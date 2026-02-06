#!/usr/bin/env python3
"""
HypeProof AI 자가발전 루프 - 08:00 KST까지 실제로 반복 실행

Usage:
    python overnight_loop.py
"""

import subprocess
import time
import json
from datetime import datetime, timedelta
from pathlib import Path
import pytz

KST = pytz.timezone('Asia/Seoul')
END_TIME = datetime.now(KST).replace(hour=8, minute=0, second=0, microsecond=0)
if datetime.now(KST) > END_TIME:
    END_TIME += timedelta(days=1)

CYCLE_MINUTES = 20
LOG_DIR = Path.home() / "CodeWorkspace" / "hypeproof" / "evolution-tracking"
WEB_DIR = Path.home() / "CodeWorkspace" / "hypeproof" / "web"

def run_claude(prompt: str, timeout: int = 300) -> str:
    """Claude Code headless 실행"""
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", "sonnet"],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(WEB_DIR)
        )
        return result.stdout + result.stderr
    except Exception as e:
        return f"ERROR: {e}"

def save_snapshot(cycle: int, output: str):
    """스냅샷 저장"""
    timestamp = datetime.now(KST).strftime("%Y%m%d_%H%M%S")
    snapshot_file = LOG_DIR / f"cycle_{cycle:03d}_{timestamp}.md"
    
    # Git log
    git_log = subprocess.run(
        ["git", "log", "--oneline", "-5"],
        capture_output=True, text=True, cwd=str(WEB_DIR)
    ).stdout
    
    # File count
    tsx_count = len(list(WEB_DIR.glob("src/**/*.tsx")))
    
    content = f"""# Cycle {cycle} Snapshot
**Time**: {datetime.now(KST).isoformat()}

## Output
```
{output[:2000]}
```

## Git Log (last 5)
```
{git_log}
```

## Stats
- TSX files: {tsx_count}
"""
    
    with open(snapshot_file, 'w') as f:
        f.write(content)
    
    print(f"  📸 Snapshot: {snapshot_file.name}")

def main():
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║       HypeProof AI 자가발전 루프 시작                          ║
║       종료 시각: {END_TIME.strftime('%Y-%m-%d %H:%M')} KST                          ║
║       사이클 간격: {CYCLE_MINUTES}분                                       ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    cycle = 0
    
    tasks = [
        "page.tsx 파일을 분석하고 Hero 섹션을 별도 컴포넌트로 분리해줘. src/components/sections/Hero.tsx 로 저장하고 page.tsx에서 import해서 사용하도록 수정해.",
        "page.tsx에서 Features 섹션을 src/components/sections/Features.tsx로 분리해줘.",
        "page.tsx에서 Team 섹션을 src/components/sections/Team.tsx로 분리해줘.",
        "page.tsx에서 Philosophy 섹션을 src/components/sections/Philosophy.tsx로 분리해줘.",
        "page.tsx에서 Footer를 src/components/layout/Footer.tsx로 분리해줘.",
        "page.tsx에서 Navigation을 src/components/layout/Navigation.tsx로 분리해줘.",
        "현재 코드를 리뷰하고 성능 최적화가 필요한 부분을 개선해줘. useReducedMotion 훅을 추가하고 모바일에서 애니메이션을 줄여줘.",
        "npm run build 실행해서 에러 있으면 수정해줘.",
        "git status 확인하고 변경사항 있으면 커밋해줘. 커밋 메시지는 'Refactor: component separation cycle N'",
        "코드 품질을 리뷰하고 개선할 부분 찾아서 수정해줘.",
    ]
    
    while datetime.now(KST) < END_TIME:
        cycle += 1
        task_idx = (cycle - 1) % len(tasks)
        task = tasks[task_idx]
        
        print(f"\n{'='*60}")
        print(f"🔄 Cycle {cycle} | {datetime.now(KST).strftime('%H:%M:%S')}")
        print(f"📋 Task: {task[:60]}...")
        print(f"{'='*60}")
        
        output = run_claude(task)
        save_snapshot(cycle, output)
        
        # 빌드 테스트
        print("  🔨 Build test...")
        build_result = subprocess.run(
            ["npm", "run", "build"],
            capture_output=True, text=True, cwd=str(WEB_DIR)
        )
        if build_result.returncode != 0:
            print("  ❌ Build failed, attempting fix...")
            run_claude("npm run build 에러가 났어. 에러 메시지 보고 수정해줘: " + build_result.stderr[:500])
        else:
            print("  ✅ Build success")
        
        # 남은 시간
        remaining = END_TIME - datetime.now(KST)
        print(f"  ⏰ Remaining: {remaining}")
        
        if datetime.now(KST) < END_TIME:
            print(f"  💤 Sleeping {CYCLE_MINUTES} minutes...")
            time.sleep(CYCLE_MINUTES * 60)
    
    # 최종 보고
    print(f"\n{'='*60}")
    print("🎉 루프 완료!")
    print(f"총 사이클: {cycle}")
    print(f"스냅샷: {LOG_DIR}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
