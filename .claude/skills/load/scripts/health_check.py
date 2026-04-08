#!/usr/bin/env python3
"""Generic health check for Claude Code projects.

Reads configuration from .claude/skills/config/config.yaml.
Checks: PyYAML, Claude binary, config, required dirs, cron log dir, LaunchAgent plists, git status.
Exit 0 if no ERRORs, exit 1 if any ERROR.
"""

import os
import subprocess
import sys
from pathlib import Path

# Resolve paths
SCRIPT_DIR = Path(__file__).resolve().parent          # .claude/skills/load/scripts/
SKILL_DIR = SCRIPT_DIR.parent                         # .claude/skills/load/
SKILLS_DIR = SKILL_DIR.parent                         # .claude/skills/
PROJECT_ROOT = SKILLS_DIR.parent.parent               # project root
CONFIG_PATH = SKILLS_DIR / "config" / "config.yaml"

errors = 0
warnings = 0


def ok(label, detail=""):
    print(f"[OK]    {label}" + (f" — {detail}" if detail else ""))


def warn(label, detail=""):
    global warnings
    warnings += 1
    print(f"[WARN]  {label}" + (f" — {detail}" if detail else ""))


def error(label, detail=""):
    global errors
    errors += 1
    print(f"[ERROR] {label}" + (f" — {detail}" if detail else ""))


def check_pyyaml():
    try:
        import yaml  # noqa: F401
        ok("PyYAML", "installed")
        return True
    except ImportError:
        error("PyYAML", "not installed — run: pip3 install pyyaml")
        return False


def load_config():
    if not CONFIG_PATH.exists():
        error("config.yaml", f"not found at {CONFIG_PATH}")
        return None
    try:
        import yaml
        with open(CONFIG_PATH) as f:
            config = yaml.safe_load(f)
        ok("config.yaml", str(CONFIG_PATH.relative_to(PROJECT_ROOT)))
        return config
    except Exception as e:
        error("config.yaml", f"parse error: {e}")
        return None


def check_claude_binary(config):
    claude_bin = config.get("health_check", {}).get("claude_bin", "~/.local/bin/claude")
    path = Path(os.path.expanduser(claude_bin))
    if not path.exists():
        error("Claude binary", f"not found at {path}")
        return
    if not os.access(path, os.X_OK):
        error("Claude binary", f"not executable: {path}")
        return
    try:
        version = subprocess.run(
            [str(path), "--version"], capture_output=True, text=True, timeout=5
        ).stdout.strip()
        ok("Claude binary", version or str(path))
    except Exception:
        ok("Claude binary", str(path))


def check_directories(config):
    required = config.get("health_check", {}).get("required_dirs", [])
    if not required:
        warn("required_dirs", "not configured in config.yaml")
        return
    missing = []
    for d in required:
        p = PROJECT_ROOT / d
        if not p.is_dir():
            missing.append(d)
    if missing:
        error("directories", f"missing: {', '.join(missing)}")
    else:
        ok("directories", f"all {len(required)} present")


def check_cron_log_dir(config):
    log_dir = config.get("cron", {}).get("log_dir", "cron-reports")
    p = PROJECT_ROOT / log_dir
    if p.is_dir():
        log_count = len(list(p.glob("cron-*.log")))
        ok("cron log dir", f"{p.name}/ ({log_count} logs)")
    else:
        warn("cron log dir", f"{log_dir}/ not found")


def check_plists(config):
    expected = config.get("health_check", {}).get("expected_plists", [])
    if not expected:
        ok("LaunchAgents", "no plists configured (skipped)")
        return
    launch_dir = Path.home() / "Library" / "LaunchAgents"
    if not launch_dir.is_dir():
        warn("LaunchAgents", f"{launch_dir} not found")
        return
    missing = []
    invalid = []
    loaded = 0
    for name in expected:
        plist = launch_dir / f"{name}.plist"
        if not plist.exists():
            missing.append(name.split(".")[-1])
            continue
        result = subprocess.run(
            ["plutil", "-lint", str(plist)], capture_output=True, text=True
        )
        if result.returncode != 0:
            invalid.append(name.split(".")[-1])
        else:
            loaded += 1
    parts = []
    if loaded:
        parts.append(f"{loaded} valid")
    if missing:
        parts.append(f"{len(missing)} missing ({', '.join(missing)})")
    if invalid:
        parts.append(f"{len(invalid)} invalid ({', '.join(invalid)})")
    if missing or invalid:
        warn("LaunchAgents", " | ".join(parts))
    else:
        ok("LaunchAgents", f"all {loaded} valid")


def check_git_status():
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=5, cwd=PROJECT_ROOT
        )
        if result.stdout.strip():
            lines = result.stdout.strip().split("\n")
            warn("git status", f"{len(lines)} uncommitted changes")
        else:
            ok("git status", "clean")
    except Exception as e:
        warn("git status", f"check failed: {e}")


def check_failure_dir(config):
    fail_dir = config.get("cron", {}).get("failure_dir", ".claude/failures")
    p = PROJECT_ROOT / fail_dir
    if p.is_dir():
        failures = list(p.glob("*.md"))
        if failures:
            warn("failure records", f"{len(failures)} unresolved in {fail_dir}/")
        else:
            ok("failure records", "none")
    else:
        ok("failure records", f"{fail_dir}/ not found (no failures tracked)")


def main():
    print(f"=== Health Check: {PROJECT_ROOT.name} ===\n")

    if not check_pyyaml():
        print(f"\n{'='*40}")
        print(f"Result: 1 ERROR — install PyYAML first")
        sys.exit(1)

    config = load_config()
    if not config:
        print(f"\n{'='*40}")
        print(f"Result: 1 ERROR")
        sys.exit(1)

    check_claude_binary(config)
    check_directories(config)
    check_cron_log_dir(config)
    check_plists(config)
    check_failure_dir(config)
    check_git_status()

    print(f"\n{'='*40}")
    print(f"Result: {errors} ERROR, {warnings} WARN")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
