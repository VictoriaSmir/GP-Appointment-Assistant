"""
Runtime hook — fixes inspect.getsource() crash in frozen builds.
optimum-intel calls inspect.getsource() at import time which fails
in PyInstaller bundles. Returns a dummy source line to prevent crashes.
"""
import inspect
 
_original_getsource = inspect.getsource
 
def _safe_getsource(obj):
    try:
        return _original_getsource(obj)
    except (OSError, TypeError):
        return "def _placeholder(): pass"
 
inspect.getsource = _safe_getsource