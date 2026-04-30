@echo off
REM Unblock.bat — run this ONCE after extracting the zip, before launching the app.
REM Windows flags files from the internet as untrusted, which can prevent some
REM DLLs (especially .NET libraries) from loading. This script removes that flag.

echo Unblocking files in this folder (this may take a minute)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Done. You can now launch GP-Appointment-Assistant.exe
) else (
    echo.
    echo WARNING: Unblock step did not complete successfully.
    echo You can still try running the app, but it may fail to open the window.
)

echo.
pause
