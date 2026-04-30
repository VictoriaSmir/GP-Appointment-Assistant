import sys
import os

# When built with console=False, sys.stdout/stderr are None on Windows.
# Anything that calls print() or writes to stderr (including library
# code and asyncio internals) will then crash silently inside async
# handlers. Redirect to a log file (or os.devnull) to keep them alive.
# This MUST happen before any other imports.
if sys.stdout is None or sys.stderr is None:
    if getattr(sys, "frozen", False):
        log_path = os.path.join(os.path.dirname(sys.executable), "app.log")
        try:
            sys.stdout = open(log_path, "w", encoding="utf-8", buffering=1)
            sys.stderr = sys.stdout
        except Exception:
            sys.stdout = open(os.devnull, "w")
            sys.stderr = sys.stdout
    else:
        sys.stdout = open(os.devnull, "w")
        sys.stderr = sys.stdout

os.environ["PYTHONIOENCODING"] = "utf-8"

import multiprocessing
import urllib.request
import time
import threading
import subprocess

import webview
import uvicorn
import tkinter as tk
from tkinter import ttk
import sounddevice as sd


def get_bundled_path(relative_path):
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, relative_path)


def get_external_path(relative_path):
    if getattr(sys, "frozen", False):
        base = os.path.dirname(sys.executable)
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, relative_path)


def patch_model_paths():
    import backend.constants as constants
    constants.WHISPER_MODEL_DIR = get_external_path(os.path.join("models", "whisper_ov_quantised"))
    constants.NLLB_MODEL_DIR    = get_external_path(os.path.join("models", "nllb_ov_quantised"))


def start_server():
    try:
        print("Server process started")
        patch_model_paths()
        print(f"Model paths set - Whisper: {os.path.join('models', 'whisper_ov_quantised')}")
        from backend.main import app
        print("Backend app imported successfully")
        uvicorn.run(app, host="127.0.0.1", port=8765, log_level="info")
    except Exception as e:
        import traceback
        error_path = os.path.join(os.path.dirname(sys.executable) if getattr(sys, "frozen", False) else os.path.dirname(os.path.abspath(__file__)), "server_error.log")
        with open(error_path, "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())
        print(f"SERVER CRASHED: {e}")


def select_microphone():
    devices = sd.query_devices()
    input_devices = [(i, d['name']) for i, d in enumerate(devices) if d['max_input_channels'] > 0]
    if not input_devices:
        print("No input devices found - skipping mic selection")
        return
    root = tk.Tk()
    root.title("GP Appointment Assistant")
    root.geometry("460x220")
    root.resizable(False, False)
    root.configure(bg="white")

    tk.Label(
        root, text="Select Microphone",
        font=("Helvetica", 13, "bold"),
        fg="#1e1b4b", bg="white"
    ).pack(pady=18)

    tk.Label(
        root, text="Choose the microphone to use for voice input:",
        font=("Helvetica", 9),
        fg="#444444", bg="white"
    ).pack()

    combo = ttk.Combobox(
        root,
        values=[f"{i}: {name}" for i, name in input_devices],
        width=52,
        state="readonly"
    )
    combo.current(0)
    combo.pack(pady=12, padx=20)

    def confirm():
        idx = int(combo.get().split(":")[0])
        sd.default.device[0] = idx
        print(f"Microphone selected: {combo.get()}")
        root.destroy()

    tk.Button(
        root, text="Continue",
        command=confirm,
        width=18,
        bg="#4f46e5", fg="white",
        font=("Helvetica", 10, "bold"),
        relief="flat", cursor="hand2",
        activebackground="#6366f1", activeforeground="white"
    ).pack(pady=8)
    root.mainloop()


def show_loading_window():
    root = tk.Tk()
    root.title("GP Appointment Assistant")
    root.geometry("440x260")
    root.resizable(False, False)
    root.configure(bg="white")

    tk.Label(
        root, text="GP Appointment Assistant",
        font=("Helvetica", 16, "bold"),
        fg="#1e1b4b", bg="white"
    ).pack(pady=22)

    tk.Label(
        root,
        text="Loading AI models, please wait...",
        font=("Helvetica", 10),
        fg="#444444", bg="white"
    ).pack()

    canvas = tk.Canvas(root, width=80, height=20, bg="white", highlightthickness=0)
    canvas.pack(pady=18)

    dots = []
    for i in range(5):
        x = 10 + i * 15
        dot = canvas.create_oval(x, 5, x+10, 15, fill="#4f46e5", outline="")
        dots.append(dot)

    active = [0]

    def animate():
        for i, dot in enumerate(dots):
            canvas.itemconfig(dot, fill="#4f46e5" if i == active[0] else "#e0e0e0")
        active[0] = (active[0] + 1) % len(dots)
        root.after(200, animate)

    animate()

    tk.Label(
        root,
        text="Setting up speech recognition and translation engines",
        font=("Helvetica", 8),
        fg="#666666", bg="white"
    ).pack()

    tk.Label(
        root,
        text="This may take up to 60 seconds on first launch",
        font=("Helvetica", 8),
        fg="#888888", bg="white"
    ).pack(pady=4)

    return root


if __name__ == "__main__":
    multiprocessing.freeze_support()

    # 1. Select microphone
    print("Opening microphone selection...")
    select_microphone()

    # 2. Kill any existing process on port 8765
    try:
        _NO_WINDOW = 0x08000000 if sys.platform == "win32" else 0
        result = subprocess.run(
            ['netstat', '-ano'],
            capture_output=True, text=True,
            creationflags=_NO_WINDOW,
        )
        for line in result.stdout.splitlines():
            if ':8765' in line and 'LISTENING' in line:
                pid = line.strip().split()[-1]
                subprocess.run(['taskkill', '/F', '/PID', pid],
                               capture_output=True,
                               creationflags=_NO_WINDOW)
                print(f"Killed existing process on port 8765 (PID {pid})")
    except Exception as e:
        print(f"Port cleanup failed: {e}")

    # 3. Start backend server
    print("Starting backend server...")
    server = multiprocessing.Process(target=start_server, daemon=True)
    server.start()
    print(f"Server process PID: {server.pid}")

    # 4. Show loading window on main thread
    print("Showing loading window...")
    root = show_loading_window()

    # 5. Poll in background thread using flag
    ready = [False]

    def poll_and_close():
        print("Polling for backend...")
        for i in range(90):
            try:
                urllib.request.urlopen("http://127.0.0.1:8765/")
                print("Backend ready!")
                ready[0] = True
                return
            except Exception as e:
                print(f"  attempt {i+1}: {e}")
                time.sleep(2)
        print("Timeout - opening anyway")
        ready[0] = True

    poll_thread = threading.Thread(target=poll_and_close, daemon=True)
    poll_thread.start()

    def check_ready():
        if ready[0]:
            print("Closing loading window...")
            root.destroy()
        else:
            root.after(500, check_ready)

    root.after(500, check_ready)
    root.mainloop()
    poll_thread.join()

# 6. Open app window
    print("Opening app window...")
    print(f"Python version: {sys.version}")
    try:
        print(f"pywebview version: {webview.__version__}")
    except:
        print("pywebview version: unknown")
    
    # Check WebView2 availability
    try:
        import clr
        print("CLR/pythonnet loaded successfully")
    except Exception as e:
        print(f"CLR load failed: {e}")

    try:
        # Dynamically find WebView2 installation path
        webview2_base = r"C:\Program Files (x86)\Microsoft\EdgeWebView\Application"
        if os.path.exists(webview2_base):
            versions = [f for f in os.listdir(webview2_base)
                       if os.path.isdir(os.path.join(webview2_base, f)) and f[0].isdigit()]
            if versions:
                webview2_path = os.path.join(webview2_base, sorted(versions)[-1])
                os.environ["WEBVIEW2_BROWSER_EXECUTABLE_FOLDER"] = webview2_path
                print(f"WebView2 path set to: {webview2_path}")
            else:
                print("No WebView2 version folders found")
        else:
            print("WebView2 base path not found")

        os.environ["PYWEBVIEW_GUI"] = "edgechromium"
        print("Attempting edgechromium backend...")
        webview.create_window(
            "GP Appointment Assistant",
            "http://127.0.0.1:8765/app/index.html",
            width=1200,
            height=800,
            resizable=True,
        )
        webview.start(gui='edgechromium', debug=False)
    except Exception as e:
        import traceback
        print(f"EdgeChromium failed: {e}")
        print(traceback.format_exc())
        error_path = os.path.join(os.path.dirname(sys.executable), "webview_error.log")
        with open(error_path, "w", encoding="utf-8") as f:
            f.write(f"EdgeChromium error: {e}\n")
            f.write(traceback.format_exc())
        print(f"Error written to {error_path}")
        print("Trying without gui parameter...")
        try:
            webview.start(debug=False)
        except Exception as e2:
            print(f"Default webview also failed: {e2}")

    server.terminate()
    print("Server terminated.")