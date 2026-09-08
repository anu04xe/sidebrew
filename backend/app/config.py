from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sidebrew"
    database_url: str = "sqlite:///./sidebrew.db"
    openai_api_key: str | None = None
    ai_provider: str = "auto"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
