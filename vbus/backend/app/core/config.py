from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/vbus"
    SECRET_KEY: str = "vbus-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Comma-separated list of allowed CORS origins ("*" allows all)
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:5174"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_BOOKINGS: str = "vbus.bookings"
    KAFKA_TOPIC_SEATS: str = "vbus.seats"

    class Config:
        env_file = ".env"

settings = Settings()
