# app.spec — PyInstaller config for GP Appointment Assistant
# Models are NOT bundled — they live in models/ folder next to the exe
# Run: pyinstaller --noconfirm app.spec

from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

openvino_datas, openvino_binaries, openvino_hiddenimports = collect_all("openvino")
pythonnet_datas, pythonnet_binaries, pythonnet_hiddenimports = collect_all("pythonnet")
clr_loader_datas, clr_loader_binaries, clr_loader_hiddenimports = collect_all("clr_loader")

a = Analysis(
    ["app_entry.py"],
    pathex=["."],
    binaries=[
        *openvino_binaries,
        *pythonnet_binaries,
        *clr_loader_binaries,
        (".venv/Lib/site-packages/openvino_tokenizers/lib/openvino_tokenizers.dll", "."),
    ],
    datas=[
        # Frontend static files bundled with exe
        ("frontend", "frontend"),
        # OpenVINO runtime data
        *openvino_datas,
        # pythonnet + clr_loader runtime data (Python.Runtime.dll etc.)
        *pythonnet_datas,
        *clr_loader_datas,
        # NOTE: models/ folder is NOT included here
        # It sits alongside the exe in the distribution zip
    ],
    hiddenimports=[
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.loops.asyncio",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.http.h11_impl",
        "uvicorn.protocols.http.httptools_impl",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.off",
        "starlette.routing",
        "starlette.middleware",
        "starlette.middleware.cors",
        "backend.main",
        "backend.app_state",
        "backend.constants",
        "backend.helpers",
        "backend.audio_utils",
        "backend.schemas",
        "backend.translate_utils",
        "backend.routers.detection",
        "backend.routers.transcription",
        "backend.routers.translation",
        "backend.routers.form",
        "backend.routers.pdf",
        "backend.routers.tts",
        "backend.routers.clinics",
        *openvino_hiddenimports,
        *collect_submodules("openvino"),
        *pythonnet_hiddenimports,
        *clr_loader_hiddenimports,
        "pythonnet",
        "clr_loader",
        "clr",
        "langdetect",
        "edge_tts",
        "reportlab",
        "soundfile",
        "numpy",
        "multipart",
        "sounddevice",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=["hook_inspect_fix.py"],
    excludes=["matplotlib"],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="GP-Appointment-Assistant",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="GP-Appointment-Assistant",
)
