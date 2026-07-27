# PYTHON — CHAPTER 9
## Applied Python

> “This is where Python stops being an exercise and starts being a tool.”

### By the End of This Chapter, You Will Be Able To:
* Call web APIs using the requests library and parse JSON responses
* Understand the basic concepts behind web scraping and when it's appropriate
* Automate simple everyday tasks — file handling and scheduling
* Use regular expressions (the re module) to search, match, and extract patterns in text
* Work confidently with dates and times for real applications, not just isolated examples

---

### 1. Working with APIs (requests & JSON)

An API (Application Programming Interface) lets your program ask another service for data over the internet — weather, currency rates, maps, payments. The `requests` library is the standard way to do this in Python, and responses usually come back as JSON.

```python
import requests

response = requests.get("https://api.example.com/weather", params={"city": "Hyderabad"})
print(response.status_code) # 200 means success

if response.status_code == 200:
    data = response.json() # parses the JSON response into a Python dict
    print(data["temperature"])
    print(data["condition"])
else:
    print("Request failed.")
```

Output:
```text
200
31
Partly cloudy
```

> [!WARNING]
> **Watch Out**
> Always check `response.status_code` (or wrap the call in try/except for `requests.exceptions.RequestException`) before trusting the response. Networks fail, servers go down, and APIs change — code that assumes success will eventually crash in production.

#### Handling errors safely

```python
import requests

def get_weather(city):
    try:
        response = requests.get(
            "https://api.example.com/weather",
            params={"city": city},
            timeout=5,
        )
        response.raise_for_status() # raises an error for 4xx/5xx responses
        return response.json()
    except requests.exceptions.Timeout:
        print("The request timed out.")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    return None
```

> [!NOTE]
> **Real-World Use**
> Weather apps, payment gateway integrations, and maps/location services are all built on exactly this pattern: call an external API, parse the JSON, handle failures gracefully, and use the data in your own app.

---

### 2. Basic Web Scraping Concepts

Web scraping means extracting data directly from a website's HTML when there's no API available. It's a common technique, but comes with real responsibilities — respecting a site's terms of service and its `robots.txt` file.

```python
import requests
from bs4 import BeautifulSoup # a popular HTML-parsing library

response = requests.get("https://example.com/news")
soup = BeautifulSoup(response.text, "html.parser")

# Find all headline elements, e.g. <h2 class="headline">...</h2>
headlines = soup.find_all("h2", class_="headline")
for headline in headlines:
    print(headline.get_text().strip())
```

> [!NOTE]
> **Note**
> `requests` fetches the raw HTML; a parsing library like BeautifulSoup then lets you search that HTML by tag, class, or id — much like using CSS selectors, but from Python code.

> [!WARNING]
> **Watch Out**
> Always check a site's `robots.txt` and terms of service before scraping it — some sites explicitly disallow scraping, rate-limit aggressively, or require using their official API instead. Prefer an API whenever one exists; scraping should be a fallback, not a first choice.

---

### 3. Automating Simple Tasks (File Handling & Scheduling)

A huge share of everyday automation is just Python touching files on a schedule — renaming a batch of files, cleaning up a downloads folder, or generating a report at a set time.

#### Bulk file renaming

```python
from pathlib import Path

folder = Path("photos")

for index, file in enumerate(folder.glob("*.jpg"), start=1):
    new_name = folder / f"vacation_{index:03d}.jpg"
    file.rename(new_name)
    print(f"Renamed {file.name} -> {new_name.name}")
```

Output:
```text
Renamed IMG_2031.jpg -> vacation_001.jpg
Renamed IMG_2032.jpg -> vacation_002.jpg
```

#### Scheduling a task

For a script that should run repeatedly (say, every day), Python code itself usually just does the work once — the repetition is handled either by a simple sleep loop, or (more robustly) by the operating system's own scheduler.

```python
import time
import schedule # third-party package: pip install schedule

def generate_report():
    print("Generating daily report...")

schedule.every().day.at("09:00").do(generate_report)

while True:
    schedule.run_pending()
    time.sleep(60) # check once a minute
```

> [!NOTE]
> **Key Idea**
> For anything running in production, OS-level schedulers (`cron` on Linux/macOS, Task Scheduler on Windows) are usually more reliable than a Python script left running forever — they survive reboots and don't depend on one process staying alive.

> [!NOTE]
> **Real-World Use**
> Scheduled report generation, price/availability trackers (checking a page or API on a timer), and bulk file renaming/cleanup tools are the classic "boring stuff" that automation scripts like this eliminate.

---

### 4. Intro to Regular Expressions (re module)

A regular expression (regex) is a pattern that describes text to search for, match, or extract — far more powerful than plain `.find()` or `.replace()` for anything beyond an exact literal match.

```python
import re

text = "Contact us at support@example.com or sales@example.org"

# Find all matches of a pattern
emails = re.findall(r"[\w.]+@[\w.]+", text)
print(emails)

# Check if a pattern exists at all
if re.search(r"\d{3}-\d{4}", "Call 555-1234 now"):
    print("Found a phone number")

# Replace matches
masked = re.sub(r"\d", "*", "My PIN is 4821")
print(masked)
```

Output:
```text
['support@example.com', 'sales@example.org']
Found a phone number
My PIN is ****
```

| Pattern | Meaning | Example match |
| :--- | :--- | :--- |
| `\d` | Any single digit | `"5"` in `"555"` |
| `\w` | Any word character (letter, digit, underscore) | `"a"` in `"cat_1"` |
| `+` | One or more of the previous item | `\d+` matches `"123"` |
| `*` | Zero or more of the previous item | `ab*` matches `"a"`, `"ab"`, `"abb"` |
| `{3}` | Exactly 3 of the previous item | `\d{3}` matches `"555"` |

> [!WARNING]
> **Watch Out**
> Always write regex patterns as raw strings (`r"..."`) in Python. Without the `r` prefix, backslashes like `\d` get interpreted as Python escape sequences first, which usually breaks the pattern in confusing ways.

#### ✏ Try It Yourself
Write a regex pattern to validate a simple username: 3-16 characters, letters/digits/underscores only. Hint: `^[\w]{3,16}$`, and test it with `re.match()`.

---

### 5. Working with Dates and Times

Beyond the basics from Chapter 8, applied Python work regularly involves parsing dates from external sources, formatting them for display, and doing date arithmetic.

```python
from datetime import datetime, timedelta

# Parsing a date string into a datetime object
date_str = "2026-07-16"
parsed = datetime.strptime(date_str, "%Y-%m-%d")
print(parsed.strftime("%B %d, %Y")) # "July 16, 2026"

# Date arithmetic
due_date = parsed + timedelta(days=30)
print(due_date.strftime("%Y-%m-%d"))

# Comparing dates
if datetime.now() > due_date:
    print("Overdue!")
else:
    print("Still within the deadline.")
```

Output:
```text
July 16, 2026
2026-08-15
Still within the deadline.
```

> [!NOTE]
> **Key Idea**
> `strptime` ("parse time") converts a string into a datetime object; `strftime` ("format time") converts a datetime object back into a string. Remembering "p for parse-in, f for format-out" helps keep the two straight.

---

### 6. Mini Project: Weather CLI Tool

This project pulls the whole chapter together: an API call with error handling, JSON parsing, regex-based input validation, and date formatting for the display.

```python
# weather_cli.py
import re
import requests
from datetime import datetime

def is_valid_city(city):
    """Allow letters, spaces, and hyphens only."""
    return bool(re.match(r"^[A-Za-z\s\-]+$", city))

def get_weather(city):
    if not is_valid_city(city):
        print("Invalid city name.")
        return None
    try:
        response = requests.get(
            "https://api.example.com/weather",
            params={"city": city},
            timeout=5,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Could not fetch weather: {e}")
        return None

def display_weather(city):
    data = get_weather(city)
    if data is None:
        return
    today = datetime.now().strftime("%B %d, %Y")
    print(f"Weather in {city} on {today}:")
    print(f"  {data['temperature']}°C, {data['condition']}")

display_weather("Hyderabad")
display_weather("Hyd3rabad!") # fails validation
```

Output:
```text
Weather in Hyderabad on July 16, 2026:
  31°C, Partly cloudy
Invalid city name.
```

#### ✏ Try It Yourself
Extend `weather_cli.py` to accept a list of cities and print a formatted weather report for each one, catching and reporting errors for any city individually without stopping the whole loop.

---

### Chapter Summary

#### Key Takeaways
* **The requests library** calls web APIs; `response.json()` parses JSON responses; always check status codes or use `raise_for_status()` and handle request exceptions.
* **Web scraping** (e.g. with BeautifulSoup) extracts data from raw HTML when no API exists — check `robots.txt`/terms of service first, and prefer an API when available.
* **Automation scripts** commonly combine file handling (`pathlib`) with scheduling — either a simple sleep loop or, more robustly, an OS-level scheduler like `cron`.
* **Regular expressions** (the `re` module) match patterns in text — `findall()`, `search()`, and `sub()` cover most everyday needs; always use raw strings (`r"..."`) for patterns.
* **strptime** parses a string into a datetime; **strftime** formats a datetime back into a string; **timedelta** supports date arithmetic like deadlines and due dates.
