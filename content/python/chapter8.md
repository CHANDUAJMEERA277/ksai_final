# PYTHON — CHAPTER 8
## Modules, Packages & Environment

> “No serious program lives in one file — learning to organize code is learning to scale it.”

### By the End of This Chapter, You Will Be Able To:
* Import modules and packages, and understand the role of `__init__.py`
* Navigate useful parts of the standard library: `os`, `sys`, `datetime`, `random`, `collections`, `itertools`
* Create and use virtual environments with `venv`, and install packages with `pip`
* Understand and write a `requirements.txt` file for reproducible project setups
* Write and organize your own reusable modules across multiple files

---

### 1. Importing Modules and Packages, and __init__.py

A module is simply a single `.py` file containing code you can reuse. A package is a folder containing multiple related modules, grouped together — and marked as a package by an `__init__.py` file.

```python
# Different ways to import
import math # import the whole module
print(math.sqrt(16)) # access with math.

from math import sqrt # import one specific function
print(sqrt(16)) # use it directly, no prefix

from math import sqrt as square_root # import with an alias
print(square_root(16))

import math as m # alias the whole module
print(m.pi)
```

Output:
```text
4.0
4.0
4.0
3.141592653589793
```

#### Package structure

```text
my_project/
    shop/
        __init__.py
        cart.py
        checkout.py
    main.py
```

```python
# Inside main.py:
from shop import cart
from shop.checkout import process_payment
```

* `__init__.py` can be empty — its presence is what tells Python "this folder is a package".
* It can also run setup code, or control what `from shop import *` exposes.
* In modern Python (3.3+), packages technically work without `__init__.py` too, but including it is still standard practice for clarity and compatibility.

> [!NOTE]
> **Note**
> `import module_name` vs. `from module_name import thing` is a tradeoff: the first is more explicit about where things come from (`math.sqrt`), the second is more concise (`sqrt`) but can create naming collisions if two modules define the same name.

---

### 2. Standard Library Highlights

Python ships with a huge "batteries included" standard library. A handful of modules show up constantly in real projects — worth knowing well before reaching for a third-party package.

#### os and sys — interacting with the operating system

```python
import os, sys

print(os.getcwd()) # current working directory
print(os.listdir(".")) # files/folders in current directory
print(sys.version) # the running Python version
print(sys.argv) # command-line arguments passed to the script
```

#### datetime — dates and times

```python
from datetime import datetime, timedelta

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M"))

tomorrow = now + timedelta(days=1)
print(tomorrow.strftime("%Y-%m-%d"))
```

Output:
```text
2026-07-16 14:32
2026-07-17
```

#### random — randomness

```python
import random

print(random.randint(1, 6)) # a random integer, dice roll
print(random.choice(["a", "b", "c"])) # a random item from a sequence

sample = [1, 2, 3, 4, 5]
random.shuffle(sample) # shuffles the list in place
print(sample)
```

#### collections — specialized containers

```python
from collections import Counter, defaultdict

words = ["cat", "dog", "cat", "bird", "cat"]
counts = Counter(words)
print(counts) # Counter({'cat': 3, 'dog': 1, 'bird': 1})
print(counts.most_common(1)) # [('cat', 3)]

grouped = defaultdict(list)
grouped["fruits"].append("apple") # no KeyError, even though "fruits" is new
print(grouped)
```

Output:
```text
Counter({'cat': 3, 'dog': 1, 'bird': 1})
[('cat', 3)]
defaultdict(<class 'list'>, {'fruits': ['apple']})
```

#### itertools — efficient looping tools

```python
from itertools import permutations, chain

print(list(permutations([1, 2, 3], 2))) # all ordered pairs
print(list(chain([1, 2], [3, 4]))) # flatten multiple iterables into one
```

Output:
```text
[(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]
[1, 2, 3, 4]
```

> [!NOTE]
> **Key Idea**
> `Counter` and `defaultdict` alone eliminate a huge amount of manual "check if key exists, then increment/append" boilerplate that you'd otherwise write by hand — reach for them whenever you're counting or grouping.

---

### 3. Virtual Environments (venv) and pip

Every project can need different, sometimes conflicting versions of the same package. A virtual environment is an isolated Python installation just for one project — so its dependencies never clash with another project's, or with your system Python.

```bash
# Create a virtual environment named "venv" in the current folder
python -m venv venv

# Activate it:
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Once activated, install packages with pip — they go into THIS environment only
pip install requests pandas

# See what's installed in the current environment
pip list

# Deactivate when done
deactivate
```

```text
create venv → activate → pip install → work isolated → deactivate
```

> [!WARNING]
> **Watch Out**
> Installing packages with `pip` while NOT inside an activated virtual environment installs them globally, on your system Python — a common source of "it works on my machine" bugs when different projects silently share (and fight over) global packages.

---

### 4. requirements.txt Basics

A `requirements.txt` file lists exactly which packages (and versions) a project depends on — so anyone else (or you, on a new machine) can recreate the same environment with one command.

#### requirements.txt
```text
# requirements.txt
requests==2.31.0
pandas>=2.0.0
python-dotenv
```

#### Terminal / command line
```bash
# Generate a requirements.txt from your current environment
pip freeze > requirements.txt

# Install everything listed in a requirements.txt
pip install -r requirements.txt
```

> [!NOTE]
> **Real-World Use**
> Reproducible project setups depend entirely on this file — a teammate (or your future self) can clone a repo, create a fresh venv, run `pip install -r requirements.txt`, and have an identical working environment in seconds.

> [!NOTE]
> **Note**
> `==` pins an exact version (safest for reproducibility), while `>=` allows anything newer (more flexible, but riskier if a new version changes behavior). Production projects usually pin exact versions.

---

### 5. Writing and Organizing Your Own Modules

As a project grows past a single script, splitting related functions and classes into separate files (modules) keeps things organized, testable, and reusable across multiple scripts.

#### utils/validators.py
```python
# file: utils/validators.py

def is_valid_email(email):
    return "@" in email and "." in email.split("@")[-1]

def is_strong_password(password):
    return len(password) >= 8 and any(c.isdigit() for c in password)
```

#### main.py
```python
# file: main.py
from utils.validators import is_valid_email, is_strong_password

print(is_valid_email("asha@example.com")) # True
print(is_strong_password("abc"))         # False
```

Output:
```text
True
False
```

#### The if \_\_name\_\_ == "\_\_main\_\_": guard

```python
# file: utils/validators.py (continued)

def is_valid_email(email):
    return "@" in email

if __name__ == "__main__":
    # This block ONLY runs when validators.py is executed directly,
    # NOT when it's imported by another file like main.py
    print(is_valid_email("test@example.com")) # quick manual test
```

> [!NOTE]
> **Key Idea**
> `__name__` equals `"__main__"` only when a file is run directly (`python validators.py`), and equals the module's name when it's imported elsewhere. This guard lets a file be both a reusable module AND a runnable script with its own quick tests, without the test code firing on every import.

> [!NOTE]
> **Real-World Use**
> Structuring production codebases into modules (`models/`, `utils/`, `services/`) and building reusable internal utility libraries are exactly this pattern, scaled up — the same idea whether it's three files or three hundred.

#### ✏ Try It Yourself
Split a simple calculator script into `calculator/operations.py` (add, subtract, multiply, divide functions) and a `main.py` that imports and uses them, including an `if __name__ == "__main__":` block for quick manual testing.

---

### 6. Mini Project: Personal Utility Package

This project brings the chapter together: a small package with multiple modules, imports across files, and a `requirements.txt` for the one external dependency it uses.

#### Project structure
```text
toolkit/
    __init__.py
    text_tools.py
    date_tools.py
main.py
requirements.txt
```

#### toolkit/text_tools.py
```python
# toolkit/text_tools.py
from collections import Counter

def word_frequency(text):
    """Return a Counter of word frequencies in the given text."""
    return Counter(text.lower().split())

def is_palindrome(word):
    cleaned = word.lower().replace(" ", "")
    return cleaned == cleaned[::-1]
```

#### toolkit/date_tools.py
```python
# toolkit/date_tools.py
from datetime import datetime

def days_until(target_date_str):
    """target_date_str format: YYYY-MM-DD"""
    target = datetime.strptime(target_date_str, "%Y-%m-%d")
    return (target - datetime.now()).days
```

#### main.py
```python
# main.py
from toolkit.text_tools import word_frequency, is_palindrome
from toolkit.date_tools import days_until

print(word_frequency("the cat sat on the mat"))
print(is_palindrome("Racecar"))
print(days_until("2026-12-31"))
```

Output:
```text
Counter({'the': 2, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1})
True
168
```

#### ✏ Try It Yourself
Add a `number_tools.py` module to the `toolkit` package with an `is_prime(n)` function, and import it in `main.py` alongside the other two modules.

---

### Chapter Summary

#### Key Takeaways
* **Modules** are single `.py` files; **packages** are folders of related modules, traditionally marked with `__init__.py`.
* `import module`, `from module import thing`, and aliasing with `as` are the core import patterns — each with different tradeoffs around clarity and brevity.
* `os` and `sys` interact with the OS and interpreter; `datetime` handles dates/times; `random` adds randomness; `collections` (`Counter`, `defaultdict`) simplifies counting/grouping; `itertools` provides efficient looping tools.
* **Virtual environments (venv)** isolate a project's dependencies from the system Python and other projects; **pip** installs packages into the currently active environment.
* **requirements.txt** (generated via `pip freeze`) lists exact dependencies, letting anyone recreate the same environment with `pip install -r requirements.txt`.
* **Organize your own code** into modules as a project grows; the `if __name__ == "__main__":` guard lets a file work both as an importable module and a standalone script.
