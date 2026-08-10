"""In-process pub/sub hub for real-time SSE broadcasts.

All clients connect to the same uvicorn process, so an in-process registry of
asyncio queues is sufficient (no external broker needed for this deployment).
Events are dicts; the stream serializes them as unnamed SSE `data:` frames.
"""
import asyncio
from typing import Any

QUEUE_MAX = 256


class EventHub:
    def __init__(self) -> None:
        self._queues: set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()

    async def publish(self, event: dict[str, Any]) -> None:
        async with self._lock:
            targets = list(self._queues)
        for q in targets:
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:  # slow consumer: drop rather than block
                pass

    async def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=QUEUE_MAX)
        async with self._lock:
            self._queues.add(q)
        return q

    async def unsubscribe(self, q: asyncio.Queue) -> None:
        async with self._lock:
            self._queues.discard(q)


hub = EventHub()
