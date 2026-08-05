

### 2.1 Conditional Statements

So far, every program you've written runs every line, top to bottom, no exceptions. Real programs need to make decisions — charge a different shipping fee for a different country, show a different message for a passing or failing grade, take a different path depending on what the user typed. Conditional statements are how C makes those decisions.

#### if
An `if` statement runs a block of code only when a condition is true. If the condition is false, the block is skipped entirely and the program continues after it.

##### Code:
```c
if (condition) {
    // runs only if condition is true (non-zero)
}
```

##### Code:
```c
#include <stdio.h>

int main() {
    int age = 20;

    if (age >= 18) {
        printf("You can vote.\n");
    }
    printf("Program continues here regardless.\n");
    return 0;
}
```

##### Output:
```text
You can vote.
Program continues here regardless.
```

##### Flow of execution:
```text
      +----------------+
      |  age >= 18 ?   |
      +----------------+
        |            |
       true        false
        |            |
        v            v
print "You can vote" (skip)
        |            |
      +----+-----+
           v
   program continues
```

> [!NOTE]
> **Note**
> In C, any non-zero value is treated as true, and 0 is treated as false — there is no separate boolean type in classic C (C99 added `_Bool` / `stdbool.h`, but the 0/non-zero rule still applies underneath).

#### if else
`if...else` lets you run one block when the condition is true and a different block when it's false — exactly one of the two branches ever runs.

##### Code:
```c
if (condition) {
    // runs when condition is true
} else {
    // runs when condition is false
}
```

##### Code:
```c
#include <stdio.h>

int main() {
    int marks = 42;

    if (marks >= 50) {
        printf("Pass\n");
    } else {
        printf("Fail\n");
    }
    return 0;
}
```

##### Output:
```text
Fail
```

#### else if
When there are more than two possibilities, chain conditions together with `else if`. C checks each condition top to bottom and runs the first block whose condition is true, then skips the rest of the chain.

##### Code:
```c
#include <stdio.h>

int main() {
    int marks = 76;

    if (marks >= 90) {
        printf("Grade: A\n");
    } else if (marks >= 75) {
        printf("Grade: B\n");
    } else if (marks >= 50) {
        printf("Grade: C\n");
    } else {
        printf("Grade: F\n");
    }
    return 0;
}
```

##### Output:
```text
Grade: B
```
Line-by-line: `marks` (76) fails the first check (`>= 90`), so C moves to the next. It passes the second check (`>= 75`), prints `"Grade: B"`, and — this is the important part — never even evaluates the remaining conditions. Order matters: if the checks were written smallest-first, every mark above 50 would incorrectly print `"Grade: C"` and stop there.

#### switch
A `switch` statement compares one variable against a list of exact values — it's often cleaner than a long `else if` chain when you're checking a single variable for specific matches (like a menu choice or a day number).

##### Code:
```c
switch (expression) {
    case value1:
        // code
        break;
    case value2:
        // code
        break;
    default:
        // code if nothing matches
}
```

##### Code:
```c
#include <stdio.h>

int main() {
    int day = 3;
    switch (day) {
        case 1:
            printf("Monday\n");
            break;
        case 2:
            printf("Tuesday\n");
            break;
        case 3:
            printf("Wednesday\n");
            break;
        default:
            printf("Invalid day\n");
    }
    return 0;
}
```

##### Output:
```text
Wednesday
```

> [!WARNING]
> **Warning**
> Forgetting `break;` causes fall-through — execution continues into the next case instead of exiting the switch. This is one of the most common switch bugs in C:

##### Code:
```c
switch (day) {
    case 1:
        printf("Monday\n"); // no break!
    case 2:
        printf("Tuesday\n");
        break;
}
// if day == 1, this prints BOTH "Monday" and "Tuesday"
```
Sometimes fall-through is intentional — for example, grouping several cases under one action:

##### Code:
```c
switch (day) {
    case 6:
    case 7:
        printf("Weekend\n");
        break;
    default:
        printf("Weekday\n");
}
```

#### Nested Conditions
An `if` statement can contain another `if` statement inside it. This is useful when a second decision only makes sense after the first one is already true.

##### Code:
```c
#include <stdio.h>

int main() {
    int age = 25;
    int hasLicense = 1;

    if (age >= 18) {
        if (hasLicense) {
            printf("You may drive.\n");
        } else {
            printf("You need a license first.\n");
        }
    } else {
        printf("Too young to drive.\n");
    }
    return 0;
}
```

##### Output:
```text
You may drive.
```

> [!NOTE]
> **Key Idea**
> Nested conditions read like a decision tree: the inner if/else only executes at all once the outer condition has already been satisfied. Combining conditions with `&&` is often a cleaner alternative to deep nesting: `if (age >= 18 && hasLicense)`.

#### Common Beginner Mistakes
* Using `=` (assignment) instead of `==` (comparison) inside a condition — `if (x = 5)` compiles, assigns 5 to `x`, and is always true, which silently breaks the logic.
* Forgetting `break` in a switch case, causing unintended fall-through.
* Writing else-if ranges in the wrong order (e.g. checking `>= 50` before `>= 90`), so a higher case is wrongly caught by an earlier, looser condition.
* Adding a semicolon right after `if (condition);` — this creates an empty statement as the "if body", so the block below always runs regardless of the condition.
* Assuming switch works with float or string values — in standard C, switch only works with integer types (int, char, enums).

---

### 2.2 Loops

Loops let a block of code repeat automatically instead of being copy-pasted. C gives you three loop constructs — while, do-while, and for — each suited to a slightly different situation.

#### while
A `while` loop checks its condition before every iteration. If the condition is false the very first time, the body never runs at all.

##### Code:
```c
while (condition) {
    // repeats as long as condition is true
}
```

##### Code:
```c
#include <stdio.h>

int main() {
    int i = 1;
    while (i <= 5) {
        printf("%d ", i);
        i++;
    }
    printf("\n");
    return 0;
}
```

##### Output:
```text
1 2 3 4 5
```

##### Flow of execution:
```text
 +---------------------+
 |  check: i <= 5 ?    |<------------+
 +---------------------+             |
   |                 |               |
  true             false             |
   |                 \               |
   v                 v               |
 print i, i++     exit loop          |
   |                                 |
   +---------------------------------+
```

#### do while
A `do...while` loop checks its condition after running the body, so the body always executes at least once — even if the condition is false from the start.

##### Code:
```c
do {
    // runs at least once
} while (condition);
```

##### Code:
```c
#include <stdio.h>

int main() {
    int choice;
    do {
        printf("Enter 0 to quit: ");
        scanf("%d", &choice);
    } while (choice != 0);
    printf("Goodbye!\n");
    return 0;
}
```

> [!NOTE]
> **Note**
> Notice the semicolon after `while (condition);` in a do-while loop — it's easy to forget, and leaving it out is a compile error, unlike a plain while loop.

#### for
A `for` loop packs initialization, condition, and update into one line — it's the natural choice whenever you know in advance how many times you want to repeat something.

##### Code:
```c
for (initialization; condition; update) {
    // body
}
```

##### Code:
```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}
```

##### Output:
```text
1 2 3 4 5
```
Line-by-line: `int i = 1` runs once, before the loop starts. `i <= 5` is checked before every iteration. `i++` runs after every iteration, right before the condition is checked again. All three pieces are optional — `for (;;)` is a valid, deliberately infinite loop.

#### break
`break` immediately exits the loop (or switch) it's inside, skipping any remaining iterations.

##### Code:
```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 10; i++) {
        if (i == 5) {
            break;
        }
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}
```

##### Output:
```text
1 2 3 4
```

#### continue
`continue` skips the rest of the current iteration and jumps straight to the next one — the loop keeps running, it just skips one round of the body.

##### Code:
```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        if (i == 3) {
            continue;
        }
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}
```

##### Output:
```text
1 2 4 5
```
Notice 3 is skipped, but 4 and 5 still print — unlike break, continue does not end the loop, it only skips ahead.

#### Nested Loops
A loop can contain another loop. The inner loop completes all of its iterations for every single iteration of the outer loop — this is the basis of grids, tables, and patterns.

##### Code:
```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            printf("(%d,%d) ", i, j);
        }
        printf("\n");
    }
    return 0;
}
```

##### Output:
```text
(1,1) (1,2) (1,3)
(2,1) (2,2) (2,3)
(3,1) (3,2) (3,3)
```

##### Trace of iteration counts:
* outer i=1 ➔ inner j runs 1, 2, 3 (prints one row)
* outer i=2 ➔ inner j runs 1, 2, 3 (prints one row)
* outer i=3 ➔ inner j runs 1, 2, 3 (prints one row)
* Total body executions = 3 outer x 3 inner = 9

#### Common Loop Mistakes

> [!WARNING]
> **Warning**
> Forgetting to update the loop variable (or updating it incorrectly) causes an infinite loop — the condition never becomes false, so the program hangs:

##### Code:
```c
int i = 1;
while (i <= 5) {
    printf("%d ", i);
    // forgot i++ -> infinite loop
}
```
* Off-by-one errors: using `<` instead of <=, or starting at 0 vs 1, which makes a loop run one time too many or too few.
* Using `=` instead of `==` or a valid comparison inside the loop condition.
* Modifying the loop counter inside the body in a way that conflicts with the for loop's own update, causing confusing behavior.
* Placing a semicolon right after the loop header — `for (int i = 0; i < 5; i++);` — which creates an empty loop body that does nothing five times, and the real block below runs only once.
* Comparing floating-point loop counters for exact equality, which can misbehave due to rounding.

> [!TIP]
> **Tip**
> When a loop's exact number of repetitions is known ahead of time, reach for `for`. When it depends on a condition that might change unpredictably (like user input), `while` or `do-while` usually reads more naturally.

---

### 2.3 Basic Problem Solving

With conditionals and loops in hand, you can now solve small, classic problems that show up constantly in real programs and in interviews. Each one below combines the tools from this chapter in a slightly different way.

#### Sum and Average
Accumulating a running total in a loop is one of the most common patterns in programming — a variable starts at 0 and grows by a little on each iteration.

##### Code:
```c
#include <stdio.h>

int main() {
    int n = 5;
    int numbers[] = {10, 20, 30, 40, 50};
    int sum = 0;

    for (int i = 0; i < n; i++) {
        sum += numbers[i];
    }
    float average = (float) sum / n;
    printf("Sum: %d\n", sum);
    printf("Average: %.2f\n", average);
    return 0;
}
```

##### Output:
```text
Sum: 150
Average: 30.00
```

> [!NOTE]
> **Note**
> Arrays are formally introduced in Chapter 4 — here, `numbers[]` is just a labeled list of values so the sum/average logic has real data to work with.

#### Minimum and Maximum
Finding the smallest or largest value follows the same shape: keep a "best so far" variable, and update it whenever you see something better.

##### Code:
```c
#include <stdio.h>

int main() {
    int values[] = {23, 9, 47, 5, 31};
    int n = 5;
    int min = values[0];
    int max = values[0];

    for (int i = 1; i < n; i++) {
        if (values[i] < min) min = values[i];
        if (values[i] > max) max = values[i];
    }
    printf("Min: %d\n", min);
    printf("Max: %d\n", max);
    return 0;
}
```

##### Output:
```text
Min: 5
Max: 47
```
Line-by-line: `min` and `max` both start out equal to the first value, since that's the only value seen so far. The loop then starts from index 1 and compares every remaining value, replacing `min` or `max` the moment a better candidate shows up.

#### Counting
Counting problems use a variable purely as a tally — it increments by 1 each time a condition is met, rather than accumulating a sum.

##### Code:
```c
#include <stdio.h>

int main() {
    int count = 0;
    for (int i = 1; i <= 20; i++) {
        if (i % 2 == 0) {
            count++;
        }
    }
    printf("Even numbers from 1 to 20: %d\n", count);
    return 0;
}
```

##### Output:
```text
Even numbers from 1 to 20: 10
```

#### Number Patterns
Number patterns combine nested loops with the loop counters themselves as the thing being printed — the outer loop controls the row, the inner loop controls what's printed on that row.

##### Code:
```c
#include <stdio.h>

int main() {
    int rows = 4;
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d ", j);
        }
        printf("\n");
    }
    return 0;
}
```

##### Output:
```text
1
1 2
1 2 3
1 2 3 4
```

#### Simple Star Patterns
Star patterns are the classic first exercise in nested loops — the inner loop count depends on the outer loop's current value, building up a shape row by row.

##### Code:
```c
#include <stdio.h>

int main() {
    int rows = 5;
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= i; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

##### Output:
```text
*
**
***
****
*****
```

##### ASCII trace of what each outer iteration prints:
* `i=1 ➔ inner runs 1 time  ➔ *`
* `i=2 ➔ inner runs 2 times ➔ **`
* `i=3 ➔ inner runs 3 times ➔ ***`
* `i=4 ➔ inner runs 4 times ➔ ****`
* `i=5 ➔ inner runs 5 times ➔ *****`

> [!NOTE]
> **Key Idea**
> Almost every star or number pattern is the same recipe: an outer loop for the row, an inner loop whose limit is tied to the outer counter, and no newline printed until the inner loop finishes. Once you see this shape, you can adapt it to pyramids, inverted triangles, and diamonds.

---

### 2.4 Real-World Applications & Interview Corner

#### Real-World Applications
* **Form validation:** if/else chains check that a password meets length and character requirements before an account is created.
* **Game logic:** switch statements route player input (move, attack, pause) to the right handler.
* **Data processing:** loops scan through thousands of sensor readings or log lines, counting, summing, or filtering as they go.
* **Retry logic:** do-while loops repeatedly prompt for input (or retry a network request) until it succeeds.
* **Menu-driven programs:** a while loop keeps a program running until the user chooses to exit, with a switch dispatching each menu option.

#### Interview Corner
* **Q: What's the difference between while and do-while?**
  A while loop may execute its body zero times if the condition starts false; a do-while loop always executes its body at least once, since the check happens after the first run.
* **Q: Why can switch cases only use constant integer expressions in C?**
  The compiler builds a switch into a fast jump table (or comparison chain) at compile time, which requires each case label to be a fixed, known value — not a variable or a runtime expression.
* **Q: What happens if you omit break in a switch case?**
  Execution falls through into the next case's code and keeps running until it hits a break or reaches the end of the switch — this is called fall-through, and it's occasionally used intentionally to group cases together.
* **Q: Is `for (;;) { }` valid C, and what does it do?**
  Yes — all three parts of a for loop are optional. With all three left blank, there's no condition to become false, so it loops forever unless a break, return, or `exit()` stops it.
* **Q: How would you print a pattern's shape without hardcoding the number of rows?**
  Store the row count in a variable (or read it with `scanf`) and use that variable as the outer loop's limit, so the same nested-loop logic scales to any size.

#### Chapter Summary
* `if`, `if-else`, and `else-if` let a program choose between one or more paths based on a condition.
* `switch` compares one variable against a list of exact values, and needs `break` to avoid falling through into the next case.
* `while` checks its condition before the loop body runs; `do-while` checks after, guaranteeing at least one execution.
* `for` combines initialization, condition, and update in a single, compact header — ideal for a known number of repetitions.
* `break` exits a loop (or switch) entirely; `continue` skips only the current iteration and moves to the next.
* Nested loops run the inner loop fully for every single iteration of the outer loop — the foundation of patterns, grids, and matrices.
* Accumulator (sum), running-best (min/max), and tally (count) are three recurring loop shapes that solve most basic problems.
