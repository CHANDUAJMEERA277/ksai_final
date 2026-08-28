export interface ChapterRecapData {
  language: "python" | "c" | "cpp" | "java";
  chapterOrder: number;
  chapterTitle: string;
  summary: string;
  whatYouWillLearn: string[];
  keyConcepts: string[];
  importantSyntax: string[];
  whatYouShouldBeAbleToDo: string[];
  revisionPoints: string[];
  chapterQuestions?: string[];
}

export interface QuickRecapData {
  language: "python" | "c" | "cpp" | "java";
  chapterOrder: number;
  topicTitle: string;
  whatWeLearned: string;
  keyConcept: string;
  importantSyntaxOrRule: string;
  codeExample: {
    lang: string;
    code: string;
  };
  oneThingToRemember: string;
  checkpointQuestion?: string;
}

export const CHAPTER_RECAP_BANK: Record<string, Record<number, ChapterRecapData>> = {
  c: {
    0: {
      language: "c",
      chapterOrder: 0,
      chapterTitle: "Introduction to C, System Architecture & Toolchain",
      summary: "This chapter introduces the C programming language, hardware-level architecture, memory organization, and setting up the GCC/Clang compilation toolchain.",
      whatYouWillLearn: [
        "Origin, philosophy, and modern relevance of C in system programming",
        "The 4-stage C compilation pipeline: Preprocessing, Compilation, Assembly, and Linking",
        "Structure of a standard C program (headers, main function, return status)",
        "Configuring GCC, VS Code, and terminal compilation workflows",
        "Writing, compiling, and running your first C program",
      ],
      keyConcepts: [
        "Source Code to Machine Executable pipeline (.c -> .i -> .s -> .o -> executable)",
        "Standard I/O Streams: stdin, stdout, stderr",
        "Exit codes: 0 for clean success, non-zero for system error",
      ],
      importantSyntax: [
        '#include <stdio.h>',
        'int main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}',
        'gcc -Wall -Wextra main.c -o main && ./main',
      ],
      whatYouShouldBeAbleToDo: [
        "Set up a local C development environment with GCC/Clang",
        "Compile and execute multi-file and single-file C programs from the command line",
        "Identify and fix basic syntax and compiler warnings",
      ],
      revisionPoints: [
        "C is a compiled, statically-typed, procedural language with zero runtime overhead.",
        "Every C program execution begins at the main() entry point.",
        "Headers provide forward declarations; libraries provide compiled binary object code.",
      ],
    },
    1: {
      language: "c",
      chapterOrder: 1,
      chapterTitle: "Data Types, Variables & Memory Representation",
      summary: "Explore primitive data types, memory sizes, format specifiers, signed vs unsigned representations, and variable scopes in C.",
      whatYouWillLearn: [
        "Fundamental data types: char, int, float, double, void",
        "Data type modifiers: short, long, signed, unsigned",
        "Format specifiers for formatted I/O (%d, %u, %f, %lf, %c, %s, %p, %x)",
        "Memory sizing with the sizeof operator",
        "Type casting (implicit type promotion vs explicit casting)",
        "Constants (#define macro vs const qualifier)",
      ],
      keyConcepts: [
        "Bit-level representation of signed vs unsigned integers (Two's complement)",
        "IEEE 754 floating-point representation (single vs double precision)",
        "Memory sizing on 32-bit vs 64-bit architectures",
      ],
      importantSyntax: [
        "int count = 42; unsigned int id = 1001U;",
        "float temperature = 98.6f; double precisionValue = 3.1415926535;",
        "char initial = 'K';",
        'printf("Value: %d, Size: %zu bytes\\n", count, sizeof(count));',
        "double result = (double)numerator / denominator;",
      ],
      whatYouShouldBeAbleToDo: [
        "Choose optimal data types for memory-constrained and high-performance applications",
        "Format input and output with precision specifiers using printf and scanf",
        "Safely perform numeric conversions without truncation or overflow",
      ],
      revisionPoints: [
        "sizeof returns size in bytes as a size_t type.",
        "char is guaranteed to be 1 byte (8 bits).",
        "Always use unsigned for quantities that can never be negative (indexes, sizes, counters).",
      ],
    },
    2: {
      language: "c",
      chapterOrder: 2,
      chapterTitle: "Operators, Expressions & Bitwise Manipulation",
      summary: "Master arithmetic, relational, logical, bitwise operators, operator precedence, and low-level bit manipulation in C.",
      whatYouWillLearn: [
        "Arithmetic and compound assignment operators (+, -, *, /, %, +=, etc.)",
        "Relational & logical operators with short-circuit evaluation (&&, ||, !)",
        "Bitwise operations (&, |, ^, ~, <<, >>) and bit masking",
        "Ternary conditional operator (? :)",
        "Operator precedence and associativity order",
      ],
      keyConcepts: [
        "Integer division truncation vs modulus arithmetic",
        "Short-circuiting in boolean expressions",
        "Bit masking patterns: setting, clearing, toggling, and checking specific bits",
      ],
      importantSyntax: [
        "int isSet = (flags & (1 << bitPosition)) != 0; // Check bit",
        "flags |= (1 << bitPosition);                   // Set bit",
        "flags &= ~(1 << bitPosition);                  // Clear bit",
        "flags ^= (1 << bitPosition);                   // Toggle bit",
        "int max = (a > b) ? a : b;",
      ],
      whatYouShouldBeAbleToDo: [
        "Implement high-speed bitwise flag systems and permission masks",
        "Construct complex boolean logic without logical flaws or precedence bugs",
        "Use bit shifts for efficient powers of 2 multiplication and division",
      ],
      revisionPoints: [
        "Logical operators (&&, ||) return 0 or 1; bitwise operators (&, |) compute bit-by-bit.",
        "Shift operators (<<, >>) shift bits left (multiply by 2) or right (divide by 2).",
        "In C, 0 evaluates to false; any non-zero value evaluates to true.",
      ],
    },
    3: {
      language: "c",
      chapterOrder: 3,
      chapterTitle: "Control Flow: Conditionals & Loops",
      summary: "Understand conditional branching, switch-case selection, loop constructs, nested loops, and loop control statements.",
      whatYouWillLearn: [
        "Conditional structures: if, else if, else",
        "Multi-way branch selection: switch, case, default, break",
        "Loop constructs: for loops, while loops, do-while loops",
        "Loop control statements: break, continue, goto (and its anti-patterns)",
        "Infinite loops and loop invariants",
      ],
      keyConcepts: [
        "Fall-through behavior in switch statements",
        "Pre-test loops (for, while) vs post-test loop (do-while)",
        "Nested loop complexity and optimization",
      ],
      importantSyntax: [
        "if (score >= 90) { ... } else if (score >= 75) { ... } else { ... }",
        "switch (status) { case 1: handleInit(); break; default: handleFallback(); break; }",
        "for (int i = 0; i < n; i++) { if (arr[i] == target) break; }",
        "while (hasMoreData()) { processNext(); }",
      ],
      whatYouShouldBeAbleToDo: [
        "Design robust decision-tree algorithms and state machines",
        "Write clean iterative algorithms without off-by-one errors",
        "Choose between while, for, and do-while based on entry conditions",
      ],
      revisionPoints: [
        "Always include break statements in switch cases unless fall-through is intentional.",
        "A do-while loop executes its body at least once.",
        "Avoid goto; use structured loops and functions for clean control flow.",
      ],
    },
    4: {
      language: "c",
      chapterOrder: 4,
      chapterTitle: "Functions, Storage Classes & Call Stack",
      summary: "Learn function prototypes, call-by-value semantics, recursion, storage classes (auto, static, extern, register), and stack frame management.",
      whatYouWillLearn: [
        "Function declarations, forward prototypes, and definition structure",
        "Parameter passing (Call-by-value vs passing pointers)",
        "Storage classes: auto, register, static, extern",
        "Recursive functions, base cases, and stack overflow prevention",
        "Inline functions and compiler optimizations",
      ],
      keyConcepts: [
        "Call stack frames: return address, local variables, parameters",
        "Static local variables (persistent lifetime, local scope)",
        "Header file prototypes and multi-file code modularity",
      ],
      importantSyntax: [
        "int calculateSum(int a, int b); // Function prototype",
        "static int cachedCounter = 0;   // Static lifetime variable",
        "extern int globalSystemConfig;  // External linkage declaration",
        "int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}",
      ],
      whatYouShouldBeAbleToDo: [
        "Modularize large programs into clean, reusable functions across multiple files",
        "Apply static storage class for encapsulation within translation units",
        "Implement recursive divide-and-conquer algorithms safely",
      ],
      revisionPoints: [
        "C functions can only return a single value directly; use pointers for multiple outputs.",
        "static variables retain their value across multiple function invocations.",
        "Function prototypes prevent implicit declaration warnings in C.",
      ],
    },
    5: {
      language: "c",
      chapterOrder: 5,
      chapterTitle: "Arrays, Multi-Dimensional Matrices & Strings",
      summary: "Master contiguous array allocation, multi-dimensional matrix layouts, null-terminated strings, and standard string manipulation functions in C.",
      whatYouWillLearn: [
        "1D Array declaration, initialization, indexing, and boundary checks",
        "Multi-dimensional arrays and 2D matrix manipulation",
        "Null-terminated char arrays (C strings) and ASCII representation",
        "String library functions: strlen, strcpy, strncpy, strcat, strcmp, strstr",
        "Passing arrays to functions (decaying to pointers)",
      ],
      keyConcepts: [
        "Contiguous memory layout and row-major order for 2D arrays",
        "The essential role of the null terminator ('\\0') in C strings",
        "Array decay to pointer when passed into function parameters",
      ],
      importantSyntax: [
        "int numbers[5] = {10, 20, 30, 40, 50};",
        "int matrix[3][3] = {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};",
        'char message[64] = "KnowledgeStream AI";',
        "size_t len = strlen(message);",
        'if (strcmp(str1, str2) == 0) { /* strings are equal */ }',
      ],
      whatYouShouldBeAbleToDo: [
        "Process, transform, and search array elements efficiently",
        "Perform matrix arithmetic (addition, transposition, multiplication)",
        "Manipulate strings safely using length-bounded functions like strncpy and snprintf",
      ],
      revisionPoints: [
        "C does NOT perform array bounds checking; out-of-bounds access causes undefined behavior.",
        "String length (strlen) does not count the null terminator; array size must be strlen + 1.",
        "Array names evaluate to the memory address of the first element in most expressions.",
      ],
    },
    6: {
      language: "c",
      chapterOrder: 6,
      chapterTitle: "Pointers, Memory Addresses & Pointer Arithmetic",
      summary: "Understand pointers, address-of (&) and dereference (*) operators, pointer arithmetic, void pointers, NULL safety, and double pointers.",
      whatYouWillLearn: [
        "Memory addresses, pointer declaration, and initialization",
        "The Address-of operator (&) and Dereference operator (*)",
        "Pointer arithmetic (stepping by sizeof(type))",
        "Pointers to pointers (double pointers: **ptr)",
        "Void pointers (void*) and type casting",
        "Function pointers and callback mechanisms",
      ],
      keyConcepts: [
        "Pointers store memory addresses of variables in RAM",
        "Pointer arithmetic automatically scales by the underlying data type's byte size",
        "Call-by-reference simulation in C via pointer passing",
      ],
      importantSyntax: [
        "int value = 42;",
        "int *ptr = &value;       // ptr holds address of value",
        "*ptr = 99;              // Dereference to modify value directly",
        "ptr++;                  // Advances address by sizeof(int) bytes",
        "void (*callback)(int);  // Function pointer declaration",
      ],
      whatYouShouldBeAbleToDo: [
        "Swap variables and modify caller state using pointer parameters",
        "Navigate arrays and buffers using pointer arithmetic",
        "Implement callback functions using function pointers",
      ],
      revisionPoints: [
        "Always initialize pointers to NULL or a valid address to avoid dangling pointers.",
        "Dereferencing a NULL or wild pointer causes a Segmentation Fault (SIGSEGV).",
        "Array subscripting arr[i] is mathematically identical to *(arr + i).",
      ],
    },
    7: {
      language: "c",
      chapterOrder: 7,
      chapterTitle: "Dynamic Memory Allocation (Heap Management)",
      summary: "Master heap allocation with malloc, calloc, realloc, and free, preventing memory leaks, double frees, and heap fragmentation.",
      whatYouWillLearn: [
        "Stack vs Heap memory regions and lifetimes",
        "malloc() for raw heap memory allocation",
        "calloc() for contiguous zero-initialized allocation",
        "realloc() for dynamic resizing of heap blocks",
        "free() for releasing memory back to the OS",
        "Detecting and fixing memory leaks and dangling pointers",
      ],
      keyConcepts: [
        "Manual memory management responsibility in C",
        "Allocation failure checking (NULL verification)",
        "Heap fragmentation and realloc reallocation behavior",
      ],
      importantSyntax: [
        "int *arr = (int*)malloc(n * sizeof(int));",
        "if (arr == NULL) { /* handle out-of-memory error */ return -1; }",
        "int *cleanArr = (int*)calloc(n, sizeof(int));",
        "int *expanded = (int*)realloc(arr, newSize * sizeof(int));",
        "free(arr); arr = NULL; // Free and neutralize pointer",
      ],
      whatYouShouldBeAbleToDo: [
        "Dynamically allocate resizable buffers and arrays at runtime",
        "Write leak-free C code with symmetric malloc/free discipline",
        "Safely handle reallocation without losing original memory on failure",
      ],
      revisionPoints: [
        "Every malloc/calloc MUST have a corresponding free() call.",
        "calloc initializes all allocated bytes to zero; malloc leaves memory uninitialized.",
        "Set pointer to NULL immediately after calling free() to prevent use-after-free bugs.",
      ],
    },
    8: {
      language: "c",
      chapterOrder: 8,
      chapterTitle: "Structures, Unions, Bitfields & Enums",
      summary: "Model complex real-world data structures using struct, union, typedef, bitfields, and enum in C.",
      whatYouWillLearn: [
        "Structure definition, member access (. operator vs -> pointer operator)",
        "Typedef alias definitions for cleaner type declarations",
        "Nested structures and arrays of structures",
        "Unions for memory-shared polymorphic data",
        "Bitfields for packing flags into precise bit counts",
        "Enumerations (enum) for named integral constants",
      ],
      keyConcepts: [
        "Structure memory layout, padding, and alignment boundaries",
        "Union memory allocation (sized to its largest member)",
        "Passing structures by pointer vs passing by value",
      ],
      importantSyntax: [
        "typedef struct {\n    int id;\n    char name[64];\n    float gpa;\n} Student;",
        "Student s1 = {101, \"Alice\", 3.95f};",
        "Student *sPtr = &s1;\nprintf(\"Name: %s\\n\", sPtr->name);",
        "typedef enum { STATE_IDLE, STATE_RUNNING, STATE_DONE } ProcessState;",
      ],
      whatYouShouldBeAbleToDo: [
        "Design compound data models for entities and records",
        "Write memory-efficient embedded structs with bitfields",
        "Use arrow operator (->) for dynamic structure manipulation",
      ],
      revisionPoints: [
        "Use the arrow operator (ptr->member) when accessing members through a struct pointer.",
        "Structures create distinct memory for all fields; unions share the same memory address.",
        "Structure padding can increase struct size to align with CPU word boundaries.",
      ],
    },
    9: {
      language: "c",
      chapterOrder: 9,
      chapterTitle: "File I/O, Streams & Binary Data Processing",
      summary: "Learn persistent data storage with fopen, fclose, fprintf, fscanf, fgets, fputs, fread, fwrite, and random-access with fseek and ftell.",
      whatYouWillLearn: [
        "File streams and modes (r, w, a, r+, w+, a+, and binary modes rb, wb)",
        "Formatted text I/O: fprintf, fscanf, fgets, fputs",
        "Binary I/O for direct memory-to-disk transfers: fread, fwrite",
        "File positioning: fseek, ftell, rewind",
        "Error handling in file operations (feof, ferror, perror)",
      ],
      keyConcepts: [
        "Buffered I/O streams and buffer flushing (fflush)",
        "Text mode newline translation vs raw binary byte streaming",
        "Random access navigation in structured binary records",
      ],
      importantSyntax: [
        'FILE *fp = fopen("data.txt", "r");\nif (!fp) { perror("File open error"); return -1; }',
        'char buffer[256];\nwhile (fgets(buffer, sizeof(buffer), fp)) { printf("%s", buffer); }',
        "fwrite(&student, sizeof(Student), 1, binFp);",
        "fseek(fp, 0, SEEK_END); long fileSize = ftell(fp);",
        "fclose(fp);",
      ],
      whatYouShouldBeAbleToDo: [
        "Read and parse configuration files, logs, and CSVs line-by-line",
        "Serialize and deserialize struct records to binary storage files",
        "Calculate file sizes and navigate records with fseek/ftell",
      ],
      revisionPoints: [
        "Always verify that fopen() returned a non-NULL pointer before accessing the file stream.",
        "Always call fclose() to flush write buffers and release OS file descriptors.",
        "Use fgets instead of gets to prevent buffer overflow vulnerabilities.",
      ],
    },
    10: {
      language: "c",
      chapterOrder: 10,
      chapterTitle: "C Preprocessor, Advanced Macro Magic & Modular Projects",
      summary: "Master the C preprocessor (#define, macros, conditional compilation, header guards), multi-file architecture, makefiles, and defensive coding.",
      whatYouWillLearn: [
        "Preprocessor directives: #include, #define, #undef",
        "Parameterized macros, stringification (#), and token pasting (##)",
        "Conditional compilation: #ifdef, #ifndef, #if, #elif, #else, #endif",
        "Header guards (#pragma once vs #ifndef _HEADER_H_)",
        "Multi-file compilation, separation of interface (.h) and implementation (.c)",
        "Writing clean Makefiles for automated project builds",
      ],
      keyConcepts: [
        "Macro text replacement vs inline function type safety",
        "Cross-platform compilation flags and debug logging macros",
        "Linking object files (.o) and static library creation (.a)",
      ],
      importantSyntax: [
        "#ifndef MY_MODULE_H\n#define MY_MODULE_H\n/* declarations */\n#endif",
        "#define MAX(a, b) ((a) > (b) ? (a) : (b))",
        "#define STRINGIFY(x) #x",
        "#define CONCAT(a, b) a##b",
        "#ifdef DEBUG\n#define LOG(msg) printf(\"[DEBUG] %s\\n\", msg)\n#else\n#define LOG(msg)\n#endif",
      ],
      whatYouShouldBeAbleToDo: [
        "Architect clean, modular multi-file C systems with header interfaces",
        "Implement conditional compilation for debug/release and cross-platform targets",
        "Write Makefiles with dependency rules for automated compilation",
      ],
      revisionPoints: [
        "Always enclose macro arguments and full macro expressions in parentheses.",
        "Header files (.h) should contain declarations; source files (.c) contain definitions.",
        "Use header guards in every header file to prevent multiple declaration errors.",
      ],
    },
  },
  cpp: {
    1: {
      language: "cpp",
      chapterOrder: 1,
      chapterTitle: "C++ Fundamentals, Namespaces & Modern I/O Streams",
      summary: "Transition from C to modern C++, mastering std::cout/std::cin, namespaces, references, auto type deduction, and const correctness.",
      whatYouWillLearn: [
        "Modern C++ architecture and differences from C",
        "Standard streams: std::cout, std::cin, std::cerr with stream manipulators",
        "Namespaces, namespace aliasing, and using declarations",
        "C++ References (&) vs Pointers and lvalue references",
        "Modern C++ auto keyword for type deduction",
        "const correctness and constexpr compile-time evaluation",
      ],
      keyConcepts: [
        "Type safety and stream abstraction over printf/scanf",
        "References as immutable aliases to existing memory locations",
        "Compile-time computation with constexpr",
      ],
      importantSyntax: [
        "#include <iostream>\n#include <string>",
        "std::cout << \"Hello, C++!\" << std::endl;",
        "int value = 50;\nint& ref = value; // ref is an alias to value",
        "auto rate = 3.14159; // auto deduces double",
        "constexpr int BUFFER_SIZE = 1024;",
      ],
      whatYouShouldBeAbleToDo: [
        "Write clean C++ programs using std::iostream with stream chaining",
        "Pass arguments efficiently by const reference without copying overhead",
        "Create custom namespaces to avoid symbol name collisions",
      ],
      revisionPoints: [
        "References cannot be NULL and cannot be reseated after initialization.",
        "Pass large objects by const reference (const Type&) to avoid expensive copy operations.",
        "Avoid 'using namespace std;' in header files to prevent namespace pollution.",
      ],
    },
    2: {
      language: "cpp",
      chapterOrder: 2,
      chapterTitle: "Classes, Objects & Encapsulation",
      summary: "Understand Object-Oriented Programming (OOP) foundation in C++: classes, access specifiers, constructors, destructors, and this pointer.",
      whatYouWillLearn: [
        "Classes vs structs in C++ (default private vs public access)",
        "Access specifiers: public, private, protected",
        "Constructors (default, parameterized, member initializer lists)",
        "Destructors for deterministic RAII resource cleanup",
        "The this pointer and method chaining",
        "const member functions and mutable keyword",
      ],
      keyConcepts: [
        "Encapsulation: bundling state and behavior with controlled access",
        "Member initializer lists vs body assignment in constructors",
        "Deterministic destruction lifecycle (RAII)",
      ],
      importantSyntax: [
        "class BankAccount {\nprivate:\n    std::string accountNumber;\n    double balance;\npublic:\n    BankAccount(std::string id, double initial)\n        : accountNumber(id), balance(initial) {}\n    ~BankAccount() { /* cleanup */ }\n    double getBalance() const { return balance; }\n};",
      ],
      whatYouShouldBeAbleToDo: [
        "Model real-world entities with encapsulated C++ classes",
        "Use member initializer lists for optimal constructor performance",
        "Enforce const correctness on read-only member functions",
      ],
      revisionPoints: [
        "In C++, structs default to public members; classes default to private members.",
        "Member initializer lists initialize members directly, avoiding default construction + assignment.",
        "Mark member functions as const if they do not modify the object state.",
      ],
    },
  },
  python: {
    0: {
      language: "python",
      chapterOrder: 0,
      chapterTitle: "Introduction to Programming & Python Architecture",
      summary: "Explore computer science fundamentals, Python's role in AI and data science, bytecode execution, and configuring your coding environment.",
      whatYouWillLearn: [
        "How programming languages translate human logic into computer actions",
        "Python's core design philosophy: readability, versatility, and extensive libraries",
        "Interpreted vs compiled language paradigms and the Python Virtual Machine (PVM)",
        "Installing Python, setting up VS Code, and verifying PATH environment variables",
        "Writing and running your very first Python script",
      ],
      keyConcepts: [
        "Python 2-stage execution: Source Code (.py) -> Bytecode (.pyc) -> PVM Execution",
        "Dynamic typing and interactive REPL exploration",
        "Cross-platform execution across Windows, Linux, and macOS",
      ],
      importantSyntax: [
        'print("Hello, World!")',
        '# Single-line comment',
        '"""Multi-line docstring"""',
        'python --version && python main.py',
      ],
      whatYouShouldBeAbleToDo: [
        "Run Python scripts from the terminal and within VS Code",
        "Explain how Python bytecode executes on the Python Virtual Machine",
        "Differentiate between compiled and interpreted language execution",
      ],
      revisionPoints: [
        "Python is dynamically-typed and interpreted via the Python Virtual Machine.",
        "Code blocks are defined by indentation (4 spaces standard PEP 8), not curly braces.",
        "print() outputs strings and formatted expressions to standard output.",
      ],
    },
    1: {
      language: "python",
      chapterOrder: 1,
      chapterTitle: "Variables, Dynamic Typing, Operators & PEP 8",
      summary: "Master Python primitive data types, dynamic typing, arithmetic & logical operators, formatted strings, and PEP 8 styling conventions.",
      whatYouWillLearn: [
        "Dynamic typing, variable assignment, and Python reference semantics",
        "Primitive data types: int, float, str, bool, NoneType",
        "Explicit type casting (int(), float(), str(), bool())",
        "Operators: arithmetic, comparison, logical (and, or, not), identity (is), membership (in)",
        "Formatted string literals (f-strings) and input/output handling",
        "PEP 8 style guide, naming conventions, and clean code formatting",
      ],
      keyConcepts: [
        "Variables in Python are references (pointers) to objects in memory",
        "Immutability of numbers, strings, and booleans",
        "Truthiness in Python: empty containers, 0, None evaluate to False",
      ],
      importantSyntax: [
        'name = "Alice"; age = 22; gpa = 3.95; is_active = True',
        'message = f"Student {name} (Age: {age}) has GPA {gpa:.2f}"',
        'user_age = int(input("Enter your age: "))',
        'is_eligible = (age >= 18) and is_active',
      ],
      whatYouShouldBeAbleToDo: [
        "Capture, cast, and validate user input from the console",
        "Format dynamic strings with precision using f-strings",
        "Write clean, PEP 8-compliant Python code with meaningful variable names",
      ],
      revisionPoints: [
        "Use f-strings (f'...') for fast, readable string formatting in modern Python.",
        "The '==' operator checks value equality; 'is' checks object memory identity.",
        "Follow snake_case naming for variables and functions per PEP 8.",
      ],
    },
  },
  java: {
    1: {
      language: "java",
      chapterOrder: 1,
      chapterTitle: "Java Platform Architecture, JDK, JVM & Syntax Fundamentals",
      summary: "Understand the Java Virtual Machine, Write Once Run Anywhere architecture, JDK vs JRE, and foundational Java syntax and classes.",
      whatYouWillLearn: [
        "Java platform philosophy: Object-oriented, statically typed, garbage collected",
        "The JVM execution model: Source (.java) -> Bytecode (.class) -> JIT Compiler -> Machine code",
        "Class declaration, public static void main entry point, and Java packages",
        "Java primitive data types (byte, short, int, long, float, double, char, boolean)",
        "Formatted console output with System.out.println and System.out.printf",
      ],
      keyConcepts: [
        "Write Once, Run Anywhere (WORA) bytecode portability",
        "Primitive types vs Reference types (heap object references)",
        "Automatic garbage collection memory management",
      ],
      importantSyntax: [
        "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Welcome to Java!\");\n    }\n}",
        "int count = 100; double price = 49.99; boolean isActive = true;",
        "System.out.printf(\"Item count: %d, Total: $%.2f%n\", count, price);",
      ],
      whatYouShouldBeAbleToDo: [
        "Write, compile (javac), and execute (java) standard Java programs",
        "Select appropriate primitive data types based on range and memory footprint",
        "Format console outputs with System.out.printf",
      ],
      revisionPoints: [
        "In Java, every line of executable code must reside inside a class.",
        "The file name must exactly match the public class name (e.g., Main.java).",
        "Java is strictly pass-by-value (for references, the memory address copy is passed).",
      ],
    },
  },
};

export function getChapterRecap(language: string, chapterOrder: number): ChapterRecapData {
  const normLang = (language || "").toLowerCase().trim();
  const langKey =
    normLang === "c++" || normLang === "cpp"
      ? "cpp"
      : normLang === "c"
      ? "c"
      : normLang === "java"
      ? "java"
      : "python";

  const bank = CHAPTER_RECAP_BANK[langKey];
  if (bank && bank[chapterOrder]) {
    return bank[chapterOrder];
  }

  // Synthesis fallback
  const langDisplay = langKey === "cpp" ? "C++" : langKey.toUpperCase();
  return {
    language: langKey as any,
    chapterOrder,
    chapterTitle: `${langDisplay} Chapter ${chapterOrder} Masterclass`,
    summary: `Comprehensive study recap of ${langDisplay} Chapter ${chapterOrder}. Covers core language features, syntax rules, memory implications, and practical design patterns.`,
    whatYouWillLearn: [
      `Understand foundational logic and architecture of ${langDisplay} Chapter ${chapterOrder}`,
      `Master idiomatic syntax rules and compiler behaviors`,
      `Apply best practices to solve complex programming challenges`,
      `Develop robust debugging and verification techniques`,
    ],
    keyConcepts: [
      `Core language specifications and execution pipelines`,
      `Memory allocation, scope lifetimes, and type safety`,
      `Optimal algorithmic patterns for ${langDisplay}`,
    ],
    importantSyntax: [
      `// Core syntax and patterns for ${langDisplay} Chapter ${chapterOrder}`,
    ],
    whatYouShouldBeAbleToDo: [
      `Write and execute error-free ${langDisplay} programs applying this chapter's topics`,
      `Debug runtime and compile-time issues with confidence`,
      `Pass the chapter knowledge assessment with 70%+ mastery`,
    ],
    chapterQuestions: [
      `What is the primary role of this chapter's concepts in ${langDisplay} architecture?`,
      `How do memory allocation and syntax rules apply to the topics covered?`,
      `Explain one practical pitfall to avoid when writing this code in ${langDisplay}.`,
    ],
    revisionPoints: [
      `Ensure all syntax conforms to standard ${langDisplay} conventions.`,
      `Review key examples before taking the chapter assessment.`,
      `Practice hands-on code exercises to reinforce theoretical mastery.`,
    ],
  };
}

export function generateCheckpointQuestionForTopic(language: string, topicTitle: string): string {
  const normLang = (language || "").toLowerCase().trim();
  const langKey =
    normLang === "c++" || normLang === "cpp"
      ? "C++"
      : normLang === "c"
      ? "C"
      : normLang === "java"
      ? "Java"
      : "Python";

  const lower = topicTitle.toLowerCase();

  // C-Specific Questions
  if (langKey === "C") {
    if (lower.includes("pointer")) {
      return "What is a pointer in C, and how does dereferencing with * differ from taking an address with &?";
    }
    if (lower.includes("memory") || lower.includes("malloc") || lower.includes("alloc")) {
      return "What is the difference between stack and heap memory allocation in C, and why must malloc be paired with free?";
    }
    if (lower.includes("array") || lower.includes("string")) {
      return "In C, how are strings represented in memory, and why is the null terminator '\\0' essential?";
    }
    if (lower.includes("struct") || lower.includes("union")) {
      return "What is the fundamental difference in memory layout between a struct and a union in C?";
    }
    if (lower.includes("function") || lower.includes("scope")) {
      return "In C, what is the difference between pass-by-value and passing a pointer to modify the original argument?";
    }
    if (lower.includes("compil") || lower.includes("toolchain") || lower.includes("what is c")) {
      return "What are the 4 stages of C compilation (.c to executable), and what does the preprocessor do?";
    }
    if (lower.includes("variable") || lower.includes("type")) {
      return "In C, why is data type sizing critical, and what does the sizeof operator return?";
    }
  }

  // C++-Specific Questions
  if (langKey === "C++") {
    if (lower.includes("class") || lower.includes("object") || lower.includes("oop")) {
      return "In C++, what is encapsulation, and how do access specifiers (public, private, protected) enforce it?";
    }
    if (lower.includes("constructor") || lower.includes("destructor") || lower.includes("raii")) {
      return "What is RAII in C++, and when are constructors and destructors automatically invoked?";
    }
    if (lower.includes("inherit") || lower.includes("polymorphism") || lower.includes("virtual")) {
      return "In C++, what is the role of the 'virtual' keyword in member functions, and how does the vtable enable runtime polymorphism?";
    }
    if (lower.includes("template") || lower.includes("generic")) {
      return "How do function and class templates in C++ achieve compile-time generic programming?";
    }
    if (lower.includes("stl") || lower.includes("vector") || lower.includes("map")) {
      return "What is the C++ Standard Template Library (STL), and what is the difference between a vector and a list?";
    }
    if (lower.includes("reference") || lower.includes("pointer")) {
      return "In C++, how does a reference (&) differ fundamentally from a pointer (*)?";
    }
  }

  // Python-Specific Questions
  if (langKey === "Python") {
    if (lower.includes("variable") || lower.includes("typing")) {
      return "In Python, what does dynamic typing mean, and how do variables store references to objects in memory?";
    }
    if (lower.includes("list") || lower.includes("dict") || lower.includes("tuple") || lower.includes("set")) {
      return "What is the difference between mutable (e.g. lists, dicts) and immutable (e.g. tuples, strings) data structures in Python?";
    }
    if (lower.includes("function") || lower.includes("lambda") || lower.includes("scope")) {
      return "In Python, how do positional arguments, keyword arguments (*args, **kwargs), and default parameters work?";
    }
    if (lower.includes("loop") || lower.includes("condition") || lower.includes("if")) {
      return "In Python, how does the 'for in range()' construct iterate, and how does 'break' differ from 'continue'?";
    }
    if (lower.includes("class") || lower.includes("oop") || lower.includes("object")) {
      return "In Python, what is the purpose of '__init__' and the 'self' parameter in class methods?";
    }
    if (lower.includes("what is") || lower.includes("intro") || lower.includes("execut")) {
      return "In Python, how does bytecode execution (.pyc on PVM) differ from traditional line-by-line interpretation?";
    }
  }

  // Java-Specific Questions
  if (langKey === "Java") {
    if (lower.includes("jvm") || lower.includes("bytecode") || lower.includes("intro")) {
      return "What enables Java's 'Write Once, Run Anywhere' capability, and what is the relationship between JDK, JRE, and JVM?";
    }
    if (lower.includes("class") || lower.includes("object") || lower.includes("static")) {
      return "In Java, what does the 'static' keyword mean for methods and variables, and why must main be static?";
    }
    if (lower.includes("inherit") || lower.includes("interface") || lower.includes("abstract")) {
      return "In Java, what is the difference between an abstract class and an interface?";
    }
    if (lower.includes("array") || lower.includes("collection") || lower.includes("list")) {
      return "In Java, how does a fixed-size array differ from a dynamic ArrayList in terms of memory and resizing?";
    }
  }

  return `In your own words, what is the key concept and primary rule of "${topicTitle}" in ${langKey}?`;
}

export function generateQuickRecap(language: string, chapterOrder: number, topicTitle: string): QuickRecapData {
  const normLang = (language || "").toLowerCase().trim();
  const langKey =
    normLang === "c++" || normLang === "cpp"
      ? "cpp"
      : normLang === "c"
      ? "c"
      : normLang === "java"
      ? "java"
      : "python";

  const cleanTopic = topicTitle.replace(/^[\d\.\-\s:]+/, "").trim();
  const question = generateCheckpointQuestionForTopic(langKey, cleanTopic);

  const cCode = `#include <stdio.h>\n\nint main(void) {\n    // Implementation for ${cleanTopic}\n    printf("Mastered ${cleanTopic}\\n");\n    return 0;\n}`;
  const cppCode = `#include <iostream>\n\nint main() {\n    // Implementation for ${cleanTopic}\n    std::cout << "Mastered ${cleanTopic}" << std::endl;\n    return 0;\n}`;
  const pyCode = `# Implementation for ${cleanTopic}\ndef practice():\n    print("Mastered ${cleanTopic}")\n\npractice()`;
  const javaCode = `public class Solution {\n    public static void main(String[] args) {\n        // Implementation for ${cleanTopic}\n        System.out.println("Mastered ${cleanTopic}");\n    }\n}`;

  const codeMap = {
    c: { lang: "c", code: cCode },
    cpp: { lang: "cpp", code: cppCode },
    python: { lang: "python", code: pyCode },
    java: { lang: "java", code: javaCode },
  };

  return {
    language: langKey as any,
    chapterOrder,
    topicTitle: cleanTopic,
    whatWeLearned: `Explored the core principles, syntax rules, and practical application of ${cleanTopic} in ${langKey.toUpperCase()}.`,
    keyConcept: `Fundamental programming concept defining how ${cleanTopic} operates in memory and runtime execution.`,
    importantSyntaxOrRule: `Always declare appropriate types and follow standard ${langKey.toUpperCase()} idioms when implementing ${cleanTopic}.`,
    codeExample: codeMap[langKey],
    oneThingToRemember: `Mastering ${cleanTopic} provides a key building block for advanced ${langKey.toUpperCase()} software architecture.`,
    checkpointQuestion: question,
  };
}
