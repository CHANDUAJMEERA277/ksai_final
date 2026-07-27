# PYTHON — CHAPTER 7
## Error Handling & File I/O

> “Good programs don't avoid errors — they expect them, and fail gracefully.”

### By the End of This Chapter, You Will Be Able To:
* Handle errors gracefully using try / except / else / finally
* Raise your own exceptions, and design custom exception classes for domain-specific errors
* Read and write text files, and work with structured data formats (CSV and JSON)
* Work confidently with file paths using both os and pathlib
* Use context managers (with) for safe, automatic file handling

---

### 1. try / except / else / finally

Errors are a normal part of programming — bad input, missing files, network failures. Python lets you anticipate likely failures and respond to them gracefully instead of crashing.

* `try`: The block of code that might fail.
* `except`: Runs only if a matching error occurs. You can have multiple except blocks for different error types.
* `else`: Runs only if the try block succeeded with no error.
* `finally`: Always runs, whether an error occurred or not — ideal for cleanup.

```python
try:
    age = int(input("Enter your age: "))
    result = 100 / age
except ValueError:
    print("That's not a valid number.")
except ZeroDivisionError:
    print("Age can't be zero.")
else:
    print(f"100 divided by your age is {result:.2f}")
finally:
    print("Done processing input.")
```

> [!WARNING]
> **Watch Out**
> Catching a bare `except:` (with no error type) swallows every possible error, including ones you didn't anticipate — like typos in your own code. Always catch specific exception types (ValueError, KeyError, etc.) so real bugs don't get silently hidden.

#### Program 7.1 — Safe division with multiple except blocks

```python
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Cannot divide by zero.")
        return None
    except TypeError:
        print("Both values must be numbers.")
        return None

print(safe_divide(10, 2))
print(safe_divide(10, 0))
print(safe_divide(10, "a"))
```

Output:
```text
5.0
Cannot divide by zero.
None
Both values must be numbers.
None
```

---

### 2. Raising Exceptions & Custom Exception Classes

`raise` deliberately triggers an exception when data is clearly invalid or conditions aren't met.

```python
def set_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(f"Invalid input: {e}")
```

Output:
```text
Invalid input: Age cannot be negative
```

#### Custom exception classes

For anything beyond generic errors, define your own exception class by inheriting from `Exception`. This lets calling code catch your specific error type instead of guessing which built-in exception might apply.

```python
class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the available balance."""
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(
            f"Cannot withdraw {amount}; balance is only {balance}"
        )
    return balance - amount

try:
    withdraw(100, 500)
except InsufficientFundsError as e:
    print(f"Transaction failed: {e}")
```

Output:
```text
Transaction failed: Cannot withdraw 500; balance is only 100
```

> [!NOTE]
> **Key Idea**
> A custom exception is usually just a class that inherits from `Exception` with little or no extra code — its real value is the descriptive name, which makes `except InsufficientFundsError` far clearer than `except Exception` everywhere.

> [!NOTE]
> **Real-World Use**
> Form and input validation (rejecting bad signup data) and safe API request handling (catching timeouts, bad responses, and connection errors distinctly) are the everyday homes for this pattern.

#### ✏ Try It Yourself
Define an `InvalidEmailError(Exception)` class and a `validate_email(email)` function that raises it if the email doesn't contain "@", then wrap a call to it in try/except.

---

### 3. Reading and Writing Files (Text, CSV, JSON)

Programs regularly need to persist data beyond a single run — reading configuration, saving results, or exporting reports. Python's file handling makes this straightforward for plain text, CSV tables, and JSON data.

#### Plain text files

```python
# Writing a text file
with open("notes.txt", "w") as f:
    f.write("First line\n")
    f.write("Second line\n")

# Reading it back
with open("notes.txt", "r") as f:
    contents = f.read()
    print(contents)

# Reading line by line (memory-efficient for large files)
with open("notes.txt", "r") as f:
    for line in f:
        print(line.strip())
```

Output:
```text
First line
Second line

First line
Second line
```

#### CSV files

```python
import csv

# Writing a CSV
with open("students.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "marks"])
    writer.writerow(["Asha", 92])
    writer.writerow(["Ravi", 78])

# Reading a CSV as dictionaries
with open("students.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["marks"])
```

Output:
```text
Asha 92
Ravi 78
```

#### JSON files

```python
import json

profile = {"name": "Asha", "age": 21, "skills": ["Python", "SQL"]}

# Writing JSON
with open("profile.json", "w") as f:
    json.dump(profile, f, indent=2)

# Reading JSON back into a Python dict
with open("profile.json", "r") as f:
    loaded = json.load(f)
    print(loaded["name"], loaded["skills"])
```

Output:
```text
Asha ['Python', 'SQL']
```

> [!NOTE]
> **Note**
> `json.dump()`/`json.load()` work with file objects; `json.dumps()`/`json.loads()` (with an 's') work with strings directly. Mixing them up is a very common source of confusion.

> [!NOTE]
> **Real-World Use**
> Config file parsers often use JSON or similar formats for settings, data import/export tools rely heavily on CSV for spreadsheet-friendly data, and log file readers process plain text line by line.

---

### 4. Working with File Paths — os and pathlib

Real programs rarely hardcode a single filename — they build paths dynamically, check whether files exist, and work across folders. Python offers the older `os.path` module and the more modern, object-oriented `pathlib`.

```python
import os
from pathlib import Path

# --- os.path style ---
folder = "data"
filename = "students.csv"
full_path = os.path.join(folder, filename)
print(full_path)
print(os.path.exists(full_path))

# --- pathlib style (more modern, more readable) ---
path = Path("data") / "students.csv" # the / operator joins paths
print(path)
print(path.exists())
print(path.suffix) # .csv
print(path.stem) # students
```

Output:
```text
data/students.csv
False
data/students.csv
False
.csv
students
```

> [!NOTE]
> **Key Idea**
> `pathlib` treats paths as objects with useful properties (`.suffix`, `.stem`, `.parent`) and lets you build paths with the `/` operator instead of string concatenation — it's the recommended approach in modern Python, though `os.path` still appears constantly in existing codebases.

#### ✏ Try It Yourself
Using pathlib, write a small script that lists every `.txt` file in the current folder with `Path(".").glob("*.txt")` and prints each filename.

---

### 5. Context Managers for File Handling

Using `with open(...) as f:` is the standard, safe pattern because it guarantees the file closes even if an error occurs inside the block.

```python
# The risky, manual way
f = open("notes.txt", "r")
contents = f.read()
f.close() # easy to forget, especially if an error happens above

# The safe way, using a context manager
with open("notes.txt", "r") as f:
    contents = f.read()
# f is automatically closed here, even if .read() raised an error
```

> [!WARNING]
> **Watch Out**
> A file left open (because `.close()` was forgotten or skipped due to an error) can lead to data not being saved properly, or the file being locked/unavailable to other programs. `with` removes this entire class of bugs.

#### Handling errors and cleanup together

```python
def read_config(path):
    try:
        with open(path, "r") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Config file not found: {path}")
        return None

config = read_config("settings.txt")
```

Output:
```text
Config file not found: settings.txt
```

> [!NOTE]
> **Key Idea**
> `with` handles closing the file automatically; `try/except` handles what to do if opening or reading fails in the first place. The two work together — `with` doesn't prevent errors, it just guarantees cleanup when they happen.

---

### 6. Mini Project: Expense Tracker with CSV & Error Handling

This project ties the chapter together: reading/writing CSV data, validating user input with custom exceptions, and safely handling missing files.

```python
# expense_tracker.py
import csv
from pathlib import Path

class InvalidExpenseError(Exception):
    """Raised when an expense amount or category is invalid."""
    pass

FILE_PATH = Path("expenses.csv")

def add_expense(category, amount):
    if amount <= 0:
        raise InvalidExpenseError("Amount must be positive")
    if not category:
        raise InvalidExpenseError("Category cannot be empty")

    file_exists = FILE_PATH.exists()
    with open(FILE_PATH, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["category", "amount"])
        writer.writerow([category, amount])

def total_expenses():
    try:
        with open(FILE_PATH, "r") as f:
            reader = csv.DictReader(f)
            return sum(float(row["amount"]) for row in reader)
    except FileNotFoundError:
        return 0.0

try:
    add_expense("Groceries", 45.50)
    add_expense("Transport", 20)
    add_expense("Snacks", -5) # invalid — will raise
except InvalidExpenseError as e:
    print(f"Could not add expense: {e}")

print(f"Total so far: {total_expenses()}")
```

Output:
```text
Could not add expense: Amount must be positive
Total so far: 65.5
```

#### ✏ Try It Yourself
Add a per-category summary function that reads `expenses.csv` and returns a dict of `{category: total_amount}`, using a dict comprehension or manual accumulation.

---

### Chapter Summary

#### Key Takeaways
* **try/except/else/finally** lets you anticipate errors, handle them per type, run code only on success, and always run cleanup.
* **raise** triggers an exception deliberately; custom exception classes (inheriting from `Exception`) give domain-specific errors clear, catchable names.
* **Text files** use `.read()`/`.write()` or line-by-line iteration; **CSV** uses the `csv` module (`writer`, `DictReader`); **JSON** uses `json.dump()`/`json.load()` for files.
* **pathlib.Path** is the modern way to build and inspect file paths, with the `/` operator and properties like `.suffix` and `.stem`; `os.path` is the older equivalent.
* **with open(...) as f:** guarantees the file is closed automatically, even if an error occurs — always prefer it over manual `open()`/`close()`.
* **Error handling and file I/O** work together constantly: wrap file operations in `try/except` to handle missing files or bad data gracefully.
