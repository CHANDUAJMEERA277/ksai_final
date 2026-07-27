# PYTHON — CHAPTER 10
## Advanced Python Concepts

> “Understanding what happens under the hood is what separates using a language from mastering it.”

### By the End of This Chapter, You Will Be Able To:
* Understand Python's data model and dunder methods at a deeper level
* Explain the basics of memory management — reference counting and garbage collection
* Distinguish mutable vs. immutable objects, and shallow vs. deep copies
* Understand the basics of concurrency: threading, multiprocessing, and asyncio, and when each applies
* Recognize what metaclasses are, at an overview level
* Use type hints and the typing module to write clearer, more maintainable code

---

### 1. Python's Data Model / Dunder Methods in Depth

Dunder methods let your custom objects support arithmetic, comparisons, indexing, and iteration natively, letting them behave like Python's built-in types.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other): # supports v1 + v2
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other): # supports v1 == v2
        return self.x == other.x and self.y == other.y

    def __lt__(self, other): # supports v1 < v2
        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)

    def __getitem__(self, index): # supports v1[0], v1[1]
        return (self.x, self.y)[index]

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)

print(v1 + v2) # Vector(4, 6) — uses __add__
print(v1 < v2) # True — uses __lt__
print(v1[0]) # 1 — uses __getitem__
```

Output:
```text
Vector(4, 6)
True
1
```

> [!NOTE]
> **Key Idea**
> This is why Python's data model is often called "protocol-based": there's no special interface to declare — implementing `__add__` is what makes `+` work, implementing `__getitem__` is what makes indexing and loop iteration work.

> [!NOTE]
> **Real-World Use**
> Custom library design leans heavily on this: NumPy arrays, pandas DataFrames, and countless other libraries feel like "native" Python types purely because they implement the right dunder methods.

---

### 2. Memory Management Basics

Python manages memory automatically, but understanding reference counting and garbage collection explains object lifetimes and circular references.

#### Reference counting

Every object keeps a count of how many references point to it. When that count hits zero, Python immediately frees the memory — this is reference counting, and it's the primary way CPython manages memory.

```python
import sys

a = [1, 2, 3]
print(sys.getrefcount(a)) # baseline count (includes a temporary reference)

b = a # a and b now both point to the SAME list
print(sys.getrefcount(a)) # count increased

del b # one reference removed
print(sys.getrefcount(a)) # count decreased back
```

#### Garbage collection (for circular references)

A circular reference happens when two or more objects reference each other, keeping their reference counts from ever hitting zero, even when they're otherwise unreachable.

```python
class Node:
    def __init__(self):
        self.next = None

a = Node()
b = Node()
a.next = b
b.next = a # a circular reference — each keeps the other alive

del a
del b
# Reference counting alone can't free these — they still reference each other.
# Python's cyclic garbage collector periodically detects and cleans up cycles like this.
```

> [!WARNING]
> **Watch Out**
> A circular reference can never reach a reference count of zero on its own. Python's garbage collector runs periodically specifically to detect and clean up these cycles — without it, such objects would leak memory forever.

---

### 3. Mutable vs. Immutable Objects, Shallow vs. Deep Copy

Assignment in Python never copies; it just creates a new reference. Copying mutable objects correctly requires distinguishing between shallow and deep copies.

```python
original = [1, 2, [3, 4]] # a list containing a nested list

# Assignment does NOT copy — it just creates another reference
same_object = original
same_object[0] = 99
print(original) # [99, 2, [3, 4]] — original changed too!
```

Output:
```text
[99, 2, [3, 4]]
```

#### Shallow copy — copies the outer container only

```python
import copy

original = [1, 2, [3, 4]]
shallow = copy.copy(original) # or original.copy()

shallow[0] = 99 # only affects the copy — outer level is independent
shallow[2][0] = "changed" # affects BOTH — the nested list is still shared!

print(original)
print(shallow)
```

Output:
```text
[1, 2, ['changed', 4]]
[99, 2, ['changed', 4]]
```

#### Deep copy — copies everything, recursively

```python
import copy

original = [1, 2, ['changed', 4]]
deep = copy.deepcopy(original)

deep[2][0] = "fully independent"

print(original)
print(deep)
```

Output:
```text
[1, 2, ['changed', 4]]
[1, 2, ['fully independent', 4]]
```

> [!NOTE]
> **Key Idea**
> Plain assignment (`=`) never copies — it just adds another name for the same object. A shallow copy duplicates the outer container but still shares nested objects. Only a deep copy fully separates every nested level.

---

### 4. Concurrency Basics — Threading, Multiprocessing, asyncio

Concurrency means making progress on multiple tasks around the same time. Python offers three different approaches, each suited to a different workload.

| Approach | Best for | Why |
| :--- | :--- | :--- |
| threading | I/O-bound tasks (network calls, file reads, waiting) | Threads can overlap while waiting on I/O, despite the GIL |
| multiprocessing | CPU-bound tasks (heavy computation) | Separate processes each get their own Python interpreter, bypassing the GIL |
| asyncio | Many I/O-bound tasks at once (thousands of connections) | Single-threaded, cooperative — extremely efficient for high-volume waiting |

#### threading — for I/O-bound waiting

```python
import threading, time

def download(name):
    print(f"Starting {name}")
    time.sleep(1) # simulates waiting on a network response
    print(f"Finished {name}")

threads = [threading.Thread(target=download, args=(f"file{i}",)) for i in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join() # wait for all threads to finish
```

#### asyncio — for many concurrent waits

```python
import asyncio

async def download(name):
    print(f"Starting {name}")
    await asyncio.sleep(1) # non-blocking wait
    print(f"Finished {name}")

async def main():
    await asyncio.gather(download("file1"), download("file2"), download("file3"))

asyncio.run(main())
```

> [!WARNING]
> **Watch Out**
> Python's Global Interpreter Lock (GIL) means only one thread runs Python bytecode at a time — so threading doesn't speed up CPU-heavy work, only I/O-bound waiting. For real parallel computation, multiprocessing (separate processes, no shared GIL) is the right tool.

> [!NOTE]
> **Real-World Use**
> Concurrent web scrapers and async chat/notification systems lean on threading or asyncio (I/O-bound waiting on network calls); parallel data processing pipelines lean on multiprocessing (CPU-bound crunching across multiple cores).

---

### 5. Metaclasses (Overview Level)

If a class is a blueprint for objects, a metaclass is a blueprint for classes. Every class in Python is itself an instance of a metaclass — usually `type` — and metaclasses let you customize how classes themselves get created.

```python
class Meta(type):
    def __new__(mcs, name, bases, namespace):
        print(f"Creating class: {name}")
        return super().__new__(mcs, name, bases, namespace)

class MyClass(metaclass=Meta):
    pass
# Output happens at class-definition time, before any object is even created:
# Creating class: MyClass
```

Output:
```text
Creating class: MyClass
```

> [!NOTE]
> **Note**
> Metaclasses are an advanced, rarely-needed tool — most Python developers go years without writing one. They're mentioned here mainly so the term isn't mysterious when it appears in framework internals (Django's ORM and various validation libraries use them behind the scenes).

---

### 6. Type Hints and Static Typing (typing module)

Python remains dynamically typed at runtime — type hints don't change that. They are optional annotations that document expected types, letting tools (editors, linters, mypy) catch type-related bugs before the code ever runs.

```python
def calculate_total(prices: list[float], tax_rate: float = 0.1) -> float:
    subtotal = sum(prices)
    return subtotal * (1 + tax_rate)

print(calculate_total([10.0, 20.0, 5.5]))
```

Output:
```text
39.05
```

#### More expressive hints with the typing module

```python
from typing import Optional, Union

def find_user(user_id: int) -> Optional[dict]:
    """Returns a user dict, or None if not found."""
    users = {1: {"name": "Asha"}}
    return users.get(user_id)

def parse_id(value: Union[str, int]) -> int:
    """Accepts either a string or an int, always returns an int."""
    return int(value)
```

> [!NOTE]
> **Key Idea**
> Type hints are not enforced at runtime — `calculate_total(["a", "b"], "oops")` will still run and fail at the arithmetic, not at the function call. Their value comes from static analysis tools and editor autocompletion catching mismatches before you ever run the code.

> [!NOTE]
> **Real-World Use**
> Large, maintainable codebases and custom library design both rely heavily on type hints — they make a function's contract explicit at a glance, which matters enormously once a codebase has more files than any one person can hold in their head.

---

### 7. Mini Project: Type-Hinted Concurrent Downloader (Simulated)

This project ties the chapter together: type hints throughout, a custom class using dunder methods, and `asyncio` for simulated concurrent "downloads."

```python
# concurrent_downloader.py
import asyncio
from typing import List

class DownloadResult:
    def __init__(self, name: str, size_kb: int):
        self.name = name
        self.size_kb = size_kb

    def __repr__(self) -> str:
        return f"DownloadResult({self.name!r}, {self.size_kb}KB)"

    def __add__(self, other: "DownloadResult") -> int:
        return self.size_kb + other.size_kb

async def download(name: str, size_kb: int) -> DownloadResult:
    print(f"Starting {name}...")
    await asyncio.sleep(0.5) # simulate network delay
    print(f"Finished {name}")
    return DownloadResult(name, size_kb)

async def download_all(files: List[tuple]) -> List[DownloadResult]:
    tasks = [download(name, size) for name, size in files]
    return await asyncio.gather(*tasks)

files_to_get = [("report.pdf", 240), ("photo.jpg", 850), ("data.csv", 120)]
results = asyncio.run(download_all(files_to_get))
print(results)
total_kb = sum(r.size_kb for r in results)
print(f"Total downloaded: {total_kb}KB")
```

Output:
```text
Starting report.pdf...
Starting photo.jpg...
Starting data.csv...
Finished report.pdf
Finished photo.jpg
Finished data.csv
[DownloadResult('report.pdf', 240KB), DownloadResult('photo.jpg', 850KB), DownloadResult('data.csv', 120KB)]
Total downloaded: 1210KB
```

#### ✏ Try It Yourself
Add an `__eq__` method to `DownloadResult` that compares both `name` and `size_kb`, and use `deepcopy` to create an independent copy of the results list to modify without affecting the original.

---

### Chapter Summary

#### Key Takeaways
* **Dunder methods** extend beyond `__str__`/`__eq__` — `__add__`, `__lt__`, `__getitem__`, and more let custom objects support operators and indexing natively.
* **CPython** uses reference counting for memory management, plus a cyclic garbage collector to handle circular references that reference counting alone can't free.
* **Assignment** never copies; a shallow copy duplicates the outer container but still shares nested objects; only a deep copy fully separates every nested level.
* **threading** suits I/O-bound waiting, **multiprocessing** suits CPU-bound computation (bypassing the GIL), and **asyncio** suits many concurrent I/O-bound tasks efficiently.
* **A metaclass** is a blueprint for classes themselves (usually `type`) — an advanced, rarely-needed tool mostly encountered inside frameworks.
* **Type hints** (and the typing module) document expected types for tools and readers, without being enforced at runtime — valuable for large or shared codebases.
