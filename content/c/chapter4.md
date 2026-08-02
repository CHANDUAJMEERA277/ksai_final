> "Every variable you've used so far holds exactly one value. An array is a single variable name that holds a fixed-size sequence of values of the same type, stored back-to-back in memory — perfect for a list of scores, temperatures, or names."

### 4.1 One-Dimensional Arrays

Every variable you've used so far holds exactly one value. An array is a single variable name that holds a fixed-size sequence of values of the same type, stored back-to-back in memory — perfect for a list of scores, temperatures, or names.

#### Declaration
```c
type arrayName[size];
int scores[5]; // an array of 5 ints, uninitialized
float prices[10]; // an array of 10 floats
```

> [!NOTE]
> The size in square brackets must be a constant known at compile time for a plain array declaration — it tells C exactly how much contiguous memory to reserve.

#### Initialization
An array can be given starting values immediately, either fully or partially — any values you leave out default to 0.

```c
int scores[5] = {90, 85, 78, 92, 88}; // fully initialized
int marks[5] = {70, 60}; // marks[2..4] are all 0
int grid[5] = {0}; // every element set to 0
int auto_size[] = {1, 2, 3, 4}; // size (4) inferred from values
```

#### Indexing
Each element in an array is accessed with an index in square brackets. C indexing always starts at 0, so an array of size 5 has valid indices 0 through 4 — there is no index 5.

```c
#include <stdio.h>
int main() {
 int scores[5] = {90, 85, 78, 92, 88};
 printf("First score: %d\n", scores[0]);
 printf("Third score: %d\n", scores[2]);
 printf("Last score: %d\n", scores[4]);
 return 0;
}
```

##### Output:
```text
First score: 90
Third score: 78
Last score: 88
```

```text
Memory layout of scores[5] = {90, 85, 78, 92, 88}:
index: [0] [1] [2] [3] [4]
value:  90  85  78  92  88
        ^               ^
     scores[0]       scores[4] (last valid index = size - 1)
```

> [!WARNING]
> **Watch Out**
> Reading or writing scores[5] on a 5-element array is out-of-bounds access — C does not check this for you at runtime. It compiles, may appear to "work" sometimes, and can silently corrupt nearby memory or crash the program. Always keep indices within 0 to size-1.

#### Traversal
Traversal means visiting every element of an array in order, almost always with a for loop whose limit is the array's size.

```c
#include <stdio.h>
int main() {
 int scores[5] = {90, 85, 78, 92, 88};
 for (int i = 0; i < 5; i++) {
 printf("scores[%d] = %d\n", i, scores[i]);
 }
 return 0;
}
```

##### Output:
```text
scores[0] = 90
scores[1] = 85
scores[2] = 78
scores[3] = 92
scores[4] = 88
```

#### Searching
A linear search checks each element one at a time until it finds a match (or reaches the end without finding one) — simple, and the natural first searching technique.

```c
#include <stdio.h>
int main() {
 int scores[5] = {90, 85, 78, 92, 88};
 int target = 78;
 int foundIndex = -1;
 for (int i = 0; i < 5; i++) {
 if (scores[i] == target) {
 foundIndex = i;
 break;
 }
 }
 if (foundIndex != -1) {
 printf("Found %d at index %d\n", target, foundIndex);
 } else {
 printf("%d not found\n", target);
 }
 return 0;
}
```

##### Output:
```text
Found 78 at index 2
```

#### Updating
Assigning to a specific index changes just that one element — the rest of the array is untouched.

```c
#include <stdio.h>
int main() {
 int scores[5] = {90, 85, 78, 92, 88};
 scores[2] = 100; // update the third element 
 for (int i = 0; i < 5; i++) {
 printf("%d ", scores[i]);
 }
 printf("\n");
 return 0;
}
```

##### Output:
```text
90 85 100 92 88
```

#### Passing Arrays to Functions
When an array is passed to a function, C passes a reference to its first element, not a copy of the whole array — so unlike ordinary variables, changes a function makes to array elements *are* visible back in the caller. Because of this, the array's size is usually passed as a separate parameter, since the function can't determine it from the array parameter alone.

```c
#include <stdio.h>
void doubleAll(int arr[], int size) {
 for (int i = 0; i < size; i++) {
 arr[i] = arr[i] * 2;
 }
}
int main() {
 int nums[4] = {1, 2, 3, 4};
 doubleAll(nums, 4);
 for (int i = 0; i < 4; i++) {
 printf("%d ", nums[i]);
 }
 printf("\n");
 return 0;
}
```

##### Output:
```text
2 4 6 8
```

> [!NOTE]
> **Key Idea**
> Arrays are the one place where C quietly breaks its usual "pass by value" rule for practical reasons: passing a whole array by value on every call would be slow and wasteful, so C always passes arrays to functions by reference under the hood.

---

### 4.2 Two-Dimensional Arrays

A two-dimensional array is an array of arrays — conceptually a grid or table with rows and columns. It's the natural way to represent a matrix, a game board, or a small spreadsheet of numbers.

#### Declaration
```c
type arrayName[rows][columns];
int matrix[3][4]; // 3 rows, 4 columns
```

#### Initialization
```c
int matrix[2][3] = {
 {1, 2, 3},
 {4, 5, 6}
};
int zeros[3][3] = {0}; // every element set to 0
```

```text
How the grid maps to rows and columns:
         col0 col1 col2
row0 ->   1    2    3
row1 ->   4    5    6

matrix[0][2] = 3 (row 0, column 2)
matrix[1][0] = 4 (row 1, column 0)
```

#### Matrices
Because a 2D array is naturally row-by-column, it's the standard way to represent a mathematical matrix in C, including for operations like addition or multiplication (covered in later chapters).

```c
#include <stdio.h>
int main() {
 int a[2][2] = {{1, 2}, {3, 4}};
 int b[2][2] = {{5, 6}, {7, 8}};
 int sum[2][2];
 for (int i = 0; i < 2; i++) {
 for (int j = 0; j < 2; j++) {
 sum[i][j] = a[i][j] + b[i][j];
 }
 }
 for (int i = 0; i < 2; i++) {
 for (int j = 0; j < 2; j++) {
 printf("%d ", sum[i][j]);
 }
 printf("\n");
 }
 return 0;
}
```

##### Output:
```text
6 8
10 12
```

#### Nested Loops for 2D Arrays
Reading or writing every element of a 2D array requires two nested loops: the outer loop walks the rows, the inner loop walks the columns within the current row.

```c
for (int row = 0; row < numRows; row++) {
 for (int col = 0; col < numCols; col++) {
 // access matrix[row][col]
 }
}
```

#### Matrix Traversal
Printing a 2D array in its natural grid shape is the most common traversal — a newline after each completed row is what turns a flat sequence of numbers into a readable grid.

```c
#include <stdio.h>
int main() {
 int matrix[3][3] = {
 {1, 2, 3},
 {4, 5, 6},
 {7, 8, 9}
 };
 for (int i = 0; i < 3; i++) {
 for (int j = 0; j < 3; j++) {
 printf("%d ", matrix[i][j]);
 }
 printf("\n");
 }
 return 0;
}
```

##### Output:
```text
1 2 3
4 5 6
7 8 9
```

> [!TIP]
> **Tip**
> When a nested-loop pattern's output doesn't look right, trace it exactly like the star-pattern traces from Chapter 2: write down what the outer loop variable is, then step through every value the inner loop variable takes before the outer loop advances.

---

### 4.3 Strings

C has no dedicated string type. A string in C is simply a character array that ends with a special marker — everything about how C strings work follows from that one fact.

#### Character Arrays
A string is declared and initialized just like any other array, but of type char, and usually holding text in double quotes.

```c
char name[20] = "Asha";
char greeting[] = "Hello"; // size inferred: 6, not 5 (see below)
```

#### The Null Terminator
C automatically adds an invisible null terminator character, written \0, at the end of every string literal. It marks "the string ends here" for any function that processes the string — without it, functions like printf("%s", ...) would keep reading memory past the intended text.

```c
char word[6] = "Hello";
// stored in memory as: 'H' 'e' 'l' 'l' 'o' '\0'
// index:              0   1   2   3   4   5
// "Hello" is 5 letters but needs 6 bytes of storage for the terminator
```

> [!WARNING]
> **Warning**
> A char array must always have room for the null terminator in addition to the visible characters. char word[5] = "Hello"; leaves no space for \0 and is a common source of subtle bugs.

#### strlen
strlen (from string.h) returns the number of characters in a string, not counting the null terminator.

```c
#include <stdio.h>
#include <string.h>
int main() {
 char name[] = "Programming";
 printf("Length: %zu\n", strlen(name));
 return 0;
}
```

##### Output:
```text
Length: 11
```

#### strcpy
strcpy copies one string into another, including the null terminator. The destination array must be large enough to hold the source string.

```c
#include <stdio.h>
#include <string.h>
int main() {
 char source[] = "Hello";
 char destination[20];
 strcpy(destination, source);
 printf("%s\n", destination);
 return 0;
}
```

##### Output:
```text
Hello
```

#### strcat
strcat appends one string onto the end of another, overwriting the first string's null terminator and adding a new one at the very end.

```c
#include <stdio.h>
#include <string.h>
int main() {
 char greeting[30] = "Hello, ";
 char name[] = "Asha";
 strcat(greeting, name);
 printf("%s\n", greeting);
 return 0;
}
```

##### Output:
```text
Hello, Asha
```

> [!NOTE]
> **Note**
> The destination array for strcat (greeting, here) must already have enough spare room for the combined result — it does not grow automatically.

#### strcmp
strcmp compares two strings character by character and returns 0 if they're exactly equal, a negative number if the first string comes before the second alphabetically, and a positive number if it comes after.

```c
#include <stdio.h>
#include <string.h>
int main() {
 char a[] = "apple";
 char b[] = "apple";
 char c[] = "banana";
 printf("%d\n", strcmp(a, b)); // 0 (equal)
 printf("%d\n", strcmp(a, c)); // negative ('a' < 'b')
 return 0;
}
```

##### Output:
```text
0
-1
```

> [!WARNING]
> **Warning**
> Never compare strings with == in C — that compares memory addresses, not the text they contain, and will almost always give the wrong answer. Always use strcmp() for string content comparison.

#### Manual String Manipulation
Because a string is just a char array ending in \0, you can process it yourself with a plain loop instead of a library function — this is exactly how strlen, strcpy, and similar functions work internally.

```c
#include <stdio.h>
int myStrlen(char str[]) {
 int length = 0;
 while (str[length] != '\0') {
 length++;
 }
 return length;
}
int main() {
 printf("%d\n", myStrlen("Hello"));
 return 0;
}
```

##### Output:
```text
5
```

#### Reverse String
Reversing a string swaps characters from the outside in: the first character trades places with the last, the second with the second-to-last, and so on, stopping at the middle.

```c
#include <stdio.h>
#include <string.h>
void reverse(char str[]) {
 int start = 0;
 int end = strlen(str) - 1;
 while (start < end) {
 char temp = str[start];
 str[start] = str[end];
 str[end] = temp;
 start++;
 end--;
 }
}
int main() {
 char word[] = "hello";
 reverse(word);
 printf("%s\n", word);
 return 0;
}
```

##### Output:
```text
olleh
```

```text
Trace of the swap pointers closing in:
h e l l o
^       ^
start=0 end=4   -> swap -> o e l l h

o e l l h
  ^   ^
start=1 end=3   -> swap -> o l l e h

o l l e h
    ^
start=2 end=2   -> start == end, stop
```

#### Palindrome
A palindrome reads the same forwards and backwards (like "madam" or "level"). Checking for one uses the same two-pointer idea as reversing — but instead of swapping, you compare, and stop early the moment a mismatch is found.

```c
#include <stdio.h>
#include <string.h>
int isPalindrome(char str[]) {
 int start = 0;
 int end = strlen(str) - 1;
 while (start < end) {
 if (str[start] != str[end]) {
 return 0; // mismatch found -- not a palindrome
 }
 start++;
 end--;
 }
 return 1; // no mismatches found
}
int main() {
 printf("%d\n", isPalindrome("madam")); // 1
 printf("%d\n", isPalindrome("hello")); // 0
 return 0;
}
```

##### Output:
```text
1
0
```

#### Counting Vowels
Counting vowels traverses the string once, checking each character against the set 'a', 'e', 'i', 'o', 'u' (and their uppercase forms, if the text isn't already normalized).

```c
#include <stdio.h>
#include <string.h>
int main() {
 char text[] = "Programming in C";
 int count = 0;
 for (int i = 0; i < strlen(text); i++) {
 char ch = text[i];
 if (ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u'||
 ch=='A'||ch=='E'||ch=='I'||ch=='O'||ch=='U') {
 count++;
 }
 }
 printf("Vowels: %d\n", count);
 return 0;
}
```

##### Output:
```text
Vowels: 4
```

#### Counting Words
A simple word count treats consecutive non-space characters as one word, and increments the count each time a space is followed by a non-space character (i.e. each time a new word *begins*).

```c
#include <stdio.h>
#include <string.h>
int main() {
 char sentence[] = "C programming is fun";
 int wordCount = 0;
 for (int i = 0; i < strlen(sentence); i++) {
 if (sentence[i] != ' ' && (i == 0 || sentence[i - 1] == ' ')) {
 wordCount++;
 }
 }
 printf("Words: %d\n", wordCount);
 return 0;
}
```

##### Output:
```text
Words: 4
```

> [!NOTE]
> **Key Idea**
> Nearly every hand-rolled string algorithm in C follows the same skeleton: loop from index 0 up to strlen(str), look at one character (or a small neighborhood of characters) at a time, and keep a running total, flag, or pair of pointers as you go.

#### Real-World Applications
* **Arrays back nearly every collection of data** a program handles: sensor readings, exam scores, inventory counts, pixel rows in an image.
* **2D arrays model spreadsheets**, game boards (like tic-tac-toe or chess), and image data (rows and columns of pixel values).
* **String functions like `strcmp()` and `strcpy()`** are used constantly in parsing user input, comparing usernames, and processing text files.
* **Palindrome and word-count style algorithms** are common building blocks in text processing, search engines, and basic data validation.

#### Interview Corner
* **Q: Why does an array's index start at 0 in C?**
  A: An array name represents the address of its first element, and index i is computed as an offset of i elements from that starting address — index 0 means "zero elements past the start", which is the first element itself.
* **Q: Why are arrays passed by reference to functions when everything else in C is passed by value?**
  A: Copying an entire array on every function call would be slow and memory-heavy, especially for large arrays, so C always passes just the address of the array's first element instead.
* **Q: What exactly makes a char array a valid C string?**
  A: The presence of a null terminator (\0) marking where the text ends — without it, string functions have no way to know where to stop reading.
* **Q: Why is it wrong to compare two strings with == in C?**
  A: == compares the two array (pointer) addresses, not the characters they contain — two strings with identical text but stored at different memory locations would incorrectly compare as unequal.
* **Q: How would you find the number of rows and columns in a 2D array passed to a function?**
  A: You can't recover them from the array parameter alone, since it decays to a pointer — the row and column counts must be passed in separately as extra parameters.

#### Chapter Summary
* An array stores a fixed number of same-type values in contiguous memory, accessed with a zero-based index.
* C does not check array bounds at runtime — accessing an index outside 0 to size-1 is undefined behavior.
* Arrays are passed to functions by reference, so changes made inside a function are visible to the caller; the size must be passed separately.
* A 2D array is an array of arrays, indexed as arr[row][col] and typically processed with nested loops.
* A C string is a char array terminated by \0; the array must always be sized for one extra character beyond the visible text.
* strlen, strcpy, strcat, and strcmp are the core string.h functions for length, copying, concatenation, and comparison.
* Classic string algorithms — reversing, palindrome-checking, counting vowels, counting words — all boil down to a single pass through the characters with a running total, flag, or pair of pointers.
