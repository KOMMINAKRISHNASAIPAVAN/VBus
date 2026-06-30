r"""
VBus Kafka consumer — listens for booking & seat events and processes them.

Run (from the backend folder, broker must be up):
    .\.venv\Scripts\python.exe -m app.kafka.consumer
"""
import sys
import json
import logging

sys.path.insert(0, ".")
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger("vbus.kafka.consumer")


def handle_booking(data):
    ev = data.get("event")
    pnr = data.get("pnr")
    if ev == "booking_created":
        log.info("[BOOKING] %s confirmed | trip %s | total Rs.%s | %s -> %s | %s passenger(s) -> notify passengers",
                 pnr, data.get("trip_id"), data.get("total_amount"),
                 data.get("boarding_stop"), data.get("dropping_stop"),
                 len(data.get("passengers") or []))
    elif ev == "booking_cancelled":
        log.info("[BOOKING] %s cancelled | trip %s -> process refund", pnr, data.get("trip_id"))
    else:
        log.info("[BOOKING] %s", data)


def handle_seat(data):
    log.info("[SEAT] %s | trip %s | seats %s", data.get("event"), data.get("trip_id"), data.get("seats"))


def main():
    from kafka import KafkaConsumer
    consumer = KafkaConsumer(
        settings.KAFKA_TOPIC_BOOKINGS,
        settings.KAFKA_TOPIC_SEATS,
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS.split(","),
        group_id="vbus-workers",
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda b: json.loads(b.decode("utf-8")),
        key_deserializer=lambda b: b.decode("utf-8") if b else None,
    )
    log.info("Listening on '%s' and '%s' (broker %s) ... Ctrl+C to stop.",
             settings.KAFKA_TOPIC_BOOKINGS, settings.KAFKA_TOPIC_SEATS, settings.KAFKA_BOOTSTRAP_SERVERS)
    try:
        for msg in consumer:
            if msg.topic == settings.KAFKA_TOPIC_BOOKINGS:
                handle_booking(msg.value)
            elif msg.topic == settings.KAFKA_TOPIC_SEATS:
                handle_seat(msg.value)
    except KeyboardInterrupt:
        log.info("Stopping consumer ...")
    finally:
        consumer.close()


if __name__ == "__main__":
    main()
