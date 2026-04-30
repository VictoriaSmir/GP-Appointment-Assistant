import os
import time
import json
import shutil
import platform
import subprocess
import numpy as np
from pathlib import Path
from datetime import datetime

WHISPER_DIR = "whisper_ov_quantised"
NLLB_DIR    = "nllb_ov_quantised"
DEVICE      = "CPU"

report = {
    "timestamp":  datetime.now().isoformat(),
    "phase":      "baseline_pre_quantisation",
    "system":     {},
    "model_sizes": {},
    "load_times":  {},
    "inference":   {},
    "app_code":    {},
}


# ───────────────────────────────────────────────────────────
# 1. System info
# ───────────────────────────────────────────────────────────
def get_system_info():
    info = {
        "platform": platform.platform(),
        "processor": platform.processor(),
        "python": platform.python_version(),
    }
    try:
        import psutil
        info["ram_total_gb"] = round(psutil.virtual_memory().total / 1e9, 2)
        info["ram_available_gb"] = round(psutil.virtual_memory().available / 1e9, 2)
        info["cpu_cores"] = psutil.cpu_count(logical=False)
        info["cpu_threads"] = psutil.cpu_count(logical=True)
    except ImportError:
        info["note"] = "Install psutil for RAM info: pip install psutil"

    # Intel CPU / OpenVINO device info
    try:
        import openvino as ov
        core = ov.Core()
        info["openvino_version"] = ov.__version__
        info["available_devices"] = core.available_devices
        for dev in core.available_devices:
            try:
                info[f"{dev}_name"] = core.get_property(dev, "FULL_DEVICE_NAME")
            except Exception:
                pass
    except ImportError:
        info["openvino"] = "not installed"

    return info


# ───────────────────────────────────────────────────────────
# 1b. Power / CPU measurement helpers
# ───────────────────────────────────────────────────────────

def measure_cpu_power_during(fn, duration_hint_s: float = 5.0) -> dict:
    """
    Measure CPU utilisation and estimate power draw while fn() runs.
    Uses psutil for CPU% sampling. Power is estimated using Intel's
    typical TDP figures scaled by utilisation — not a hardware wattmeter,
    but a useful relative comparison between FP32 and INT8.
    """
    try:
        import psutil
        import threading

        samples = []
        stop_flag = [False]

        def sampler():
            while not stop_flag[0]:
                samples.append(psutil.cpu_percent(interval=0.1))

        t = threading.Thread(target=sampler, daemon=True)
        t.start()

        t0 = time.perf_counter()
        fn()
        elapsed = time.perf_counter() - t0

        stop_flag[0] = True
        t.join(timeout=1)

        if not samples:
            return {"status": "no_samples"}

        avg_cpu_pct = round(sum(samples) / len(samples), 1)
        peak_cpu_pct = round(max(samples), 1)

        # Rough power estimate: assume ~45W TDP for a mid-range Intel CPU
        # Scale by CPU% to get estimated watts during inference
        tdp_w = 45
        est_avg_w  = round(tdp_w * avg_cpu_pct / 100, 1)
        est_peak_w = round(tdp_w * peak_cpu_pct / 100, 1)
        # Energy = power × time (watt-seconds → joules)
        est_energy_j = round(est_avg_w * elapsed, 2)

        return {
            "status": "ok",
            "elapsed_s": round(elapsed, 3),
            "avg_cpu_pct": avg_cpu_pct,
            "peak_cpu_pct": peak_cpu_pct,
            "est_avg_watts": est_avg_w,
            "est_peak_watts": est_peak_w,
            "est_energy_joules": est_energy_j,
            "note": "Estimated from CPU% × 45W TDP — relative comparison only",
        }
    except ImportError:
        return {"status": "psutil_not_installed"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


# ───────────────────────────────────────────────────────────
# 2. Model sizes on disk
# ───────────────────────────────────────────────────────────
def measure_dir_size(path: str) -> dict:
    p = Path(path)
    if not p.exists():
        return {"error": f"Directory not found: {path}"}

    total_bytes = sum(f.stat().st_size for f in p.rglob("*") if f.is_file())
    files = []
    for f in sorted(p.rglob("*")):
        if f.is_file():
            size_mb = round(f.stat().st_size / 1e6, 2)
            files.append({"file": str(f.relative_to(p)), "size_mb": size_mb})

    return {
        "path": str(p.resolve()),
        "total_mb": round(total_bytes / 1e6, 2),
        "total_gb": round(total_bytes / 1e9, 3),
        "files": files,
    }


# ───────────────────────────────────────────────────────────
# 3. Model load times
# ───────────────────────────────────────────────────────────
def measure_whisper_load():
    try:
        import openvino_genai as ov_genai
        t0 = time.perf_counter()
        pipeline = ov_genai.WhisperPipeline(WHISPER_DIR, DEVICE)
        elapsed = round(time.perf_counter() - t0, 3)
        return {"load_seconds": elapsed, "status": "ok", "pipeline": pipeline}
    except Exception as e:
        return {"load_seconds": None, "status": "error", "error": str(e), "pipeline": None}


def measure_nllb_load():
    try:
        from backend.translate_utils import load_nllb_translator
        t0 = time.perf_counter()
        translator = load_nllb_translator(NLLB_DIR, DEVICE)
        elapsed = round(time.perf_counter() - t0, 3)
        return {"load_seconds": elapsed, "status": "ok", "translator": translator}
    except Exception as e:
        return {"load_seconds": None, "status": "error", "error": str(e), "translator": None}


# ───────────────────────────────────────────────────────────
# 4. Inference benchmarks
# ───────────────────────────────────────────────────────────
def benchmark_whisper(pipeline, runs: int = 3):
    """
    Transcribe 3 seconds of synthetic audio and measure latency.
    Tries openvino_genai first (for original whisper_ov format),
    then falls back to optimum.intel OVModelForSpeechSeq2Seq
    (for models exported via optimum-cli).
    """
    if pipeline is None:
        return {"status": "skipped"}

    import soundfile as sf
    import io

    t   = np.linspace(0, 3, 16000 * 3, endpoint=False)
    pcm = (0.4 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)

    try:
        import openvino_genai as ov_genai
        config = ov_genai.WhisperGenerationConfig()
        config.max_new_tokens = 200
        config.language = "<|en|>"
        config.task = "transcribe"

        latencies = []
        for _ in range(runs):
            t0 = time.perf_counter()
            pipeline.generate(pcm, config)
            latencies.append(round(time.perf_counter() - t0, 3))

        return {
            "status": "ok",
            "api": "openvino_genai",
            "runs": runs,
            "audio_seconds": 3.0,
            "latency_avg_s": round(sum(latencies) / len(latencies), 3),
            "latency_min_s": min(latencies),
            "latency_max_s": max(latencies),
            "rtf": round((sum(latencies) / len(latencies)) / 3.0, 3),
        }
    except Exception as e1:
        pass

    try:
        import torch
        from optimum.intel import OVModelForSpeechSeq2Seq
        from transformers import AutoProcessor

        model     = OVModelForSpeechSeq2Seq.from_pretrained(WHISPER_DIR)
        processor = AutoProcessor.from_pretrained(WHISPER_DIR)

        inputs = processor(pcm, sampling_rate=16000, return_tensors="pt")

        latencies = []
        for _ in range(runs):
            t0 = time.perf_counter()
            with torch.no_grad():
                model.generate(**inputs, max_new_tokens=200, language="en", task="transcribe")
            latencies.append(round(time.perf_counter() - t0, 3))

        return {
            "status": "ok",
            "api": "optimum_intel",
            "runs": runs,
            "audio_seconds": 3.0,
            "latency_avg_s": round(sum(latencies) / len(latencies), 3),
            "latency_min_s": min(latencies),
            "latency_max_s": max(latencies),
            "rtf": round((sum(latencies) / len(latencies)) / 3.0, 3),
        }
    except Exception as e2:
        return {"status": "error", "error": f"openvino_genai: beam_idx port issue. optimum: {e2}"}


def benchmark_nllb(translator, runs: int = 5):
    """Translate a standard sentence and measure latency."""
    if translator is None:
        return {"status": "skipped"}

    test_sentences = [
        ("I have a headache and feel unwell.", "eng_Latn", "rus_Cyrl"),
        ("I have a headache and feel unwell.", "eng_Latn", "ara_Arab"),
        ("I have a headache and feel unwell.", "eng_Latn", "zho_Hans"),
        ("У меня болит голова.",               "rus_Cyrl", "eng_Latn"),
        ("عندي صداع.",                         "ara_Arab", "eng_Latn"),
    ]

    results = []
    for text, src, tgt in test_sentences:
        latencies = []
        for _ in range(runs):
            t0 = time.perf_counter()
            out = translator.translate(text, src_lang=src, tgt_lang=tgt)
            latencies.append(round(time.perf_counter() - t0, 3))
        results.append({
            "src_lang": src,
            "tgt_lang": tgt,
            "input":    text,
            "output":   out,
            "latency_avg_s": round(sum(latencies) / len(latencies), 3),
            "latency_min_s": min(latencies),
            "latency_max_s": max(latencies),
        })

    avg_all = round(sum(r["latency_avg_s"] for r in results) / len(results), 3)
    return {"status": "ok", "runs_per_sentence": runs, "avg_all_s": avg_all, "sentences": results}


# ───────────────────────────────────────────────────────────
# 5. App code size
# ───────────────────────────────────────────────────────────
def measure_code_size():
    sizes = {}
    for folder in ["backend", "frontend", "tests"]:
        p = Path(folder)
        if p.exists():
            total = sum(f.stat().st_size for f in p.rglob("*") if f.is_file())
            count = sum(1 for f in p.rglob("*") if f.is_file())
            sizes[folder] = {"total_kb": round(total / 1e3, 1), "files": count}
    return sizes


# ───────────────────────────────────────────────────────────
# Main
# ───────────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("  GP ASSISTANT — BASELINE MEASUREMENT")
    print("=" * 60)

    # System
    print("System info...")
    report["system"] = get_system_info()
    print(f"   Platform:   {report['system'].get('platform', 'unknown')}")
    print(f"   OpenVINO:   {report['system'].get('openvino_version', 'not found')}")
    print(f"   Devices:    {report['system'].get('available_devices', [])}")

    # Model sizes
    print("\Model sizes on disk...")
    report["model_sizes"]["whisper"] = measure_dir_size(WHISPER_DIR)
    report["model_sizes"]["nllb"]    = measure_dir_size(NLLB_DIR)
    w_size = report["model_sizes"]["whisper"].get("total_mb", "N/A")
    n_size = report["model_sizes"]["nllb"].get("total_mb", "N/A")
    print(f"   Whisper ({WHISPER_DIR}):  {w_size} MB")
    print(f"   NLLB    ({NLLB_DIR}):     {n_size} MB")

    # Load times
    print("Model load times...")
    whisper_load = measure_whisper_load()
    report["load_times"]["whisper"] = {k: v for k, v in whisper_load.items() if k != "pipeline"}
    print(f"   Whisper: {whisper_load.get('load_seconds', 'ERROR')}s  [{whisper_load['status']}]")

    nllb_load = measure_nllb_load()
    report["load_times"]["nllb"] = {k: v for k, v in nllb_load.items() if k != "translator"}
    print(f"   NLLB:    {nllb_load.get('load_seconds', 'ERROR')}s  [{nllb_load['status']}]")

    # Inference
    print("Inference benchmarks (3 runs each)...")
    report["inference"]["whisper"] = benchmark_whisper(whisper_load.get("pipeline"), runs=3)
    w_inf = report["inference"]["whisper"]
    if w_inf["status"] == "ok":
        print(f"   Whisper latency: avg={w_inf['latency_avg_s']}s  RTF={w_inf['rtf']}")
    else:
        print(f"   Whisper benchmark error: {w_inf.get('error', 'unknown')}")

    report["inference"]["nllb"] = benchmark_nllb(nllb_load.get("translator"), runs=3)
    n_inf = report["inference"]["nllb"]
    if n_inf["status"] == "ok":
        print(f"   NLLB latency:    avg={n_inf['avg_all_s']}s across 5 language pairs")

    # Power measurements
    print("Power / energy estimates during inference...")
    whisper_pipe = whisper_load.get("pipeline")
    nllb_trans   = nllb_load.get("translator")

    if whisper_pipe:
        import numpy as np
        t   = np.linspace(0, 3, 16000 * 3, endpoint=False)
        pcm = (0.4 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
        try:
            import openvino_genai as ov_genai
            config = ov_genai.WhisperGenerationConfig()
            config.max_new_tokens = 200
            power_w = measure_cpu_power_during(lambda: whisper_pipe.generate(pcm, config))
        except Exception:
            power_w = measure_cpu_power_during(lambda: whisper_pipe.generate(pcm))
        report["power"] = report.get("power", {})
        report["power"]["whisper_inference"] = power_w
        if power_w.get("status") == "ok":
            print(f"   Whisper: avg {power_w['est_avg_watts']}W  peak {power_w['est_peak_watts']}W  energy {power_w['est_energy_joules']}J")

    if nllb_trans:
        power_n = measure_cpu_power_during(
            lambda: nllb_trans.translate("I have a headache.", src_lang="eng_Latn", tgt_lang="rus_Cyrl")
        )
        report["power"] = report.get("power", {})
        report["power"]["nllb_inference"] = power_n
        if power_n.get("status") == "ok":
            print(f"   NLLB:    avg {power_n['est_avg_watts']}W  peak {power_n['est_peak_watts']}W  energy {power_n['est_energy_joules']}J")

    # NLLB load power
    power_nllb_load = measure_cpu_power_during(lambda: None)  # placeholder
    print(f"   (Note: estimates based on CPU% × 45W TDP — useful for relative comparison)")

    # Code size
    print("Application code size...")
    report["app_code"] = measure_code_size()
    for folder, info in report["app_code"].items():
        print(f"   {folder}: {info['total_kb']} KB  ({info['files']} files)")

    # Save
    out_path = "baseline_report.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print(f"Baseline saved to: {out_path}")
    print("=" * 60)

    # Print summary table
    print("\n┌─────────────────────────────────────────────────┐")
    print("│  SUMMARY — BEFORE QUANTISATION                  │")
    print("├─────────────────────────────────────────────────┤")
    print(f"│  Whisper model size:    {str(w_size) + ' MB':<26}│")
    print(f"│  NLLB model size:       {str(n_size) + ' MB':<26}│")
    if whisper_load['status'] == 'ok':
        print(f"│  Whisper load time:     {str(whisper_load['load_seconds']) + 's':<26}│")
    if nllb_load['status'] == 'ok':
        print(f"│  NLLB load time:        {str(nllb_load['load_seconds']) + 's':<26}│")
    if w_inf.get('status') == 'ok':
        print(f"│  Whisper inference RTF: {str(w_inf['rtf']):<26}│")
    else:
        print(f"│  Whisper inference RTF: {'ERROR - see above':<26}│")
    if n_inf.get('status') == 'ok':
        print(f"│  NLLB avg latency:      {str(n_inf['avg_all_s']) + 's':<26}│")
    pw = report.get("power", {}).get("whisper_inference", {})
    pn = report.get("power", {}).get("nllb_inference", {})
    if pw.get("status") == "ok":
        print(f"│  Whisper inference energy: {str(pw['est_energy_joules']) + 'J':<22}│")
    if pn.get("status") == "ok":
        print(f"│  NLLB inference energy:    {str(pn['est_energy_joules']) + 'J':<22}│")
    print("└─────────────────────────────────────────────────┘")
    print("\nKeep baseline_report.json — you'll compare against")
    print("it again after quantisation to measure improvement.\n")


if __name__ == "__main__":
    main()