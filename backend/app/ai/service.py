from __future__ import annotations

import os

import httpx

from .providers import BriefInput, BriefProvider, DeterministicBriefProvider


class OpenAIBriefProvider(BriefProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model

    def generate(self, brief_input: BriefInput) -> str:
        prompt = (
            "Generate a concise operations brief. Never invent any numbers, only reuse exact provided values. "
            "Keep to: what happened, what matters, what needs attention, and actions.\n"
            f"Day: {brief_input.day_label}\n"
            f"Revenue line: {brief_input.revenue_text}\n"
            f"Orders line: {brief_input.orders_text}\n"
            f"Observations: {' | '.join(brief_input.observations[:5])}\n"
            f"Actions: {' | '.join(brief_input.actions[:5])}"
        )

        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": "Bearer " + self.api_key, "Content-Type": "application/json"},
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You write concise operational briefs."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.1,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


def select_brief_provider() -> BriefProvider:
    key = os.getenv("OPENAI_API_KEY")
    provider = os.getenv("AI_PROVIDER", "auto")
    if key and provider in {"auto", "openai"}:
        try:
            return OpenAIBriefProvider(key)
        except Exception:
            return DeterministicBriefProvider()
    return DeterministicBriefProvider()
