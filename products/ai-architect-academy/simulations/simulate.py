#!/usr/bin/env python3
"""
AI Architect Academy - Simulation Engine
1000번 루프를 돌면서 게임 개발 시뮬레이션 + 자동 개선

Usage:
    python simulate.py --loops 1000 --output results/
"""

import os
import sys
import json
import yaml
import time
import random
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from anthropic import Anthropic

# ============================================
# Data Classes
# ============================================

@dataclass
class SimulationMetrics:
    """시뮬레이션 결과 지표"""
    completion_rate: float = 0.0
    autonomous_attempts: int = 0
    stuck_resolution_time: float = 0.0  # minutes
    prd_completeness: float = 0.0
    prompt_quality: float = 0.0  # 구체적 지시 비율
    child_engagement: float = 0.0  # 0-1
    parent_intervention_rate: float = 0.0  # 0-1 (낮을수록 좋음)
    efficacy_score: float = 0.0  # 0-5
    learning_recognition: int = 0  # 핵심학습 언급 수 (0-3)

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

@dataclass
class ImprovementSuggestion:
    """개선 제안"""
    target: str  # system_prompt, scenario, persona, etc.
    issue: str
    suggestion: str
    priority: str  # high, medium, low
    applied: bool = False

# ============================================
# Simulation Engine
# ============================================

class SimulationEngine:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.client = Anthropic()
        
        # Load configurations
        self.system_prompt = self._load_system_prompt()
        self.personas = self._load_personas()
        self.scenarios = self._load_scenarios()
        
        # State
        self.current_loop = 0
        self.results: List[SimulationResult] = []
        self.improvements: List[ImprovementSuggestion] = []
        
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
    
    def _call_claude(self, system: str, user: str, max_tokens: int = 500) -> str:
        """Claude API 호출"""
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}]
            )
            return response.content[0].text
        except Exception as e:
            print(f"API Error: {e}")
            return f"[ERROR: {e}]"
    
    def _simulate_child(self, persona: Dict, phase: Dict, context: str) -> str:
        """아이 역할 시뮬레이션"""
        child = persona["child"]
        prompt_template = self.scenarios["simulation_prompts"]["for_child"]
        
        prompt = prompt_template.format(
            age=child["age"],
            traits=", ".join(child["traits"]),
            phase_name=phase["name"],
            situation=context,
            prompt_examples="\n".join(child.get("prompt_examples", [])[:3])
        )
        
        system = f"당신은 시뮬레이션을 위해 {child['age']}세 아이 역할을 합니다. 성격: {', '.join(child['traits'])}"
        return self._call_claude(system, prompt, max_tokens=100)
    
    def _simulate_parent(self, persona: Dict, phase: Dict, context: str, child_response: str) -> str:
        """부모 역할 시뮬레이션"""
        parent = persona["parent"]
        child = persona["child"]
        prompt_template = self.scenarios["simulation_prompts"]["for_parent"]
        
        prompt = prompt_template.format(
            traits=", ".join(parent["traits"]),
            child_age=child["age"],
            phase_name=phase["name"],
            situation=context,
            child_response=child_response,
            prompt_examples="\n".join(parent.get("prompt_examples", [])[:3])
        )
        
        system = f"당신은 시뮬레이션을 위해 부모 역할을 합니다. 성격: {', '.join(parent['traits'])}"
        return self._call_claude(system, prompt, max_tokens=100)
    
    def _simulate_ai_copilot(self, child_input: str, parent_input: str, context: str) -> str:
        """AI 코파일럿 응답 시뮬레이션"""
        user_prompt = f"""
현재 상황: {context}
아이 입력: {child_input}
부모 입력: {parent_input}

AI 코파일럿으로서 응답하세요.
"""
        return self._call_claude(self.system_prompt, user_prompt, max_tokens=200)
    
    def _evaluate_interaction(self, transcript: List[Dict], persona: Dict) -> SimulationMetrics:
        """상호작용 평가"""
        metrics = SimulationMetrics()
        
        # 자율 시도 횟수 (아이가 직접 AI에게 지시한 횟수)
        child_directs = [t for t in transcript if t["role"] == "child" and "해줘" in t["content"] or "만들어" in t["content"]]
        metrics.autonomous_attempts = len(child_directs)
        
        # 부모 개입률
        parent_interventions = [t for t in transcript if t["role"] == "parent" and ("내가" in t["content"] or "이렇게" in t["content"])]
        total_parent = len([t for t in transcript if t["role"] == "parent"])
        metrics.parent_intervention_rate = len(parent_interventions) / max(total_parent, 1)
        
        # 완주율 (마지막 phase까지 도달했는지)
        phases_completed = len(set(t.get("phase", "") for t in transcript))
        total_phases = len(self.scenarios["workshop"]["phases"])
        metrics.completion_rate = phases_completed / total_phases
        
        # 프롬프트 품질 (구체적 지시 비율)
        specific_prompts = [t for t in transcript if t["role"] == "child" and len(t["content"]) > 20]
        metrics.prompt_quality = len(specific_prompts) / max(len(child_directs), 1)
        
        # 아이 참여도
        child_messages = len([t for t in transcript if t["role"] == "child"])
        metrics.child_engagement = min(child_messages / 20, 1.0)  # 20개 이상이면 1.0
        
        # 학습 인지 (핵심 학습 언급)
        core_learnings = ["자세히", "설명", "내가 결정", "실패", "다시"]
        last_messages = " ".join([t["content"] for t in transcript[-5:]])
        metrics.learning_recognition = sum(1 for l in core_learnings if l in last_messages)
        
        # PRD 완성도 (기획서 관련 대화 분석)
        prd_keywords = ["이름", "캐릭터", "목표", "규칙", "승리"]
        prd_mentions = sum(1 for k in prd_keywords if any(k in t["content"] for t in transcript))
        metrics.prd_completeness = prd_mentions / len(prd_keywords)
        
        # 효능감 점수 (긍정 표현 기반)
        positive_expressions = ["만들었", "됐다", "했어", "재밌", "신기", "좋아"]
        child_text = " ".join([t["content"] for t in transcript if t["role"] == "child"])
        positive_count = sum(1 for p in positive_expressions if p in child_text)
        metrics.efficacy_score = min(positive_count, 5)
        
        return metrics
    
    def _identify_issues(self, metrics: SimulationMetrics, persona: Dict) -> List[str]:
        """문제점 식별"""
        issues = []
        
        if metrics.autonomous_attempts < 10:
            issues.append(f"자율 시도 부족: {metrics.autonomous_attempts}회 (목표 10회)")
        
        if metrics.parent_intervention_rate > 0.3:
            issues.append(f"부모 과잉 개입: {metrics.parent_intervention_rate:.1%}")
        
        if metrics.completion_rate < 0.9:
            issues.append(f"완주율 미달: {metrics.completion_rate:.1%}")
        
        if metrics.prompt_quality < 0.6:
            issues.append(f"프롬프트 품질 낮음: {metrics.prompt_quality:.1%}")
        
        if metrics.learning_recognition < 2:
            issues.append(f"학습 인지 부족: {metrics.learning_recognition}/3")
        
        return issues
    
    def _generate_improvements(self, issues: List[str], transcript: List[Dict]) -> List[ImprovementSuggestion]:
        """개선 제안 생성 (AI 활용)"""
        if not issues:
            return []
        
        prompt = f"""
다음 시뮬레이션에서 발견된 문제점들을 분석하고 개선안을 제시하세요:

문제점:
{chr(10).join(f"- {i}" for i in issues)}

시스템 프롬프트 현재 버전:
{self.system_prompt[:500]}...

JSON 형식으로 답하세요:
[
  {{"target": "system_prompt|scenario|persona", "issue": "문제", "suggestion": "개선안", "priority": "high|medium|low"}}
]
"""
        
        response = self._call_claude(
            "당신은 AI 교육 제품 개선 전문가입니다. JSON으로만 답하세요.",
            prompt,
            max_tokens=500
        )
        
        try:
            # JSON 파싱 시도
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                suggestions = json.loads(json_match.group())
                return [ImprovementSuggestion(**s) for s in suggestions]
        except:
            pass
        
        return []
    
    def _apply_improvements(self, suggestions: List[ImprovementSuggestion]) -> int:
        """개선사항 적용"""
        applied_count = 0
        
        for suggestion in suggestions:
            if suggestion.priority != "high" or suggestion.applied:
                continue
            
            if suggestion.target == "system_prompt":
                # 시스템 프롬프트 개선 적용
                prompt = f"""
현재 시스템 프롬프트:
{self.system_prompt}

개선 요청:
문제: {suggestion.issue}
제안: {suggestion.suggestion}

개선된 시스템 프롬프트 전체를 출력하세요. 마크다운 형식 유지.
"""
                improved = self._call_claude(
                    "시스템 프롬프트를 개선하세요. 전체 내용을 출력하세요.",
                    prompt,
                    max_tokens=2000
                )
                
                if len(improved) > 500:  # 유효한 응답인지 확인
                    self.system_prompt = improved
                    suggestion.applied = True
                    applied_count += 1
                    print(f"  ✅ 시스템 프롬프트 개선 적용: {suggestion.issue[:50]}...")
        
        return applied_count
    
    def run_single_simulation(self, persona_id: str) -> SimulationResult:
        """단일 시뮬레이션 실행"""
        persona = None
        for p in self.personas["personas"]:
            if p["id"] == persona_id:
                persona = p
                break
        
        if not persona:
            raise ValueError(f"Unknown persona: {persona_id}")
        
        transcript = []
        phases = self.scenarios["workshop"]["phases"]
        
        # 각 phase 시뮬레이션
        for phase in phases:
            context = f"{phase['name']} 단계입니다."
            
            for checkpoint in phase.get("checkpoints", [])[:2]:  # 체크포인트당 2개만
                # 아이 반응
                child_response = self._simulate_child(persona, phase, context)
                transcript.append({
                    "role": "child",
                    "phase": phase["id"],
                    "checkpoint": checkpoint["name"],
                    "content": child_response
                })
                
                # 부모 반응
                parent_response = self._simulate_parent(persona, phase, context, child_response)
                transcript.append({
                    "role": "parent",
                    "phase": phase["id"],
                    "checkpoint": checkpoint["name"],
                    "content": parent_response
                })
                
                # AI 코파일럿 반응
                ai_response = self._simulate_ai_copilot(child_response, parent_response, context)
                transcript.append({
                    "role": "ai_copilot",
                    "phase": phase["id"],
                    "checkpoint": checkpoint["name"],
                    "content": ai_response
                })
                
                context = f"{checkpoint['name']} 완료. 다음 단계."
        
        # 평가
        metrics = self._evaluate_interaction(transcript, persona)
        issues = self._identify_issues(metrics, persona)
        
        # 통과 여부
        passed = (
            metrics.completion_rate >= 0.9 and
            metrics.autonomous_attempts >= 10 and
            metrics.parent_intervention_rate <= 0.3 and
            metrics.prompt_quality >= 0.6
        )
        
        # 개선 제안
        improvements = self._generate_improvements(issues, transcript)
        
        return SimulationResult(
            loop_id=self.current_loop,
            persona_id=persona_id,
            timestamp=datetime.now().isoformat(),
            metrics=metrics,
            passed=passed,
            transcript=transcript,
            issues=issues,
            improvements=[asdict(i) for i in improvements]
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
            "by_persona": {pid: {"passed": 0, "failed": 0} for pid in persona_ids}
        }
        
        print(f"\n🚀 Starting {num_loops} simulation loops...")
        print(f"📁 Output: {output_dir}")
        print(f"👥 Personas: {', '.join(persona_ids)}")
        print("-" * 60)
        
        for loop in range(num_loops):
            self.current_loop = loop + 1
            
            # 모든 페르소나에 대해 시뮬레이션
            for persona_id in persona_ids:
                result = self.run_single_simulation(persona_id)
                self.results.append(result)
                
                stats["total"] += 1
                if result.passed:
                    stats["passed"] += 1
                    stats["by_persona"][persona_id]["passed"] += 1
                else:
                    stats["failed"] += 1
                    stats["by_persona"][persona_id]["failed"] += 1
                
                # 개선사항 수집
                self.improvements.extend([
                    ImprovementSuggestion(**i) for i in result.improvements
                ])
            
            # 매 10 루프마다 개선 적용
            if loop > 0 and loop % 10 == 0:
                applied = self._apply_improvements(self.improvements)
                stats["improvements_applied"] += applied
                
                # 진행 상황 출력
                pass_rate = stats["passed"] / stats["total"] * 100
                print(f"  Loop {loop}/{num_loops} | Pass: {pass_rate:.1f}% | Improvements: {stats['improvements_applied']}")
            
            # 매 100 루프마다 중간 저장
            if loop > 0 and loop % 100 == 0:
                self._save_checkpoint(output_dir, loop, stats)
        
        # 최종 저장
        self._save_final_results(output_dir, stats)
        
        return stats
    
    def _save_checkpoint(self, output_dir: Path, loop: int, stats: Dict):
        """체크포인트 저장"""
        checkpoint = {
            "loop": loop,
            "timestamp": datetime.now().isoformat(),
            "stats": stats,
            "system_prompt_version": hash(self.system_prompt) % 10000
        }
        
        path = output_dir / f"checkpoint_{loop:04d}.json"
        with open(path, "w") as f:
            json.dump(checkpoint, f, indent=2, ensure_ascii=False)
    
    def _save_final_results(self, output_dir: Path, stats: Dict):
        """최종 결과 저장"""
        # 통계 저장
        stats_path = output_dir / "final_stats.json"
        with open(stats_path, "w") as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        
        # 개선된 시스템 프롬프트 저장
        prompt_path = output_dir / "improved_system_prompt.md"
        with open(prompt_path, "w") as f:
            f.write(self.system_prompt)
        
        # 마지막 100개 결과 저장
        results_path = output_dir / "last_100_results.json"
        with open(results_path, "w") as f:
            results_data = [asdict(r) for r in self.results[-100:]]
            json.dump(results_data, f, indent=2, ensure_ascii=False)
        
        # 개선 히스토리 저장
        improvements_path = output_dir / "improvements_history.json"
        with open(improvements_path, "w") as f:
            improvements_data = [asdict(i) for i in self.improvements]
            json.dump(improvements_data, f, indent=2, ensure_ascii=False)
        
        # 요약 리포트 생성
        self._generate_report(output_dir, stats)
    
    def _generate_report(self, output_dir: Path, stats: Dict):
        """요약 리포트 생성"""
        pass_rate = stats["passed"] / stats["total"] * 100 if stats["total"] > 0 else 0
        
        report = f"""# AI Architect Academy - Simulation Report

## Summary
- **Total Simulations**: {stats['total']}
- **Passed**: {stats['passed']} ({pass_rate:.1f}%)
- **Failed**: {stats['failed']}
- **Improvements Applied**: {stats['improvements_applied']}
- **Generated**: {datetime.now().isoformat()}

## Results by Persona

| Persona | Passed | Failed | Pass Rate |
|---------|--------|--------|-----------|
"""
        
        for pid, pstats in stats["by_persona"].items():
            total = pstats["passed"] + pstats["failed"]
            rate = pstats["passed"] / total * 100 if total > 0 else 0
            report += f"| {pid} | {pstats['passed']} | {pstats['failed']} | {rate:.1f}% |\n"
        
        report += f"""
## Key Improvements Applied

See `improvements_history.json` for full details.

## Next Steps

1. Review `improved_system_prompt.md` for latest version
2. Check `last_100_results.json` for recent simulation details
3. Analyze failed cases for remaining issues

---
*Generated by AI Architect Academy Simulation Engine*
"""
        
        report_path = output_dir / "REPORT.md"
        with open(report_path, "w") as f:
            f.write(report)
        
        print(f"\n📊 Report saved to {report_path}")

# ============================================
# Main
# ============================================

def main():
    parser = argparse.ArgumentParser(description="AI Architect Academy Simulation")
    parser.add_argument("--loops", type=int, default=1000, help="Number of loops")
    parser.add_argument("--output", type=str, default="results", help="Output directory")
    args = parser.parse_args()
    
    base_dir = Path(__file__).parent.parent
    output_dir = base_dir / "simulations" / args.output / datetime.now().strftime("%Y%m%d_%H%M%S")
    
    engine = SimulationEngine(base_dir)
    stats = engine.run_loop(args.loops, output_dir)
    
    print("\n" + "=" * 60)
    print("🎉 Simulation Complete!")
    print(f"   Total: {stats['total']}")
    print(f"   Passed: {stats['passed']} ({stats['passed']/stats['total']*100:.1f}%)")
    print(f"   Improvements: {stats['improvements_applied']}")
    print(f"   Results: {output_dir}")
    print("=" * 60)

if __name__ == "__main__":
    main()
