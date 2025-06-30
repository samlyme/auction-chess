import heapq
from typing import Generic, TypeVar

V = TypeVar("V")

class PriorityQueue(Generic[V]):
    arr: list[tuple[int, int, V]] = []
    _n: int = 0
    count: int = 0
    
    def __init__(self) -> None:
        pass

    def push(self, priority: int, value: V):
        heapq.heappush(self.arr, (priority, self._n, value))
        self._n += 1
        self.count += 1

    def pop(self) -> tuple[int, V]:
        p, _, v = heapq.heappop(self.arr)
        return p, v
    
    def peek(self) -> tuple[int, V]:
        p, _, v = self.arr[0]
        return p, v