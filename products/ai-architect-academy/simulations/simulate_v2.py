#!/usr/bin/env python3
"""
AI Architect Academy - Simulation Engine v2
Claude Code Headless 모드 사용 (API 키 불필요)

Usage:
    python simulate_v2.py --loops 1000 --output results/
"""

import os
import sys
import json
import yaml
import time
import subprocess
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

# ============================================
# Data Classes
# ============================================

@dataclass
class SimulationMetrics:
    """시뮬레이션 결과 지표"""
    completion_rate: float = 0.0
    autonomous_attempts: int = 0
    stuck_resolution_time: float = 0.0
    prd_completeness: float = 0.0
    prompt_quality: float = 0.0
    child_engagement: float = 0.0
    parent_intervention_rate: float = 0.0
    efficacy_score: float = 0.0
    learning_recognition: int = 0

@dataclass
class SimulationResult:
    """단일 시뮬레이션 결과"""
    loop_id: int
    persona_id: str
    timestamp: str
    metrics: SimulationMetrics
    passed: bool
    transcript: List[Dict]
    issues: List[str]
    improvements: List[str]

# ============================================
# Claude Code Headless Wrapper
# ============================================

class ClaudeCodeRunner:
    """Claude Code CLI를 headless로 실행"""
    
    def __init__(self, model: str = "sonnet"):
        self.model = model
        self.call_count = 0
        self.total_time = 0
    
    def run(self, prompt: str, system: str = None, max_tokens: int = 500) -> str:
        """Claude Code headless 실행"""
        self.call_count += 1
        start = time.time()
        
        try:
            # 시스템 프롬프트가 있으면 프롬프트에 포함
            full_prompt = prompt
            if system:
                full_prompt = f"[System: {system}]\n\n{prompt}"
            
            # Claude Code headless 실행
            result = subprocess.run(
                ["claude", "-p", full_prompt, "--model", self.model],
                capture_output=True,
                text=True,
                timeout=60,
                cwd=os.path.expanduser("~")
            )
            
            self.total_time += time.time() - start
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"[ERROR: {result.stderr[:200]}]"
                
        except subprocess.TimeoutExpired:
            return "[ERROR: Timeout]"
        except Exception as e:
            return f"[ERROR: {str(e)[:200]}]"

# ============================================
# Simulation Engine
# ============================================

class SimulationEngine:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.claude = ClaudeCodeRunner(model="sonnet")
        
        # Load configurations
        self.system_prompt = self._load_system_prompt()
        self.personas = self._load_personas()
        self.scenarios = self._load_scenarios()
        
        # State
        self.current_loop = 0
        self.results: List[SimulationResult] = []
        self.improvements_applied = 0
        
    def _load_system_prompt(self) -> str:
        path = self.base_dir / "prompts" / "system_prompt.md"
        return path.read_text()
    
    def _load_personas(self) -> Dict:
        path = self.base_dir / "personas" / "all_personas.yaml"
        with open(path) as f:
            return yaml.safe_load(f)
    
    def _load_scenarios(self) -> Dict:
        path = self.base_dir / "scenarios" / "workshop_flow.yaml"
        with open(path) as f:
            return yaml.safe_load(f)
    
    def _simulate_interaction(self, persona: Dict, phase: Dict, checkpoint: Dict) -> Dict:
        """한 체크포인트의 상호작용 시뮬레이션"""
        child = persona["child"]
        parent = persona["parent"]
        
        # 통합 시뮬레이션 프롬프트
        prompt = f"""당신은 AI 교육 워크숍 시뮬레이터입니다.

## 페르소나
- 아이: {child['age']}세, 특성: {', '.join(child['traits'])}
- 부모: 특성: {', '.join(parent['traits'])}

## 현재 단계
- Phase: {phase['name']}
- Checkpoint: {checkpoint['name']}
- 상황: {checkpoint.get('expected_child_behavior', '일반적인 상황')}

## 시뮬레이션 요청
아이와 부모의 대화, 그리고 AI 코파일럿의 응답을 시뮬레이션하세요.

JSON 형식으로 답하세요:
{{
  "child": "아이의 말/행동 (1-2문장, 한국어)",
  "parent": "부모의 반응 (1-2문장, 한국어)",
  "ai_copilot": "AI 코파일럿 응답 (2-3문장, 한국어)",
  "child_engaged": true/false,
  "parent_intervened": true/false,
  "stuck": true/false
}}"""

        response = self.claude.run(prompt, max_tokens=400)
        
        # JSON 파싱
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # 파싱 실패 시 기본값
        return {
            "child": response[:100] if response else "(no response)",
            "parent": "(simulated)",
            "ai_copilot": "(simulated)",
            "child_engaged": True,
            "parent_intervened": False,
            "stuck": False
        }
    
    def _evaluate_simulation(self, interactions: List[Dict], persona: Dict) -> SimulationMetrics:
        """시뮬레이션 평가"""
        metrics = SimulationMetrics()
        
        total = len(interactions)
        if total == 0:
            return metrics
        
        # 완주율
        metrics.completion_rate = min(total / 14, 1.0)  # 14개 체크포인트 예상
        
        # 아이 참여도
        engaged = sum(1 for i in interactions if i.get("child_engaged", True))
        metrics.child_engagement = engaged / total
        
        # 부모 개입률
        intervened = sum(1 for i in interactions if i.get("parent_intervened", False))
        metrics.parent_intervention_rate = intervened / total
        
        # 자율 시도 (아이 발화에서 지시어 포함)
        child_texts = " ".join(i.get("child", "") for i in interactions)
        directive_words = ["해줘", "만들어", "바꿔", "넣어", "추가", "변경"]
        metrics.autonomous_attempts = sum(child_texts.count(w) for w in directive_words)
        
        # 프롬프트 품질 (긴 발화 비율)
        long_prompts = sum(1 for i in interactions if len(i.get("child", "")) > 15)
        metrics.prompt_quality = long_prompts / total
        
        # 막힘 해결 시간 (stuck이 있으면 증가)
        stuck_count = sum(1 for i in interactions if i.get("stuck", False))
        metrics.stuck_resolution_time = stuck_count * 3  # 가정: stuck당 3분
        
        # 효능감 점수 (긍정 표현)
        positive_words = ["만들었", "됐다", "재밌", "신기", "좋아", "할 수 있"]
        all_text = " ".join(i.get("child", "") + i.get("ai_copilot", "") for i in interactions)
        metrics.efficacy_score = min(sum(all_text.count(w) for w in positive_words), 5)
        
        # 학습 인지
        learning_words = ["자세히", "설명", "결정", "내가", "다시"]
        metrics.learning_recognition = min(sum(all_text.count(w) for w in learning_words), 3)
        
        # PRD 완성도
        prd_words = ["이름", "캐릭터", "목표", "규칙", "승리"]
        metrics.prd_completeness = sum(1 for w in prd_words if w in all_text) / len(prd_words)
        
        return metrics
    
    def _identify_issues(self, metrics: SimulationMetrics) -> List[str]:
        """문제점 식별"""
        issues = []
        
        if metrics.autonomous_attempts < 10:
            issues.append(f"자율 시도 부족: {metrics.autonomous_attempts}회")
        if metrics.parent_intervention_rate > 0.3:
            issues.append(f"부모 과잉 개입: {metrics.parent_intervention_rate:.0%}")
        if metrics.completion_rate < 0.9:
            issues.append(f"완주율 미달: {metrics.completion_rate:.0%}")
        if metrics.child_engagement < 0.7:
            issues.append(f"아이 참여도 낮음: {metrics.child_engagement:.0%}")
        if metrics.efficacy_score < 3:
            issues.append(f"효능감 부족: {metrics.efficacy_score}/5")
        
        return issues
    
    def _generate_improvement(self, issues: List[str]) -> Optional[str]:
        """개선안 생성"""
        if not issues:
            return None
        
        prompt = f"""다음 AI 교육 시뮬레이션의 문제점을 분석하고, 시스템 프롬프트 개선안을 한 문장으로 제시하세요.

문제점:
{chr(10).join(f"- {i}" for i in issues)}

현재 시스템 프롬프트 핵심:
- AI가 아이를 "지휘자"로 존중
- 모호한 지시는 구체화 질문으로 유도
- 부모 개입 시 아이에게 다시 질문

개선안 (한 문장):"""

        return self.claude.run(prompt, max_tokens=100)
    
    def _apply_improvement(self, suggestion: str):
        """시스템 프롬프트에 개선 적용"""
        if not suggestion or len(suggestion) < 10:
            return
        
        # 간단한 개선: 시스템 프롬프트 끝에 추가
        addition = f"\n\n## 개선 #{self.improvements_applied + 1}\n{suggestion}"
        self.system_prompt += addition
        self.improvements_applied += 1
        
        # 저장
        path = self.base_dir / "prompts" / "system_prompt_improved.md"
        path.write_text(self.system_prompt)
    
    def run_single_simulation(self, persona_id: str) -> SimulationResult:
        """단일 시뮬레이션 실행"""
        persona = next((p for p in self.personas["personas"] if p["id"] == persona_id), None)
        if not persona:
            raise ValueError(f"Unknown persona: {persona_id}")
        
        interactions = []
        phases = self.scenarios["workshop"]["phases"]
        
        # 각 phase의 처음 2개 체크포인트만 시뮬레이션 (속도 위해)
        for phase in phases[:5]:  # 처음 5개 phase만
            for checkpoint in phase.get("checkpoints", [])[:2]:
                interaction = self._simulate_interaction(persona, phase, checkpoint)
                interaction["phase"] = phase["id"]
                interaction["checkpoint"] = checkpoint["name"]
                interactions.append(interaction)
        
        # 평가
        metrics = self._evaluate_simulation(interactions, persona)
        issues = self._identify_issues(metrics)
        
        # 통과 여부
        passed = (
            metrics.completion_rate >= 0.8 and
            metrics.autonomous_attempts >= 8 and
            metrics.parent_intervention_rate <= 0.35 and
            metrics.child_engagement >= 0.6
        )
        
        # 개선안 (실패 시)
        improvements = []
        if not passed and issues:
            suggestion = self._generate_improvement(issues)
            if suggestion:
                improvements.append(suggestion)
        
        return SimulationResult(
            loop_id=self.current_loop,
            persona_id=persona_id,
            timestamp=datetime.now().isoformat(),
            metrics=metrics,
            passed=passed,
            transcript=interactions,
            issues=issues,
            improvements=improvements
        )
    
    def run_loop(self, num_loops: int, output_dir: Path):
        """메인 루프 실행"""
        output_dir.mkdir(parents=True, exist_ok=True)
        
        persona_ids = [p["id"] for p in self.personas["personas"]]
        
        stats = {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "improvements_applied": 0,
            "by_persona": {pid: {"passed": 0, "failed": 0} for pid in persona_ids},
            "api_calls": 0,
            "api_time": 0
        }
        
        print(f"\n🚀 Starting {num_loops} simulation loops (Claude Code Headless)...")
        print(f"📁 Output: {output_dir}")
        print(f"👥 Personas: {len(persona_ids)}")
        print("-" * 60)
        
        start_time = time.time()
        
        for loop in range(num_loops):
            self.current_loop = loop + 1
            
            # 랜덤하게 1개 페르소나 선택 (속도 위해)
            import random
            persona_id = random.choice(persona_ids)
            
            try:
                result = self.run_single_simulation(persona_id)
                self.results.append(result)
                
                stats["total"] += 1
                if result.passed:
                    stats["passed"] += 1
                    stats["by_persona"][persona_id]["passed"] += 1
                else:
                    stats["failed"] += 1
                    stats["by_persona"][persona_id]["failed"] += 1
                    
                    # 개선 적용 (매 5번 실패마다)
                    if result.improvements and stats["failed"] % 5 == 0:
                        self._apply_improvement(result.improvements[0])
                        stats["improvements_applied"] += 1
                
            except Exception as e:
                print(f"  ⚠️ Loop {loop} error: {e}")
                continue
            
            # 진행 상황 (매 10 루프)
            if loop > 0 and loop % 10 == 0:
                elapsed = time.time() - start_time
                pass_rate = stats["passed"] / stats["total"] * 100 if stats["total"] > 0 else 0
                print(f"  Loop {loop}/{num_loops} | Pass: {pass_rate:.1f}% | Time: {elapsed:.0f}s | Improvements: {stats['improvements_applied']}")
            
            # 체크포인트 (매 100 루프)
            if loop > 0 and loop % 100 == 0:
                self._save_checkpoint(output_dir, loop, stats)
        
        # API 통계
        stats["api_calls"] = self.claude.call_count
        stats["api_time"] = self.claude.total_time
        
        # 최종 저장
        self._save_final_results(output_dir, stats)
        
        return stats
    
    def _save_checkpoint(self, output_dir: Path, loop: int, stats: Dict):
        checkpoint = {
            "loop": loop,
            "timestamp": datetime.now().isoformat(),
            "stats": stats
        }
        path = output_dir / f"checkpoint_{loop:04d}.json"
        with open(path, "w") as f:
            json.dump(checkpoint, f, indent=2, ensure_ascii=False)
    
    def _save_final_results(self, output_dir: Path, stats: Dict):
        # 통계
        with open(output_dir / "final_stats.json", "w") as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        
        # 개선된 프롬프트
        (output_dir / "improved_system_prompt.md").write_text(self.system_prompt)
        
        # 마지막 50개 결과
        with open(output_dir / "last_50_results.json", "w") as f:
            results_data = [asdict(r) for r in self.results[-50:]]
            json.dump(results_data, f, indent=2, ensure_ascii=False)
        
        # 리포트
        self._generate_report(output_dir, stats)
    
    def _generate_report(self, output_dir: Path, stats: Dict):
        pass_rate = stats["passed"] / stats["total"] * 100 if stats["total"] > 0 else 0
        
        report = f"""# AI Architect Academy - Simulation Report (v2)

## Summary
- **Engine**: Claude Code Headless
- **Total**: {stats['total']}
- **Passed**: {stats['passed']} ({pass_rate:.1f}%)
- **Improvements Applied**: {stats['improvements_applied']}
- **API Calls**: {stats.get('api_calls', 'N/A')}
- **Generated**: {datetime.now().isoformat()}

## By Persona

| Persona | Passed | Failed | Rate |
|---------|--------|--------|------|
"""
        for pid, ps in stats["by_persona"].items():
            t = ps["passed"] + ps["failed"]
            r = ps["passed"] / t * 100 if t > 0 else 0
            report += f"| {pid} | {ps['passed']} | {ps['failed']} | {r:.0f}% |\n"
        
        report += "\n---\n*Claude Code Headless Engine*"
        
        (output_dir / "REPORT.md").write_text(report)
        print(f"\n📊 Report: {output_dir / 'REPORT.md'}")

# ============================================
# Main
# ============================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--loops", type=int, default=1000)
    parser.add_argument("--output", type=str, default="overnight_run")
    args = parser.parse_args()
    
    base_dir = Path(__file__).parent.parent
    output_dir = base_dir / "simulations" / "results" / f"{args.output}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    engine = SimulationEngine(base_dir)
    stats = engine.run_loop(args.loops, output_dir)
    
    print("\n" + "=" * 60)
    print("🎉 Complete!")
    print(f"   Pass Rate: {stats['passed']/max(stats['total'],1)*100:.1f}%")
    print(f"   Improvements: {stats['improvements_applied']}")
    print("=" * 60)

if __name__ == "__main__":
    main()
