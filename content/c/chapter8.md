> "Every variable, array, or structure in a C program lives in RAM. The moment the program ends, that memory is wiped — all data is lost. File handling is C's mechanism for achieving data persistence, allowing programs to store data permanently on disk."

File handling lets a program read from and write to storage devices. This means your program's data can survive after it exits, allowing it to be reused, shared, or processed later.

#### Why File Handling Exists
* **Data must survive program execution** so it can be reloaded later (e.g., configurations, user settings, database records).
* **Volatile memory (RAM) is cleared on exit**, whereas non-volatile storage (disk) persists indefinitely.
* **Real-world systems process external inputs** like CSV logs, images, and config files that must be loaded dynamically.
* **Large datasets cannot fit entirely in memory** and must be read incrementally from files.

#### Where This Is Used
* **Logging Frameworks** write warning and error messages to log files for server diagnostics.
* **Web Browsers** save settings, cache, cookies, and browsing history to the local disk.
* **Office Applications** load and save documents (like `.docx`, `.xlsx`) in structured text or binary formats.
* **Database Systems** store collections of records inside complex binary files with indices for fast lookup.

---

### 8.1 File Basics

#### Text Files vs. Binary Files

| Aspect | Text File | Binary File |
| :--- | :--- | :--- |
| **Storage form** | Human-readable characters (ASCII/UTF-8) | Raw bytes — exact memory representation |
| **Example** | `25` stored as characters `'2'` `'5'` (2 bytes) | `25` (an `int`) stored as 4 raw bytes |
| **Editable in Notepad** | Yes, fully readable | No, appears as garbled character codes |
| **Speed** | Slightly slower (requires text conversion) | Faster (direct memory copy) |
| **Typical use** | Config files, source code, logs, CSV | Images, executables, databases |

> [!NOTE]
> **Key Idea**
> The mode/function used to write to the file decides its actual format, not the file extension. If you open a file with `"w"` and use `fprintf`, it writes text. If you open with `"wb"` and use `fwrite`, it writes binary — even if the file extension is `.txt`.

#### FILE* — The File Pointer
`FILE` is a structure defined in `<stdio.h>` that stores information about an open file: its position indicator, buffer, error flags, and more. You never access this structure directly — you always work through a **pointer to it**.

```c
FILE *fp;
```

```text
fp (FILE*)
│
▼
┌─────────────────────┐
│ FILE structure      │
│ - buffer            │
│ - current position  │
│ - error/EOF flags   │
│ - file descriptor ──┼──► Actual file on disk
└─────────────────────┘
```

> [!NOTE]
> **Key Idea**
> `fp` does not hold the file's data itself — it is a **handle** the operating system uses to track your program's active session with that file.

#### fopen() — Opening a File
```c
FILE *fopen(const char *filename, const char *mode);
```
* Returns a valid `FILE*` on success.
* Returns `NULL` on failure (e.g., file doesn't exist, no permissions, disk full, etc.).

```c
FILE *fp = fopen("data.txt", "r");
```

#### File Modes

| Mode | Meaning | If file exists | If file doesn't exist |
| :--- | :--- | :--- | :--- |
| **"r"** | Read (text) | Opens at start | Returns `NULL` (error) |
| **"w"** | Write (text) | **Erases all content** | Creates new file |
| **"a"** | Append (text) | Opens, writing starts at end | Creates new file |
| **"rb"** | Read (binary) | Opens at start | Returns `NULL` (error) |
| **"wb"** | Write (binary) | **Erases all content** | Creates new file |
| **"ab"** | Append (binary) | Opens, writing starts at end | Creates new file |

> [!WARNING]
> **Common Beginner Mistakes**
> Using `"w"` on a file you only meant to append data to. This silently **deletes all existing content**. Use `"a"` to append instead.

#### fclose() — Closing a File
```c
int fclose(FILE *fp);
```
* Flushes any buffered data to disk and releases the system file handle.
* Returns `0` on success, `EOF` on failure.

> [!IMPORTANT]
> **Always close every file you open.** Forgetting to close files can cause:
> 1. **Data loss** (buffered writes never flushed to disk before the program exits).
> 2. **Resource leaks** (operating systems limit the number of files a single program can have open simultaneously).

```text
Basic Read/Write Workflow:
┌───────────┐
│  fopen()  │
└─────┬─────┘
      │
      ▼
┌───────────────┐
│ Check for NULL│
└─────┬─────────┘
      │ OK
      ▼
┌────────────────────┐
│ Read / Write data  │
└─────┬───────────────┘
      │
      ▼
┌───────────┐
│  fclose()  │
└───────────┘
```

#### Checking for Successful Open
```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    printf("Error: could not open file.\n");
    return 1;
}
```

> [!WARNING]
> **Common Beginner Mistakes**
> Skipping the `NULL` check and directly using `fp` for I/O operations. This invokes **undefined behavior** (and usually crashes the program) if the file failed to open.

#### Simple Write Example
```c
#include <stdio.h>

int main() {
    FILE *fp = fopen("greet.txt", "w"); // create/overwrite for writing
    if (fp == NULL) {
        printf("Could not open file.\n");
        return 1;
    }

    fprintf(fp, "Hello, File Handling!\n"); // write text into file
    fclose(fp); // save and release the file

    printf("Data written successfully.\n");
    return 0;
}
```

##### Expected Output:
```text
Data written successfully.
```
This creates a file named `greet.txt` in the program's working directory containing the text `Hello, File Handling!`.

#### Practice - 8.1

##### Conceptual Questions
1. Why is file handling needed even though variables can store data?
2. What does `fopen()` return when it fails?
3. What is the difference between `"w"` and `"a"` mode?

##### Output / Code Tracing
What will `test.txt` contain after this runs?
```c
FILE *fp = fopen("test.txt", "w");
fprintf(fp, "A");
fclose(fp);

fp = fopen("test.txt", "a");
fprintf(fp, "B");
fclose(fp);
```

##### Coding Exercise
1. Write a program that opens a file in `"w"` mode and checks whether it succeeded.
2. Write a program that tries to open a non-existent file in `"r"` mode and prints an appropriate error message.

---

### 8.2 Text File I/O

#### fprintf() — Formatted Write
```c
int fprintf(FILE *fp, const char *format, ...);
```
Works exactly like `printf()`, but the first argument is the target file pointer.
```c
fprintf(fp, "%s is %d years old\n", name, age);
```

#### fscanf() — Formatted Read
```c
int fscanf(FILE *fp, const char *format, ...);
```
Works like `scanf()`, but reads from the file instead of the standard keyboard input.
```c
char name[50];
int age;
fscanf(fp, "%s %d", name, &age);
```
* **Return value:** the number of items successfully read (or `EOF` if nothing could be read due to file end or error).

> [!WARNING]
> **Common Beginner Mistakes**
> `fscanf(fp, "%s", ...)` stops reading at any whitespace. It **cannot read a full line with spaces** (e.g., `"New York"` is read as just `"New"`).

#### fgets() — Read a Line
```c
char *fgets(char *str, int n, FILE *fp);
```
* Reads up to `n-1` characters, or until a newline `\n`, or until `EOF` — whichever comes first.
* Includes the newline character `\n` in the destination string, if read.
* Returns `NULL` at end of file (or on error).

```c
char line[100];
fgets(line, sizeof(line), fp);
```

> [!NOTE]
> **Key Idea**
> `fgets` is always preferred over `gets()` because you specify a size limit, preventing buffer overflow bugs.

#### fputs() — Write a Line
```c
int fputs(const char *str, FILE *fp);
```
Writes a string to the file **as-is**. Unlike `fprintf()`, it does no formatting, and unlike `puts()`, it does **not** append a newline character automatically.
```c
fputs("Hello, world!\n", fp);
```

#### I/O Comparison Tables

##### fscanf() vs. fgets()

| Feature | fscanf() | fgets() |
| :--- | :--- | :--- |
| **Reads** | Formatted tokens (word/number at a time) | Entire line (including spaces) |
| **Stops at** | Whitespace (for `%s`) | Newline or buffer limit |
| **Best for** | Structured text data (numbers, CSV keys) | Free-form text, lines, sentences |
| **Common pitfall** | Cannot handle spaces in `%s`; leaves `\n` in buffer | Includes the trailing `\n` in the read string |

##### fprintf() vs. fputs()

| Feature | fprintf() | fputs() |
| :--- | :--- | :--- |
| **Formatting** | Yes (`%d`, `%s`, `%f`, etc.) | No — writes raw string only |
| **Speed** | Slightly slower (must parse format string) | Faster, simpler |
| **Use case** | Writing mixed types formatted together | Writing plain text lines |

#### The File Position & EOF
Every open file has an internal **position indicator** — where the next read or write will happen. As you read, this pointer advances. `feof(fp)` becomes true only **after** an attempt to read past the last byte fails.

> [!WARNING]
> **Common Beginner Mistakes**
> Using `feof()` directly to control a read loop:
> ```c
> while (!feof(fp)) {
>     fscanf(fp, "%d", &num);
>     printf("%d\n", num); // may print the LAST value twice!
> }
> ```
> This happens because `feof()` only becomes true *after* a failed read attempt. The loop body still executes once more using stale data when it hits EOF.

##### Correct Pattern: Check Read Result Directly
```c
while (fscanf(fp, "%d", &num) == 1) {
    printf("%d\n", num);
}
```

> [!IMPORTANT]
> **Why shouldn't feof() control a read loop?**
> Because `feof` is a *lagging* indicator; it only flips to true after a read operation has already failed, not before.

#### Reading Line by Line (Correct Pattern)
```c
char line[100];
while (fgets(line, sizeof(line), fp) != NULL) {
    printf("%s", line);
}
```
This is the standard, safe way to process a text file line by line.

#### Reading Multiple Values per Line
```c
int a, b, c;
while (fscanf(fp, "%d %d %d", &a, &b, &c) == 3) {
    printf("%d %d %d\n", a, b, c);
}
```
Checking that the return value equals the expected count of items (`3`) ensures partial or garbled lines are detected and skipped safely.

#### Practical Examples

##### 1. Create and Write a Text File
```c
#include <stdio.h>

int main() {
    FILE *fp = fopen("names.txt", "w");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }

    fprintf(fp, "Alice\n");
    fprintf(fp, "Bob\n");
    fprintf(fp, "Charlie\n");

    fclose(fp);
    printf("File written.\n");
    return 0;
}
```

##### 2. Read a Text File Line-by-Line
```c
#include <stdio.h>

int main() {
    FILE *fp = fopen("names.txt", "r");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }

    char line[100];
    while (fgets(line, sizeof(line), fp) != NULL) {
        printf("%s", line);
    }

    fclose(fp);
    return 0;
}
```

##### Expected Output:
```text
Alice
Bob
Charlie
```

##### 3. Append to a Text File
```c
#include <stdio.h>

int main() {
    FILE *fp = fopen("names.txt", "a");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }

    fprintf(fp, "David\n");
    fclose(fp);
    return 0;
}
```
`names.txt` now contains `Alice`, `Bob`, `Charlie`, `David` in sequence.

##### 4. Copy Contents Character-by-Character
```c
#include <stdio.h>

int main() {
    FILE *src = fopen("names.txt", "r");
    FILE *dest = fopen("names_copy.txt", "w");

    if (src == NULL || dest == NULL) {
        printf("Error opening files.\n");
        return 1;
    }

    char ch;
    while ((ch = fgetc(src)) != EOF) {
        fputc(ch, dest);
    }

    fclose(src);
    fclose(dest);
    printf("File copied successfully.\n");
    return 0;
}
```

#### Practice - 8.2

##### Conceptual Questions
1. Why can `fscanf("%s", ...)` fail to read a full sentence?
2. What does `fgets()` return when it reaches the end of the file?
3. Why is checking `feof()` before reading considered a bug pattern?

##### Output / Code Tracing
What is printed by this code?
```c
FILE *fp = fopen("nums.txt", "w");
fprintf(fp, "10 20 30");
fclose(fp);

fp = fopen("nums.txt", "r");
int x, y, z;
int count = fscanf(fp, "%d %d %d", &x, &y, &z);
printf("%d %d %d %d\n", count, x, y, z);
```

##### Coding Exercise
1. Write a program to count the number of lines in a text file using `fgets()`.
2. Write a program that reads a file word-by-word using `fscanf("%s", ...)` and prints each word on a new line.

---

### 8.3 Binary File I/O

#### What Are Binary Files?
Binary files store data in the **same raw byte layout** it has in memory — no conversion to human-readable characters happens. An `int` takes exactly `sizeof(int)` bytes; a struct is stored as a contiguous byte block matching its memory layout.

* **Text mode:** `25` → `'2'` `'5'` (2 bytes, human-readable ASCII characters)
* **Binary mode:** `25` → `00 00 00 19` (4 bytes, raw memory bytes representing the integer)

> [!NOTE]
> **Key Idea**
> Binary I/O is **faster** (no text conversions) and **preserves exact data**, but the file is **not human-readable** and can be **less portable** across machines with different byte-ordering (endianness) or struct padding.

#### fread() — Reading Binary Data
```c
size_t fread(void *ptr, size_t size, size_t count, FILE *fp);
```
* `ptr` — where to store the read data (destination buffer).
* `size` — size in bytes of each element.
* `count` — number of elements to read.
* **Return value:** the **number of complete elements actually read** (may be less than count if EOF or an error is encountered).

```c
int arr[5];
fread(arr, sizeof(int), 5, fp);
```

#### fwrite() — Writing Binary Data
```c
size_t fwrite(const void *ptr, size_t size, size_t count, FILE *fp);
```
* `ptr` — source data to write.
* **Return value:** the number of complete elements successfully written.

```c
int arr[5] = {1, 2, 3, 4, 5};
fwrite(arr, sizeof(int), 5, fp);
```

> [!IMPORTANT]
> **Binary Modes**
> Always open the file with a binary mode (`"rb"`, `"wb"`, `"ab"`) for binary I/O. On some systems (such as Windows), opening a binary file in text mode corrupts the binary data due to automatic carriage return/newline translation.

#### fread() vs. fscanf()

| Feature | fread() | fscanf() |
| :--- | :--- | :--- |
| **Data form** | Raw bytes (binary) | Text tokens |
| **Speed** | Faster — direct memory copy | Slower — parses text |
| **Human-readable** | No | Yes |
| **Best for** | Structs, arrays, binary files | Config-style text files |

#### Reading and Writing Arrays
```c
#include <stdio.h>

int main() {
    int nums[5] = {10, 20, 30, 40, 50};

    FILE *fp = fopen("nums.bin", "wb");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }
    fwrite(nums, sizeof(int), 5, fp);
    fclose(fp);

    int result[5];
    fp = fopen("nums.bin", "rb");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }
    fread(result, sizeof(int), 5, fp);
    fclose(fp);

    for (int i = 0; i < 5; i++)
        printf("%d ", result[i]);
    printf("\n");

    return 0;
}
```

##### Expected Output:
```text
10 20 30 40 50 
```

#### Reading and Writing Structures
```c
#include <stdio.h>

struct Student {
    char name[30];
    int roll;
    float marks;
};

int main() {
    struct Student s1 = {"Ravi", 101, 89.5};

    FILE *fp = fopen("student.dat", "wb");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }
    fwrite(&s1, sizeof(struct Student), 1, fp);
    fclose(fp);

    struct Student s2;
    fp = fopen("student.dat", "rb");
    if (fp == NULL) { printf("Error opening file.\n"); return 1; }
    fread(&s2, sizeof(struct Student), 1, fp);
    fclose(fp);

    printf("Name: %s, Roll: %d, Marks: %.2f\n", s2.name, s2.roll, s2.marks);
    return 0;
}
```

##### Expected Output:
```text
Name: Ravi, Roll: 101, Marks: 89.50
```

> [!NOTE]
> **Key Idea**
> When writing an array of structures, specify the size of one struct and count as `n`: `fwrite(arr, sizeof(struct Student), n, fp)`.

> [!WARNING]
> **Common Beginner Mistakes & Limitations**
> * Opening a binary file in text mode (e.g., `"w"` instead of `"wb"`).
> * Forgetting that `fread`/`fwrite` copy **raw memory**, including uninitialized padding bytes inside structures.
> * Mismatching struct/array types between the `fwrite` and the corresponding `fread`, which yields corrupt data.
> * Expecting binary files to be portable across different machines/compilers (differences in endianness or structure alignment padding can break them).

#### Practice - 8.3

##### Conceptual Questions
1. Why must binary files be opened with `"rb"`/`"wb"` rather than `"r"`/`"w"`?
2. What does `fread()` return, and why should you check it?
3. Why might a binary file written by one program not be portable to another machine?

##### Output / Code Tracing
What is printed by this code?
```c
float f = 3.14f;
FILE *fp = fopen("val.bin", "wb");
fwrite(&f, sizeof(float), 1, fp);
fclose(fp);

float g = 0;
fp = fopen("val.bin", "rb");
size_t n = fread(&g, sizeof(float), 1, fp);
fclose(fp);
printf("%zu %.2f\n", n, g);
```

##### Coding Exercise
1. Write a program to store 5 employee records (struct with name and salary) in a binary file, then read them back and print them.
2. Write a program that appends a new structure record to an existing binary file without overwriting previous records.

---

### 8.4 Visual Learning - Diagrams

#### 1. File Handling Workflow
```text
Program ──► fopen() ──► [file operation: read/write] ──► fclose()
```

#### 2. File Pointer Diagram
```text
FILE *fp
│
▼
┌───────────────────┐      ┌─────────────────┐
│ FILE structure    │ ───> │   Actual file   │
│ (buffer, position,│      │     on disk     │
│  error/EOF flags) │      └─────────────────┘
└───────────────────┘
```

#### 3. File Modes Diagram
```text
┌───── TEXT MODE ─────┐      ┌──── BINARY MODE ────┐
│      r   w   a      │      │     rb  wb  ab      │
└──────┬──────────────┘      └──────┬───────────────┘
       │                            │
 r/rb: read only, must exist   w/wb: write, erases/creates
 a/ab: write, appends at end   (rb/wb/ab = binary counterparts)
```

#### 4. Reading Flowchart
```text
Start
│
▼
fopen(file, "r")
│
▼
fp == NULL? ── Yes ──► Print error ──► End
│ No
▼
Read data (fgets/fscanf/fread)
│
▼
Success? ── No ──► (EOF or error) ──► fclose() ──► End
│ Yes
▼
Process data ──► loop back to Read
```

#### 5. Writing Flowchart
```text
Start
│
▼
fopen(file, "w"/"a")
│
▼
fp == NULL? ── Yes ──► Print error ──► End
│ No
▼
Write data (fprintf/fputs/fwrite)
│
▼
fclose()
│
▼
End
```

#### 6. Text vs. Binary File Diagram
```text
Value: 1000 (an int)

TEXT FILE:   '1' '0' '0' '0'  → 4 bytes, human-readable characters
BINARY FILE:  E8  03  00  00  → 4 bytes, raw int in memory
```

#### 7. fgets() Line-Reading Diagram
```text
File content: "Hello\nWorld\nEOF"

fgets() call 1 ──► reads "Hello\n" (stops at \n)
fgets() call 2 ──► reads "World\n" (stops at \n)
fgets() call 3 ──► returns NULL (EOF reached, nothing left)
```

#### 8. fread()/fwrite() Block-Data Diagram
```text
Memory (array of 5 ints):
[10][20][30][40][50]
 │
 │ fwrite(arr, sizeof(int), 5, fp)
 ▼
File (raw bytes):
[10][20][30][40][50] (same byte layout, no conversion)
 │
 │ fread(result, sizeof(int), 5, fp)
 ▼
Memory (array restored):
[10][20][30][40][50]
```

#### 9. Structure + Binary File Diagram
```text
struct Student s1 ──fwrite()──► student.dat (raw bytes) ──fread()──► struct Student s2
(s1 == s2 is identical byte-for-byte, if same struct layout/compiler)
```

---

### 8.5 Summary & Cheat Sheet

#### Function Reference

| Function | Purpose | Important Arguments | Return Value |
| :--- | :--- | :--- | :--- |
| `fopen()` | Opens a file and links it to a `FILE*` | filename, mode (`"r"`,`"w"`,`"a"`,`"rb"`,`"wb"`,`"ab"`) | `FILE*` on success, `NULL` on failure |
| `fclose()` | Closes an open file, flushing buffers | `FILE *fp` | `0` on success, `EOF` on failure |
| `fprintf()` | Writes formatted text to a file | `FILE *fp`, format string, values | Number of characters written, negative on error |
| `fscanf()` | Reads formatted text from a file | `FILE *fp`, format string, addresses | Number of items successfully matched, `EOF` on failure/end |
| `fgets()` | Reads a line (up to n-1 chars or `\n`) | buffer, max size n, `FILE *fp` | Pointer to buffer, or `NULL` at EOF/error |
| `fputs()` | Writes a string as-is (no newline added) | string, `FILE *fp` | Non-negative on success, `EOF` on error |
| `fread()` | Reads raw binary data into memory | buffer, element size, count, `FILE *fp` | Number of complete elements read |
| `fwrite()` | Writes raw binary data from memory | data, element size, count, `FILE *fp` | Number of complete elements written |

#### File-Mode Cheat Sheet

| Mode | Type | Action |
| :--- | :--- | :--- |
| **r** | Text | Read only, file must exist |
| **w** | Text | Write, erase existing or create new |
| **a** | Text | Append to end, create if missing |
| **rb** | Binary | Read only, file must exist |
| **wb** | Binary | Write, erase existing or create new |
| **ab** | Binary | Append to end, create if missing |

> [!WARNING]
> **Common Mistakes Checklist**
> * [ ] Not checking `fopen()` for `NULL`.
> * [ ] Using `feof()` to control a read loop instead of checking the read function's return value.
> * [ ] Using `"w"` when `"a"` was intended (accidental data loss).
> * [ ] Forgetting `fclose()`.
> * [ ] Using `fscanf("%s", ...)` expecting it to read a line with spaces.
> * [ ] Opening a binary file in text mode.
> * [ ] Not checking `fread`/`fwrite` return counts.
> * [ ] Mismatching struct/array types between the `fwrite` and the corresponding `fread`.

#### Revision Questions
1. What is the difference between a text file and a binary file?
2. What does `fopen()` return if it fails, and why must this be checked?
3. Differentiate between `"w"` and `"a"` modes.
4. Why is `fgets()` generally safer than `fscanf("%s", ...)` for reading text?
5. What does `fputs()` do differently from `puts()`?
6. Explain why controlling a read loop with `feof()` is a common bug.
7. What are the arguments of `fread()` and `fwrite()`, in order?
8. Why must binary files be opened using `"rb"`/`"wb"` and not `"r"`/`"w"`?
9. What does `fread()` return, and how can this be used to detect incomplete reads?
10. How would you write an entire structure to a binary file in a single call?
11. What happens to existing file content when you open a file in `"w"` mode?
12. Why might a binary file not be portable across different machines/compilers?
13. What is the purpose of `fclose()`, beyond just "ending" file access?
14. Compare `fprintf()` and `fwrite()` in terms of output format and use cases.
15. Why does `fgets()` include the newline character in the string it reads?

#### Mixed Coding Problems
1. Write a program that writes 10 integers entered by the user into a text file, one per line, then reads them back and prints their sum.
2. Write a program that counts the number of vowels in a text file's contents.
3. Write a program that stores an array of 10 float values in a binary file, then reads them back and computes their average.
4. Write a program that maintains a binary file of `struct Employee { char name[30]; int id; float salary; }` records — allow the user to append a new record and then print all records currently stored.
5. Write a program that copies only the non-empty lines from one text file into another text file.
