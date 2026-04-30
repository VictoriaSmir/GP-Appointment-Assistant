import argparse
import json
import shutil
import time
from pathlib import Path
from datetime import datetime

WHISPER_SRC  = Path("whisper_ov")
NLLB_SRC     = Path("nllb_ov")
WHISPER_DST  = Path("whisper_ov_quantised")
NLLB_DST     = Path("nllb_ov_quantised")


def dir_size_mb(path: Path) -> float:
    if not path.exists():
        return 0.0
    return round(sum(f.stat().st_size for f in path.rglob("*") if f.is_file()) / 1e6, 2)


def find_ov_models(directory: Path) -> list[Path]:
    """Return all .xml OpenVINO model files in a directory."""
    return sorted(directory.rglob("*.xml"))


def quantise_model(src_dir: Path, dst_dir: Path, mode: str, model_name: str):
    """
    Compress all OpenVINO IR models (.xml/.bin pairs) in src_dir
    and write quantised versions to dst_dir.

    mode: "INT8" | "INT4"
    """
    import nncf
    import openvino as ov

    print(f"\n{'─'*55}")
    print(f"  Quantising {model_name}  →  {mode}")
    print(f"  Source : {src_dir.resolve()}")
    print(f"  Output : {dst_dir.resolve()}")
    print(f"{'─'*55}")

    if not src_dir.exists():
        print(f"Source directory not found: {src_dir}")
        return {"status": "error", "error": f"not found: {src_dir}"}

    size_before = dir_size_mb(src_dir)
    print(f"  Size before: {size_before} MB")

    if dst_dir.exists():
        print(f"Removing existing output dir: {dst_dir}")
        shutil.rmtree(dst_dir)
    shutil.copytree(src_dir, dst_dir)

    core       = ov.Core()
    xml_files  = find_ov_models(src_dir)

    if not xml_files:
        print(f"No .xml model files found in {src_dir}")
        return {"status": "error", "error": "no .xml files found"}

    print(f"  Found {len(xml_files)} model(s) to compress:")
    for x in xml_files:
        print(f"{x.relative_to(src_dir)}")

    results = []
    t_total = time.perf_counter()

    for xml_src in xml_files:
        rel     = xml_src.relative_to(src_dir)
        xml_dst = dst_dir / rel

        print(f"{rel}")
        t0 = time.perf_counter()

        try:
            model = core.read_model(xml_src)

            if mode == "INT4":
                compressed = nncf.compress_weights(
                    model,
                    mode=nncf.CompressWeightsMode.INT4_ASYM, 
                    ratio=0.8,       
                    group_size=128,    
                )
            else:
                compressed = nncf.compress_weights(
                    model,
                    mode=nncf.CompressWeightsMode.INT8_ASYM,
                )

            ov.save_model(compressed, xml_dst)

            elapsed = round(time.perf_counter() - t0, 2)
            size_before_m = round(xml_src.with_suffix(".bin").stat().st_size / 1e6, 2) \
                if xml_src.with_suffix(".bin").exists() else 0
            size_after_m  = round(xml_dst.with_suffix(".bin").stat().st_size / 1e6, 2) \
                if xml_dst.with_suffix(".bin").exists() else 0
            reduction = round((1 - size_after_m / size_before_m) * 100, 1) \
                if size_before_m > 0 else 0

            print(f"{elapsed}s  |  {size_before_m} MB → {size_after_m} MB  ({reduction}% smaller)")
            results.append({
                "model": str(rel),
                "status": "ok",
                "elapsed_s": elapsed,
                "size_before_mb": size_before_m,
                "size_after_mb": size_after_m,
                "reduction_pct": reduction,
            })

        except Exception as e:
            elapsed = round(time.perf_counter() - t0, 2)
            print(f" Failed in {elapsed}s: {e}")
            results.append({"model": str(rel), "status": "error", "error": str(e)})

    total_elapsed = round(time.perf_counter() - t_total, 2)
    size_after    = dir_size_mb(dst_dir)
    reduction_pct = round((1 - size_after / size_before) * 100, 1) if size_before > 0 else 0

    print(f"\n  {'─'*50}")
    print(f"  {model_name} complete in {total_elapsed}s")
    print(f"  Total:  {size_before} MB  →  {size_after} MB  ({reduction_pct}% reduction)")

    return {
        "status": "ok",
        "mode": mode,
        "total_elapsed_s": total_elapsed,
        "size_before_mb": size_before,
        "size_after_mb": size_after,
        "reduction_pct": reduction_pct,
        "models": results,
    }


def run_post_quantisation_check(whisper_dst: Path, nllb_dst: Path):
    print(f"\n{'='*55}")
    print("  POST-QUANTISATION SANITY CHECK")
    print(f"{'='*55}")

    results = {}

    if whisper_dst.exists():
        try:
            import openvino_genai as ov_genai
            import numpy as np
            print(f"\n  Loading quantised Whisper from {whisper_dst}...")
            t0 = time.perf_counter()
            pipe = ov_genai.WhisperPipeline(str(whisper_dst), "CPU")
            load_t = round(time.perf_counter() - t0, 3)

            pcm = (0.4 * np.sin(2 * np.pi * 440 * np.linspace(0, 3, 48000))).astype(np.float32)
            t0 = time.perf_counter()
            pipe.generate(pcm)
            inf_t = round(time.perf_counter() - t0, 3)
            rtf   = round(inf_t / 3.0, 3)

            print(f"  ✅ Whisper OK — load: {load_t}s  inference: {inf_t}s  RTF: {rtf}")
            results["whisper"] = {"status": "ok", "load_s": load_t, "inference_s": inf_t, "rtf": rtf}
        except Exception as e:
            print(f"  ❌ Whisper check failed: {e}")
            results["whisper"] = {"status": "error", "error": str(e)}

    if nllb_dst.exists():
        try:
            from backend.translate_utils import load_nllb_translator
            print(f"\n  Loading quantised NLLB from {nllb_dst}...")
            t0 = time.perf_counter()
            translator = load_nllb_translator(str(nllb_dst), "CPU")
            load_t = round(time.perf_counter() - t0, 3)

            t0 = time.perf_counter()
            out = translator.translate("I have a headache.", src_lang="eng_Latn", tgt_lang="rus_Cyrl")
            inf_t = round(time.perf_counter() - t0, 3)

            print(f"  ✅ NLLB OK — load: {load_t}s  inference: {inf_t}s")
            print(f"     'I have a headache.' → '{out}'")
            results["nllb"] = {"status": "ok", "load_s": load_t, "inference_s": inf_t, "output": out}
        except Exception as e:
            print(f"  ❌ NLLB check failed: {e}")
            results["nllb"] = {"status": "error", "error": str(e)}

    return results


def print_comparison(baseline_path: str, q_results: dict):
    """Load the baseline JSON and print a before/after table."""
    try:
        with open(baseline_path, encoding="utf-8") as f:
            baseline = json.load(f)
    except FileNotFoundError:
        print(f"\n  ⚠  baseline_report.json not found — run measure_baseline.py first")
        return

    print(f"\n{'='*55}")
    print("  BEFORE vs AFTER COMPARISON")
    print(f"{'='*55}")

    b_w = baseline["model_sizes"].get("whisper", {})
    b_n = baseline["model_sizes"].get("nllb", {})
    b_wl = baseline["load_times"].get("whisper", {})
    b_nl = baseline["load_times"].get("nllb", {})

    q_w = q_results.get("whisper", {})
    q_n = q_results.get("nllb", {})

    rows = [
        ("Whisper size (MB)", b_w.get("total_mb"), q_w.get("size_after_mb")),
        ("NLLB size (MB)",    b_n.get("total_mb"), q_n.get("size_after_mb")),
        ("Whisper load (s)",  b_wl.get("load_seconds"), None),
        ("NLLB load (s)",     b_nl.get("load_seconds"), None),
    ]

    print(f"\n  {'Metric':<30} {'Before':>10} {'After':>10} {'Change':>10}")
    print(f"  {'─'*30} {'─'*10} {'─'*10} {'─'*10}")
    for label, before, after in rows:
        b_str = f"{before}" if before is not None else "N/A"
        a_str = f"{after}"  if after  is not None else "(run check)"
        if before and after:
            pct = round((1 - after / before) * 100, 1)
            c_str = f"-{pct}%"
        else:
            c_str = "—"
        print(f"  {label:<30} {b_str:>10} {a_str:>10} {c_str:>10}")


def main():
    parser = argparse.ArgumentParser(description="Quantise GP Assistant models with NNCF")
    parser.add_argument("--model",  choices=["whisper", "nllb", "both"], default="both",
                        help="Which model to quantise (default: both)")
    parser.add_argument("--int4",   action="store_true",
                        help="Use INT4 instead of INT8 (more compression, less accuracy)")
    parser.add_argument("--check",  action="store_true",
                        help="Run post-quantisation sanity check after compression")
    parser.add_argument("--no-check", action="store_true",
                        help="Skip sanity check")
    args = parser.parse_args()

    mode = "INT4" if args.int4 else "INT8"
    run_check = not args.no_check

    print(f"\n{'='*55}")
    print(f"  GP ASSISTANT — MODEL QUANTISATION  [{mode}]")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*55}")
    print(f"\n  ⚠  Original models will NOT be modified.")
    print(f"     Quantised copies saved to:")
    print(f"     • {WHISPER_DST}")
    print(f"     • {NLLB_DST}")
    print(f"\n  To use quantised models, update constants.py:")
    print(f"     WHISPER_MODEL_DIR = \"{WHISPER_DST}\"")
    print(f"     NLLB_MODEL_DIR    = \"{NLLB_DST}\"")

    q_results = {}
    t_start = time.perf_counter()

    if args.model in ("whisper", "both"):
        q_results["whisper"] = quantise_model(WHISPER_SRC, WHISPER_DST, mode, "Whisper")

    if args.model in ("nllb", "both"):
        q_results["nllb"] = quantise_model(NLLB_SRC, NLLB_DST, mode, "NLLB")

    total_time = round(time.perf_counter() - t_start, 1)

    if run_check:
        check_results = run_post_quantisation_check(
            WHISPER_DST if args.model in ("whisper", "both") else Path("__none__"),
            NLLB_DST    if args.model in ("nllb", "both")    else Path("__none__"),
        )
        q_results["sanity_check"] = check_results

    print_comparison("baseline_report.json", q_results)

    report = {
        "timestamp":  datetime.now().isoformat(),
        "phase":      f"post_quantisation_{mode.lower()}",
        "mode":       mode,
        "total_elapsed_s": total_time,
        "results":    q_results,
    }
    out_path = f"quantisation_report_{mode.lower()}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n  ✅ Report saved: {out_path}")
    print(f"  ⏱  Total time:  {total_time}s")

    print(f"\n{'='*55}")
    print("  NEXT STEPS")
    print(f"{'='*55}")
    print(f"  1. Review the comparison table above")
    print(f"  2. If accuracy looks good, update constants.py:")
    print(f"       WHISPER_MODEL_DIR = \"{WHISPER_DST}\"")
    print(f"       NLLB_MODEL_DIR    = \"{NLLB_DST}\"")
    print(f"  3. Re-run measure_baseline.py to confirm gains")
    print(f"  4. Try --int4 for even more compression if needed")
    print(f"  5. Consider running on NPU device for extra speed:")
    print(f"       DEVICE = \"NPU\"  in constants.py\n")


if __name__ == "__main__":
    main()