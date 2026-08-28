import { CareerRoleDefinition } from "./types";

export const CAREER_ROLES: CareerRoleDefinition[] = [
  // 1. PYTHON AI & BACKEND DEVELOPER
  {
    id: "python-backend-engineer",
    title: "Python Backend & AI Developer",
    category: "Software Engineering",
    description:
      "Designs scalable backend services, REST APIs, data processing pipelines, and AI integration services using modern Python.",
    requiredSkills: [
      {
        name: "Python Fundamentals & Types",
        category: "Programming",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["py-variables-and-data-types"],
        course: "python",
      },
      {
        name: "Control Flow & Algorithms",
        category: "Logic",
        targetScore: 80,
        importance: "HIGH",
        relevantConcepts: ["py-control-flow-and-loops"],
        course: "python",
      },
      {
        name: "Functions & Scope",
        category: "Architecture",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["py-functions-and-scope"],
        course: "python",
      },
      {
        name: "Data Structures (Lists, Dicts, Sets)",
        category: "Data Structures",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["py-data-structures-lists-dicts"],
        course: "python",
      },
    ],
    recommendedSkills: [
      { name: "FastAPI / Django", targetScore: 70, course: "python" },
      { name: "SQL & Databases", targetScore: 75, course: "python" },
    ],
    projectExpectations: [
      "AI-Powered Personal Expense Analyzer",
      "RESTful API Service with Database Persistence",
    ],
    interviewTopics: [
      "Python GIL & Concurrency",
      "List Comprehensions & Generators",
      "Object Mutability & Argument Binding",
      "Data Structure Complexities (Dict lookup vs List search)",
    ],
  },

  // 2. SYSTEMS & EMBEDDED C DEVELOPER
  {
    id: "systems-c-engineer",
    title: "Systems & Embedded C Engineer",
    category: "Systems Engineering",
    description:
      "Engineers low-level systems, kernel modules, device drivers, and high-throughput embedded software in pure C.",
    requiredSkills: [
      {
        name: "Memory Architecture & Variables",
        category: "Systems",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["c-variables-and-memory"],
        course: "c",
      },
      {
        name: "Pointer Dereferencing & Arithmetic",
        category: "Memory Management",
        targetScore: 90,
        importance: "CRITICAL",
        relevantConcepts: ["c-pointers-and-addresses"],
        course: "c",
      },
      {
        name: "Dynamic Heap Allocation (malloc/free)",
        category: "Memory Management",
        targetScore: 90,
        importance: "CRITICAL",
        relevantConcepts: ["c-dynamic-memory-allocation"],
        course: "c",
      },
      {
        name: "Structures & Binary Data Models",
        category: "Data Structures",
        targetScore: 85,
        importance: "HIGH",
        relevantConcepts: ["c-structures-and-typedef"],
        course: "c",
      },
    ],
    recommendedSkills: [
      { name: "Linux System Calls & POSIX", targetScore: 75, course: "c" },
      { name: "Valgrind Memory Profiling", targetScore: 80, course: "c" },
    ],
    projectExpectations: [
      "Student Record Management System (Binary Serialization)",
      "Custom Shell & Process Dispatcher",
    ],
    interviewTopics: [
      "Stack vs Heap Memory Layout",
      "Dangling Pointers & Memory Leaks",
      "Pointer to Pointer Dereferencing",
      "Structure Padding and Word Alignment",
    ],
  },

  // 3. C++ SOFTWARE ARCHITECT
  {
    id: "cpp-software-engineer",
    title: "C++ Software & Systems Architect",
    category: "Software Architecture",
    description:
      "Develops high-performance distributed systems, game engines, financial ledger software, and robust OOP applications in modern C++.",
    requiredSkills: [
      {
        name: "Classes & Encapsulation",
        category: "OOP",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["cpp-classes-and-encapsulation"],
        course: "cpp",
      },
      {
        name: "References & Const Correctness",
        category: "Memory Safety",
        targetScore: 85,
        importance: "HIGH",
        relevantConcepts: ["cpp-references-and-const"],
        course: "cpp",
      },
      {
        name: "Inheritance & Polymorphism (Virtual Methods)",
        category: "OOP",
        targetScore: 90,
        importance: "CRITICAL",
        relevantConcepts: ["cpp-inheritance-and-polymorphism"],
        course: "cpp",
      },
      {
        name: "STL Containers & Templates",
        category: "Data Structures",
        targetScore: 85,
        importance: "HIGH",
        relevantConcepts: ["cpp-templates-and-stl"],
        course: "cpp",
      },
    ],
    recommendedSkills: [
      { name: "Smart Pointers & RAII", targetScore: 85, course: "cpp" },
      { name: "Multithreading & Mutexes", targetScore: 75, course: "cpp" },
    ],
    projectExpectations: [
      "Banking Ledger & Polymorphic Transaction Engine",
      "High-Performance Object-Oriented Cache",
    ],
    interviewTopics: [
      "Virtual Method Table (Vtable) & Dynamic Dispatch",
      "RAII Resource Management & Smart Pointers",
      "Copy vs Move Semantics (rvalue references)",
      "Exception Safety Guarantees",
    ],
  },

  // 4. JAVA ENTERPRISE DEVELOPER
  {
    id: "java-enterprise-developer",
    title: "Java Enterprise & Cloud Backend Engineer",
    category: "Enterprise Systems",
    description:
      "Builds enterprise microservices, banking platforms, and scalable cloud applications utilizing modern Java and the Spring ecosystem.",
    requiredSkills: [
      {
        name: "JVM Architecture & Strong Typing",
        category: "Architecture",
        targetScore: 85,
        importance: "HIGH",
        relevantConcepts: ["java-jvm-and-types"],
        course: "java",
      },
      {
        name: "Classes, Objects & Constructors",
        category: "OOP",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["java-classes-and-objects"],
        course: "java",
      },
      {
        name: "Inheritance & Interfaces Contract Design",
        category: "OOP",
        targetScore: 90,
        importance: "CRITICAL",
        relevantConcepts: ["java-inheritance-and-interfaces"],
        course: "java",
      },
      {
        name: "Collections Framework & Generics",
        category: "Data Structures",
        targetScore: 85,
        importance: "CRITICAL",
        relevantConcepts: ["java-collections-and-generics"],
        course: "java",
      },
    ],
    recommendedSkills: [
      { name: "Spring Boot Microservices", targetScore: 75, course: "java" },
      { name: "JPA & Hibernate ORM", targetScore: 75, course: "java" },
    ],
    projectExpectations: [
      "Enterprise Library Catalog & Loan Manager",
      "Multi-Tier Order Processing System",
    ],
    interviewTopics: [
      "Interface vs Abstract Class Contract Design",
      "HashMap Internal Hashing & Collision Handling",
      "Java Garbage Collection & Memory Model",
      "Checked vs Unchecked Exceptions",
    ],
  },
];
