from __future__ import annotations

from dataclasses import dataclass


@dataclass
class BriefInput:
    day_label: str
    revenue_text: str
    orders_text: str
    observations: list[str]
    actions: list[str]


class BriefProvider:
    def generate(self, brief_input: BriefInput) -> str:
        raise NotImplementedError


class DeterministicBriefProvider(BriefProvider):
    def generate(self, brief_input: BriefInput) -> str:
        observations = "\n".join([f"• {item}" for item in brief_input.observations[:3]]) or "• No major anomalies detected"
        actions = "\n".join([f"• {item}" for item in brief_input.actions[:3]]) or "• Keep normal operating rhythm"
        return (
            f"GOOD MORNING · {brief_input.day_label}\n\n"
            f"Revenue: {brief_input.revenue_text}\n"
            f"Orders: {brief_input.orders_text}\n\n"
            f"Worth noticing:\n{observations}\n\n"
            f"Today's actions:\n{actions}"
        )
