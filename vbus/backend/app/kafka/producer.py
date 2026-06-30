"""
Kafka producer for VBus.

Designed to be SAFE: if no broker is running (or kafka-python isn't installed),
publishing becomes a no-op and the API keeps working normally. Start a broker on
KAFKA_BOOTSTRAP_SERVERS to begin emitting events.
"""
import json
import atexit
import logging

from app.core.config import settings

log = logging.getLogger("vbus.kafka.producer")

_producer = None
_disabled = False   # set True after a failed connect so we don't retry slowly each request


def _get_producer():
    global _producer, _disabled
    if _disabled:
        return None
    if _producer is not None:
        return _producer
    try:
        from kafka import KafkaProducer
        _producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS.split(","),
            value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
            key_serializer=lambda k: str(k).encode("utf-8") if k is not None else None,
            acks="all",
            retries=2,
            # keep these short so a missing broker never hangs an API request
            request_timeout_ms=3000,
            max_block_ms=3000,
            api_version_auto_timeout_ms=3000,
        )
        atexit.register(_close)
        log.info("Kafka producer connected to %s", settings.KAFKA_BOOTSTRAP_SERVERS)
    except Exception as e:  # broker down, lib missing, etc.
        _disabled = True
        _producer = None
        log.warning("Kafka unavailable (%s). Events will be skipped until a broker is up.", e)
    return _producer


def _close():
    global _producer
    if _producer is not None:
        try:
            _producer.flush(timeout=3)
            _producer.close(timeout=3)
        except Exception:
            pass
        _producer = None


def publish(topic: str, value: dict, key=None):
    """Fire-and-forget publish. Never raises to the caller."""
    p = _get_producer()
    if p is None:
        log.info("[kafka skipped] %s key=%s value=%s", topic, key, value)
        return
    try:
        p.send(topic, key=key, value=value)
    except Exception as e:
        log.warning("Kafka publish to %s failed: %s", topic, e)


def _status(s):
    return s.value if hasattr(s, "value") else s


def publish_booking_event(event: str, booking, passengers=None):
    """event: 'booking_created' | 'booking_cancelled'"""
    publish(settings.KAFKA_TOPIC_BOOKINGS, {
        "event": event,
        "pnr": booking.pnr,
        "booking_id": booking.id,
        "user_id": booking.user_id,
        "trip_id": booking.trip_id,
        "status": _status(booking.status),
        "total_amount": booking.total_amount,
        "boarding_stop": booking.boarding_stop,
        "dropping_stop": booking.dropping_stop,
        "passengers": passengers if passengers is not None else booking.passenger_info,
    }, key=booking.pnr)


def publish_seat_event(event: str, trip_id: int, seat_numbers):
    """event: 'seat_booked' | 'seat_released'"""
    publish(settings.KAFKA_TOPIC_SEATS, {
        "event": event,
        "trip_id": trip_id,
        "seats": list(seat_numbers),
    }, key=str(trip_id))
