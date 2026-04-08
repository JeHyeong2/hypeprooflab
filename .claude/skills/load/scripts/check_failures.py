#!/usr/bin/env python3
"""Scan cron logs and failure records for recent failures.

Reads config from .claude/skills/config/config.yaml.
Outputs JSON to stdout. Diagnostics go to stderr.

Usage:
    python3 check_failures.py [--window HOURS] [--config PATH]
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
SKILLS_DIR = SKILL_DIR.parent
PROJECT_ROOT = SKILLS_DIR.parent.parent
DEFAULT_CONFIG = SKILLS_DIR / "config" / "config.yaml"


def load_config(config_path):
    try:
        import yaml
        with open(config_path) as f:
            return yaml.safe_load(f)
    except ImportError:
        print("WARN: PyYAML not installed, using defaults", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"WARN: config load failed: {e}", file=sys.stderr)
        return {}


def scan_log_files(log_dir, window_hours, job_configs):
    """Scan cron-reports/ for logs with non-zero exit codes."""
    failures = []
    cutoff = datetime.now() - timedelta(hours=window_hours)

    if not log_dir.is_dir():
        return failures

    for log_file in sorted(log_dir.glob("cron-*.log")):
        # Skip parallel solver logs
        if "parallel" in log_file.name:
            continue

        # Extract job name and date from filename: cron-{job}-{date}.log
        match = re.match(r"cron-(.+)-(\d{4}-\d{2}-\d{2})\.log", log_file.name)
        if not match:
            continue

        job_name = match.group(1)
        date_str = match.group(2)

        try:
            log_date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            continue

        if log_date < cutoff:
            continue

        # Read last lines to find exit code
        try:
            content = log_file.read_text()
        except Exception:
            continue

        exit_match = re.search(r"^Exit:\s*(\d+)", content, re.MULTILINE)
        if not exit_match:
            # No exit line — check file modification time and size
            if log_file.stat().st_size < 200:
                # Tiny log = probably crashed before completing
                exit_code = -1
                reason = "log truncated (possible crash)"
            else:
                continue
        else:
            exit_code = int(exit_match.group(1))
            if exit_code == 0:
                continue
            reason = _detect_reason(content)

        job_cfg = job_configs.get(job_name, {})
        failures.append({
            "job": job_name,
            "date": date_str,
            "exit_code": exit_code,
            "recoverable": job_cfg.get("recoverable", False),
            "reason": reason,
            "skill": job_cfg.get("skill"),
        })

    return failures


def scan_failure_records(failure_dir, window_hours):
    """Scan .claude/failures/ for failure markdown records."""
    failures = []
    cutoff = datetime.now() - timedelta(hours=window_hours)

    if not failure_dir.is_dir():
        return failures

    for md_file in sorted(failure_dir.glob("*.md")):
        match = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.md", md_file.name)
        if not match:
            continue

        date_str = match.group(1)
        job_name = match.group(2)

        try:
            rec_date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            continue

        if rec_date < cutoff:
            continue

        try:
            content = md_file.read_text()
            exit_match = re.search(r"Exit Code\*\*:\s*(\d+)", content)
            exit_code = int(exit_match.group(1)) if exit_match else -1
        except Exception:
            exit_code = -1

        failures.append({
            "job": job_name,
            "date": date_str,
            "exit_code": exit_code,
            "source": "failure_record",
        })

    return failures


def _detect_reason(content):
    """Detect failure reason from log content."""
    last_lines = "\n".join(content.strip().split("\n")[-10:])

    patterns = [
        (r"declare: -A: invalid option", "bash 3.2 declare -A incompatibility"),
        (r"FATAL:", "fatal error"),
        (r"ConnectionRefused|ECONNREFUSED|Unable to connect", "connection error"),
        (r"alarm handler", "timeout"),
        (r"RETRY:", "connection retry attempted"),
        (r"lock race lost|already running", "concurrent run blocked"),
        (r"Prompt file not found", "missing prompt file"),
        (r"claude not found", "claude binary missing"),
    ]

    for pattern, reason in patterns:
        if re.search(pattern, last_lines):
            return reason

    return f"exit non-zero (check log)"


def main():
    parser = argparse.ArgumentParser(description="Scan cron failures")
    parser.add_argument("--window", type=int, default=None, help="Hours to look back")
    parser.add_argument("--config", type=str, default=None, help="Config file path")
    args = parser.parse_args()

    config_path = Path(args.config) if args.config else DEFAULT_CONFIG
    config = load_config(config_path)

    cron_cfg = config.get("cron", {})
    window_hours = args.window or cron_cfg.get("failure_window_hours", 48)
    log_dir = PROJECT_ROOT / cron_cfg.get("log_dir", "cron-reports")
    failure_dir = PROJECT_ROOT / cron_cfg.get("failure_dir", ".claude/failures")
    job_configs = cron_cfg.get("jobs", {})

    # Scan both sources
    log_failures = scan_log_files(log_dir, window_hours, job_configs)
    record_failures = scan_failure_records(failure_dir, window_hours)

    # Deduplicate: prefer log failures (more detail) over records
    seen = {(f["job"], f["date"]) for f in log_failures}
    for rf in record_failures:
        if (rf["job"], rf["date"]) not in seen:
            # Enrich with job config
            job_cfg = job_configs.get(rf["job"], {})
            rf["recoverable"] = job_cfg.get("recoverable", False)
            rf["skill"] = job_cfg.get("skill")
            log_failures.append(rf)

    result = {
        "failures": log_failures,
        "window_hours": window_hours,
        "scanned_at": datetime.now().isoformat(timespec="seconds"),
    }

    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
    print()  # trailing newline


if __name__ == "__main__":
    main()
