r"""
Create the VBus Kafka topics (optional — brokers usually auto-create them).

Run (broker must be up):
    .\.venv\Scripts\python.exe -m app.kafka.create_topics
"""
import sys
sys.path.insert(0, ".")
from app.core.config import settings


def main():
    from kafka.admin import KafkaAdminClient, NewTopic
    from kafka.errors import TopicAlreadyExistsError

    admin = KafkaAdminClient(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS.split(","))
    topics = [
        NewTopic(name=settings.KAFKA_TOPIC_BOOKINGS, num_partitions=1, replication_factor=1),
        NewTopic(name=settings.KAFKA_TOPIC_SEATS,    num_partitions=1, replication_factor=1),
    ]
    for t in topics:
        try:
            admin.create_topics([t])
            print(f"Created topic: {t.name}")
        except TopicAlreadyExistsError:
            print(f"Topic already exists: {t.name}")
    admin.close()


if __name__ == "__main__":
    main()
