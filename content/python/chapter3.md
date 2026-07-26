# PYTHON — CHAPTER 3
## Data Structures

> “A program is really just data, organized well enough that logic barely has to work for it.”

### By the End of This Chapter, You Will Be Able To:
* Store and access ordered collections of data using lists, including indexing and slicing
* Use list methods and list comprehensions to build and transform lists concisely
* Understand tuples as immutable sequences, and use packing/unpacking
* Store and retrieve key-value data using dictionaries, including dict comprehensions
* Use sets for membership testing, deduplication, and set algebra (union, intersection, difference)
* Treat strings as sequences: slicing, common methods, and immutability
* Combine data structures into nested structures (list of dicts, dict of lists)
* Choose the right data structure for a given problem

---

### 1. Lists — Indexing & Slicing

A list is Python's go-to container for an ordered, changeable collection of items. Unlike the variables you've used so far, a list holds many values under one name — and you can grow it, shrink it, or rearrange it at any time.

```python
fruits = ["apple", "banana", "cherry", "date"]
print(fruits[0]) # apple (first item, index 0)
print(fruits[-1]) # date (last item, index -1)
print(fruits[1:3]) # ['banana', 'cherry'] (slice)
```

* Indexing starts at 0 — `fruits[0]` is the first item, not the second.
* Negative indices count from the end: `fruits[-1]` is the last item.
* Slicing `list[start:stop]` returns a new list from start up to (not including) stop.
* Lists are mutable — you can change an item in place: `fruits[0] = "apricot"`.

> [!WARNING]
> **Watch Out**
> `list[1:3]` stops BEFORE index 3 — it grabs indices 1 and 2 only. This "stop is exclusive" rule trips up most beginners at least once. Count carefully, or just test it in the runner.

#### Program 3.1 — Slicing a playlist
```python
playlist = ["Intro", "Song A", "Song B", "Song C", "Outro"]

middle_tracks = playlist[1:4]
first_two = playlist[:2]
last_two = playlist[-2:]

print(middle_tracks)
print(first_two)
print(last_two)
```

Output:
```text
['Song A', 'Song B', 'Song C']
['Intro', 'Song A']
['Song C', 'Outro']
```

Leaving out the start or stop tells Python to "go to the edge" — `[:2]` means "from the beginning to index 2", and `[-2:]` means "the last two items to the end". This shorthand shows up constantly in real code.

#### ✏ Try It Yourself
Given `weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"]`, write one slice expression that returns just `["Tue", "Wed", "Thu"]` (the weekdays minus the first and last).

---

### 2. List Methods & List Comprehensions

Lists come with built-in methods for adding, removing, and reordering items — and Python's list comprehensions let you build a new list from an existing one in a single, readable line.

#### Common list methods
```python
cart = ["bread", "milk"]

cart.append("eggs")       # add to the end -> ['bread', 'milk', 'eggs']
cart.insert(0, "butter")  # insert at index 0
cart.remove("milk")       # remove first matching value
cart.pop()                # remove & return the last item
cart.sort()               # sort in place, alphabetically
print(cart)
```

Output:
```text
['bread', 'butter']
```

#### List comprehensions — build a list in one line
A list comprehension is a compact way to create a list by transforming or filtering another sequence, replacing a multi-line for loop + append pattern.

```python
numbers = [1, 2, 3, 4, 5, 6]

# Traditional way
squares = []
for n in numbers:
    squares.append(n ** 2)

# List comprehension — same result, one line
squares = [n ** 2 for n in numbers]

# With a filter condition
even_squares = [n ** 2 for n in numbers if n % 2 == 0]

print(squares)
print(even_squares)
```

Output:
```text
[1, 4, 9, 16, 25]
[4, 16, 36]
```

> [!NOTE]
> **Key Idea**
> The pattern is always `[expression for item in sequence if condition]`. Read it out loud as "give me expression, for every item in sequence, but only if condition is true" — that's exactly what it does.

#### Program 3.2 — Shopping cart with running total
```python
cart = [("apple", 3, 20), ("bread", 1, 45), ("milk", 2, 30)]
# each item: (name, quantity, price_per_unit)

line_totals = [qty * price for name, qty, price in cart]
grand_total = sum(line_totals)

print(line_totals)
print(f"Total: ₹{grand_total}")
```

Output:
```text
[60, 45, 60]
Total: ₹165
```

> [!NOTE]
> **Real-World Use**
> Shopping cart apps, student databases, and inventory systems are all built on lists at their core — an ordered collection of items you can add to, remove from, loop over, and total up.

---

### 3. Tuples — Immutability & Packing/Unpacking

A tuple looks like a list but with round brackets — and once created, it cannot be changed. That immutability is a feature, not a limitation: it signals "this data is fixed" and lets Python use tuples in places lists aren't allowed, like dictionary keys.

```python
point = (3, 7)
colors = ("red", "green", "blue")

print(point[0]) # 3
# point[0] = 5  # TypeError: tuples cannot be modified
```

#### Packing and unpacking
```python
# Packing: multiple values into one tuple
coordinates = (10, 20, 30)

# Unpacking: one tuple into multiple variables
x, y, z = coordinates
print(x, y, z) # 10 20 30

# A common real use: swapping two variables
a, b = 5, 10
a, b = b, a
print(a, b) # 10 5
```

> [!NOTE]
> **Note**
> Use a tuple when the data shouldn't change (a coordinate, an RGB color, a date) and a list when it should (a to-do list, a cart, a queue). The choice communicates intent to anyone reading your code.

#### ✏ Try It Yourself
Write a function `get_min_max(numbers)` that returns a tuple (smallest, largest), then unpack it into two variables when you call the function: `low, high = get_min_max([4, 9, 1, 6])`.

---

### 4. Dictionaries — Methods, Comprehensions & Iteration

A dictionary stores data as key-value pairs instead of positions — you look things up by a meaningful key (like a username or a setting name) rather than a numeric index.

```python
user = {"name": "Asha", "age": 21, "is_active": True}

print(user["name"])       # Asha
print(user.get("email"))  # None (no error, unlike user["email"])

user["age"] = 22          # update an existing key
user["city"] = "Hyderabad" # add a new key
```

#### Common dictionary methods
```python
settings = {"volume": 70, "brightness": 50}

print(settings.keys())    # dict_keys(['volume', 'brightness'])
print(settings.values())  # dict_values([70, 50])
print(settings.items())   # dict_items([('volume', 70), ('brightness', 50)])

settings.pop("volume")    # removes and returns 70
settings.update({"contrast": 60}) # merge in new key(s)
```

#### Iterating key/value pairs
```python
prices = {"apple": 20, "bread": 45, "milk": 30}

for item, price in prices.items():
    print(f"{item}: ₹{price}")
```

Output:
```text
apple: ₹20
bread: ₹45
milk: ₹30
```

#### Dict comprehensions
```python
prices = {"apple": 20, "bread": 45, "milk": 30}

# Apply a 10% discount to every item
discounted = {item: round(price * 0.9, 2) for item, price in prices.items()}
print(discounted)
```

Output:
```text
{'apple': 18.0, 'bread': 40.5, 'milk': 27.0}
```

> [!NOTE]
> **Real-World Use**
> User profile storage, app configuration settings, and caching lookups are the textbook uses of dictionaries — anywhere you need "look this up by name" instead of "look this up by position".

#### Program 3.3 — Word frequency counter
```python
text = "the cat sat on the mat the cat ran"
words = text.split()

frequency = {}
for word in words:
    frequency[word] = frequency.get(word, 0) + 1

print(frequency)
```

Output:
```text
{'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1, 'ran': 1}
```

`frequency.get(word, 0)` is the key trick: it returns the word's current count, or 0 if it hasn't been seen yet, so the `+=` logic never crashes on a missing key.

---

### 5. Sets — Operations & Use Cases

A set is an unordered collection of unique items — duplicates are automatically dropped, and Python gives you fast membership testing (`x in my_set`) along with classic set-algebra operations.

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b) # union — all items from either set {1,2,3,4,5,6}
print(a & b) # intersection — items in both {3, 4}
print(a - b) # difference — in a but not in b {1, 2}
print(a ^ b) # symmetric difference — in one but not both {1,2,5,6}
```

| Operation | Operator | Meaning | Example match |
| :--- | :--- | :--- | :--- |
| Union | `\|` | All unique elements from both sets | `{1, 2} \| {2, 3}` → `{1, 2, 3}` |
| Intersection | `&` | Only elements in both sets | `{1, 2} & {2, 3}` → `{2}` |
| Difference | `-` | Elements in first set but not second | `{1, 2} - {2, 3}` → `{1}` |
| Symmetric Difference | `^` | Elements in either set, but not both | `{1, 2} ^ {2, 3}` → `{1, 3}` |

#### Program 3.4 — Removing duplicates
```python
emails = ["a@mail.com", "b@mail.com", "a@mail.com", "c@mail.com"]
unique_emails = list(set(emails))

print(unique_emails)
print(len(unique_emails)) # 3 — duplicates gone
```

> [!WARNING]
> **Watch Out**
> Converting a list to a set loses the original order (sets are unordered). If order matters, use `dict.fromkeys(emails)` instead — it removes duplicates while preserving order.

#### Program 3.5 — Access control check
```python
admin_users = {"asha", "ravi"}
requesting_user = "meera"

if requesting_user in admin_users:
    print("Access granted")
else:
    print("Access denied")
```

Output:
```text
Access denied
```

> [!NOTE]
> **Real-World Use**
> Duplicate detection (unique visitor counts), tag/category systems (a post's tags as a set), and access-control lists (checking if a user is in the allowed set) all lean on sets for speed and uniqueness.

---

### 6. Strings as Sequences

A string behaves like a sequence of characters — the same indexing and slicing rules from lists apply directly, but strings are immutable: you can never change a character in place.

```python
word = "python"
print(word[0])    # p
print(word[-1])   # n
print(word[2:5])  # tho
print(word[::-1]) # nohtyp (reversed, using step -1)

# word[0] = "P"   # TypeError: strings are immutable
```

#### Common string methods
```python
msg = "  Hello, World!  "

print(msg.strip()) # 'Hello, World!' (removes outer whitespace)
print(msg.lower()) # lowercase version
print(msg.strip().split(",")) # ['Hello', ' World!']
print("-".join(["a", "b", "c"])) # 'a-b-c'
print(msg.strip().replace("World", "Python")) # 'Hello, Python!'
```

> [!NOTE]
> **Note**
> Every string method (`.lower()`, `.strip()`, `.replace()`, ...) returns a brand-new string — it never modifies the original, because strings can't be modified. If you don't reassign the result, the change is silently lost.

#### ✏ Try It Yourself
Given `sentence = "Data Structures Are Fun"`, write one line that counts how many words it has, and another that reverses the word order (hint: `split()`, then slice with `[::-1]` or use `reversed()`).

---

### 7. Nested Data Structures

Real data is rarely flat. Python lets you nest data structures inside each other — a list of dictionaries, a dictionary of lists, or deeper combinations — to model real-world records naturally.

#### List of dictionaries — a table of records
```python
students = [
    {"name": "Asha", "marks": 92},
    {"name": "Ravi", "marks": 78},
    {"name": "Meera", "marks": 85},
]

for student in students:
    print(f"{student['name']}: {student['marks']}")

topper = max(students, key=lambda s: s["marks"])
print(f"Topper: {topper['name']}")
```

Output:
```text
Asha: 92
Ravi: 78
Meera: 85
Topper: Asha
```

#### Dictionary of lists — grouping data
```python
inventory = {
    "fruits": ["apple", "banana"],
    "vegetables": ["carrot", "potato", "onion"],
}

inventory["fruits"].append("mango")
print(inventory["fruits"])
print(len(inventory["vegetables"]))
```

Output:
```text
['apple', 'banana', 'mango']
3
```

> [!NOTE]
> **Key Idea**
> Access nested data one layer at a time, from the outside in: `inventory["fruits"]` gets the list, then `[0]` or `.append(...)` works on that list directly. Long chains like `data["a"]["b"][0]` read the same way — just resolve one layer at a time.

---

### 8. Choosing the Right Data Structure

Most bugs and slow code come from picking the wrong container early on. A quick gut-check comparison:

| Structure | Ordered / Mutable? | Use it when... |
| :--- | :--- | :--- |
| **List** | Ordered, mutable | You need an ordered, changeable collection — a cart, a queue, a to-do list |
| **Tuple** | Ordered, immutable | The data shouldn't change — coordinates, RGB colors, a fixed record |
| **Dictionary** | Ordered (3.7+), mutable | You look things up by a meaningful key — a profile, settings, a cache |
| **Set** | Unordered, mutable | You need uniqueness or fast membership tests — dedup, tags, ACLs |

> [!WARNING]
> **Watch Out**
> If you find yourself searching a list repeatedly for membership (`if x in my_list`) inside a loop, that's usually a sign to switch to a set — set membership checks are dramatically faster on large data.

---

### 9. Mini Project: Student Database

This chapter's project combines everything: a list of dictionaries as the database, dictionary methods to update records, a list comprehension to filter, and a set to check for duplicate names before adding.

```python
# student_database.py

students = [
    {"name": "Asha", "grade": "A", "marks": 92},
    {"name": "Ravi", "grade": "B", "marks": 78},
]

def add_student(name, grade, marks):
    existing_names = {s["name"] for s in students} # set comprehension
    if name in existing_names:
        print(f"{name} is already in the database.")
        return
    students.append({"name": name, "grade": grade, "marks": marks})
    print(f"Added {name}.")

def top_scorers(min_marks):
    return [s["name"] for s in students if s["marks"] >= min_marks]

add_student("Meera", "A", 88)
add_student("Asha", "A", 92) # duplicate — will be rejected

print("Top scorers (85+):", top_scorers(85))
```

Output:
```text
Added Meera.
Asha is already in the database.
Top scorers (85+): ['Asha', 'Meera']
```

#### ✏ Try It Yourself
Extend `student_database.py` with a `remove_student(name)` function, and an `average_marks()` function that returns the class average using `sum()` and `len()` on the `students` list.

---

### Chapter Summary

#### Key Takeaways
* **Lists** are ordered, mutable collections — indexed from 0, sliceable, and built up with `.append()`, `.insert()` or list comprehensions.
* **Tuples** look like lists but are immutable — use them for fixed data, and for packing/unpacking multiple values at once.
* **Dictionaries** store key-value pairs — use `.get()` for safe lookups, `.items()` to iterate both key and value, and dict comprehensions to transform them.
* **Sets** hold unique, unordered items and support union (`|`), intersection (`&`), difference (`-`), and symmetric difference (`^`).
* **Strings** are immutable sequences — indexing/slicing work like lists, but every string method returns a new string rather than modifying the original.
* **Nested structures** (list of dicts, dict of lists) model real-world records — access one layer at a time, from the outside in.
* **Pick the structure** that matches the job: order + change → list, fixed data → tuple, key lookup → dict, uniqueness/speed → set.
