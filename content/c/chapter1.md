

### 1.1 Structure of a C Program

Every C program follows the same basic skeleton. Understanding this structure makes every future program easier to read, because the pieces never change — only what goes inside them does.

```c
#include <stdio.h> // 1. Preprocessor directive

int main() { // 2. main function — entry point
    // 3. Statements go here, each ending in a semicolon
    printf("Hello!");
    return 0; // 4. Return statement
} // 5. Closing brace
```

#### The Building Blocks
* `#include` — a preprocessor directive that pulls in code from a library before compilation begins (e.g. `stdio.h` for input/output functions).
* `int main() { ... }` — every C program has exactly one `main()` function, and execution always starts there, regardless of where it's physically placed in the file.
* `Braces { }` — mark the beginning and end of a block of code (like a function body).
* `Semicolons ;` — every statement in C must end with a semicolon; forgetting one is the most common beginner error.
* `Comments` — `//` for a single line, or `/* ... */` for multiple lines; ignored by the compiler, used to explain code to humans.

> [!NOTE]
> **Key Idea**
> The compiler cares about semicolons and braces, not indentation or line breaks. Good formatting exists purely to help humans read the code — but sloppy formatting still compiles fine, so build good habits early.

#### A Program With Multiple Statements
Real programs contain many statements executed in order, top to bottom, inside `main()`:

```c
#include <stdio.h>

int main() {
    printf("Starting program...\n");
    printf("Step 1 complete.\n");
    printf("Step 2 complete.\n");
    printf("Program finished.\n");
    return 0;
}
```

##### Output (each printf runs in sequence, one after another):
```text
Starting program...
Step 1 complete.
Step 2 complete.
Program finished.
```

#### ✏ Try It Yourself
Predict the output of this program before running it, then check your answer by compiling it:

```c
#include <stdio.h>

int main() {
    printf("A");
    printf("B\n");
    printf("C");
    return 0;
}
```
(Answer: it prints AB on one line, then C on the next — only `\n` creates a new line, so A and B share a line while C starts fresh.)

---

### 1.2 Variables, Data Types, and Constants

Unlike Python, C is a statically-typed language: every variable's type must be declared explicitly, and it cannot change type later. This is one of the biggest mental shifts for students coming from Python.

#### Core Data Types

| Type | Stores | Example |
| :--- | :--- | :--- |
| **int** | Whole numbers | `int age = 21;` |
| **float** | Decimal numbers (single precision) | `float price = 9.99f;` |
| **double** | Decimal numbers (double precision, more accurate) | `double pi = 3.14159265;` |
| **char** | A single character | `char grade = 'A';` |

Declaring a variable reserves a labeled box of memory of the right size for that type. You must declare a variable's type before using it — C does not guess the type from the value, the way Python does.

```c
int age; // declaration only
age = 21; // assignment
int score = 95; // declaration + assignment (initialization) in one line
```

#### Literals and Naming Rules
* A literal is a fixed value written directly in code, e.g. `21`, `3.14`, `'A'`, `"hello"`.
* Variable names must start with a letter or underscore, can contain letters/digits/underscores, and are case-sensitive (`age` and `Age` are different variables).
* C reserves certain words (`int`, `return`, `if`, etc.) — these cannot be used as variable names.

#### const and sizeof
`const` marks a variable as unchangeable after initialization — attempting to modify it is a compile error, which helps prevent accidental changes to values that should stay fixed:
```c
const float PI = 3.14159;
```
`sizeof` tells you how many bytes a type or variable occupies in memory — useful for understanding memory usage:
```c
printf("%zu", sizeof(int)); // commonly prints 4 (bytes)
```

#### Putting It Together: Declaring, Initializing, and Printing
A complete example declaring one variable of each core type, then printing all of them with their matching format specifiers:

```c
#include <stdio.h>

int main() {
    int age = 21;
    float price = 9.99f;
    double pi = 3.14159265;
    char grade = 'A';

    printf("Age: %d\n", age);
    printf("Price: %.2f\n", price);
    printf("Pi: %lf\n", pi);
    printf("Grade: %c\n", grade);
    return 0;
}
```

##### Output:
```text
Age: 21
Price: 9.99
Pi: 3.141593
Grade: A
```

Notice `%.2f` — the `.2` limits the output to 2 decimal places. This kind of precision control is common when printing prices or measurements.

#### Checking Memory Size with sizeof

```c
#include <stdio.h>

int main() {
    printf("int: %zu bytes\n", sizeof(int));
    printf("float: %zu bytes\n", sizeof(float));
    printf("double: %zu bytes\n", sizeof(double));
    printf("char: %zu bytes\n", sizeof(char));
    return 0;
}
```

##### Typical output on most modern systems:
```text
int: 4 bytes
float: 4 bytes
double: 8 bytes
char: 1 bytes
```
This is why `double` stores decimals more accurately than `float` — it simply has twice the memory to represent the number more precisely.

#### What Happens If You Try to Modify a const
This code will not compile — it's included here so you recognize the error if you see it:

```c
const float PI = 3.14159;
PI = 3.14; // ERROR: assignment of read-only variable 'PI'
```
The compiler catches this at compile time, before the program ever runs — this is exactly the kind of safety `const` is meant to provide.

---

### 1.3 Input and Output

`printf()` displays output, and `scanf()` reads input from the user. Both rely on format specifiers to know what type of data they're working with.

#### Common Format Specifiers

| Specifier | Used For |
| :--- | :--- |
| **%d** | int |
| **%f** | float |
| **%c** | char |
| **%s** | string (character array) |

```c
int age;
printf("Enter your age: ");
scanf("%d", &age); // note the & before the variable
printf("You are %d years old.\n", age);
```

> [!NOTE]
> **Key Idea**
> `scanf()` needs the memory address of the variable (using `&`) so it knows where to store the value it reads — this is your first hands-on encounter with the idea of memory addresses, which becomes central once you reach pointers.

#### Basic Input Validation
`scanf()` returns the number of values it successfully read — checking this return value is a simple first step toward validating input, rather than assuming the user always types exactly what you expect:

```c
int age;
if (scanf("%d", &age) != 1) {
    printf("Invalid input.\n");
}
```

#### Reading Multiple Values at Once
`scanf()` can read several values in a single call — the format string and the argument list just need to line up:

```c
int day, month, year;
printf("Enter date as DD MM YYYY: ");
scanf("%d %d %d", &day, &month, &year);
printf("You entered: %d/%d/%d\n", day, month, year);
```

##### Sample run:
```text
Enter date as DD MM YYYY: 15 8 2025
You entered: 15/8/2025
```

#### A Gotcha: Reading Characters After Numbers
When mixing `%d` and `%c` in `scanf()`, a leftover newline character can be accidentally read as the next character input. Adding a space before `%c` tells `scanf` to skip any whitespace (including leftover newlines) first:

```c
int score;
char grade;
printf("Enter score: ");
scanf("%d", &score);
printf("Enter grade: ");
scanf(" %c", &grade); // note the space before %c
```

> [!NOTE]
> **Key Idea**
> This whitespace-before-%c trick is one of the most common fixes beginners need in C — if a character input seems to get "skipped," this is almost always why.

#### Printing Strings with %s

```c
#include <stdio.h>

int main() {
    char name[20];
    printf("Enter your name: ");
    scanf("%s", name); // no & needed — arrays are covered in Chapter 4
    printf("Hello, %s!\n", name);
    return 0;
}
```

##### Sample run:
```text
Enter your name: Asha
Hello, Asha!
```
Note: `%s` with `scanf()` reads only up to the first space — reading full sentences requires functions covered later in this course (see Chapter 4: Strings).

---

### 1.4 Operators and Expressions

#### Arithmetic, Relational, and Logical Operators

| Category | Operators | Example |
| :--- | :--- | :--- |
| **Arithmetic** | `+` `-` `*` `/` `%` | `a % b` (remainder) |
| **Relational** | `==` `!=` `>` `<` `>=` `<=` | `a == b` |
| **Logical** | `&&` `||` `!` | `a > 0 && b > 0` |

#### Assignment and Increment/Decrement
```c
int x = 5;
x += 3; // same as x = x + 3; -> x is now 8
x++;    // increment by 1     -> x is now 9
x--;    // decrement by 1     -> x is now 8
```

#### Operator Precedence and Associativity
Just like in mathematics, C evaluates some operators before others. Multiplication and division happen before addition and subtraction, unless parentheses say otherwise:

```c
int result = 2 + 3 * 4; // 14, not 20 — multiplication happens first
```

#### Type Conversion
**Implicit conversion** happens automatically when C combines different types, usually converting the "smaller" type up to the "larger" one:

```c
int a = 5;
float b = a; // 5 becomes 5.0 automatically
```
**Explicit conversion (casting)** lets you force a conversion yourself:
```c
float result = (float) 7 / 2; // 3.5, instead of integer division giving 3
```

#### Relational and Logical Operators in Practice
These operators are most useful combined with conditionals (covered fully in Chapter 2), but you can already evaluate them on their own — they produce 1 (true) or 0 (false) in C:

```c
#include <stdio.h>

int main() {
    int a = 10, b = 20;

    printf("%d\n", a == b);             // 0 (false)
    printf("%d\n", a < b);              // 1 (true)
    printf("%d\n", (a < b) && (b > 0)); // 1 (true, both conditions hold)
    printf("%d\n", (a > b) || (b > 0)); // 1 (true, at least one holds)
    printf("%d\n", !(a == b));          // 1 (true, negates a false condition)
    return 0;
}
```

#### The Integer Division Trap
One of the most common beginner surprises in C: dividing two integers always produces an integer result, truncating (not rounding) any decimal part:

```c
int a = 7, b = 2;
printf("%d\n", a / b);          // 3, not 3.5
printf("%f\n", (float) a / b);  // 3.500000 — casting one operand to float first
```

> [!NOTE]
> **Key Idea**
> Casting only one of the two operands to float is enough — C then promotes the whole expression to floating-point division before it runs, giving you the decimal result you'd expect.

#### Full Expression Walkthrough
Combining several operators in one expression — work through this step by step using precedence rules (parentheses, then `*` and `/`, then `+` and `-`, left to right):

```c
int result = 10 + 2 * 3 - 4 / 2;
// Step 1: 2 * 3 = 6  -> 10 + 6 - 4 / 2
// Step 2: 4 / 2 = 2  -> 10 + 6 - 2
// Step 3: 10 + 6 = 16 -> 16 - 2
// Step 4: 16 - 2 = 14
printf("%d\n", result); // 14
```
