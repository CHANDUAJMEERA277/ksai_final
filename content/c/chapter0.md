

> "Before you can write a single working line of C, your computer needs to learn how to turn your words into something it can actually execute."

### By the End of This Chapter, You Will Be Able To:
* Explain what C is, and why it's still used to build operating systems, embedded devices, and other programming languages
* Install a C compiler (GCC) and choose a suitable editor or IDE
* Write, compile, and run C programs from the command line
* Read and understand basic compiler errors and warnings
* Write and explain your first C program, "Hello, World!"

---

### 1. What is C, and Where is it Used?

C is a general-purpose, procedural programming language created by Dennis Ritchie at Bell Labs in 1972. It's often called a "mid-level" language: high-level enough to write readable programs, but low-level enough to directly manage memory and talk to hardware almost as directly as assembly.

C's philosophy is simplicity and control. It gives you direct access to memory through pointers, and very few built-in safety nets — trusting you, the programmer, to manage resources correctly. That trade-off makes C extremely fast and predictable, but also easy to get wrong if you're not careful.

> [!NOTE]
> **Key Idea**
> C trades convenience for control. Higher-level languages like Python protect you from many mistakes automatically. C won't stop you from shooting yourself in the foot — but it also won't get in your way when you need precise control over memory and performance.

#### Where C is Used
* **Operating Systems** — Linux, Windows, and macOS all have kernels written substantially in C.
* **Embedded Systems** — microcontrollers inside cars, appliances, and IoT devices run C because it's small, fast, and predictable.
* **System Programming** — compilers, interpreters, and even other programming languages are built in C (CPython, the reference implementation of Python, is itself written in C).
* **Performance-Critical Software** — game engines and real-time systems where every millisecond and every byte of memory matters.
* **Foundational Learning** — understanding C teaches you how memory, pointers, and computers actually work under the hood, which makes every other language easier to reason about later.

> [!NOTE]
> **Real-World Use**
> Every time your phone boots up, your car's dashboard responds, or you run a Python script, C is working quietly underneath — either directly, or through a language whose own interpreter was written in C.

---

### 2. Installing a Compiler and Editor/IDE

A compiler translates your human-readable C source code (a `.c` file) into machine code the processor can actually run. Unlike Python, C code must be compiled before it can run at all — there's no interpreter reading it line by line as you go.

#### Installing GCC (GNU Compiler Collection)
* **Windows:** install via MinGW-w64, or use WSL (Windows Subsystem for Linux) with GCC pre-available.
* **macOS:** install Xcode Command Line Tools (`xcode-select --install`), which includes Clang (GCC-compatible).
* **Linux:** usually pre-installed, or install via your package manager, e.g. `sudo apt install gcc`.

Verify the installation by running:
```bash
gcc --version
```

##### Output:
```text
gcc (GCC) 13.2.0
Copyright (C) 2023 Free Software Foundation, Inc.
```

#### Choosing an Editor or IDE
* **VS Code** — lightweight, highly extensible, the most popular choice for learning C (use the "C/C++" extension).
* **Code::Blocks** — a free, beginner-friendly IDE built specifically for C/C++.
* **CLion** — a full-featured, paid IDE (free for students) with strong debugging tools.

> [!NOTE]
> **Note**
> This course uses VS Code with the C/C++ extension in all examples — it's free, fast, and widely used on real development teams, so the habits you build here transfer directly.

---

### 3. Writing, Compiling, and Running a Program

Getting a C program to run involves three distinct steps — unlike Python, where you simply run the file directly:

| Step | What Happens | Command |
| :--- | :--- | :--- |
| 1. Write | Save your code in a plain text file with a .c extension | hello.c |
| 2. Compile | The compiler translates the .c file into an executable binary | `gcc hello.c -o hello` |
| 3. Run | The operating system executes the compiled binary | `./hello` |

> [!WARNING]
> **Watch Out**
> If you change your code, you must re-compile before running again. The executable is a frozen snapshot of your code at the moment you compiled it — it is not a live link to the source file. Running an old executable after editing the .c file will silently show you old behavior.

#### Program 0.1 — Compiling and running your first file
```c
// save this file as greet.c
#include <stdio.h>

int main() {
    printf("Compilation successful!\n");
    return 0;
}
```

From the terminal, in the same folder as the file:
```bash
gcc greet.c -o greet
./greet
```

##### Output:
```text
Compilation successful!
```

---

### 4. Understanding Errors and Warnings

The compiler checks your code for problems before producing an executable. It's important to know the difference between the two kinds of messages it can give you:

| Type | Meaning | Result |
| :--- | :--- | :--- |
| **Error** | Code violates C's syntax/rules and cannot be compiled | No executable is produced — must be fixed |
| **Warning** | Code compiles but looks suspicious or risky | Executable is still produced — should be reviewed, not ignored |

#### Program 0.2 — A program with a missing semicolon
```c
#include <stdio.h>

int main() {
    printf("Almost there")
    return 0;
}
```

Attempting to compile this produces an error, not a warning, because C's syntax rules are broken:

##### Output:
```text
greet.c:5:5: error: expected ';' before 'return'
```

Reading these messages carefully — starting with the file name and line number — is one of the most important debugging skills in C. The line number points you almost directly to the mistake (or the line just before it, since a missing semicolon is only "noticed" once the next line breaks the pattern).

> [!NOTE]
> **Key Idea**
> Never ignore warnings just because your program "still runs." Many of C's most dangerous bugs — like using a variable before giving it a value — show up only as warnings, not errors, and can cause crashes or corrupted data much later, far from where the real mistake was made.

---

### 5. Your First Program: "Hello, World!"

Here is the traditional first C program, and the one you'll return to as a reference for the basic shape of every program you write from now on:

```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

##### Output:
```text
Hello, World!
```

#### Breaking Down the Structure
* `#include <stdio.h>` — brings in the Standard Input/Output library, which contains `printf()`.
* `int main() { ... }` — every C program starts execution from a function called `main`. The `int` means this function returns an integer value to the operating system.
* `printf("Hello, World!\n");` — prints the given text to the screen; `\n` moves the cursor to a new line afterward.
* `return 0;` — tells the operating system the program finished successfully (by convention, `0` means "no errors").

#### ✏ Try It Yourself
Modify the Hello World program so it prints your name on one line, and "Welcome to C!" on the next line — using a single `printf()` call with one `\n` in the middle of the string.
