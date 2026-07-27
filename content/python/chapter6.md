# PYTHON — CHAPTER 6
## Functional & Pythonic Concepts

> “Writing Pythonic code means embracing readability, functional programming tools, and lazy evaluation for clean and performant applications.”

### By the End of This Chapter, You Will Be Able To:
* Distinguish between iterables and iterators and create custom ones
* Write memory-efficient generators using the `yield` keyword
* Build custom decorators to modify and extend function behavior
* Implement context managers to guarantee cleanup of resources
* Apply `map()`, `filter()`, and `reduce()` for functional data transformations
* Write list, set, dict, and generator comprehensions with confidence
* Understand first-class functions and closures in Python

---

### 1. Iterators and Iterables

An iterable is any Python object capable of returning its members one at a time, permitting it to be looped over. An iterator is a stateful helper object that actually performs the iteration.

```python
numbers = [10, 20]
iterator = iter(numbers)

print(next(iterator))
print(next(iterator))
# print(next(iterator)) # Raises StopIteration when empty
```

Output:
```text
10
20
```

* **Iterable**: An object capable of returning its members one at a time. It implements `__iter__` to return an iterator. Examples: Lists, Tuples, Dictionaries, and Strings.
* **Iterator**: The actual stateful object that does the iteration. It implements `__next__` to return subsequent elements and `__iter__` to return itself. It raises `StopIteration` when there are no more elements.

You can create a custom iterator class by implementing both `__iter__` and `__next__` magic methods.

```python
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        val = self.current
        self.current -= 1
        return val

for num in Countdown(3):
    print(num)
```

Output:
```text
3
2
1
```

> [!NOTE]
> **Key Idea**
> An iterable is a collection that you can get an iterator from (using `iter()`). An iterator is a state-preserving machine that produces the next value upon request (using `next()`), moving sequentially through the collection.

---

### 2. Generators and the yield Keyword

Generators are a simpler way to create iterators using functions and the `yield` keyword. Unlike normal functions that run and return once, generator functions yield values one at a time and pause their execution.

```python
def countdown(start):
    while start > 0:
        yield start
        start -= 1

for num in countdown(3):
    print(num)
```

Output:
```text
3
2
1
```

> [!NOTE]
> **Note**
> Calling a generator function does not execute its body. Instead, it returns a generator object. The code inside only runs when `next()` is called on the generator object (or inside a loop), pausing at each `yield` statement.

Because generators yield values on-the-fly instead of keeping them all in RAM, they are highly memory-efficient.

```python
import sys

# List approach - loads all items in memory
squares_list = [n ** 2 for n in range(1000)]

# Generator approach - computes on the fly
squares_gen = (n ** 2 for n in range(1000))

print("List size in bytes:", sys.getsizeof(squares_list))
print("Generator size in bytes:", sys.getsizeof(squares_gen))
```

Output:
```text
List size in bytes: 8856
Generator size in bytes: 192
```

> [!NOTE]
> **Real-World Use**
> Large data pipelines use generators to stream log lines, database query chunks, or image batches to avoid running out of RAM.

#### ✏ Try It Yourself
Create a generator function `even_numbers(limit)` that yields even numbers from 0 up to (but not including) `limit`.

---

### 3. Decorators

Decorators allow you to wrap a function with another function to extend or modify its behavior without modifying its source code.

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def waste_time():
    time.sleep(0.5)

waste_time()
```

Output:
```text
waste_time took 0.5005 seconds
```

Flow of a decorator call:
Call waste_time() -> wrapper() -> Start Timer -> Original function -> End Timer -> Return

> [!NOTE]
> **Key Idea**
> A decorator takes a function as input, adds some extra behavior around it inside a wrapper function, and returns this new wrapper function. It is a powerful way to implement cross-cutting concerns like logging or timing.

Caching is another prime candidate for decorators. `@memoize` can store previous inputs and outputs to optimize recursive calls.

```python
def memoize(func):
    cache = {}
    def wrapper(n):
        if n not in cache:
            cache[n] = func(n)
        return cache[n]
    return wrapper

@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

print(fib(30))
```

Output:
```text
832040
```

> [!NOTE]
> **Real-World Use**
> Web frameworks like Flask or FastAPI use decorators to route requests to specific handler functions (e.g. `@app.get("/")`).

---

### 4. Context Managers

Context managers allow you to allocate and release resources precisely when you want to, commonly using the `with` statement.

> [!WARNING]
> **Watch Out**
> Manually opening and closing files using `f = open()` and `f.close()` is error-prone. If an error occurs between the open and close calls, the file remains open in memory. The `with` statement guarantees cleanup, even if exceptions are raised.

You can write custom context managers using classes that implement `__enter__` and `__exit__`.

```python
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        print(f"Elapsed: {self.end - self.start:.4f} seconds")

with Timer():
    time.sleep(0.5)
```

Output:
```text
Elapsed: 0.5005 seconds
```

> [!NOTE]
> **Key Idea**
> Any class with `__enter__` and `__exit__` methods implements the Context Manager protocol. `__enter__` handles resource setup, while `__exit__` guarantees resource teardown, even when errors occur inside the block.

---

### 5. map(), filter(), reduce()

Functional programming tools like `map()`, `filter()`, and `reduce()` allow you to process collections cleanly.

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# map: double each number
doubled = list(map(lambda x: x * 2, numbers))

# filter: keep only even numbers
evens = list(filter(lambda x: x % 2 == 0, numbers))

# reduce: sum all numbers
total = reduce(lambda x, y: x + y, numbers)

print("Doubled:", doubled)
print("Evens:", evens)
print("Total:", total)
```

Output:
```text
Doubled: [2, 4, 6, 8, 10]
Evens: [2, 4]
Total: 15
```

> [!NOTE]
> **Note**
> `reduce()` is not a built-in function in Python 3; it must be imported from the `functools` module. Both `map()` and `filter()` return lazy iterator objects in Python 3, which is why we wrap them in `list()` to display their contents.

#### ✏ Try It Yourself
Use `filter()` and a `lambda` to filter a list of strings to only keep words that start with the letter `"a"`.

---

### 6. Comprehensions — List, Dict, Set & Generator

Comprehensions offer a compact syntax to construct new lists, sets, dictionaries, and generators from existing collections.

```python
# List Comprehension
l_comp = [x * 2 for x in range(3)]

# Set Comprehension
s_comp = {x * 2 for x in range(3)}

# Dict Comprehension
d_comp = {x: x * 2 for x in range(3)}

# Generator Expression
g_comp = (x * 2 for x in range(3))

print(l_comp)
print(s_comp)
print(d_comp)
print(g_comp)
```

Output:
```text
[0, 2, 4]
{0, 2, 4}
{0: 0, 1: 2, 2: 4}
<generator object <genexpr> at 0x...>
```

| Comprehension Type | Bracket Type | Result Type | Example |
| :--- | :--- | :--- | :--- |
| List Comprehension | Square brackets `[ ]` | List | `[x for x in data]` |
| Set Comprehension | Curly braces `{ }` | Set (Unique items) | `{x for x in data}` |
| Dict Comprehension | Curly braces `{k: v}` | Dictionary (Key-Value) | `{x: x for x in data}` |
| Generator Expression | Parentheses `( )` | Lazy Generator Object | `(x for x in data)` |

> [!NOTE]
> **Key Idea**
> Generator expressions using parentheses `( )` are lazy and do not construct the collection in memory immediately. They return an iterator that yields items on demand, which is ideal for performance on large collections.

---

### 7. First-Class Functions and Closures

In Python, functions are first-class citizens. This means they can be passed as arguments, returned from other functions, and assigned to variables.

```python
def shout(text):
    return text.upper() + "!"

def whisper(text):
    return text.lower() + "..."

def greet(func, message):
    return func(message)

print(greet(shout, "hello"))
print(greet(whisper, "HELLO"))
```

Output:
```text
HELLO!
hello...
```

A closure is an inner function that remembers the state of variables in its outer enclosing scope even after the outer function has finished executing.

```python
def make_multiplier(factor):
    def multiplier(n):
        return n * factor
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5), triple(5))
```

Output:
```text
10 15
```

> [!NOTE]
> **Key Idea**
> A closure is a nested function that retains access to the variables of its outer enclosing function (like `factor`), even after the outer function has finished executing.

> [!NOTE]
> **Real-World Use**
> Closures are used to create customized callback functions in event-driven systems or UI event listeners.

---

### 8. Mini Project: Log Processor with Generators & Decorators

This project combines decorators, generator functions, lazy parsing of mock log details, and function timing.

```python
import time

# 1. Timer decorator
def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"[{func.__name__}] took {end - start:.4f} seconds")
        return result
    return wrapper

# 2. Log generator
def read_log_lines():
    logs = [
        "INFO: System startup completed.",
        "ERROR: Database connection failed.",
        "INFO: User logged in.",
        "ERROR: Disk space low."
    ]
    for log in logs:
        yield log

# 3. Processing function
@timer
def find_errors(log_generator):
    errors = []
    for line in log_generator:
        if line.startswith("ERROR:"):
            errors.append(line)
    return errors

# Run execution
log_stream = read_log_lines()
error_list = find_errors(log_stream)
print("Errors found:")
for err in error_list:
    print(f"- {err}")
```

Output:
```text
[find_errors] took 0.0000 seconds
Errors found:
- ERROR: Database connection failed.
- ERROR: Disk space low.
```

#### ✏ Try It Yourself
Modify `find_errors()` or write a new function `find_warnings(log_generator)` that filters and returns only warning messages (starting with `"WARNING:"`).

---

### Chapter Summary

#### Key Takeaways
* **Iterators and Iterables**: An iterable can be looped over (implements `__iter__`), while an iterator keeps track of its state and returns the next value (implements `__next__`), raising `StopIteration` when done.
* **Generators**: Defined with the `yield` keyword, generators produce values lazily one-at-a-time, making them highly memory-efficient compared to lists.
* **Decorators**: Functions that wrap other functions (using `@decorator`) to modify or extend their behavior (e.g., logging, timing, caching) without changing their source code.
* **Context Managers**: Used via the `with` statement to manage resources and ensure cleanup (like closing files or timings) via `__enter__` and `__exit__`.
* **Functional Tools**: `map()` applies a function, `filter()` filters elements, and `reduce()` aggregates values, often used with `lambda` expressions for concise data operations.
* **Comprehensions**: List, dictionary, set, and generator comprehensions offer a compact syntax for building collections, with parentheses producing a lazy generator expression.
* **First-Class Functions & Closures**: Functions are first-class objects (can be passed as arguments or returned) and can form closures that capture and remember variables from their outer enclosing scope.
