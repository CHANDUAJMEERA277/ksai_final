import { ProjectDefinition } from "./types";

export const CANONICAL_PROJECTS: ProjectDefinition[] = [
  // C PROJECT
  {
    id: "c-student-record-system",
    course: "c",
    title: "Student Record Management System",
    description:
      "Design a high-performance database engine in pure C using dynamic structs, binary file persistence, and safe pointer manipulation.",
    difficulty: "INTERMEDIATE",
    technologies: ["C11", "Pointers", "Dynamic Memory", "Binary File I/O", "Valgrind"],
    skillsGained: [
      "Memory Allocation (malloc/free)",
      "Pointer Arithmetic",
      "Binary File Streaming",
      "Defensive Error Handling",
    ],
    requiredConcepts: [
      "c-variables-and-memory",
      "c-pointers-and-addresses",
      "c-dynamic-memory-allocation",
      "c-structures-and-typedef",
    ],
    architectureOverview:
      "Modular design with `student.h` data model, `storage.c` for binary read/write operations, and `cli.c` for user menu interactions.",
    starterCode: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\ntypedef struct {\n    int id;\n    char name[64];\n    float gpa;\n} Student;\n\nint main(void) {\n    printf("Student Management Engine initialized.\\n");\n    return 0;\n}\n`,
    milestones: [
      {
        id: "m1-data-model",
        order: 1,
        title: "Milestone 1: Data Model & In-Memory Storage",
        description: "Define the `Student` struct and dynamic array with auto-resizing capacity.",
        status: "NOT_STARTED",
        requiredConcepts: ["c-structures-and-typedef", "c-dynamic-memory-allocation"],
        deliverables: ["`Student` struct definition", "`create_student()`", "`resize_capacity()`"],
        tasks: [
          { id: "t1", title: "Declare Student struct with id, name, and gpa", completed: false },
          { id: "t2", title: "Implement malloc-based dynamic storage array", completed: false },
          { id: "t3", title: "Write memory cleanup free() routine to eliminate leaks", completed: false },
        ],
      },
      {
        id: "m2-crud-operations",
        order: 2,
        title: "Milestone 2: CRUD Operations & Search Indexing",
        description: "Implement search by ID, update student records, and calculate GPA statistics.",
        status: "NOT_STARTED",
        requiredConcepts: ["c-pointers-and-addresses"],
        deliverables: ["`find_student_by_id()`", "`update_student()`", "`delete_student()`"],
        tasks: [
          { id: "t4", title: "Implement binary or linear search using pointer traversals", completed: false },
          { id: "t5", title: "Implement safe record deletion with array shifting", completed: false },
        ],
      },
      {
        id: "m3-file-persistence",
        order: 3,
        title: "Milestone 3: Binary File Serialization & Validation",
        description: "Save and restore student databases to disk via `fopen`, `fwrite`, and `fread`.",
        status: "NOT_STARTED",
        requiredConcepts: ["c-dynamic-memory-allocation", "c-pointers-and-addresses"],
        deliverables: ["`save_database_binary()`", "`load_database_binary()`"],
        tasks: [
          { id: "t6", title: "Write student database to binary file with header check", completed: false },
          { id: "t7", title: "Load binary data with memory boundary validation", completed: false },
        ],
      },
    ],
  },

  // C++ PROJECT
  {
    id: "cpp-banking-ledger",
    course: "cpp",
    title: "Object-Oriented Banking Ledger & Transaction Engine",
    description:
      "Build a robust banking system implementing polymorphism, abstract account types, transaction history, and RAII resource management.",
    difficulty: "INTERMEDIATE",
    technologies: ["C++17", "OOP Polymorphism", "Virtual Methods", "STL Containers", "RAII"],
    skillsGained: [
      "Inheritance & Virtual Methods",
      "STL std::vector & std::map",
      "Exception Safety",
      "Modern Memory Management (std::unique_ptr)",
    ],
    requiredConcepts: [
      "cpp-classes-and-encapsulation",
      "cpp-references-and-const",
      "cpp-inheritance-and-polymorphism",
      "cpp-templates-and-stl",
    ],
    architectureOverview:
      "Polymorphic `Account` base class with derived `SavingsAccount` and `CheckingAccount`, managed by a `BankLedger` controller.",
    starterCode: `#include <iostream>\n#include <vector>\n#include <memory>\n\nclass Account {\npublic:\n    virtual ~Account() = default;\n    virtual void deposit(double amount) = 0;\n    virtual bool withdraw(double amount) = 0;\n};\n\nint main() {\n    std::cout << "Bank Ledger initialized." << std::endl;\n    return 0;\n}\n`,
    milestones: [
      {
        id: "m1-account-hierarchy",
        order: 1,
        title: "Milestone 1: Polymorphic Account Hierarchy",
        description: "Create the abstract `Account` interface and specialized `SavingsAccount` with interest calculation.",
        status: "NOT_STARTED",
        requiredConcepts: ["cpp-classes-and-encapsulation", "cpp-inheritance-and-polymorphism"],
        deliverables: ["Abstract `Account` class", "`SavingsAccount` & `CheckingAccount`"],
        tasks: [
          { id: "t1", title: "Implement abstract Account class with virtual destructor", completed: false },
          { id: "t2", title: "Implement derived SavingsAccount with annual interest logic", completed: false },
          { id: "t3", title: "Implement CheckingAccount with overdraft fee protection", completed: false },
        ],
      },
      {
        id: "m2-transaction-ledger",
        order: 2,
        title: "Milestone 2: STL Transaction History & Smart Pointers",
        description: "Manage accounts using `std::vector<std::unique_ptr<Account>>` and log audit records.",
        status: "NOT_STARTED",
        requiredConcepts: ["cpp-templates-and-stl"],
        deliverables: ["`Transaction` struct", "`BankLedger` class with `unique_ptr` container"],
        tasks: [
          { id: "t4", title: "Use modern smart pointers (std::unique_ptr) for account storage", completed: false },
          { id: "t5", title: "Record timestamped transaction logs in STL map", completed: false },
        ],
      },
    ],
  },

  // PYTHON PROJECT
  {
    id: "py-expense-analyzer",
    course: "python",
    title: "AI-Powered Personal Expense Analyzer",
    description:
      "Build a complete personal finance tool featuring CSV imports, budget categorization, statistical insights, and automated anomaly detection.",
    difficulty: "BEGINNER",
    technologies: ["Python 3.11", "Data Structures", "File Processing", "Exceptions", "Math/Stats"],
    skillsGained: [
      "List Comprehensions & Dictionaries",
      "CSV Parsing & File Handling",
      "Custom Exception Classes",
      "Data Aggregation & Analysis",
    ],
    requiredConcepts: [
      "py-variables-and-data-types",
      "py-control-flow-and-loops",
      "py-functions-and-scope",
      "py-data-structures-lists-dicts",
    ],
    architectureOverview:
      "Modular CLI and engine: `tracker.py` for storage, `analyzer.py` for aggregation math, and `storage.py` for persistence.",
    starterCode: `import csv\n\nclass ExpenseTracker:\n    def __init__(self):\n        self.expenses = []\n\n    def add_expense(self, category, amount, date):\n        self.expenses.append({"category": category, "amount": float(amount), "date": date})\n\nif __name__ == "__main__":\n    print("Expense Analyzer initialized.")\n`,
    milestones: [
      {
        id: "m1-core-tracker",
        order: 1,
        title: "Milestone 1: Core Expense Tracker & Data Validation",
        description: "Implement data structures to capture, validate, and categorize expenses.",
        status: "NOT_STARTED",
        requiredConcepts: ["py-variables-and-data-types", "py-data-structures-lists-dicts"],
        deliverables: ["`ExpenseTracker` class", "Input validation routines"],
        tasks: [
          { id: "t1", title: "Build Expense dictionary model with category tag validation", completed: false },
          { id: "t2", title: "Implement custom InvalidExpenseError exception", completed: false },
        ],
      },
      {
        id: "m2-analytics-engine",
        order: 2,
        title: "Milestone 2: Spending Analytics & Category Aggregations",
        description: "Calculate total expenses, category percentages, and highest spend alerts.",
        status: "NOT_STARTED",
        requiredConcepts: ["py-functions-and-scope", "py-data-structures-lists-dicts"],
        deliverables: ["`calculate_category_breakdown()`", "`detect_overspending()`"],
        tasks: [
          { id: "t3", title: "Use dict aggregations to sum totals per category", completed: false },
          { id: "t4", title: "Generate summary percentage breakdown report", completed: false },
        ],
      },
    ],
  },

  // JAVA PROJECT
  {
    id: "java-library-catalog",
    course: "java",
    title: "Enterprise Library Catalog & Loan Manager",
    description:
      "Develop a multi-tier library system featuring interfaces, generic collections, book loan tracking, and multi-user membership management.",
    difficulty: "INTERMEDIATE",
    technologies: ["Java 17", "Interfaces", "Generics", "Collections Framework", "Streams API"],
    skillsGained: [
      "Interface-Based Architecture",
      "Generics & Collections (List, Map, Set)",
      "Custom Checked Exceptions",
      "Clean Object-Oriented Principles",
    ],
    requiredConcepts: [
      "java-jvm-and-types",
      "java-classes-and-objects",
      "java-inheritance-and-interfaces",
      "java-collections-and-generics",
    ],
    architectureOverview:
      "`Book` & `Member` entities with `CatalogService` implementing `Loanable` interface, backed by Java Collections.",
    starterCode: `import java.util.*;\n\npublic class LibrarySystem {\n    public static void main(String[] args) {\n        System.out.println("Library Catalog Engine initialized.");\n    }\n}\n`,
    milestones: [
      {
        id: "m1-domain-entities",
        order: 1,
        title: "Milestone 1: Domain Entities & Interface Contracts",
        description: "Design `Book`, `Member`, and the `LoanService` interface specification.",
        status: "NOT_STARTED",
        requiredConcepts: ["java-classes-and-objects", "java-inheritance-and-interfaces"],
        deliverables: ["`Book` and `Member` classes", "`LoanService` interface contract"],
        tasks: [
          { id: "t1", title: "Implement Book entity with ISBN and checkout state", completed: false },
          { id: "t2", title: "Declare LoanService interface for issue and return contracts", completed: false },
        ],
      },
      {
        id: "m2-collections-engine",
        order: 2,
        title: "Milestone 2: Generic Collections & Search Service",
        description: "Manage book inventories and member borrowing limits using `Map<String, Book>` and `List<Loan>`.",
        status: "NOT_STARTED",
        requiredConcepts: ["java-collections-and-generics"],
        deliverables: ["`LibraryCatalog` implementation with Java Collections"],
        tasks: [
          { id: "t3", title: "Store catalog in HashMap for O(1) ISBN lookups", completed: false },
          { id: "t4", title: "Implement borrow limit validation and exception throwing", completed: false },
        ],
      },
    ],
  },
];
