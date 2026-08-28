import {
  AdaptiveAnswerEvaluation,
  AdaptiveQuestion,
  AssessmentDifficulty,
  EvaluateAdaptiveAnswerParams,
  GetAdaptiveQuestionParams,
} from "./types";
import { getStudentKnowledgeState, recordLearningEvidence } from "../knowledge-graph/graph-service";
import {
  CANONICAL_CONCEPTS,
  findConceptByTopic,
} from "../knowledge-graph/concept-registry";
import { SupportedCourse } from "../knowledge-graph/types";

// Dynamic question bank generator per concept and difficulty
const ADAPTIVE_QUESTION_BANK: Record<
  string,
  Record<AssessmentDifficulty, Array<Omit<AdaptiveQuestion, "id" | "fingerprint">>>
> = {
  // C: Pointers and Memory
  "c-pointers-and-addresses": {
    EASY: [
      {
        course: "c",
        chapterId: "c-ch3",
        topic: "Address-of (&) and Dereference (*)",
        conceptSlug: "c-pointers-and-addresses",
        conceptName: "Pointers & Memory Addresses",
        type: "MULTIPLE_CHOICE",
        difficulty: "EASY",
        question: "In C, which operator is used to obtain the memory address of an integer variable `num`?",
        options: ["*num", "&num", "%num", "->num"],
        correctOptionIndex: 1,
        hint: "The ampersand operator extracts the physical memory address of a variable.",
        explanation: "`&num` returns the hexadecimal address where `num` resides in stack memory.",
        pedagogicalGoal: "Verify foundational grasp of the address-of operator (&).",
      },
      {
        course: "c",
        chapterId: "c-ch3",
        topic: "Address-of (&) and Dereference (*)",
        conceptSlug: "c-pointers-and-addresses",
        conceptName: "Pointers & Memory Addresses",
        type: "CODE_OUTPUT",
        difficulty: "EASY",
        question: "What does the following C code output?\n```c\nint x = 42;\nint *ptr = &x;\nprintf(\"%d\", *ptr);\n```",
        options: ["The memory address of x", "42", "0", "Compilation Error"],
        correctOptionIndex: 1,
        hint: "The asterisk (*) before a pointer variable dereferences it to read the stored value.",
        explanation: "Dereferencing `*ptr` accesses the value stored at `&x`, which is 42.",
        pedagogicalGoal: "Verify pointer dereference read operation.",
      },
    ],
    MEDIUM: [
      {
        course: "c",
        chapterId: "c-ch3",
        topic: "Pointer Arithmetic and Arrays",
        conceptSlug: "c-pointers-and-addresses",
        conceptName: "Pointers & Memory Addresses",
        type: "DEBUGGING",
        difficulty: "MEDIUM",
        question: "What is the danger in the following C code snippet?\n```c\nint *p = NULL;\n*p = 100;\n```",
        options: [
          "Memory leak occurs",
          "Segmentation fault / NULL pointer dereference crash",
          "x becomes 100",
          "Garbage value is printed",
        ],
        correctOptionIndex: 1,
        hint: "Writing to address 0 (NULL) is forbidden by the operating system memory protection.",
        explanation: "Dereferencing a NULL pointer leads to undefined behavior and an immediate Segmentation Fault.",
        pedagogicalGoal: "Test defensive programming and memory safety.",
      },
    ],
    HARD: [
      {
        course: "c",
        chapterId: "c-ch3",
        topic: "Pointer to Pointer and Aliasing",
        conceptSlug: "c-pointers-and-addresses",
        conceptName: "Pointers & Memory Addresses",
        type: "CODE_REASONING",
        difficulty: "HARD",
        question: "What is printed by this double pointer operation?\n```c\nint a = 10, b = 20;\nint *p = &a;\nint **pp = &p;\n*pp = &b;\n**pp += 5;\nprintf(\"a=%d, b=%d, *p=%d\", a, b, *p);\n```",
        options: [
          "a=15, b=20, *p=15",
          "a=10, b=25, *p=25",
          "a=15, b=25, *p=25",
          "a=10, b=20, *p=20",
        ],
        correctOptionIndex: 1,
        hint: "`*pp = &b` rebinds pointer `p` to point to `b`. Then `**pp += 5` modifies `b`.",
        explanation: "`*pp` changes `p` to point to `b`. Incrementing `**pp` updates `b` from 20 to 25. `a` remains 10.",
        pedagogicalGoal: "Evaluate multi-level pointer redirection and mutation.",
      },
    ],
  },

  // C++: OOP, Classes, Virtual Functions
  "cpp-classes-and-encapsulation": {
    EASY: [
      {
        course: "cpp",
        chapterId: "cpp-ch1",
        topic: "Classes, Access Specifiers, and Members",
        conceptSlug: "cpp-classes-and-encapsulation",
        conceptName: "Classes, Constructors & Encapsulation",
        type: "MULTIPLE_CHOICE",
        difficulty: "EASY",
        question: "In C++, what is the default access specifier for members of a `class` if none is explicitly specified?",
        options: ["public", "private", "protected", "internal"],
        correctOptionIndex: 1,
        hint: "Unlike `struct` where members are public by default, `class` members are restricted by default.",
        explanation: "In C++ classes, all members declared before an access specifier are `private`.",
        pedagogicalGoal: "Test fundamental class encapsulation defaults.",
      },
    ],
    MEDIUM: [
      {
        course: "cpp",
        chapterId: "cpp-ch2",
        topic: "Virtual Functions & Polymorphism",
        conceptSlug: "cpp-classes-and-encapsulation",
        conceptName: "Classes, Constructors & Encapsulation",
        type: "CODE_REASONING",
        difficulty: "MEDIUM",
        question: "Why should a base class destructor in C++ almost always be declared as `virtual`?",
        options: [
          "To speed up object construction",
          "To ensure derived class destructors are called when deleting via a base pointer",
          "To prevent the class from being instantiated",
          "To allow destructors to take arguments",
        ],
        correctOptionIndex: 1,
        hint: "Without a virtual destructor, deleting a derived object via a `Base*` only calls the base destructor, leaking derived resources.",
        explanation: "`virtual ~Base()` ensures the dynamic runtime dispatch invokes the derived destructor first, preventing resource/memory leaks.",
        pedagogicalGoal: "Verify understanding of polymorphic destruction safety.",
      },
    ],
    HARD: [
      {
        course: "cpp",
        chapterId: "cpp-ch2",
        topic: "Vtables and Dynamic Dispatch",
        conceptSlug: "cpp-classes-and-encapsulation",
        conceptName: "Classes, Constructors & Encapsulation",
        type: "SCENARIO",
        difficulty: "HARD",
        question: "Consider this polymorphic call in C++:\n```cpp\nclass Animal { public: virtual void sound() { cout << \"A\"; } };\nclass Dog : public Animal { public: void sound() override { cout << \"D\"; } };\nAnimal *a = new Dog();\na->sound();\n```\nWhat mechanism executes `Dog::sound()` at runtime?",
        options: [
          "Static function binding during preprocessing",
          "Vptr pointer dereferencing the Vtable lookup for Dog::sound",
          "RTTI dynamic_cast table lookup",
          "Compiler inline substitution",
        ],
        correctOptionIndex: 1,
        hint: "Each polymorphic object contains a hidden `vptr` pointing to the class's Virtual Method Table.",
        explanation: "The compiler uses the `vptr` inside the `Dog` instance to index the `vtable` and call `Dog::sound()` dynamically.",
        pedagogicalGoal: "Evaluate deep mental model of C++ vtable dynamic dispatch.",
      },
    ],
  },

  // Python: Data Structures, Control Flow, Functions
  "py-variables-and-data-types": {
    EASY: [
      {
        course: "python",
        chapterId: "py-ch0",
        topic: "1. What is Programming?",
        conceptSlug: "py-variables-and-data-types",
        conceptName: "Variables & Dynamic Types",
        type: "MULTIPLE_CHOICE",
        difficulty: "EASY",
        question: "In Python, which of the following is an IMMUTABLE data type?",
        options: ["list", "dict", "tuple", "set"],
        correctOptionIndex: 2,
        hint: "Once created, elements of a tuple cannot be added, removed, or replaced in-place.",
        explanation: "Tuples and strings are immutable in Python, whereas lists, dicts, and sets are mutable.",
        pedagogicalGoal: "Verify core mutability vs immutability concept.",
      },
    ],
    MEDIUM: [
      {
        course: "python",
        chapterId: "py-ch3",
        topic: "1. Lists: Dynamic Arrays",
        conceptSlug: "py-variables-and-data-types",
        conceptName: "Variables & Dynamic Types",
        type: "CODE_OUTPUT",
        difficulty: "MEDIUM",
        question: "What is the result of the following Python list comprehension?\n```python\nnums = [1, 2, 3, 4, 5]\nres = [x * 2 for x in nums if x % 2 != 0]\nprint(res)\n```",
        options: ["[2, 6, 10]", "[4, 8]", "[2, 4, 6, 8, 10]", "[1, 3, 5]"],
        correctOptionIndex: 0,
        hint: "Filter for odd numbers (1, 3, 5), then multiply each by 2.",
        explanation: "Odd numbers are 1, 3, 5. Multiplying each by 2 produces `[2, 6, 10]`.",
        pedagogicalGoal: "Test comprehension syntax, filtering, and transformation.",
      },
    ],
    HARD: [
      {
        course: "python",
        chapterId: "py-ch2",
        topic: "1. Defining Functions with def",
        conceptSlug: "py-variables-and-data-types",
        conceptName: "Variables & Dynamic Types",
        type: "DEBUGGING",
        difficulty: "HARD",
        question: "What dangerous bug exists in this Python function definition?\n```python\ndef append_item(val, target_list=[]):\n    target_list.append(val)\n    return target_list\n```",
        options: [
          "TypeError on invocation",
          "The default mutable list is shared across all function calls, persisting state unintentionally",
          "SyntaxError because default arguments cannot be lists",
          "Memory leak due to circular reference",
        ],
        correctOptionIndex: 1,
        hint: "Default argument expressions are evaluated once when the function is defined, not upon each call.",
        explanation: "The default `[]` is created once. Subsequent calls share that same list object unless overridden.",
        pedagogicalGoal: "Test understanding of Python default argument binding and object identity.",
      },
    ],
  },

  // Java: OOP, Interfaces, Collections
  "java-jvm-and-types": {
    EASY: [
      {
        course: "java",
        chapterId: "java-ch0",
        topic: "1. Java Platform & Compilation Model",
        conceptSlug: "java-jvm-and-types",
        conceptName: "JVM Architecture, Bytecode & Strong Typing",
        type: "MULTIPLE_CHOICE",
        difficulty: "EASY",
        question: "What intermediate format is generated by the Java compiler (`javac`) from source code?",
        options: ["Machine Code", "Bytecode (.class)", "Assembly Code", "C Source Code"],
        correctOptionIndex: 1,
        hint: "Java compiles to platform-independent bytecode executed by the JVM.",
        explanation: "`javac` compiles `.java` files into `.class` bytecode files executed by the Java Virtual Machine.",
        pedagogicalGoal: "Verify Java WORA (Write Once, Run Anywhere) architecture.",
      },
    ],
    MEDIUM: [
      {
        course: "java",
        chapterId: "java-ch2",
        topic: "1. Extending Classes with extends",
        conceptSlug: "java-jvm-and-types",
        conceptName: "JVM Architecture, Bytecode & Strong Typing",
        type: "CODE_REASONING",
        difficulty: "MEDIUM",
        question: "Can a Java class inherit from multiple classes using `extends`?",
        options: [
          "Yes, using commas like `extends A, B`",
          "No, Java supports single class inheritance to avoid the diamond problem, but allows multiple interface implementation",
          "Yes, but only if both are abstract classes",
          "Only in Java 8 and higher",
        ],
        correctOptionIndex: 1,
        hint: "Java prevents diamond inheritance ambiguities by permitting single class inheritance and multiple interface implementation.",
        explanation: "A Java class can extend exactly one class, but implement multiple interfaces (`implements InterfaceA, InterfaceB`).",
        pedagogicalGoal: "Test inheritance constraints and interface usage in Java.",
      },
    ],
    HARD: [
      {
        course: "java",
        chapterId: "java-ch3",
        topic: "1. ArrayList and LinkedList",
        conceptSlug: "java-jvm-and-types",
        conceptName: "JVM Architecture, Bytecode & Strong Typing",
        type: "SCENARIO",
        difficulty: "HARD",
        question: "What is the time complexity of `get(int index)` on an `ArrayList<T>` vs a `LinkedList<T>` in Java?",
        options: [
          "ArrayList: O(1), LinkedList: O(n)",
          "ArrayList: O(n), LinkedList: O(1)",
          "Both are O(1)",
          "Both are O(log n)",
        ],
        correctOptionIndex: 0,
        hint: "`ArrayList` is backed by a contiguous array with direct offset math; `LinkedList` requires pointer traversal from head/tail.",
        explanation: "Array indexing provides constant time $O(1)$ random access, whereas linked node traversal requires $O(n)$ steps.",
        pedagogicalGoal: "Evaluate algorithmic complexity trade-offs in Collections Framework.",
      },
    ],
  },
};

/**
 * Generate fingerprint hash to prevent duplicate questions
 */
function createQuestionFingerprint(questionText: string, conceptSlug: string): string {
  return `${conceptSlug}::${questionText.slice(0, 32).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

/**
 * Select the next optimal adaptive assessment question based on student's Knowledge Graph state
 */
export async function getNextAdaptiveQuestion(
  params: GetAdaptiveQuestionParams
): Promise<AdaptiveQuestion> {
  const { userId, course, topic, preferredDifficulty, excludeFingerprints = [] } = params;

  // 1. Query Knowledge Graph State
  const state = await getStudentKnowledgeState(userId, course);

  // 2. Determine Target Concept using Pedagogical Priority:
  //    WEAK CONCEPT -> PREREQUISITE GAP -> DEVELOPING CONCEPT -> UNSEEN CONCEPT -> REINFORCE STRONG
  let targetConceptSlug: string;

  if (topic) {
    const matched = findConceptByTopic(course, topic);
    targetConceptSlug = matched ? matched.slug : "";
  } else {
    targetConceptSlug = "";
  }

  if (!targetConceptSlug) {
    if (state.weakConcepts.length > 0) {
      targetConceptSlug = state.weakConcepts[0].slug;
    } else if (state.prerequisiteGaps.length > 0 && state.prerequisiteGaps[0].missingPrerequisites.length > 0) {
      targetConceptSlug = state.prerequisiteGaps[0].missingPrerequisites[0].slug;
    } else if (state.developingConcepts.length > 0) {
      targetConceptSlug = state.developingConcepts[0].slug;
    } else if (state.unseenConcepts.length > 0) {
      targetConceptSlug = state.unseenConcepts[0].slug;
    } else if (state.strongConcepts.length > 0) {
      targetConceptSlug = state.strongConcepts[0].slug;
    } else {
      const allCourseConcepts = CANONICAL_CONCEPTS.filter((c) => c.course === course);
      targetConceptSlug = allCourseConcepts[0]?.slug || "py-variables-and-data-types";
    }
  }

  // 3. Determine Adaptive Difficulty
  let difficulty: AssessmentDifficulty = preferredDifficulty || "MEDIUM";
  if (!preferredDifficulty) {
    if (state.weakConcepts.some((c) => c.slug === targetConceptSlug)) {
      difficulty = "EASY";
    } else if (state.developingConcepts.some((c) => c.slug === targetConceptSlug)) {
      difficulty = "MEDIUM";
    } else if (state.strongConcepts.some((c) => c.slug === targetConceptSlug)) {
      difficulty = "HARD";
    }
  }

  // 4. Retrieve Question from Concept Bank
  const conceptBank = ADAPTIVE_QUESTION_BANK[targetConceptSlug] || Object.values(ADAPTIVE_QUESTION_BANK)[0];
  const questionsForDiff = conceptBank[difficulty] || conceptBank["MEDIUM"] || conceptBank["EASY"];

  // Filter out recent questions to avoid repetition
  let selected = questionsForDiff.find(
    (q) => !excludeFingerprints.includes(createQuestionFingerprint(q.question, targetConceptSlug))
  );

  if (!selected) {
    selected = questionsForDiff[0];
  }

  const fingerprint = createQuestionFingerprint(selected.question, targetConceptSlug);

  return {
    ...selected,
    id: `adaptive_${course}_${targetConceptSlug}_${Date.now()}`,
    fingerprint,
  };
}

/**
 * Evaluate an adaptive assessment response, update Knowledge Graph, and decide next action
 */
export async function evaluateAdaptiveAnswer(
  params: EvaluateAdaptiveAnswerParams
): Promise<AdaptiveAnswerEvaluation> {
  const {
    userId,
    userEmail,
    course,
    chapterId,
    topic,
    conceptSlug,
    question,
    studentAnswer,
    difficulty,
    options,
    correctOptionIndex,
    expectedExplanation,
  } = params;

  let score = 0;
  let result: "CORRECT" | "PARTIAL" | "INCORRECT" = "INCORRECT";
  let appreciation = "Good attempt.";
  let whatWasCorrect = "";
  let whatIsMissing = "";
  let feedback = "";
  let explanation = expectedExplanation || "Review the fundamental mechanics of this concept.";
  let needsFollowUp = false;
  let followUpQuestion: string | undefined;

  const cleanAns = studentAnswer.trim().toLowerCase();

  // 1. Multiple Choice Evaluation
  if (options && typeof correctOptionIndex === "number") {
    const selectedIdx = parseInt(cleanAns, 10);
    const isExactIndex = !isNaN(selectedIdx) && selectedIdx === correctOptionIndex;
    const isTextMatch = options[correctOptionIndex]?.toLowerCase().trim() === cleanAns;

    if (isExactIndex || isTextMatch) {
      score = 100;
      result = "CORRECT";
      appreciation = "Outstanding! 🎉";
      whatWasCorrect = `Accurately identified: "${options[correctOptionIndex]}"`;
      feedback = "You demonstrated strong conceptual precision.";
    } else {
      score = 25;
      result = "INCORRECT";
      appreciation = "Good try.";
      whatIsMissing = `The correct answer was "${options[correctOptionIndex]}".`;
      feedback = `${whatIsMissing} ${explanation}`;
      needsFollowUp = true;
      followUpQuestion = `Can you describe why ${options[correctOptionIndex]} applies in this case?`;
    }
  } else {
    // 2. Open-ended / Code reasoning evaluation
    if (cleanAns.includes("don't know") || cleanAns.includes("not sure") || cleanAns.length < 3) {
      score = 15;
      result = "INCORRECT";
      appreciation = "That's completely fine. 👍";
      whatIsMissing = "Foundational recall needed.";
      feedback = "Let's break this down from first principles step-by-step.";
    } else if (cleanAns.length > 20) {
      score = 80;
      result = "PARTIAL";
      appreciation = "You're on the right track! 👍";
      whatWasCorrect = "Identified the primary mechanism.";
      whatIsMissing = "Ensure full edge case consideration.";
      feedback = "Good reasoning. Keep in mind the strict execution and type rules.";
    } else {
      score = 65;
      result = "PARTIAL";
      appreciation = "Decent start.";
      feedback = "Partial understanding shown.";
      needsFollowUp = true;
      followUpQuestion = "Can you expand on how this behaves in execution?";
    }
  }

  // 3. Next Difficulty & Action Recommendation
  let nextDifficulty: AssessmentDifficulty = difficulty;
  let nextRecommendation: "ADVANCE" | "PRACTICE" | "RETEACH" | "REVIEW_PREREQUISITE" = "PRACTICE";

  if (score >= 85) {
    nextDifficulty = difficulty === "EASY" ? "MEDIUM" : "HARD";
    nextRecommendation = "ADVANCE";
  } else if (score >= 60) {
    nextDifficulty = difficulty;
    nextRecommendation = "PRACTICE";
  } else {
    nextDifficulty = difficulty === "HARD" ? "MEDIUM" : "EASY";
    nextRecommendation = score < 35 ? "REVIEW_PREREQUISITE" : "RETEACH";
  }

  // 4. Update Knowledge Graph Learning Evidence
  if (userId) {
    await recordLearningEvidence({
      userId,
      userEmail,
      course: course as SupportedCourse,
      chapterId: chapterId || "general",
      topic: topic || "Assessment Checkpoint",
      conceptSlug,
      source: "QUIZ",
      score,
      summary: `${appreciation} Score: ${score}%. ${feedback}`,
      mistakes: whatIsMissing ? [whatIsMissing] : [],
      question,
      answer: studentAnswer,
    });
  }

  return {
    score,
    result,
    appreciation,
    whatWasCorrect,
    whatIsMissing,
    feedback,
    explanation,
    conceptsDemonstrated: score >= 70 && conceptSlug ? [conceptSlug] : [],
    conceptsMissed: score < 70 && conceptSlug ? [conceptSlug] : [],
    nextDifficulty,
    needsFollowUp,
    followUpQuestion,
    nextRecommendation,
  };
}
