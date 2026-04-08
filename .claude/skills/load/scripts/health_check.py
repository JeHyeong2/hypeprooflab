#!/usr/bin/env python3
"""
PM Health Check — Fast local dependency verification.

No API calls. Target <3 seconds (check mode), ~30s (fix mode).
Checks PyYAML, config files, tokens, vault directories.

Usage:
    python3 health_check.py          # report only
    python3 health_check.py --fix    # auto-repair what we can
Exit 0 if no ERRORs, exit 1 otherwise.
"""

import os
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths (same pattern as build_index.py)
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
SKILLS_DIR = SCRIPT_DIR.parent.parent          # .claude/skills/
PROJECT_ROOT = SKILLS_DIR.parent.parent        # project root

CA_CONFIG_PATH = SKILLS_DIR / "config" / "config" / "config.yaml"
INDEX_PATH = PROJECT_ROOT / "knowledge" / "ontology-index.yaml"
GWS_CREDENTIALS_PATH = Path.home() / ".config" / "gws" / "credentials.json"
NOTEBOOKLM_CLI = Path.home() / ".local" / "bin" / "notebooklm"
NOTEBOOKLM_AUTH = Path.home() / ".notebooklm" / "storage_state.json"
NOTEBOOKLM_PIPX_VENV = Path.home() / ".local" / "pipx" / "venvs" / "notebooklm-py"
OLD_NOTEBOOKLM_39 = Path.home() / "Library" / "Python" / "3.9" / "bin" / "notebooklm"
ZPROFILE = Path.home() / ".zprofile"

FIX_MODE = "--fix" in sys.argv

VAULT_DIRS = [
    PROJECT_ROOT / "workspace" / "agendas",
    PROJECT_ROOT / "workspace" / "signals",
    PROJECT_ROOT / "workspace" / "stakeholders",
    PROJECT_ROOT / "knowledge",
]

# ---------------------------------------------------------------------------
# Check helpers
# ---------------------------------------------------------------------------
OK = "[OK]"
WARN = "[WARN]"
ERROR = "[ERROR]"


def check_pyyaml():
    """Check 1: PyYAML importable."""
    try:
        import yaml  # noqa: F401
        return OK, "PyYAML available"
    except ImportError:
        return ERROR, "PyYAML not installed — pip install pyyaml"


def check_ca_config():
    """Check 2: config.yaml parseable."""
    try:
        import yaml
        with open(CA_CONFIG_PATH) as f:
            cfg = yaml.safe_load(f)
        customers = cfg.get("customers", {})
        count = sum(len(v) for v in customers.values() if isinstance(v, list))
        return OK, f"config.yaml valid ({count} customers)"
    except FileNotFoundError:
        return ERROR, f"config.yaml not found at {CA_CONFIG_PATH}"
    except Exception as e:
        return ERROR, f"config.yaml parse error: {e}"


def check_ontology_index():
    """Check 3: ontology-index.yaml valid + age check."""
    try:
        import yaml
        with open(INDEX_PATH) as f:
            idx = yaml.safe_load(f)
        generated = idx.get("meta", {}).get("generated", "")
        if generated:
            gen_dt = datetime.fromisoformat(str(generated))
            age_h = (datetime.now() - gen_dt).total_seconds() / 3600
            age_str = f"{age_h:.0f}h old"
            if age_h > 48:
                return WARN, f"ontology-index.yaml valid but stale ({age_str})"
            return OK, f"ontology-index.yaml valid ({age_str})"
        return OK, "ontology-index.yaml valid (no timestamp)"
    except FileNotFoundError:
        return ERROR, f"ontology-index.yaml not found at {INDEX_PATH}"
    except Exception as e:
        return ERROR, f"ontology-index.yaml error: {e}"


def check_gws_cli():
    """Check 4: gws CLI installed and auth valid."""
    if not shutil.which("gws"):
        return ERROR, "gws CLI not found — brew install googleworkspace-cli"
    if not GWS_CREDENTIALS_PATH.exists():
        return ERROR, f"gws credentials not found at {GWS_CREDENTIALS_PATH}"
    try:
        result = subprocess.run(
            ["gws", "auth", "status"],
            capture_output=True, text=True, timeout=5,
            env={**os.environ, "GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE": str(GWS_CREDENTIALS_PATH)},
        )
        import json
        status = json.loads(result.stdout)
        if status.get("token_valid"):
            scope_count = status.get("scope_count", 0)
            return OK, f"gws auth valid ({scope_count} scopes, encrypted storage)"
        return WARN, "gws auth exists but token_valid=false — run: gws auth login"
    except Exception as e:
        return WARN, f"gws auth status check failed: {e}"


def check_vault_dirs():
    """Check 6: Vault directories exist."""
    missing = [d.name for d in VAULT_DIRS if not d.is_dir()]
    if not missing:
        return OK, f"All {len(VAULT_DIRS)} vault dirs exist"
    return ERROR, f"Missing vault dirs: {', '.join(missing)}"


def check_notebooklm_cli():
    """Check 8: NotebookLM CLI available and correct version on PATH."""
    # Check for stale Python 3.9 binary shadowing pipx version
    if OLD_NOTEBOOKLM_39.exists():
        if FIX_MODE:
            OLD_NOTEBOOKLM_39.unlink()
            print(f"  [FIX] Removed stale Python 3.9 binary: {OLD_NOTEBOOKLM_39}")
        else:
            return WARN, f"Stale Python 3.9 binary at {OLD_NOTEBOOKLM_39} shadows pipx — run with --fix"

    # Check ~/.local/bin on PATH
    local_bin = str(Path.home() / ".local" / "bin")
    if local_bin not in os.environ.get("PATH", ""):
        if FIX_MODE:
            _ensure_local_bin_on_path()
            os.environ["PATH"] = f"{local_bin}:{os.environ.get('PATH', '')}"
            print(f"  [FIX] Added {local_bin} to PATH in {ZPROFILE}")
        else:
            return WARN, f"~/.local/bin not on PATH — run with --fix or add to ~/.zprofile"

    if not NOTEBOOKLM_CLI.exists():
        if FIX_MODE:
            print("  [FIX] Installing notebooklm-py via pipx...")
            subprocess.run(
                ["pipx", "install", "notebooklm-py", "--python", "python3.13"],
                capture_output=True, timeout=60,
            )
            if NOTEBOOKLM_CLI.exists():
                print("  [FIX] notebooklm-py installed")
            else:
                return ERROR, "pipx install notebooklm-py failed"
        else:
            return WARN, "notebooklm CLI not found — pipx install notebooklm-py --python python3.13"

    # Check playwright installed in pipx venv
    pw_bin = NOTEBOOKLM_PIPX_VENV / "bin" / "playwright"
    if NOTEBOOKLM_PIPX_VENV.exists() and not pw_bin.exists():
        if FIX_MODE:
            print("  [FIX] Injecting playwright into notebooklm-py venv...")
            subprocess.run(["pipx", "inject", "notebooklm-py", "playwright"], capture_output=True, timeout=60)
            subprocess.run([str(NOTEBOOKLM_PIPX_VENV / "bin" / "playwright"), "install", "chromium"],
                           capture_output=True, timeout=120)
            print("  [FIX] playwright + chromium installed")
        else:
            return WARN, "playwright not in notebooklm venv — run with --fix"

    if NOTEBOOKLM_CLI.exists():
        return OK, "notebooklm CLI ready"
    return WARN, "notebooklm CLI not found"


def check_notebooklm_auth():
    """Check 9: NotebookLM auth freshness."""
    if not NOTEBOOKLM_AUTH.exists():
        if FIX_MODE:
            return _fix_notebooklm_auth("not found")
        return WARN, "NotebookLM auth not found — run with --fix or: notebooklm login"
    age_days = (time.time() - NOTEBOOKLM_AUTH.stat().st_mtime) / 86400
    if age_days > 7:
        if FIX_MODE:
            return _fix_notebooklm_auth(f"stale ({age_days:.0f}d old)")
        return WARN, f"NotebookLM auth stale ({age_days:.0f}d old) — run with --fix or: notebooklm login"
    return OK, f"NotebookLM auth fresh ({age_days:.0f}d old)"


# ---------------------------------------------------------------------------
# Fix helpers
# ---------------------------------------------------------------------------
def _ensure_local_bin_on_path():
    """Append ~/.local/bin to PATH in ~/.zprofile if not already there."""
    marker = "$HOME/.local/bin"
    if ZPROFILE.exists():
        content = ZPROFILE.read_text()
        if marker in content or str(Path.home() / ".local" / "bin") in content:
            return  # already present
    with open(ZPROFILE, "a") as f:
        f.write("\n# pipx\nexport PATH=\"$HOME/.local/bin:$PATH\"\n")


def _fix_notebooklm_auth(reason: str):
    """Launch notebooklm login interactively."""
    cli = str(NOTEBOOKLM_CLI)
    if not NOTEBOOKLM_CLI.exists():
        return WARN, f"NotebookLM auth {reason} — CLI not available, cannot auto-login"
    print(f"  [FIX] NotebookLM auth {reason}. Launching browser login...")
    try:
        result = subprocess.run([cli, "login"], timeout=120)
        if NOTEBOOKLM_AUTH.exists():
            age_days = (time.time() - NOTEBOOKLM_AUTH.stat().st_mtime) / 86400
            if age_days < 1:
                return OK, "NotebookLM auth refreshed"
        return WARN, "NotebookLM login completed but auth file not updated"
    except subprocess.TimeoutExpired:
        return WARN, "NotebookLM login timed out (120s) — run manually: notebooklm login"
    except Exception as e:
        return WARN, f"NotebookLM login failed: {e}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    checks = [
        ("PyYAML", check_pyyaml),
        ("config.yaml", check_ca_config),
        ("ontology-index.yaml", check_ontology_index),
        ("gws CLI + auth", check_gws_cli),
        ("Vault dirs", check_vault_dirs),
        ("NotebookLM CLI", check_notebooklm_cli),
        ("NotebookLM auth", check_notebooklm_auth),
    ]

    results = []
    has_error = False

    for name, fn in checks:
        status, detail = fn()
        results.append((name, status, detail))
        if status == ERROR:
            has_error = True

    # Print results
    for name, status, detail in results:
        print(f"{status:7s} {name}: {detail}")

    # Summary
    ok_count = sum(1 for _, s, _ in results if s == OK)
    warn_count = sum(1 for _, s, _ in results if s == WARN)
    err_count = sum(1 for _, s, _ in results if s == ERROR)
    print(f"\nSummary: {ok_count} OK, {warn_count} WARN, {err_count} ERROR")

    sys.exit(1 if has_error else 0)


if __name__ == "__main__":
    main()
