> "Every variable and array you've written so far has had a size fixed the moment you compiled the program. Dynamic memory allocation is how C lets a running program ask the operating system for exactly the memory it needs, exactly when it needs it — and give that memory back when it's done."

Think of the difference between renting a fixed one-bedroom apartment for life versus renting storage units on demand. A storage-unit facility lets you rent a small unit today, upgrade to a bigger one next month if you accumulate more boxes, and give it back entirely once you've moved everything out. Dynamic memory works the same way: your program can request, resize, and release memory precisely as its needs change while it runs.

#### Why Dynamic Memory Exists
* **The exact amount of data a program needs is often unknown** until the program is actually running (how many students will be entered, how many records a file contains).
* **Fixed-size arrays either waste memory** (declared too large) or overflow (declared too small).
* **Data that must outlive the function that creates it** cannot safely live on the stack, as Chapter 5 showed — data in dynamic memory lives independently of any function call.
* **Large data structures** (dynamic arrays, linked lists, trees) are only practical if memory can be requested and released at runtime.

#### Where This Is Used
* **Databases and file systems** allocate buffers sized to the exact record or file being processed.
* **Web servers and network applications** allocate connection buffers dynamically as requests arrive.
* **Game engines** allocate and free memory for objects that are created and destroyed during gameplay.
* **Every dynamic data structure you'll encounter later** (linked lists, stacks, queues, trees, hash tables) is built on top of the tools in this chapter.

---

### 6.1 Heap Memory

#### Stack vs. Heap
A running C program has (at least) two very different regions of memory it can use for data: the stack and the heap.

```text
Memory Diagram:

HIGH ADDRESSES
┌─────────────────────────────┐
│ STACK                       │ <- local variables, function
│ grows downward ↓            │    parameters, return addresses
├─────────────────────────────┤    (managed automatically)
│                             │
│ (free space between)        │
│                             │
├─────────────────────────────┤
│ HEAP                        │ <- malloc/calloc/realloc memory
│ grows upward ↑              │    (managed manually by YOU)
└─────────────────────────────┘
LOW ADDRESSES
```

The stack is fast and fully automatic: every time a function is called, its local variables are pushed onto the stack, and the instant the function returns, they vanish — this is exactly why Chapter 5 warned against returning the address of a local variable. The heap is the opposite: memory you request there stays reserved for as long as you want, across as many function calls as you like, but you are personally responsible for requesting it and giving it back.

* **Stack:** automatic, extremely fast, limited in total size, memory is freed automatically when a function returns.
* **Heap:** manual, slightly slower to allocate, limited mainly by available system memory, memory persists until you explicitly free it.

> [!NOTE]
> **Key Idea**
> The stack is like a hotel room the housekeeping staff cleans automatically the moment you check out. The heap is like renting an apartment — nobody cleans it for you; if you move out without formally ending the lease, you keep paying for it forever. That unwanted, forgotten payment is exactly what a memory leak is.

#### malloc — Allocating Raw Memory
`malloc` (short for "memory allocation") requests a block of uninitialized memory of a given size, measured in bytes, from the heap. It returns a pointer to the start of that block, or `NULL` if the request could not be satisfied.

```c
#include <stdio.h>
#include <stdlib.h> // declares malloc, calloc, realloc, free

int main() {
    int *p = (int*) malloc(sizeof(int)); // request room for one int
    if (p == NULL) {
        printf("Allocation failed.\n");
        return 1;
    }
    *p = 42;
    printf("Value: %d\n", *p);
    free(p); // return the memory to the heap
    return 0;
}
```

##### Expected Output:
```text
Value: 42
```

Reading this line by line:
* `malloc(sizeof(int))` — requests exactly enough bytes to hold one `int` (commonly 4). Using `sizeof(int)` instead of a hardcoded 4 keeps the code portable across systems where `int` sizes could differ.
* `(int*)` — `malloc` returns a generic `void*`; casting it to `int*` tells the compiler how to interpret and later dereference the memory. (In C, this cast is optional but is good practice and required in C++.)
* `if (p == NULL)` — always check whether the allocation succeeded before using the pointer; a failed allocation returns `NULL` rather than crashing outright.
* `free(p)` — returns the block back to the heap once you're done with it, so other parts of the program (or other programs) can reuse that memory.

```text
Memory Diagram:

Before malloc:                     After malloc(sizeof(int)):
HEAP: [ ...free space... ]         HEAP: [ used(4B) | ...free... ]
                                           ^
p -> (uninitialized)                       p -> 5000 (points to the block)

After *p = 42;                     After free(p):
HEAP: [ 42 (4B) | ...free... ]     HEAP: [ ...free space... ]
                                           p -> 5000 (DANGLING - still holds
                                                      the old address!)
```

> [!NOTE]
> **Key Idea**
> `free()` releases memory back to the heap, but it does not erase or reset the pointer variable itself — `p` still holds the old address after `free(p);`. Using it afterward is a dangling pointer, just like the ones from Chapter 5, so the common safety habit is to write `p = NULL;` immediately after freeing.

#### calloc — Allocating and Zeroing Memory
`calloc` ("clear allocation") is similar to `malloc` but takes two arguments — the number of elements and the size of each — and, unlike `malloc`, guarantees every byte is initialized to zero.

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*) calloc(5, sizeof(int)); // 5 ints, all set to 0
    if (arr == NULL) {
        printf("Allocation failed.\n");
        return 1;
    }
    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
    free(arr);
    return 0;
}
```

##### Expected Output:
```text
0 0 0 0 0
```

Why: `calloc(5, sizeof(int))` requests room for 5 ints and zero-initializes all of them, which is why every element prints as 0 without any explicit initialization. `malloc(5 * sizeof(int))` would request the same total memory but leave it filled with unpredictable leftover data.

> [!NOTE]
> **Key Idea**
> Use `calloc` when you need memory that starts at zero (common for counters, accumulator arrays, or anywhere uninitialized garbage would be dangerous); use `malloc` when you are about to overwrite every byte yourself anyway and the extra zeroing work would be wasted.

#### realloc — Resizing an Existing Block
`realloc` changes the size of a previously allocated block, growing or shrinking it while trying to preserve its existing contents. It may return the same address (if there's room to grow in place) or a completely new address (if the block had to be moved) — you must never keep using the old pointer after calling `realloc` on it.

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*) malloc(3 * sizeof(int));
    arr[0] = 1; arr[1] = 2; arr[2] = 3;

    int *temp = (int*) realloc(arr, 5 * sizeof(int));
    if (temp == NULL) {
        printf("Reallocation failed.\n");
        free(arr);
        return 1;
    }
    arr = temp; // safe pattern: only overwrite arr after success
    arr[3] = 4;
    arr[4] = 5;

    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);
    printf("\n");
    free(arr);
    return 0;
}
```

##### Expected Output:
```text
1 2 3 4 5
```

Why: `realloc(arr, 5 * sizeof(int))` preserves the original 1, 2, 3 while extending the block to hold two more ints. Assigning the result to a temporary variable first, and only overwriting `arr` once `temp` is confirmed non-`NULL`, avoids losing the only pointer to the original block if reallocation happens to fail.

```text
Memory Diagram:

Before realloc:                    After realloc grows the block:
HEAP: [1|2|3] (12 bytes)           HEAP: [1|2|3|?|?] (20 bytes)
      ^ arr                              ^ arr (may be same or
                                                a new address)

If realloc must move the block, the OLD address becomes invalid —
this is why you never keep using the original pointer directly.
```

> [!WARNING]
> **Common Beginner Mistakes**
> * Writing `arr = realloc(arr, newSize);` directly — if `realloc` fails and returns `NULL`, this overwrites the only pointer to the original block, leaking it permanently.
> * Forgetting to check the return value of `malloc`, `calloc`, or `realloc` for `NULL` before dereferencing it.
> * Using `sizeof` on a pointer instead of the intended type, e.g. `malloc(sizeof(p))` instead of `malloc(sizeof(int) * n)` — `sizeof(p)` just gives the pointer's own size.
> * Assuming `calloc` and `malloc(n * size)` behave identically — only `calloc` guarantees zero-initialization.

#### free — Releasing Memory
Every successful `malloc`, `calloc`, or `realloc` must eventually be matched with exactly one `free()` call on that block, once it is no longer needed. This single rule — pair every allocation with exactly one release — is the core discipline of manual memory management.

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = (int*) malloc(sizeof(int));
    *p = 7;
    printf("%d\n", *p);
    free(p);
    p = NULL; // best practice: prevents accidental reuse
    return 0;
}
```

##### Expected Output:
```text
7
```

Why: setting `p = NULL;` immediately after freeing costs nothing but eliminates an entire category of bug — any accidental later use of `p` will be caught as a clear `NULL` dereference (a crash you can debug) rather than silent corruption of memory that has since been reused elsewhere.

#### Memory Leaks
A memory leak happens when allocated memory becomes unreachable — no pointer in the program refers to it anymore — before it was ever freed. The memory stays reserved for the rest of the program's life, wasted, because nothing can reach it to free it.

```text
Memory Diagram:

int *p = malloc(sizeof(int));
p = malloc(sizeof(int)); // the FIRST block's address is gone!

HEAP: [ block A (leaked, unreachable) ] [ block B ]
                                          ^
                                          p now points only here

Block A is still reserved, but no variable holds its address —
it can never be freed. This is a memory leak.
```

```c
#include <stdlib.h>

void leaky() {
    int *p = (int*) malloc(sizeof(int));
    *p = 5;
    // function returns WITHOUT calling free(p)
    // p itself (the pointer variable) is destroyed, but the memory
    // it pointed to is still reserved on the heap, forever unreachable
}

int main() {
    for (int i = 0; i < 1000000; i++) {
        leaky(); // leaks a small block one million times
    }
    return 0;
}
```

Why this matters: each call to `leaky()` reserves a small block of heap memory and then loses the only reference to it when the function returns. Run enough times (or run a long-lived program like a server this way), and the program's memory usage climbs steadily until the system runs out of memory entirely.

#### Dangling Pointers, Wild Pointers, and Double Free
Three closely related heap bugs are worth telling apart clearly, since interview questions frequently test the distinction.
* **Dangling pointer:** a pointer that once pointed to valid memory, which has since been freed (or, as in Chapter 5, a stack frame that has ended).
* **Wild pointer:** a pointer that was never initialized at all, and holds a completely random address from the start.
* **Double free:** calling `free()` twice on the same address, which corrupts the heap's internal bookkeeping and typically crashes the program (sometimes much later, in an unrelated part of the code).

```c
#include <stdlib.h>

int main() {
    int *p = (int*) malloc(sizeof(int));
    free(p);
    free(p); // DOUBLE FREE - undefined behavior
    return 0;
}
```

```text
Memory Diagram:

Wild pointer:                  Dangling pointer:              Double free:
int *p;                        int *p = malloc(...);          free(p);
*p = 5; // CRASH               free(p);                       free(p); // CRASH
(p was never set to            *p = 5; // CRASH               (heap bookkeeping
 any valid address)            (memory already returned)       already corrupted)
```

> [!WARNING]
> **Common Beginner Mistakes**
> * Freeing memory and continuing to use the pointer afterward without setting it to `NULL` first.
> * Calling `free()` twice on the same pointer, often because two different variables ended up pointing to the same block.
> * Losing the only pointer to a heap block by overwriting it before freeing, causing a silent memory leak.
> * Confusing a dangling pointer (was valid, now freed) with a wild pointer (was never valid at all) — interviewers often ask you to define both precisely.

#### Best Practices
* **Match every malloc/calloc/realloc with exactly one free** — treat allocation and release as a pair, the way you would treat opening and closing a file.
* **Set pointers to NULL immediately after freeing them** to convert silent corruption into an obvious, debuggable crash.
* **Always check allocation return values for NULL** before dereferencing.
* **Use tools like Valgrind or AddressSanitizer** during development to catch leaks and invalid accesses automatically — professional C codebases rely on these constantly.
* **In interviews, always state explicitly which memory region** (stack or heap) a variable lives in when asked to reason about its lifetime.

#### Real World Usage
* **Every long-running server process** (web servers, databases) must manage heap memory carefully — a slow leak can crash a production system after days or weeks.
* **Operating system kernels** implement their own allocators on top of raw physical memory, using the same malloc/free principles at a lower level.
* **Game engines** allocate and free memory for objects (enemies, projectiles, particles) constantly during gameplay, often using custom allocators for speed.
* **Embedded systems** with very limited RAM must track every allocation meticulously, since there is often no operating system to recover from a leak.

#### Section Summary
* The stack is automatic and short-lived; the heap is manual and persists until explicitly freed.
* `malloc` allocates raw (uninitialized) memory; `calloc` allocates and zero-initializes it; `realloc` resizes an existing block.
* Always check allocation results for `NULL`, and always pair every allocation with exactly one `free()`.
* Memory leaks, dangling pointers, wild pointers, and double frees are the four classic heap bugs — know how to define and avoid each one.

---

### 6.2 Dynamic Arrays

A fixed-size array like `int scores[10];` commits to a size the moment the program is compiled. A dynamic array, built with `malloc` and resized with `realloc`, can grow or shrink while the program is running, based on real data the program encounters — the exact number of scores actually entered by a user, for example.

#### Runtime-Sized Arrays
Allocating an array whose size is decided at runtime:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    printf("How many numbers? ");
    scanf("%d", &n);

    int *arr = (int*) malloc(n * sizeof(int));
    if (arr == NULL) {
        printf("Allocation failed.\n");
        return 1;
    }

    for (int i = 0; i < n; i++) arr[i] = i * i;
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\n");

    free(arr);
    return 0;
}
```

##### Expected Output:
```text
How many numbers? 4
0 1 4 9 
```

Why: unlike `int arr[n];` (which some compilers only support as a nonstandard or C99 variable-length array, sized once and never resizable), `malloc(n * sizeof(int))` creates a block on the heap whose size was decided by user input at runtime, and which — unlike a stack array — can later be resized with `realloc`.

#### Growing an Array With realloc
Starting small and growing as more data arrives:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int capacity = 2;
    int count = 0;
    int *arr = (int*) malloc(capacity * sizeof(int));

    for (int i = 0; i < 5; i++) {
        if (count == capacity) {
            capacity *= 2; // double the capacity when full
            int *temp = (int*) realloc(arr, capacity * sizeof(int));
            if (temp == NULL) { 
                free(arr); 
                return 1; 
            }
            arr = temp;
        }
        arr[count++] = i * 10;
    }

    for (int i = 0; i < count; i++) printf("%d ", arr[i]);
    printf("\n");

    free(arr);
    return 0;
}
```

##### Expected Output:
```text
0 10 20 30 40 
```

Why: the array starts with room for only 2 ints. Each time `count` catches up to `capacity`, `capacity` doubles and `realloc` grows the block to match, preserving everything already stored. Doubling the capacity (rather than growing by a fixed small amount) is the standard strategy used internally by dynamic array implementations such as C++'s `std::vector`, because it keeps the number of expensive reallocations low as the array grows large.

```text
Memory Diagram:

count=0,capacity=2: [ _ | _ ]
count=2,capacity=2: [ 0 | 10 ] <- full, must grow

realloc doubles:    [ 0 | 10 | _ | _ ] capacity=4
count=4,capacity=4: [ 0 | 10 | 20 | 30 ] <- full again

realloc doubles:    [ 0 | 10 | 20 | 30 | _ | _ | _ | _ ] capacity=8
```

#### Shrinking an Array With realloc
Shrinking a block once you know you need less space:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*) malloc(10 * sizeof(int));
    for (int i = 0; i < 10; i++) arr[i] = i;

    int *temp = (int*) realloc(arr, 4 * sizeof(int)); // shrink to 4 ints
    if (temp == NULL) { 
        free(arr); 
        return 1; 
    }
    arr = temp;

    for (int i = 0; i < 4; i++) printf("%d ", arr[i]);
    printf("\n");

    free(arr);
    return 0;
}
```

##### Expected Output:
```text
0 1 2 3 
```

Why: `realloc` with a smaller size than the current block truncates it, keeping only the first 4 ints (0, 1, 2, 3) and releasing the rest back to the heap for reuse elsewhere. Shrinking is less common in practice than growing, but it matters whenever a program discovers it reserved far more memory than it ultimately needed.

#### Dynamic String Allocation
Allocating exactly enough memory for a string read at runtime:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char buffer[100];
    printf("Enter your name: ");
    scanf("%s", buffer);

    char *name = (char*) malloc(strlen(buffer) + 1); // +1 for '\0'
    if (name == NULL) return 1;

    strcpy(name, buffer);
    printf("Hello, %s!\n", name);

    free(name);
    return 0;
}
```

##### Expected Output:
```text
Enter your name: Asha
Hello, Asha!
```

Why: `strlen(buffer) + 1` computes exactly the number of bytes needed — the characters themselves, plus one extra byte for the terminating `\0`. This is the standard pattern for creating a dynamically-sized copy of a string that lives independently of the fixed-size buffer it was first read into.

A growable dynamic string, appending character by character:

```c
#include <stdio.p>
#include <stdlib.h>

int main() {
    int capacity = 4;
    int len = 0;
    char *str = (char*) malloc(capacity);
    char letters[] = {'H', 'e', 'l', 'l', 'o', '\0'};

    for (int i = 0; letters[i] != '\0'; i++) {
        if (len + 1 >= capacity) { // leave room for '\0'
            capacity *= 2;
            char *temp = (char*) realloc(str, capacity);
            if (temp == NULL) { 
                free(str); 
                return 1; 
            }
            str = temp;
        }
        str[len++] = letters[i];
    }
    str[len] = '\0'; // terminate the string manually

    printf("%s\n", str);
    free(str);
    return 0;
}
```

##### Expected Output:
```text
Hello
```

Why: this mirrors exactly how many real string-building utilities work internally — start with a small buffer, grow it with `realloc` whenever it's about to overflow, and always leave room to manually place the `\0` terminator, since raw malloc'd memory has no built-in concept of "string" at all.

> [!WARNING]
> **Common Beginner Mistakes**
> * Forgetting the `+1` for the `\0` terminator when allocating memory for a string.
> * Growing an array one element at a time with `realloc` on every single insertion, instead of doubling capacity — technically correct, but far slower for large inputs due to repeated reallocation.
> * Losing track of capacity vs. count — capacity is how much memory is reserved, count is how many elements are actually in use; confusing the two causes both overflow and wasted-space bugs.
> * Not checking `realloc`'s return value before reassigning the array pointer, risking a lost reference to the original block on failure.

#### Best Practices
* **Track both capacity (allocated size) and count (elements in use)** as separate variables whenever building a dynamic array.
* **Grow dynamic arrays by doubling capacity** rather than by a fixed increment, to keep the total cost of reallocation low as the array scales up.
* **Always free dynamically allocated memory** once it's no longer needed, and set the pointer to `NULL` immediately afterward.
* **When allocating for strings, always compute size** as `strlen(source) + 1`, never a hardcoded guess.

#### Real World Usage
* **Dynamic arrays are the underlying implementation** behind higher-level containers like C++'s `std::vector` and Python's `list`.
* **Text editors and parsers use growable dynamic strings** exactly like the example above to build up user input of unknown length.
* **Database engines and file-parsing libraries** allocate buffers sized exactly to the record or field being read.
* **Compilers build growable symbol tables and token buffers** dynamically while reading source files of unknown length.

#### Section Summary
* Dynamic arrays combine `malloc`/`realloc` to create arrays whose size is decided, and can change, at runtime.
* Doubling capacity when growing keeps reallocation costs low as an array scales up.
* Dynamic strings need `strlen(source) + 1` bytes to leave room for the terminating `\0`.
* Always track capacity separately from the number of elements actually stored.
