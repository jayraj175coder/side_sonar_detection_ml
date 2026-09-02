import os
import json
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

# Backend root directory (backend/)
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "SONARX"
    PROJECT_DESCRIPTION: str = "AI-Powered Side-Scan Sonar Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Host & Port
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", 8000))

    # Model Configuration
    MODEL_PATH: str = "./models/best.onnx"
    CONFIDENCE_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    INPUT_SIZE: int = 640
    CLASSES: List[str] = ["MILCO", "NOMBO"]

    # CORS Configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Storage Configuration
    DATA_DIR: str = "./data"

    # Geocoding & Geospatial Configuration (Optional External Services)
    GEOCODING_API_KEY: str = os.getenv("GEOCODING_API_KEY", "")
    GEOCODING_PROVIDER: str = os.getenv("GEOCODING_PROVIDER", "opencage")

    @property
    def resolved_model_path(self) -> Path:
        """Resolves model path relative to backend root if not absolute."""
        p = Path(self.MODEL_PATH)
        if p.is_absolute():
            return p
        return (BACKEND_ROOT / p).resolve()

    @property
    def resolved_data_dir(self) -> Path:
        """Resolves data directory path relative to backend root if not absolute."""
        p = Path(self.DATA_DIR)
        if p.is_absolute():
            return p
        return (BACKEND_ROOT / p).resolve()

    @property
    def parsed_cors_origins(self) -> List[str]:
        """Parses CORS origins whether supplied as JSON array or comma-delimited string."""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            trimmed = self.CORS_ORIGINS.strip()
            if trimmed.startswith("[") and trimmed.endswith("]"):
                try:
                    return json.loads(trimmed)
                except Exception:
                    pass
            return [origin.strip() for origin in trimmed.split(",") if origin.strip()]
        return ["*"]


settings = Settings()
