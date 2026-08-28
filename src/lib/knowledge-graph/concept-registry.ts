import { ConceptNode, ConceptEdge, SupportedCourse } from "./types";

export const CANONICAL_CONCEPTS: ConceptNode[] = [
  // ==========================================
  // PYTHON CONCEPTS
  // ==========================================
  {
    id: "py-var-types",
    slug: "py-variables-and-data-types",
    name: "Variables & Dynamic Types",
    course: "python",
    chapterOrder: 0,
    topicName: "1. What is Programming?",
    category: "Basics",
    difficulty: "BEGINNER",
    description: "Dynamic variable declaration, primitives, and memory references in Python.",
    skills: ["Variable Assignment", "Type Identification"],
  },
  {
    id: "py-control-flow",
    slug: "py-control-flow-and-loops",
    name: "Control Flow & Loops",
    course: "python",
    chapterOrder: 1,
    topicName: "1. If-Else Decisions",
    category: "Control Flow",
    difficulty: "BEGINNER",
    description: "Conditional branching (if/elif/else), while loops, and for-in iteration.",
    skills: ["Branching Logic", "Iterative Execution"],
  },
  {
    id: "py-functions",
    slug: "py-functions-and-scope",
    name: "Functions, Parameters & Scope",
    course: "python",
    chapterOrder: 2,
    topicName: "1. Defining Functions with def",
    category: "Modularity",
    difficulty: "BEGINNER",
    description: "Function definition, default args, *args/**kwargs, return values, and LEGB scope.",
    skills: ["Function Design", "Scope Management"],
  },
  {
    id: "py-data-structures",
    slug: "py-lists-tuples-dicts",
    name: "Core Data Structures (Lists, Dicts, Sets)",
    course: "python",
    chapterOrder: 3,
    topicName: "1. Lists: Dynamic Arrays",
    category: "Data Structures",
    difficulty: "INTERMEDIATE",
    description: "Mutable lists, immutable tuples, hash-map dictionaries, and unique sets.",
    skills: ["Collection Manipulation", "Lookup Optimization"],
  },
  {
    id: "py-oop",
    slug: "py-classes-and-objects",
    name: "Object-Oriented Programming & Dunder Methods",
    course: "python",
    chapterOrder: 6,
    topicName: "1. Classes, Instances, and self",
    category: "OOP",
    difficulty: "INTERMEDIATE",
    description: "Class instantiation, self parameter, inheritance, __init__, and special dunder methods.",
    skills: ["OOP Architecture", "Dunder Method Overrides"],
  },
  {
    id: "py-error-handling",
    slug: "py-exception-handling",
    name: "Exception Handling & Robustness",
    course: "python",
    chapterOrder: 5,
    topicName: "1. Try, Except, Finally",
    category: "Robustness",
    difficulty: "INTERMEDIATE",
    description: "Defensive programming with try/except/else/finally and custom exceptions.",
    skills: ["Error Trapping", "Defensive Code"],
  },

  // ==========================================
  // C CONCEPTS
  // ==========================================
  {
    id: "c-variables-types",
    slug: "c-variables-and-memory",
    name: "C Primitive Types & Memory Alignment",
    course: "c",
    chapterOrder: 0,
    topicName: "1. Structure of a C Program",
    category: "Basics",
    difficulty: "BEGINNER",
    description: "Static typing, sizeof(), stack storage, and formatted I/O in standard C.",
    skills: ["Type Selection", "Stack Layout Understanding"],
  },
  {
    id: "c-pointers",
    slug: "c-pointers-and-addresses",
    name: "Pointers & Memory Addresses",
    course: "c",
    chapterOrder: 3,
    topicName: "1. Address-of (&) and Dereference (*)",
    category: "Memory & Pointers",
    difficulty: "INTERMEDIATE",
    description: "Pointer declaration, address-of (&), dereferencing (*), and NULL pointer safety.",
    skills: ["Pointer Manipulation", "Address Resolution"],
  },
  {
    id: "c-pointer-arithmetic",
    slug: "c-pointer-arithmetic-arrays",
    name: "Pointer Arithmetic & Array Navigation",
    course: "c",
    chapterOrder: 3,
    topicName: "2. Pointer Arithmetic and Arrays",
    category: "Memory & Pointers",
    difficulty: "INTERMEDIATE",
    description: "Offset calculations based on type byte width, array-pointer equivalence, and buffer traversal.",
    skills: ["Buffer Traversal", "Byte Offset Calculation"],
  },
  {
    id: "c-dynamic-memory",
    slug: "c-dynamic-memory-allocation",
    name: "Dynamic Memory Allocation (malloc, free)",
    course: "c",
    chapterOrder: 4,
    topicName: "1. Heap vs Stack Memory",
    category: "Heap Management",
    difficulty: "ADVANCED",
    description: "Heap allocation with malloc/calloc/realloc, freeing memory, avoiding memory leaks and dangling pointers.",
    skills: ["Heap Lifecycle Management", "Memory Leak Prevention"],
  },
  {
    id: "c-structs",
    slug: "c-structures-and-typedef",
    name: "Structures (struct), Typedef & Padding",
    course: "c",
    chapterOrder: 5,
    topicName: "1. Defining and Using Structs",
    category: "Custom Types",
    difficulty: "INTERMEDIATE",
    description: "Composite data types, member access (.), pointer member access (->), and alignment padding.",
    skills: ["Custom Type Layout", "Complex Data Modeling"],
  },

  // ==========================================
  // C++ CONCEPTS
  // ==========================================
  {
    id: "cpp-references",
    slug: "cpp-references-and-const",
    name: "References, const & Namespaces",
    course: "cpp",
    chapterOrder: 0,
    topicName: "1. C++ vs C Paradigm Shifts",
    category: "Basics & Idioms",
    difficulty: "BEGINNER",
    description: "Pass-by-reference (&), const correctness, and namespace scoping in modern C++.",
    skills: ["Reference Passing", "Const Correctness"],
  },
  {
    id: "cpp-classes-oop",
    slug: "cpp-classes-and-encapsulation",
    name: "Classes, Constructors & Encapsulation",
    course: "cpp",
    chapterOrder: 1,
    topicName: "1. Classes, Access Specifiers, and Members",
    category: "OOP",
    difficulty: "INTERMEDIATE",
    description: "Access specifiers (private, public, protected), constructors, initializer lists, and destructors.",
    skills: ["Class Design", "Resource Construction/Destruction"],
  },
  {
    id: "cpp-inheritance-polymorphism",
    slug: "cpp-virtual-functions-polymorphism",
    name: "Inheritance, Virtual Functions & Polymorphism",
    course: "cpp",
    chapterOrder: 2,
    topicName: "1. Base and Derived Classes",
    category: "OOP",
    difficulty: "ADVANCED",
    description: "Single and multiple inheritance, vtables, virtual functions, override specifier, and runtime polymorphism.",
    skills: ["Dynamic Dispatch", "Polymorphic Hierarchy Design"],
  },
  {
    id: "cpp-templates-stl",
    slug: "cpp-templates-and-stl",
    name: "Templates & Standard Template Library (STL)",
    course: "cpp",
    chapterOrder: 3,
    topicName: "1. Function and Class Templates",
    category: "Generic Programming",
    difficulty: "ADVANCED",
    description: "Generic programming, template parameters, std::vector, std::map, algorithms, and iterators.",
    skills: ["Generic Data Structures", "STL Optimization"],
  },

  // ==========================================
  // JAVA CONCEPTS
  // ==========================================
  {
    id: "java-jvm-basics",
    slug: "java-jvm-and-types",
    name: "JVM Architecture, Bytecode & Strong Typing",
    course: "java",
    chapterOrder: 0,
    topicName: "1. Java Platform & Compilation Model",
    category: "Platform Architecture",
    difficulty: "BEGINNER",
    description: "Java virtual machine (JVM), bytecode verification, primitive types, and object wrappers.",
    skills: ["JVM Execution Model", "Type Safety"],
  },
  {
    id: "java-classes-objects",
    slug: "java-classes-and-methods",
    name: "Classes, Objects & Heap Garbage Collection",
    course: "java",
    chapterOrder: 1,
    topicName: "1. Object Creation and new Keyword",
    category: "OOP Core",
    difficulty: "INTERMEDIATE",
    description: "Class definitions, references on the stack, objects on the heap, and garbage collection.",
    skills: ["Reference Model", "Memory Management"],
  },
  {
    id: "java-inheritance-interfaces",
    slug: "java-interfaces-and-polymorphism",
    name: "Inheritance, Abstract Classes & Interfaces",
    course: "java",
    chapterOrder: 2,
    topicName: "1. Extending Classes with extends",
    category: "OOP Architecture",
    difficulty: "ADVANCED",
    description: "Class extension, interface implementation, default methods, and dynamic method dispatch.",
    skills: ["Interface-Driven Architecture", "Subtype Polymorphism"],
  },
  {
    id: "java-collections",
    slug: "java-collections-and-generics",
    name: "Collections Framework (List, Map, Set) & Generics",
    course: "java",
    chapterOrder: 3,
    topicName: "1. ArrayList and LinkedList",
    category: "Collections",
    difficulty: "ADVANCED",
    description: "Type-safe collections, ArrayList, HashMap, HashSet, and generic type parameters.",
    skills: ["Collection Data Modeling", "Generic Type Parameters"],
  },
];

export const CANONICAL_PREREQUISITES: ConceptEdge[] = [
  // C Prerequisites
  {
    fromConceptSlug: "c-variables-and-memory",
    toConceptSlug: "c-pointers-and-addresses",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "c-pointers-and-addresses",
    toConceptSlug: "c-pointer-arithmetic-arrays",
    relation: "REQUIRES",
    weight: 0.9,
  },
  {
    fromConceptSlug: "c-pointers-and-addresses",
    toConceptSlug: "c-dynamic-memory-allocation",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "c-variables-and-memory",
    toConceptSlug: "c-structures-and-typedef",
    relation: "REQUIRES",
    weight: 0.8,
  },
  {
    fromConceptSlug: "c-pointers-and-addresses",
    toConceptSlug: "c-structures-and-typedef",
    relation: "APPLIES",
    weight: 0.85,
  },

  // C++ Prerequisites
  {
    fromConceptSlug: "cpp-references-and-const",
    toConceptSlug: "cpp-classes-and-encapsulation",
    relation: "REQUIRES",
    weight: 0.9,
  },
  {
    fromConceptSlug: "cpp-classes-and-encapsulation",
    toConceptSlug: "cpp-virtual-functions-polymorphism",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "cpp-classes-and-encapsulation",
    toConceptSlug: "cpp-templates-and-stl",
    relation: "REQUIRES",
    weight: 0.85,
  },

  // Python Prerequisites
  {
    fromConceptSlug: "py-variables-and-data-types",
    toConceptSlug: "py-control-flow-and-loops",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "py-control-flow-and-loops",
    toConceptSlug: "py-functions-and-scope",
    relation: "REQUIRES",
    weight: 0.95,
  },
  {
    fromConceptSlug: "py-functions-and-scope",
    toConceptSlug: "py-lists-tuples-dicts",
    relation: "REQUIRES",
    weight: 0.85,
  },
  {
    fromConceptSlug: "py-functions-and-scope",
    toConceptSlug: "py-classes-and-objects",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "py-functions-and-scope",
    toConceptSlug: "py-exception-handling",
    relation: "REQUIRES",
    weight: 0.8,
  },

  // Java Prerequisites
  {
    fromConceptSlug: "java-jvm-and-types",
    toConceptSlug: "java-classes-and-methods",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "java-classes-and-methods",
    toConceptSlug: "java-interfaces-and-polymorphism",
    relation: "REQUIRES",
    weight: 1.0,
  },
  {
    fromConceptSlug: "java-interfaces-and-polymorphism",
    toConceptSlug: "java-collections-and-generics",
    relation: "REQUIRES",
    weight: 0.9,
  },
];

export function getConceptsByCourse(course: SupportedCourse): ConceptNode[] {
  return CANONICAL_CONCEPTS.filter((c) => c.course === course);
}

export function findConceptByTopic(course: SupportedCourse, topicName: string): ConceptNode | undefined {
  const normTopic = topicName.toLowerCase().trim();
  return CANONICAL_CONCEPTS.find(
    (c) =>
      c.course === course &&
      (c.name.toLowerCase().includes(normTopic) ||
        normTopic.includes(c.name.toLowerCase()) ||
        (c.topicName && normTopic.includes(c.topicName.toLowerCase())) ||
        (c.topicName && c.topicName.toLowerCase().includes(normTopic)))
  );
}

export function getPrerequisitesForConcept(conceptSlug: string): ConceptNode[] {
  const prereqSlugs = CANONICAL_PREREQUISITES
    .filter((edge) => edge.toConceptSlug === conceptSlug && edge.relation === "REQUIRES")
    .map((edge) => edge.fromConceptSlug);

  return CANONICAL_CONCEPTS.filter((c) => prereqSlugs.includes(c.slug));
}
