> "Every program so far has lived entirely inside main(). As programs grow, cramming everything into one function makes code hard to read, hard to reuse, and hard to fix."

### 3.1 Function Basics

Every program so far has lived entirely inside main(). As programs grow, cramming everything into one function makes code hard to read, hard to reuse, and hard to fix. A function is a named, reusable block of code that performs one task — you write the logic once and call it as many times as you need.

#### Declaration
A function declaration (also called a prototype) tells the compiler a function's name, return type, and parameter types before it's actually used — this lets you call a function from main() even if its full definition appears later in the file.

```c
returnType functionName(parameterType parameterName, ...);
// example:
int add(int a, int b);
```

> [!NOTE]
> Declarations end with a semicolon and have no body — they're a promise to the compiler, not the implementation.

#### Definition
A function definition provides the actual body — the code that runs when the function is called.

```c
int add(int a, int b) {
 int result = a + b;
 return result;
}
```

#### Calling
You call a function by writing its name followed by parentheses containing any arguments it needs. Execution jumps into the function, runs its body, and returns to exactly where it left off.

```c
#include <stdio.h>
int add(int a, int b) {
 return a + b;
}
int main() {
 int result = add(3, 4);
 printf("Sum: %d\n", result);
 return 0;
}
```

##### Output:
```text
Sum: 7
```

```text
Call and return, visualized:
main()
 |
 | calls add(3, 4)
 v
add(a=3, b=4)
 |
 | computes a + b = 7
 | return 7 ------------+
 v                      |
(back in main)          |
result = 7 <------------+
```

#### Parameters
Parameters are the named inputs a function expects, listed in its definition. The values you actually pass in when calling it are called arguments. C matches them by position: the first argument fills the first parameter, and so on.

```c
#include <stdio.h>
void greet(char name[], int times) {
 for (int i = 0; i < times; i++) {
 printf("Hello, %s!\n", name);
 }
}
int main() {
 greet("Asha", 3);
 return 0;
}
```

##### Output:
```text
Hello, Asha!
Hello, Asha!
Hello, Asha!
```

#### Return Values
A function can send a single value back to its caller using return. The function's return type in its signature must match the type of value it returns. A function that returns nothing uses void.

```c
#include <stdio.h>
int square(int n) {
 return n * n;
}
void printLine() {
 printf("--------\n");
 return; // optional for void, just exits early
}
int main() {
 printLine();
 printf("Square: %d\n", square(5));
 printLine();
 return 0;
}
```

##### Output:
```text
--------
Square: 25
--------
```

> [!WARNING]
> **Warning**
> A non-void function that reaches its closing brace without hitting a return statement has undefined behavior if its return value is used — always make sure every code path returns a value.

#### Pass by Value
C passes arguments by value — the function receives a *copy* of the argument, not the original variable. Changes made inside the function to a parameter never affect the caller's variable.

```c
#include <stdio.h>
void tryToDouble(int x) {
 x = x * 2;
 printf("Inside function: %d\n", x);
}
int main() {
 int num = 10;
 tryToDouble(num);
 printf("Back in main: %d\n", num);
 return 0;
}
```

##### Output:
```text
Inside function: 20
Back in main: 10
```

> [!NOTE]
> **Key Idea**
> Pass by value means num in main() and x inside tryToDouble() are two completely separate pieces of memory that just happen to start with the same value. This is why C uses pointers (covered later in the course) whenever a function actually needs to modify the caller's original variable.

---

### 3.2 Scope

Scope determines where in a program a variable's name is visible and usable. Getting scope right is what lets two different functions each safely use a variable called i without interfering with each other.

#### Local Variables
A local variable is declared inside a function (or block) and only exists while that function is running — it's created fresh on each call and destroyed when the function returns.

```c
#include <stdio.h>
void counter() {
 int count = 0; // local to counter()
 count++;
 printf("%d\n", count);
}
int main() {
 counter(); // prints 1
 counter(); // prints 1 again -- count resets each call
 return 0;
}
```

##### Output:
```text
1
1
```

#### Global Variables
A global variable is declared outside every function, usually near the top of the file. It's visible to every function in the file and keeps its value for the entire life of the program.

```c
#include <stdio.h>
int counter = 0; // global
void increment() {
 counter++; // modifies the shared global
}
int main() {
 increment();
 increment();
 printf("%d\n", counter);
 return 0;
}
```

##### Output:
```text
2
```

> [!WARNING]
> **Warning**
> Global variables are convenient but risky in larger programs — any function can silently change them, which makes bugs harder to trace. Prefer passing values as parameters and returning results unless a global is genuinely necessary.

#### static
A static local variable is declared inside a function but, unlike an ordinary local variable, keeps its value between calls instead of resetting. It's initialized only once, the first time the function runs.

```c
#include <stdio.h>
void counter() {
 static int count = 0; // initialized once, keeps its value
 count++;
 printf("%d\n", count);
}
int main() {
 counter(); // 1
 counter(); // 2
 counter(); // 3
 return 0;
}
```

##### Output:
```text
1
2
3
```

> [!NOTE]
> **Note**
> static gives a local variable global-like persistence without making it visible or accessible outside its own function — the best of both worlds for something like a call counter.

#### extern (Introduction)
extern tells the compiler "this variable is defined somewhere else — just trust it exists and link it up later." It's most useful when a global variable defined in one .c file needs to be used in another. A full multi-file example comes later in the course; for now, recognize the keyword and what it signals.

```c
// file1.c
int total = 0; // definition
// file2.c
extern int total; // declaration: "total is defined elsewhere"
void useTotal() {
 total++; // refers to the same variable as file1.c
}
```

---

### 3.3 Recursion

A recursive function is a function that calls itself to solve a smaller version of the same problem, until it reaches a simple case it can answer directly. Every correct recursive function needs two things: a base case that stops the recursion, and a recursive case that makes progress toward it.

#### Factorial
The factorial of n (written n!) is n × (n-1) × (n-2) × ... × 1. It has a natural recursive definition: n! = n × (n-1)!, with the base case 0! = 1.

```c
#include <stdio.h>
int factorial(int n) {
 if (n == 0) { // base case
 return 1;
 }
 return n * factorial(n - 1); // recursive case
}
int main() {
 printf("5! = %d\n", factorial(5));
 return 0;
}
```

##### Output:
```text
5! = 120
```

```text
Tracing the call stack for factorial(5):
factorial(5)
 = 5 * factorial(4)
     = 4 * factorial(3)
         = 3 * factorial(2)
             = 2 * factorial(1)
                 = 1 * factorial(0)
                     = 1 <- base case hit
                 = 1 * 1 = 1
             = 2 * 1 = 2
         = 3 * 2 = 6
     = 4 * 6 = 24
 = 5 * 24 = 120
```

#### Fibonacci
The Fibonacci sequence is defined as fib(0) = 0, fib(1) = 1, and every later term is the sum of the two before it: fib(n) = fib(n-1) + fib(n-2).

```c
#include <stdio.h>
int fibonacci(int n) {
 if (n == 0) return 0; // base case 1
 if (n == 1) return 1; // base case 2
 return fibonacci(n - 1) + fibonacci(n - 2);
}
int main() {
 for (int i = 0; i < 8; i++) {
 printf("%d ", fibonacci(i));
 }
 printf("\n");
 return 0;
}
```

##### Output:
```text
0 1 1 2 3 5 8 13
```

```text
Branching call tree for fibonacci(4):
         fib(4)
         /    \
     fib(3)  fib(2)
     /    \   /    \
 fib(2) fib(1) fib(1) fib(0)
 /    \
fib(1) fib(0)
```

> [!WARNING]
> **Warning**
> This simple recursive Fibonacci recomputes the same smaller values many times (notice fib(2) appears twice above) — for larger n it becomes very slow. Techniques to avoid this (memoization, iteration) are covered later in the course.

#### Recursion vs Iteration
Anything recursion can do, a loop can also do — and usually faster, since recursion carries the overhead of a new function call (and new stack frame) for every step. Recursion tends to be chosen when a problem is naturally defined in terms of smaller versions of itself, like tree traversal or divide-and-conquer algorithms; loops tend to be chosen for straightforward repetition.

```c
// Iterative factorial -- no recursive calls, no extra stack frames
int factorialIterative(int n) {
 int result = 1;
 for (int i = 1; i <= n; i++) {
 result *= i;
 }
 return result;
}
```

| Aspect | Recursion | Iteration |
| :--- | :--- | :--- |
| **Readability** | Often closer to the mathematical definition | Often closer to "what the machine does" |
| **Memory use** | Uses one stack frame per call | Uses a fixed amount of memory |
| **Speed** | Extra function-call overhead | Generally faster for simple repetition |
| **Best suited for** | Trees, divide-and-conquer, backtracking | Simple counted or conditional repetition |

#### Tracing Recursive Calls
Being able to trace a recursive function by hand — writing out each call, what it's waiting on, and what it eventually returns — is an essential debugging and interview skill. The two traces above (factorial and fibonacci) are exactly this technique: expand every call until you hit a base case, then collapse the results back up.

> [!TIP]
> **Tip**
> When tracing by hand, draw the calls indented one level deeper each time a function calls itself, and only start filling in return values once you reach a base case — working top-down for the calls, then bottom-up for the results, mirrors exactly what the computer's call stack does.

> [!NOTE]
> **Key Idea**
> A missing or unreachable base case is the most dangerous recursion bug: the function keeps calling itself with no way to stop, eventually crashing with a stack overflow once memory for call frames runs out.

#### Real-World Applications
* **Breaking a large program into functions** (`validateInput()`, `calculateTotal()`, `printReceipt()`) makes each piece testable and reusable on its own.
* **Library functions like `printf()` and `scanf()`** are themselves just functions someone else wrote — understanding functions is what lets you read and use any library.
* **Recursion powers file-system traversal** (walking through folders and subfolders), sorting algorithms like merge sort, and parsing nested data like JSON.
* **static local variables** are used to build simple caches or counters inside a function without exposing that state globally.

#### Interview Corner
* **Q: What is the difference between a parameter and an argument?**
  A: A parameter is the named placeholder in a function's definition; an argument is the actual value supplied when the function is called.
* **Q: Why doesn't a function in C modify the caller's variable when it changes its parameter?**
  A: Because C passes arguments by value — the function works on a copy, so any changes made to the parameter inside the function are local to that copy and disappear once the function returns.
* **Q: What are the two required parts of every recursive function?**
  A: A base case that stops the recursion without calling the function again, and a recursive case that calls the function with an input that moves closer to that base case.
* **Q: When would you choose recursion over a loop?**
  A: When the problem is naturally self-similar — like traversing a tree, or a divide-and-conquer algorithm — recursion often produces clearer code, even though a loop could technically do the same job.
* **Q: What is the risk of a global variable compared to a local one?**
  A: Any function in the file can read or modify a global variable at any time, which makes it harder to track down where and why its value changed — local variables are isolated to the function that owns them.

#### Chapter Summary
* A function declaration tells the compiler a function's signature; its definition supplies the actual body.
* Calling a function transfers execution into it and back again once it returns.
* Parameters are the function's named inputs; return sends a single value back to the caller.
* C passes arguments by value, so a function cannot change the caller's original variable through an ordinary parameter.
* Local variables live only for one function call; global variables live for the whole program; static local variables persist between calls but stay private to their function.
* extern lets one file use a global variable that's actually defined in another file.
* Every recursive function needs a base case (to stop) and a recursive case (to make progress); missing a base case causes infinite recursion and a stack overflow.
