> "Real-world data is rarely homogeneous. A student has a name (string), a roll number (int), and grades (float). Structures, unions, and enumerations are C's tools for grouping mixed data types and creating expressive, custom types that mirror real-world entities."

Real-world entities are complex. Unlike an array, which requires all items to be of the exact same type, C structures let you bundle variables of different types under a single name. Unions let those members share the exact same memory space to save memory, and enums let you assign readable names to numeric constants.

#### Why User-Defined Types Exist
* **Real-world entities have mixed attributes** (e.g., a student record, a database entry, or an employee file) that cannot fit in a single homogeneous array.
* **Scattered variables make code hard to read** and maintain. Bundling them into structures creates cleaner, more logical code.
* **Unions provide memory efficiency** in resource-constrained environments (like embedded systems) by reusing memory for mutually exclusive data.
* **Enumerations replace "magic numbers"** with self-documenting, named compile-time constants.

#### Where This Is Used
* **Database Management Systems (DBMS)** use structures to represent records and rows in a table.
* **Network Packets and Protocols** use unions and structures to parse headers and data payloads based on context.
* **Operating System Kernels** represent file descriptors, process IDs, and hardware states using structs and enums.
* **Graphics Engines** use nested structures to represent coordinate systems, colors, and shapes.

---

### 7.1 Structures

#### What is a Structure and Why Do We Need It?
A **structure (struct)** is a user-defined data type that groups together variables of **different types** under one name.

Arrays let you group variables of the **same** type (e.g., `int marks[5]`). But real-world entities like a *Student* or *Employee* have mixed attributes:
* **Student:** name (string), roll number (int), marks (float)

You cannot put these in a single array because the types differ. A structure solves this by bundling them into one logical unit.

> [!NOTE]
> **Key Idea**
> A structure is a *blueprint*. Declaring a struct does not create a variable — it only defines a new type. Memory is allocated only when you create a **structure variable**.

```text
Without struct (scattered, unrelated):
char name[20];
int roll;
float marks;

With struct (one logical unit):
struct Student {
    char name[20];
    int roll;
    float marks;
};
```

#### struct Syntax and Declaration
```c
struct StructureName {
    dataType member1;
    dataType member2;
    ...
};
```

Example:
```c
struct Student {
    char name[20];
    int roll;
    float marks;
}; // <-- semicolon is mandatory
```

> [!WARNING]
> **Common Beginner Mistakes**
> Forgetting the semicolon `;` after the closing brace of a struct definition. This is one of the most frequent beginner errors and causes confusing compiler errors on the *next* line of code.

This declaration by itself creates **no memory** — it just registers a new type name `struct Student` with the compiler.

#### Structure Variables and Initialization

##### Declaring variables
```c
struct Student s1; // one variable
struct Student s2, s3; // multiple variables

// Or combined with the struct definition:
struct Student {
    char name[20];
    int roll;
    float marks;
} s1, s2;
```

##### Initialization
```c
struct Student s1 = {"Alice", 1, 89.5}; // order must match member order

// Designated initializers (C99, recommended for clarity)
struct Student s2 = {.roll = 2, .name = "Bob", .marks = 76.0};
```

> [!NOTE]
> **Key Idea**
> Designated initializers let you initialize members in any order and skip members (uninitialized ones automatically become 0 or empty).

#### Accessing and Modifying Members with the Dot Operator (.)
Use the **dot (member) operator** to access or modify members of a structure **variable**.

```c
#include <stdio.h>
#include <string.h>

struct Student {
    char name[20];
    int roll;
    float marks;
};

int main() {
    struct Student s1 = {"Alice", 1, 89.5};

    printf("Name: %s\n", s1.name);
    printf("Roll: %d\n", s1.roll);
    printf("Marks: %.2f\n", s1.marks);

    s1.marks = 92.0; // modifying a member
    strcpy(s1.name, "Alicia"); // strings need strcpy, not '='

    printf("Updated: %s, %.2f\n", s1.name, s1.marks);
    return 0;
}
```

##### Expected Output:
```text
Name: Alice
Roll: 1
Marks: 89.50
Updated: Alicia, 92.00
```

Key lines explained:
* `s1.name` — accesses the name array member of `s1`.
* `strcpy(s1.name, "Alicia")` — you **cannot** write `s1.name = "Alicia"` because `name` is a char array (arrays aren't assignable). Use `strcpy`.
* `s1.marks = 92.0` — simple assignment works fine for non-array members.

> [!WARNING]
> **Common Beginner Mistakes**
> Trying to assign a string directly to a char-array member using `=`. Always use `strcpy` or `strncpy`.

#### Arrays of Structures
When you have many records of the same type (e.g., 5 students), use an **array of structures**.

```c
#include <stdio.h>

struct Student {
    char name[20];
    int roll;
    float marks;
};

int main() {
    struct Student class1[3] = {
        {"Alice", 1, 89.5},
        {"Bob", 2, 76.0},
        {"Carol", 3, 92.3}
    };

    for (int i = 0; i < 3; i++) {
        printf("%s - %.2f\n", class1[i].name, class1[i].marks);
    }
    return 0;
}
```

##### Expected Output:
```text
Alice - 89.50
Bob - 76.00
Carol - 92.30
```

`class1[i]` gives you the i-th structure, and `.` accesses its members — this combines indexing and dot notation.

##### Memory Diagram: Array of Structures
```text
struct Student class1[3]

Index:     [0]                  [1]                  [2]
      ┌───────────┐        ┌───────────┐        ┌───────────┐
name  │  "Alice"  │  name  │   "Bob"   │  name  │  "Carol"  │
roll  │     1     │  roll  │     2     │  roll  │     3     │
marks │   89.5    │  marks │   76.0    │  marks │   92.3    │
      └───────────┘        └───────────┘        └───────────┘
        class1[0]            class1[1]            class1[2]
```

Each block is one complete `struct Student`, laid out contiguously (back-to-back) in memory, just like an array of integers — except each "element" is a full structure.

> [!NOTE]
> **Key Idea**
> `sizeof(class1) = 3 * sizeof(struct Student)` since the array stores 3 contiguous structures.

#### Nested Structures
A structure can contain another structure as a member — useful for modeling hierarchical data (e.g., an Employee has a Address/Date).

```c
#include <stdio.h>

struct Date {
    int day, month, year;
};

struct Employee {
    char name[20];
    struct Date joiningDate; // nested structure
};

int main() {
    struct Employee e1 = {"Ravi", {12, 6, 2023}};

    printf("%s joined on %d-%d-%d\n",
           e1.name, e1.joiningDate.day,
           e1.joiningDate.month, e1.joiningDate.year);
    return 0;
}
```

##### Expected Output:
```text
Ravi joined on 12-6-2023
```

Key line: `e1.joiningDate.day` — you chain `.` operators to reach members of a nested structure.

> [!NOTE]
> **Key Idea**
> You can also declare the nested struct *inline*:
> ```c
> struct Employee {
>     char name[20];
>     struct {
>         int day, month, year;
>     } joiningDate;
> };
> ```

> [!WARNING]
> **Common Beginner Mistakes**
> A structure **cannot contain a member of its own type directly** (as this would require infinite size). It *can*, however, contain a **pointer** to its own type (this is how linked lists are built):
> ```c
> struct Node {
>     int data;
>     struct Node *next; // OK - pointer, not full struct
> };
> ```

#### Pointers to Structures and the Arrow Operator (->)
You can create a pointer that points to a structure variable.

```c
#include <stdio.h>

struct Student {
    char name[20];
    int roll;
    float marks;
};

int main() {
    struct Student s1 = {"Alice", 1, 89.5};
    struct Student *p = &s1; // pointer to s1

    // Two equivalent ways to access members via pointer:
    printf("%s\n", (*p).name); // dereference then dot
    printf("%s\n", p->name);   // arrow operator (preferred)

    p->marks = 95.0; // modifying through pointer
    printf("%.2f\n", s1.marks);
    return 0;
}
```

##### Expected Output:
```text
Alice
Alice
95.00
```

Key lines:
* `(*p).name` — dereferences `p` to get the struct, then uses `.`. Parentheses are required because `.` binds tighter than `*`.
* `p->name` — the **arrow operator**, shorthand for `(*p).name`. Always preferred for readability.
* `p->marks = 95.0` — changes `s1.marks` directly, since `p` points to `s1`'s actual memory location.

##### Memory Diagram: Structure Pointer
```text
p (pointer)              s1 (struct Student)
┌───────────┐            ┌──────────────────────┐
│  address  │ ---------> │ name  : "Alice"      │
└───────────┘            │ roll  : 1            │
                         │ marks : 95.0         │
                         └──────────────────────┘
p->name ≡ (*p).name ≡ s1.name
```

##### . vs -> Comparison Table

| Operator | Used with | Example | Meaning |
| :--- | :--- | :--- | :--- |
| **. (dot)** | Structure **variable** | `s1.marks` | Direct member access |
| **-> (arrow)** | Structure **pointer** | `p->marks` | Dereference + member access |
| **(*p).x** | Structure pointer (manual) | `(*p).marks` | Same as `p->marks`, but less readable |

> [!WARNING]
> **Common Beginner Mistakes**
> Writing `p.marks` when `p` is a pointer. This is a compiler error. Pointers must use `->` (or `(*p).`).

#### Passing Structures to Functions
##### (a) Pass by Value (copy)
The entire structure is copied into the function. Changes inside the function do **not** affect the original.

```c
#include <stdio.h>

struct Point { int x, y; };

void tryModify(struct Point p) {
    p.x = 100; // modifies only the local copy
}

int main() {
    struct Point pt = {1, 2};
    tryModify(pt);
    printf("%d %d\n", pt.x, pt.y); // unchanged
    return 0;
}
```

##### Expected Output:
```text
1 2
```

> [!WARNING]
> **Common Beginner Mistakes**
> Passing large structures by value copies *all* their bytes onto the stack on every call. This is slow and wasteful for big structs. Prefer pointers for large structures.

##### Memory Diagram: Pass by Value
```text
main()                           tryModify()
pt {x=1, y=2} ── copies struct ─> p {x=1, y=2} (separate copy)
                                 (changes to p do not affect pt)
```

##### (b) Pass by Pointer
Passing a pointer avoids copying and allows the function to modify the original.

```c
#include <stdio.h>

struct Point { int x, y; };

void modify(struct Point *p) {
    p->x = 100; // modifies the original
    p->y = 200;
}

int main() {
    struct Point pt = {1, 2};
    modify(&pt);
    printf("%d %d\n", pt.x, pt.y); // changed
    return 0;
}
```

##### Expected Output:
```text
100 200
```

> [!NOTE]
> **Key Idea**
> Passing by pointer is the standard practice for structures. It is fast (only an address is copied) and allows in-place modifications. If a function should read but not modify, use `const`:
> ```c
> void display(const struct Point *p) {
>     printf("%d %d\n", p->x, p->y);
>     // p->x = 5; // compile error! protects against changes
> }
> ```

##### Memory Diagram: Pass by Pointer
```text
main()                           modify()
pt {x=1, y=2} <─── address ────── p (pointer)
      │
      └─ p->x = 100 changes pt directly
```

#### Returning Structures from Functions
A function can return a whole structure by value.

```c
#include <stdio.h>

struct Point { int x, y; };

struct Point makePoint(int a, int b) {
    struct Point temp;
    temp.x = a;
    temp.y = b;
    return temp; // struct copied out to caller
}

int main() {
    struct Point pt = makePoint(5, 10);
    printf("%d %d\n", pt.x, pt.y);
    return 0;
}
```

##### Expected Output:
```text
5 10
```

> [!WARNING]
> **Common Beginner Mistakes**
> Returning a pointer to a **local** structure variable:
> ```c
> struct Point *badFunction() {
>     struct Point temp = {1, 2};
>     return &temp; // DANGEROUS: temp is destroyed when function ends
> }
> ```
> This causes **undefined behavior** because `temp` lives on the stack and is deallocated once the function returns, leaving the caller with a **dangling pointer**.
> Fix: return the struct **by value** (as in the correct example above), or dynamically allocate memory with `malloc`.

#### typedef struct
`typedef` lets you create an alias for a struct type so you don't need to write `struct` every time.

```c
#include <stdio.h>

typedef struct {
    char name[20];
    int roll;
    float marks;
} Student; // "Student" is now a type name

int main() {
    Student s1 = {"Alice", 1, 89.5}; // no need to write "struct Student"
    printf("%s\n", s1.name);
    return 0;
}
```

##### Expected Output:
```text
Alice
```

You can also keep both the tag and the alias:
```c
typedef struct Student {
    char name[20];
    int roll;
} Student;

struct Student s1; // still valid
Student s2;        // also valid, shorter
```

> [!NOTE]
> **Key Idea**
> `typedef` is purely a compile-time convenience — it does not change memory layout or runtime behavior. In C (unlike C++), you **must** write `struct Student` (not just `Student`) unless a `typedef` alias exists.

#### Structure Memory Layout and Padding
```c
struct Student {
    char name[20]; // 20 bytes
    int roll;      // 4 bytes
    float marks;   // 4 bytes
};
```

Memory layout of one `struct Student` variable:
```text
Offset: 0                    19 20         23 24         27
        ┌──────────────────────┬─────────────┬─────────────┐
        │   name [20 bytes]    │  roll (4B)  │  marks (4B) │
        └──────────────────────┴─────────────┴─────────────┘
```

> [!IMPORTANT]
> **Structure Padding**
> Compilers may insert extra unused bytes (**padding**) between members to align data on word boundaries for faster CPU access. Because of this, `sizeof(struct Student)` may be **larger** than the sum of its individual member sizes.
> ```c
> struct Example {
>     char c; // 1 byte
>     int i;  // 4 bytes
> };
> // sizeof(struct Example) is often 8, not 5, due to 3 bytes of padding after 'c'
> ```

> [!NOTE]
> **Optimization Tip**
> Reordering structure members (from largest to smallest) can reduce padding and total struct size — a common embedded-systems optimization.

#### Practice - 7.1 Structures

##### Conceptual Questions
1. Why can't you use `=` to copy a string into a char-array struct member?
2. Why is passing a structure pointer usually preferred over passing by value?

##### Output / Code Tracing
What does this print, and why?
```c
#include <stdio.h>
struct P { int x, y; };
void f(struct P p) { p.x = 50; }
int main() {
    struct P a = {1, 2};
    f(a);
    printf("%d", a.x);
}
```

##### Coding Exercise
Define a struct `Book` with title, author, and price. Create an array of 3 books, initialize them, and print all details using a loop.

---

### 7.2 Unions

#### What is a Union and Why Is It Used?
A **union** is similar to a structure — it groups different data types under one name — but with one critical difference:

> [!IMPORTANT]
> **Shared Memory**
> **All members of a union share the exact same memory location.** Only **one** member can hold a valid value at any given time.

Unions are used when you need to represent **one value that could be of several different types**, and you don't need all of them simultaneously — this saves memory.

* **struct:** each member gets its OWN memory → total size = sum of members (+ padding)
* **union:** all members SHARE ONE memory → total size = size of largest member

#### Syntax, Declaration, and Initialization
```c
union Data {
    int i;
    float f;
    char str[20];
}; // semicolon required, just like struct

union Data d1; // declare a variable
union Data d2 = {10}; // initializes the FIRST member only (i = 10)
```

> [!WARNING]
> **Common Beginner Mistakes**
> In a standard (non-designated) initializer, only the **first member** of a union can be initialized directly. To initialize a different member, use a designated initializer:
> ```c
> union Data d3 = {.f = 3.14f};
> ```

#### Accessing Members
Access works exactly like structures — `.` for variables, `->` for pointers.

```c
#include <stdio.h>

union Data {
    int i;
    float f;
    char str[20];
};

int main() {
    union Data d;
    d.i = 10;
    printf("%d\n", d.i); // valid: 10

    d.f = 3.14; // now overwrites the same memory
    printf("%.2f\n", d.f); // valid: 3.14
    printf("%d\n", d.i); // GARBAGE: 'i' is no longer meaningful

    return 0;
}
```

##### Expected Output:
```text
10
3.14
1078523331
```

Why: When `d.f` is assigned, it overwrites the exact same bytes that `d.i` used. Once you write to `f`, the value stored in `i` is now meaningless bit-garbage.

#### Shared Memory and Memory Layout
```c
union Data {
    int i;        // 4 bytes
    float f;      // 4 bytes
    char str[20]; // 20 bytes
};
```

`sizeof(union Data) = 20` (size of the LARGEST member: `str[20]`).

```text
Offset: 0                                       19
        ┌────────────────────────────────────────┐
i       │  i (uses bytes 0-3)                    │
f       │  f (uses bytes 0-3, SAME bytes as i)   │
str     │  str (uses all bytes 0-19)             │
        └────────────────────────────────────────┘
        ^--- all three members start at the SAME address
```

##### struct vs union Memory Comparison

| Type | Memory Layout | Size | Member Access |
| :--- | :--- | :--- | :--- |
| **struct** | Separate memory for each member | Sum of all members (+ padding) | All members usable at once |
| **union** | Shared memory (members overlap) | Size of largest member | Only one member valid at a time |

#### What Happens When Different Members Are Assigned
Every time you assign to a different union member, the previous member's data is **overwritten** (interpreted through a different type's "lens"), because they occupy identical memory.

```c
#include <stdio.h>

union Test {
    int i;
    char c[4];
};

int main() {
    union Test t;
    t.i = 65; // binary: 01000001 00000000 00000000 00000000 (little-endian)

    printf("%d\n", t.i);
    printf("%c\n", t.c[0]); // reads just the first byte as a char
    return 0;
}
```

##### Expected Output:
```text
65
A
```

Why: `t.i = 65` stores the integer 65 in the shared 4 bytes. `t.c[0]` then reads the *first byte* of that same memory, which happens to be the ASCII value 65 = `'A'`. This is a classic demonstration of shared union memory — and it's also how you can inspect a system's **byte order (endianness)**.

#### Practical Use Cases
1. **Saving memory** when only one of several fields is needed at a time (e.g., a variant type holding either an int, float, or string).
2. **Type-punning / low-level byte inspection** (e.g., examining the raw bytes of a float).
3. **Interpreting hardware/network data** where the same bits may represent different fields depending on context.
4. **Tagged Unions:** A struct containing a union + a "type" field to safely store one-of-several types:

```c
#include <stdio.h>

enum Type { INT_TYPE, FLOAT_TYPE };

struct Variant {
    enum Type type; // tag telling us which member is valid
    union {
        int i;
        float f;
    } value;
};

void printVariant(struct Variant v) {
    if (v.type == INT_TYPE)
        printf("Int: %d\n", v.value.i);
    else
        printf("Float: %.2f\n", v.value.f);
}

int main() {
    struct Variant v1 = {.type = INT_TYPE, .value.i = 42};
    printVariant(v1);
    return 0;
}
```

> [!NOTE]
> **Key Idea**
> The "tagged union" pattern (struct + enum + union) is the standard, *safe* way to use unions in real code — the tag tells you which member is currently valid.

#### Practice - 7.2 Unions

##### Conceptual Questions
1. Why does `sizeof(union)` equal the size of its largest member instead of the sum of all members?
2. Why is it dangerous to read a union member that wasn't the last one assigned?

##### Output / Code Tracing
What does this print on a little-endian system, and why?
```c
#include <stdio.h>
union U { int a; char b[4]; };
int main() {
    union U u;
    u.a = 1;
    printf("%d", u.b[0]);
}
```

##### Coding Exercise
Write a "tagged union" struct `Shape` that can hold either a circle's radius or a rectangle's width & height, along with a type tag, and a function that computes the area based on the tag.

---

### 7.3 Enumerations

#### What is enum and Why Is It Useful?
An **enum (enumeration)** is a user-defined type consisting of a set of **named integer constants**. It makes code more readable by replacing "magic numbers" with meaningful names.

```c
// Without enum - unclear magic numbers
int day = 3; // what does 3 mean??

// With enum - self-documenting
enum Day { MON, TUE, WED, THU, FRI, SAT, SUN };
enum Day day = WED; // clearly Wednesday
```

> [!IMPORTANT]
> **Under the Hood**
> Internally, enum constants are just integers. An enum is a compile-time convenience for naming integers — it does **not** enforce special runtime type checking.

#### Syntax and Declaration
```c
enum EnumName {
    CONSTANT1,
    CONSTANT2,
    CONSTANT3
};
```

Example:
```c
enum Color { RED, GREEN, BLUE };
enum Color c1 = GREEN;
```

#### Default and Custom Values
By default, enum constants start at **0** and increase by **1**:
* `RED = 0, GREEN = 1, BLUE = 2`

You can assign **custom values**. Any constant left unassigned continues incrementing from the previous value:
```c
enum Status { OK = 200, NOT_FOUND = 404, SERVER_ERROR = 500 };
enum Priority { LOW = 1, MEDIUM, HIGH };
// LOW = 1, MEDIUM = 2, HIGH = 3 (MEDIUM/HIGH auto-increment from LOW)
```

##### Diagram: Enum Value Mapping
```text
enum Color { RED, GREEN, BLUE };
RED   ───> 0
GREEN ───> 1
BLUE  ───> 2

enum Priority { LOW = 1, MEDIUM, HIGH };
LOW    ───> 1
MEDIUM ───> 2 (1 + 1, auto-incremented)
HIGH   ───> 3 (2 + 1, auto-incremented)
```

> [!NOTE]
> **Key Idea**
> Two enum constants can share the same value:
> `enum Status { ACTIVE = 1, ENABLED = 1, INACTIVE = 0 };`

#### Enum Variables
```c
#include <stdio.h>

enum Color { RED, GREEN, BLUE };

int main() {
    enum Color c1 = GREEN;

    printf("%d\n", c1); // prints 1 (its integer value)

    if (c1 == GREEN)
        printf("Color is green\n");

    return 0;
}
```

##### Expected Output:
```text
1
Color is green
```

> [!WARNING]
> **Common Beginner Mistakes**
> There is no built-in way to print an enum's *name* with `printf` — `%d` prints its underlying integer. To print the name, you must manually map it (e.g., with an array of strings or a switch statement):
> ```c
> const char *colorNames[] = {"RED", "GREEN", "BLUE"};
> printf("%s\n", colorNames[c1]); // "GREEN"
> ```

#### Enums with switch
Enums pair naturally with switch statements — a very common and readable combination.

```c
#include <stdio.h>

enum Day { MON, TUE, WED, THU, FRI, SAT, SUN };

void printDayType(enum Day d) {
    switch (d) {
        case SAT:
        case SUN:
            printf("Weekend\n");
            break;
        case MON:
        case TUE:
        case WED:
        case THU:
        case FRI:
            printf("Weekday\n");
            break;
        default:
            printf("Invalid day\n");
    }
}

int main() {
    printDayType(SAT);
    printDayType(WED);
    return 0;
}
```

##### Expected Output:
```text
Weekend
Weekday
```

##### Flowchart: Enum + switch
```text
      ┌──────────────────────┐
      │  enum Day d = input  │
      └──────────┬───────────┘
                 │
                 v
      ┌──────────────────────┐
      │      switch(d)       │
      └──────┬───┬───┬───────┘
             │   │   │
      ┌──────┘   │   └──────┐
    SAT/SUN   MON..FRI   default
      │          │          │
      v          v          v
  "Weekend"  "Weekday"  "Invalid day"
```

> [!IMPORTANT]
> **Switch Case Labels**
> Because enum constants are compile-time integer constants, they can be used directly as case labels in a switch — unlike regular variables.

#### Enums with Functions
Enums work well as function parameters and return types, making function signatures self-explanatory.

```c
#include <stdio.h>

enum Status { FAIL, SUCCESS };

enum Status divide(int a, int b, int *result) {
    if (b == 0) return FAIL;
    *result = a / b;
    return SUCCESS;
}

int main() {
    int result;
    enum Status s = divide(10, 2, &result);

    if (s == SUCCESS)
        printf("Result: %d\n", result);
    else
        printf("Division failed\n");

    return 0;
}
```

##### Expected Output:
```text
Result: 5
```

Why: Returning an `enum Status` instead of a plain `0`/`1` makes the function's intent immediately clear — `SUCCESS`/`FAIL` is far more readable than magic numbers.

#### typedef enum
Just like structs, `typedef` removes the need to repeat the `enum` keyword.

```c
#include <stdio.h>

typedef enum {
    LOW,
    MEDIUM,
    HIGH
} Priority;

int main() {
    Priority p = HIGH; // no need to write "enum Priority"
    printf("%d\n", p);
    return 0;
}
```

##### Expected Output:
```text
2
```

#### Practice - 7.3 Enums

##### Conceptual Questions
1. Why can enum constants be used as switch case labels but regular `int` variables cannot?
2. What is the underlying data type of an enum constant in C?

##### Output / Code Tracing
What is printed by this code snippet?
```c
enum Level { LOW = 5, MEDIUM, HIGH = 10, EXTREME };
printf("%d %d", MEDIUM, EXTREME);
```

##### Coding Exercise
Define `enum TrafficLight { RED, YELLOW, GREEN }`, write a function `nextLight()` that returns the next light in sequence (GREEN wraps back to RED), and print the name of each light using a switch statement over 4 calls.

---

### 7.4 Summary & Cheat Sheet

#### Module Summary
* A **structure** groups variables of *different* types under one name; each member has its own memory (total size ≈ sum of members + padding).
* Structure members are accessed with `.` for variables and `->` for pointers.
* Structures can be nested, stored in arrays, passed by value or pointer to functions, and returned from functions (never return a pointer to a local struct).
* `typedef struct` creates a cleaner alias for a struct type.
* A **union** also groups different types under one name, but all members **share the same memory** — only one member is valid at a time, and its size equals its largest member.
* Unions are used to save memory or interpret raw bytes; pair with an enum "tag" for safe usage (tagged union pattern).
* An **enum** defines a set of named integer constants, starting at 0 by default (customizable), improving code readability, especially with switch statements.
* `typedef enum` provides a clean, alias-based syntax, avoiding repetition of the `enum` keyword.

#### C Syntax Cheat Sheet - Module 7
```c
/* ---------- STRUCT ---------- */
struct Name {
    type member1;
    type member2;
};
struct Name var = {val1, val2};       // initialize
struct Name var2 = {.member2 = val2}; // designated init
var.member1;                          // access (variable)
ptr->member1;                         // access (pointer)
struct Name arr[N] = { {...}, {...} }; // array of structs
void func(struct Name s);             // pass by value
void func(struct Name *s);            // pass by pointer
struct Name func();                   // return struct

typedef struct {
    type member;
} Alias;                              // typedef struct

/* ---------- UNION ---------- */
union Name {
    type member1;
    type member2;
};
union Name var;
var.member1 = value;                  // overwrites shared memory
sizeof(union Name);                   // = size of largest member

/* ---------- ENUM ---------- */
enum Name { A, B, C };                // A=0, B=1, C=2
enum Name { A = 5, B, C };            // A=5, B=6, C=7
enum Name var = B;
switch (var) {
    case A: ...; break;
    case B: ...; break;
    default: ...;
}
typedef enum { A, B, C } Alias;       // typedef enum
```

> [!WARNING]
> **Common Mistakes Checklist**
> * [ ] Forgot `;` after struct/union/enum definition.
> * [ ] Used `=` to assign a string to a char-array struct member instead of `strcpy`.
> * [ ] Used `.` on a pointer instead of `->`.
> * [ ] Returned a pointer to a local (stack) structure from a function.
> * [ ] Assumed `sizeof(struct)` equals the sum of member sizes (ignored padding).
> * [ ] Assumed `sizeof(union)` equals the sum of member sizes (should be the largest member's size).
> * [ ] Read a union member different from the one last written, expecting valid data.
> * [ ] Didn't track which union member is "active" (no tag/enum used).
> * [ ] Tried to `printf("%s", ...)` an enum expecting the name instead of its integer value.
> * [ ] Assigned an out-of-range integer value to an enum variable.
> * [ ] Omitted `default` in a switch over enum values.
> * [ ] Nested a struct inside itself directly instead of using a pointer.

#### Revision Questions
1. What is the fundamental difference between a structure and an array?
2. Why must a semicolon follow a struct/union/enum definition?
3. What is the difference between declaring a structure and defining a structure variable?
4. Why can't you copy a string into a struct's char-array member using `=`?
5. Explain the difference between `.` and `->` with an example.
6. Why is passing a structure pointer to a function generally more efficient than passing by value?
7. Why should you never return a pointer to a structure declared locally inside a function?
8. What does `typedef struct {...} Name;` accomplish, and why is it commonly used?
9. What is structure padding, and why does it occur?
10. How does a union's memory layout differ from a structure's?
11. Why is `sizeof(union)` equal to its largest member's size?
12. What is a "tagged union," and why is it a safer way to use unions?
13. What integer value does the first enum constant get by default, and how does auto-increment work when only some constants are assigned values?
14. Why can enum constants be used directly as switch case labels?
15. Give two reasons why using enum is better than using plain integers or `#define` for a set of related constants.

#### Mixed Coding Problems
1. **Library System:** Define a struct `Book` with title, author, and isbn (as a string). Write a function `void printBook(const struct Book *b)` that prints the details using pointer access (`->`), and call it from main on an array of 3 books.
2. **Struct + Pointer Update:** Write a struct `Rectangle` with length and width. Write a function `void scale(struct Rectangle *r, float factor)` that multiplies both dimensions by factor using pointer access. Print the rectangle before and after scaling.
3. **Union Type Inspector:** Create a union `Value` that can hold an int, float, or char. Write a struct `Variant` that pairs this union with an enum `ValueType { INT_V, FLOAT_V, CHAR_V }` tag. Write a function `void printValue(struct Variant v)` that prints the correct member based on the tag.
4. **Enum State Machine:** Define enum `State { IDLE, RUNNING, PAUSED, STOPPED }`. Write a function `enum State nextState(enum State current)` that transitions: IDLE→RUNNING→PAUSED→STOPPED→IDLE (cyclic). Print the state name (using a switch) for 5 consecutive transitions starting from IDLE.
5. **Combined Challenge:** Define a struct `Employee` containing name, id, and a nested struct `Date` (day, month, year) for the joining date, plus an enum `Department { HR, ENGINEERING, SALES }` field. Create an array of 3 employees, initialize them, and write a function that takes a pointer to the array and its size, and prints all employees whose department is ENGINEERING, using `->` for member access within the loop.
