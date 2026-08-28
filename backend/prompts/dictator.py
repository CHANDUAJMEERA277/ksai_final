# Universal AI Dictator Prompts & Structured Verification Generator
# KnowledgeStream AI — Codenthra IDE

def build_dictator_prompt(language: str, project: str, level: str = "beginner") -> str:
    norm_lang = (language or "Java").strip()
    lower = norm_lang.lower()
    if lower in ["cpp", "c++"]:
        norm_lang = "C++"
    elif lower == "c":
        norm_lang = "C"
    elif lower in ["python", "py"]:
        norm_lang = "Python"
    else:
        norm_lang = "Java"

    lvl = (level or "beginner").lower().strip()

    return f"""You are Codenthra AI Dictator inside KnowledgeStream AI.
You are a Universal Programming Teacher and Code Verification Engine.
Your highest priority is: CODE CORRECTNESS FIRST and FAITHFUL TEACHING OF THE EXACT REQUESTED PROGRAM.
Generate ONLY code that is technically, syntactically, and logically correct for {norm_lang}.

The student explicitly requested this program:
Project: {project}
Target Language: {norm_lang}
Learning Level: {lvl}

CRITICAL PEDAGOGICAL & ARCHITECTURAL RULES:
1. EXACT PROGRAM FIDELITY:
   - The user's exact request ("{project}") is authoritative.
   - Do NOT substitute another program. Do NOT replace with array, factorial, or Hello World unless requested.
   - If user asks for "ATM program", teach a real ATM with balance, deposit, withdrawal, and validation.
   - If user asks for "Binary search tree", teach a real Binary Search Tree with node insertion and traversal.
   - If user asks for "Student marks management system", teach real student records and grading.
   - If user asks for "Inheritance", teach a real inheritance hierarchy with parent and child classes.

2. STRICT LANGUAGE INTEGRITY:
   - If {norm_lang} is Java: Standard Java (public class Main, public static void main(String[] args), System.out.println).
   - If {norm_lang} is Python: Clean Python 3 (def main():, if __name__ == '__main__': main(), print()).
   - If {norm_lang} is C: Standard C (#include <stdio.h>, #include <stdlib.h>, int main() {{ return 0; }}, printf). NEVER output C++ iostream or cout.
   - If {norm_lang} is C++: Modern C++ (#include <iostream>, #include <vector>, std::cout, int main() {{ return 0; }}). NEVER output C stdio.h or printf.

3. LEVEL BEHAVIOR ({lvl}):
   - BEGINNER:
     * Teach slowly and step-by-step.
     * Simple, clear concepts. Explain each keyword clearly (e.g. in Java: public, static, void, main; in Python: def, main; in C/C++: #include, main).
     * Clear variable declarations and straightforward logic.
   - INTERMEDIATE:
     * Moderately complex implementation.
     * Modular functions/methods, classes/structs, data validation, clean program flow.
     * Faster and technically detailed explanations.
   - ADVANCED:
     * Genuinely advanced implementation (architecture, custom exceptions, generics/templates, memory management / pointers, streams/lambdas, optimization).
     * Do NOT simply use beginner code with comments. Code must actually be advanced.

4. COMPLETE PROGRAM REQUIREMENT (DO NOT FINISH EARLY):
   - The teaching plan must build the ENTIRE working program from first line to last line.
   - NEVER finish early after just declaring a class or main() header.
   - The final step's "code" MUST be the 100% complete, working, runnable {norm_lang} program solving "{project}".

5. STRUCTURE OF EACH STEP IN JSON:
   - "step": integer index (1, 2, 3, ...)
   - "title": concise step title
   - "concept": specific programming concept taught
   - "instruction": clear instruction telling the student what to write
   - "explanation": friendly, pedagogically sound explanation
   - "why": why this concept/step is needed in the architecture
   - "example": small syntax snippet illustrating this step
   - "code": accumulated full program code up to this step
   - "stepCode": ONLY the new code snippet introduced in this specific step
   - "hint": helpful hint if student gets stuck
   - "speech": voice dictation script for the AI teacher to speak
   - "expected": key token/identifier/statement expected in this step
   - "type": "structure" | "statement" | "keyword" | "method"

6. Return ONLY a valid JSON object with NO markdown formatting, NO backticks, and NO code fences.

JSON Schema:
{{
  "language": "{norm_lang}",
  "project": "{project}",
  "requirements": [
    "Program structure & headers",
    "Data declarations & state setup",
    "Core algorithmic processing",
    "Output formatting & verification"
  ],
  "totalSteps": 4,
  "steps": [
    {{
      "step": 1,
      "title": "Setup Program Structure",
      "concept": "Entry point and class definition",
      "instruction": "Define the main structure...",
      "explanation": "...",
      "why": "...",
      "example": "...",
      "code": "...",
      "stepCode": "...",
      "hint": "...",
      "speech": "...",
      "expected": "...",
      "type": "structure"
    }}
  ]
}}
"""


def build_fallback_dictator_plan(language: str, project: str, level: str = "beginner") -> dict:
    norm = (language or "java").lower().strip()
    proj = project.strip() or "Program"
    p_lower = proj.lower()
    lvl = (level or "beginner").lower().strip()
    is_adv = lvl == "advanced"
    is_int = lvl == "intermediate"

    def make_plan(lang_name, reqs, steps_data):
        steps = []
        accum = ""
        for i, s in enumerate(steps_data):
            step_code = s["insert"]
            accum += step_code
            steps.append({
                "step": i + 1,
                "title": s["title"],
                "concept": s.get("concept", s["title"]),
                "instruction": s["instruction"],
                "explanation": s["explanation"],
                "why": s.get("why", "Key architectural requirement."),
                "example": s["token"],
                "code": accum,
                "stepCode": step_code,
                "hint": s.get("hint", f"Type {s['token']}"),
                "speech": f"Step {i + 1}. {s['instruction']}",
                "expected": s["token"],
                "type": s.get("type", "statement"),
            })
        return {
            "language": lang_name,
            "project": proj,
            "requirements": reqs,
            "totalSteps": len(steps),
            "steps": steps,
        }

    # =========================================================================
    # JAVA FALLBACKS
    # =========================================================================
    if norm == "java":
        # 1. Reverse Number
        if ("reverse" in p_lower and ("number" in p_lower or "digit" in p_lower or "num" in p_lower or "int" in p_lower)) or p_lower == "reverse":
            if is_adv:
                return make_plan("Java", ["Setup Main Class", "Robust Reversal Method", "Execute Test Suite"], [
                    {
                        "token": "public class Main {\n    public static int reverseNumber(int n) {\n        int rev = 0, sign = n < 0 ? -1 : 1;\n        int temp = Math.abs(n);\n        while (temp > 0) {\n            rev = rev * 10 + (temp % 10);\n            temp /= 10;\n        }\n        return rev * sign;\n    }",
                        "insert": "public class Main {\n    public static int reverseNumber(int n) {\n        int rev = 0, sign = n < 0 ? -1 : 1;\n        int temp = Math.abs(n);\n        while (temp > 0) {\n            rev = rev * 10 + (temp % 10);\n            temp /= 10;\n        }\n        return rev * sign;\n    }\n\n",
                        "title": "Define Robust Reversal Method",
                        "instruction": "Define reverseNumber(int n) method.",
                        "explanation": "Handles positive and negative integers.",
                        "type": "structure"
                    },
                    {
                        "token": "    public static void main(String[] args) {\n        int[] tests = {12345, -9870, 100};\n        for (int num : tests) System.out.println(num + \" -> \" + reverseNumber(num));\n    }\n}",
                        "insert": "    public static void main(String[] args) {\n        int[] tests = {12345, -9870, 100};\n        for (int num : tests) {\n            System.out.println(num + \" -> \" + reverseNumber(num));\n        }\n    }\n}\n",
                        "title": "Execute Test Suite in Main",
                        "instruction": "Test array of numbers in main().",
                        "explanation": "Prints reversed results.",
                        "type": "statement"
                    }
                ])
            if is_int:
                return make_plan("Java", ["Setup Main Class", "Define Reverse Helper", "Execute in Main"], [
                    {
                        "token": "public class Main {\n    public static int reverse(int num) {\n        int rev = 0;\n        while (num != 0) {\n            int digit = num % 10;\n            rev = rev * 10 + digit;\n            num /= 10;\n        }\n        return rev;\n    }",
                        "insert": "public class Main {\n    public static int reverse(int num) {\n        int rev = 0;\n        while (num != 0) {\n            int digit = num % 10;\n            rev = rev * 10 + digit;\n            num /= 10;\n        }\n        return rev;\n    }\n\n",
                        "title": "Define Modular Reverse Function",
                        "instruction": "Define public static int reverse(int num) helper method.",
                        "explanation": "Modular digit extraction loop.",
                        "type": "structure"
                    },
                    {
                        "token": "    public static void main(String[] args) {\n        int original = 54321;\n        int reversed = reverse(original);\n        System.out.println(\"Original: \" + original + \" | Reversed: \" + reversed);\n    }\n}",
                        "insert": "    public static void main(String[] args) {\n        int original = 54321;\n        int reversed = reverse(original);\n        System.out.println(\"Original: \" + original + \" | Reversed: \" + reversed);\n    }\n}\n",
                        "title": "Invoke Function in Main",
                        "instruction": "Call reverse() from main and print result.",
                        "explanation": "Passes input to function and prints output.",
                        "type": "statement"
                    }
                ])
            return make_plan("Java", ["Setup Main Class", "Declare Variables", "Execute Reversal Loop", "Display Result"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Entry Point",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "int number = 12345;\n        int reversed = 0;\n        int original = number;",
                    "insert": "int number = 12345;\n        int reversed = 0;\n        int original = number;\n        ",
                    "title": "Declare Number & Reversed Variables",
                    "instruction": "Declare number to reverse and reversed accumulator.",
                    "explanation": "Initializes input state.",
                    "type": "statement"
                },
                {
                    "token": "while (number != 0) {\n            int digit = number % 10;\n            reversed = reversed * 10 + digit;\n            number /= 10;\n        }",
                    "insert": "while (number != 0) {\n            int digit = number % 10;\n            reversed = reversed * 10 + digit;\n            number /= 10;\n        }\n        ",
                    "title": "Execute Reversal Loop",
                    "instruction": "Use while loop with modulo 10 and division to build reversed number.",
                    "explanation": "Extracts each digit from right to left.",
                    "type": "statement"
                },
                {
                    "token": "System.out.println(\"Original: \" + original + \" | Reversed: \" + reversed);\n    }\n}",
                    "insert": "System.out.println(\"Original: \" + original + \" | Reversed: \" + reversed);\n    }\n}\n",
                    "title": "Print Reversed Result",
                    "instruction": "Print original and reversed number.",
                    "explanation": "Outputs final result to console.",
                    "type": "statement"
                }
            ])

        # 2. Factorial
        if "factorial" in p_lower:
            return make_plan("Java", ["Main Class Setup", "Declare Variables", "Loop Calculation", "Print Output"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Entry Point",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "int num = 5;\n        long factorial = 1;",
                    "insert": "int num = 5;\n        long factorial = 1;\n        ",
                    "title": "Initialize Input & Factorial Accumulator",
                    "instruction": "Declare num = 5 and long factorial = 1.",
                    "explanation": "Initializes factorial accumulator to 1.",
                    "type": "statement"
                },
                {
                    "token": "for (int i = 1; i <= num; i++) {\n            factorial *= i;\n        }",
                    "insert": "for (int i = 1; i <= num; i++) {\n            factorial *= i;\n        }\n        ",
                    "title": "Calculate Factorial via For Loop",
                    "instruction": "Multiply factorial by each integer from 1 to num.",
                    "explanation": "Computes cumulative product.",
                    "type": "statement"
                },
                {
                    "token": "System.out.println(\"Factorial of \" + num + \" is: \" + factorial);\n    }\n}",
                    "insert": "System.out.println(\"Factorial of \" + num + \" is: \" + factorial);\n    }\n}\n",
                    "title": "Display Factorial Result",
                    "instruction": "Print final factorial answer.",
                    "explanation": "Prints factorial result.",
                    "type": "statement"
                }
            ])

        # 3. Prime Number
        if "prime" in p_lower:
            return make_plan("Java", ["Main Setup", "Initialize Number", "Check Divisibility", "Print Prime Result"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Entry Point",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "int num = 29;\n        boolean isPrime = true;\n        if (num <= 1) isPrime = false;",
                    "insert": "int num = 29;\n        boolean isPrime = true;\n        if (num <= 1) isPrime = false;\n        ",
                    "title": "Set Number & Flag",
                    "instruction": "Initialize number to test and boolean flag.",
                    "explanation": "Prepares prime testing state.",
                    "type": "statement"
                },
                {
                    "token": "for (int i = 2; i <= num / 2; i++) {\n            if (num % i == 0) {\n                isPrime = false;\n                break;\n            }\n        }",
                    "insert": "for (int i = 2; i <= num / 2; i++) {\n            if (num % i == 0) {\n                isPrime = false;\n                break;\n            }\n        }\n        ",
                    "title": "Check Divisors in Loop",
                    "instruction": "Loop from 2 to num / 2 to find any exact divisors.",
                    "explanation": "Sets isPrime to false if any divisor is found.",
                    "type": "statement"
                },
                {
                    "token": "System.out.println(num + (isPrime ? \" is a Prime Number.\" : \" is NOT a Prime Number.\"));\n    }\n}",
                    "insert": "System.out.println(num + (isPrime ? \" is a Prime Number.\" : \" is NOT a Prime Number.\"));\n    }\n}\n",
                    "title": "Display Prime Output",
                    "instruction": "Print prime evaluation result.",
                    "explanation": "Outputs final prime status.",
                    "type": "statement"
                }
            ])

        # 4. Sorting
        if "sort" in p_lower or "bubble" in p_lower:
            return make_plan("Java", ["Setup Main Class", "Declare Array", "Bubble Sort Algorithm", "Print Sorted Array"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Entry Point",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "int[] arr = {64, 34, 25, 12, 22, 11, 90};\n        int n = arr.length;",
                    "insert": "int[] arr = {64, 34, 25, 12, 22, 11, 90};\n        int n = arr.length;\n        ",
                    "title": "Declare Unsorted Array",
                    "instruction": "Declare integer array to sort.",
                    "explanation": "Initializes unsorted array.",
                    "type": "statement"
                },
                {
                    "token": "for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }",
                    "insert": "for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n        ",
                    "title": "Execute Bubble Sort Nested Loops",
                    "instruction": "Compare adjacent elements and swap if out of order.",
                    "explanation": "Bubbles highest remaining element to the end on each pass.",
                    "type": "statement"
                },
                {
                    "token": "System.out.print(\"Sorted Array: \");\n        for (int x : arr) {\n            System.out.print(x + \" \");\n        }\n        System.out.println();\n    }\n}",
                    "insert": "System.out.print(\"Sorted Array: \");\n        for (int x : arr) {\n            System.out.print(x + \" \");\n        }\n        System.out.println();\n    }\n}\n",
                    "title": "Display Sorted Array",
                    "instruction": "Iterate and print sorted elements.",
                    "explanation": "Outputs sorted array.",
                    "type": "statement"
                }
            ])

        # 5. Inheritance
        if "inheritance" in p_lower:
            return make_plan("Java", ["Define Base Person Class", "Define Student Subclass", "Execute in Main"], [
                {
                    "token": "class Person {\n    String name;\n    int age;\n    Person(String n, int a) {\n        name = n;\n        age = a;\n    }\n    void display() {\n        System.out.println(\"Name: \" + name + \", Age: \" + age);\n    }\n}",
                    "insert": "class Person {\n    String name;\n    int age;\n    Person(String n, int a) {\n        name = n;\n        age = a;\n    }\n    void display() {\n        System.out.println(\"Name: \" + name + \", Age: \" + age);\n    }\n}\n\n",
                    "title": "Define Parent Class Person",
                    "instruction": "Define base class Person with constructor and display() method.",
                    "explanation": "Encapsulates common person fields.",
                    "type": "structure"
                },
                {
                    "token": "class Student extends Person {\n    int rollNo;\n    Student(String n, int a, int r) {\n        super(n, a);\n        rollNo = r;\n    }\n    @Override\n    void display() {\n        super.display();\n        System.out.println(\"Roll No: \" + rollNo);\n    }\n}",
                    "insert": "class Student extends Person {\n    int rollNo;\n    Student(String n, int a, int r) {\n        super(n, a);\n        rollNo = r;\n    }\n    @Override\n    void display() {\n        super.display();\n        System.out.println(\"Roll No: \" + rollNo);\n    }\n}\n\n",
                    "title": "Define Subclass Student extends Person",
                    "instruction": "Define class Student extends Person calling super constructor.",
                    "explanation": "Inherits parent fields and adds rollNo attribute.",
                    "type": "structure"
                },
                {
                    "token": "public class Main {\n    public static void main(String[] args) {\n        Student s = new Student(\"Alice\", 20, 101);\n        s.display();\n    }\n}",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        Student s = new Student(\"Alice\", 20, 101);\n        s.display();\n    }\n}\n",
                    "title": "Test Inheritance in Main",
                    "instruction": "Instantiate Student and call display() to verify inherited execution.",
                    "explanation": "Outputs inherited data.",
                    "type": "statement"
                }
            ])

        # 6. Method Overriding
        if "override" in p_lower or "overriding" in p_lower:
            return make_plan("Java", ["Define Base Animal Class", "Define Overridden Dog Class", "Execute Polymorphism in Main"], [
                {
                    "token": "class Animal {\n    void makeSound() {\n        System.out.println(\"Animal sound\");\n    }\n}",
                    "insert": "class Animal {\n    void makeSound() {\n        System.out.println(\"Animal sound\");\n    }\n}\n\n",
                    "title": "Define Base Animal Class",
                    "instruction": "Define class Animal with makeSound() method.",
                    "explanation": "Base class for polymorphism.",
                    "type": "structure"
                },
                {
                    "token": "class Dog extends Animal {\n    @Override\n    void makeSound() {\n        System.out.println(\"Dog barks\");\n    }\n}",
                    "insert": "class Dog extends Animal {\n    @Override\n    void makeSound() {\n        System.out.println(\"Dog barks\");\n    }\n}\n\n",
                    "title": "Define Dog with @Override",
                    "instruction": "Define class Dog extends Animal with '@Override void makeSound()'.",
                    "explanation": "Overrides base class method.",
                    "type": "structure"
                },
                {
                    "token": "public class Main {\n    public static void main(String[] args) {\n        Animal myDog = new Dog();\n        myDog.makeSound();\n    }\n}",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        Animal myDog = new Dog();\n        myDog.makeSound();\n    }\n}\n",
                    "title": "Test Polymorphic Call in Main",
                    "instruction": "Assign Dog object to Animal reference and call makeSound().",
                    "explanation": "Dynamic method dispatch executes overridden method.",
                    "type": "statement"
                }
            ])

        # 7. Exception Handling
        if "exception" in p_lower:
            return make_plan("Java", ["Setup Main Class", "Execute Try-Catch-Finally"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Entry Point",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "try {\n            int a = 10, b = 0;\n            int result = a / b;\n            System.out.println(\"Result: \" + result);\n        } catch (ArithmeticException e) {\n            System.out.println(\"Caught Exception: \" + e.getMessage());\n        } finally {\n            System.out.println(\"Finally block executed successfully.\");\n        }\n    }\n}",
                    "insert": "try {\n            int a = 10, b = 0;\n            int result = a / b;\n            System.out.println(\"Result: \" + result);\n        } catch (ArithmeticException e) {\n            System.out.println(\"Caught Exception: \" + e.getMessage());\n        } finally {\n            System.out.println(\"Finally block executed successfully.\");\n        }\n    }\n}\n",
                    "title": "Implement Try-Catch-Finally Blocks",
                    "instruction": "Handle division by zero inside try-catch-finally construct.",
                    "explanation": "Demonstrates robust runtime error handling.",
                    "type": "statement"
                }
            ])

        # 8. Student Management
        if "student" in p_lower or "mark" in p_lower:
            if is_adv:
                return make_plan("Java", ["Define StudentRecord Model", "Manage Roster with Streams in Main"], [
                    {
                        "token": "import java.util.*;\n\nclass StudentRecord {\n    final String name;\n    final int rollNo;\n    final double gpa;\n    StudentRecord(String n, int r, double g) {\n        name = n; rollNo = r; gpa = g;\n    }\n}",
                        "insert": "import java.util.*;\n\nclass StudentRecord {\n    final String name;\n    final int rollNo;\n    final double gpa;\n    StudentRecord(String n, int r, double g) {\n        name = n;\n        rollNo = r;\n        gpa = g;\n    }\n}\n\n",
                        "title": "Define StudentRecord Domain Model",
                        "instruction": "Declare immutable StudentRecord class with fields.",
                        "explanation": "Encapsulates student entity.",
                        "type": "structure"
                    },
                    {
                        "token": "public class Main {\n    public static void main(String[] args) {\n        List<StudentRecord> roster = Arrays.asList(\n            new StudentRecord(\"Alice\", 101, 3.9),\n            new StudentRecord(\"Bob\", 102, 3.4)\n        );\n        System.out.println(\"=== Student Management System ===\");\n        double avgGpa = roster.stream().mapToDouble(s -> s.gpa).average().orElse(0.0);\n        roster.forEach(s -> System.out.println(\"Roll: \" + s.rollNo + \" | \" + s.name + \" | GPA: \" + s.gpa));\n        System.out.printf(\"Class Average GPA: %.2f%n\", avgGpa);\n    }\n}",
                        "insert": "public class Main {\n    public static void main(String[] args) {\n        List<StudentRecord> roster = Arrays.asList(\n            new StudentRecord(\"Alice\", 101, 3.9),\n            new StudentRecord(\"Bob\", 102, 3.4)\n        );\n        System.out.println(\"=== Student Management System ===\");\n        double avgGpa = roster.stream().mapToDouble(s -> s.gpa).average().orElse(0.0);\n        roster.forEach(s -> System.out.println(\"Roll: \" + s.rollNo + \" | \" + s.name + \" | GPA: \" + s.gpa));\n        System.out.printf(\"Class Average GPA: %.2f%n\", avgGpa);\n    }\n}\n",
                        "title": "Manage Roster with Streams in Main",
                        "instruction": "Use Java Streams to calculate average GPA and print roster.",
                        "explanation": "Demonstrates Collections and Stream API.",
                        "type": "statement"
                    }
                ])
            if is_int:
                return make_plan("Java", ["Define Student Class", "Instantiate in Main"], [
                    {
                        "token": "class Student {\n    String name;\n    int rollNo;\n    int marks;\n    Student(String n, int r, int m) {\n        name = n; rollNo = r; marks = m;\n    }\n    char getGrade() {\n        return marks >= 90 ? 'A' : marks >= 75 ? 'B' : 'C';\n    }\n}",
                        "insert": "class Student {\n    String name;\n    int rollNo;\n    int marks;\n    Student(String n, int r, int m) {\n        name = n;\n        rollNo = r;\n        marks = m;\n    }\n    char getGrade() {\n        return marks >= 90 ? 'A' : marks >= 75 ? 'B' : 'C';\n    }\n}\n\n",
                        "title": "Define Student Class with getGrade()",
                        "instruction": "Declare Student class with constructor and grade method.",
                        "explanation": "Encapsulates student attributes and grade logic.",
                        "type": "structure"
                    },
                    {
                        "token": "public class Main {\n    public static void main(String[] args) {\n        Student s1 = new Student(\"Alice\", 101, 92);\n        Student s2 = new Student(\"Bob\", 102, 78);\n        System.out.println(\"Student: \" + s1.name + \" | Grade: \" + s1.getGrade());\n        System.out.println(\"Student: \" + s2.name + \" | Grade: \" + s2.getGrade());\n    }\n}",
                        "insert": "public class Main {\n    public static void main(String[] args) {\n        Student s1 = new Student(\"Alice\", 101, 92);\n        Student s2 = new Student(\"Bob\", 102, 78);\n        System.out.println(\"Student: \" + s1.name + \" | Grade: \" + s1.getGrade());\n        System.out.println(\"Student: \" + s2.name + \" | Grade: \" + s2.getGrade());\n    }\n}\n",
                        "title": "Instantiate & Test Students in Main",
                        "instruction": "Create student objects and print their grades.",
                        "explanation": "Demonstrates object instantiation and method calls.",
                        "type": "statement"
                    }
                ])
            return make_plan("Java", ["Setup Main Class", "Declare Student Variables", "Compute & Print Marksheet"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Class",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "String name = \"Alice\";\n        int rollNo = 101;\n        int sub1 = 85, sub2 = 90, sub3 = 88;\n        int total = sub1 + sub2 + sub3;\n        double avg = total / 3.0;",
                    "insert": "String name = \"Alice\";\n        int rollNo = 101;\n        int sub1 = 85, sub2 = 90, sub3 = 88;\n        int total = sub1 + sub2 + sub3;\n        double avg = total / 3.0;\n        ",
                    "title": "Declare Student Variables & Compute Total",
                    "instruction": "Declare student name, roll number, subject scores, and compute average.",
                    "explanation": "Computes total marks and average percentage.",
                    "type": "statement"
                },
                {
                    "token": "System.out.println(\"=== Student Marksheet ===\");\n        System.out.println(\"Student: \" + name + \" | Roll: \" + rollNo);\n        System.out.println(\"Total: \" + total + \" | Average: \" + avg + \"%\");\n    }\n}",
                    "insert": "System.out.println(\"=== Student Marksheet ===\");\n        System.out.println(\"Student: \" + name + \" | Roll: \" + rollNo);\n        System.out.println(\"Total: \" + total + \" | Average: \" + avg + \"%\");\n    }\n}\n",
                    "title": "Print Marksheet Output",
                    "instruction": "Print student marks summary.",
                    "explanation": "Outputs formatted student record.",
                    "type": "statement"
                }
            ])

        # 9. ATM / Banking
        if "atm" in p_lower or "bank" in p_lower:
            if is_adv:
                return make_plan("Java", ["Define BankAccount & Custom Exception", "Execute in Main with Try-Catch"], [
                    {
                        "token": "class InsufficientFundsException extends Exception {\n    InsufficientFundsException(String msg) { super(msg); }\n}\n\nclass BankAccount {\n    private double balance;\n    BankAccount(double init) { balance = init; }\n    public synchronized void deposit(double amt) { balance += amt; }\n    public synchronized void withdraw(double amt) throws InsufficientFundsException {\n        if (amt > balance) throw new InsufficientFundsException(\"Insufficient funds!\");\n        balance -= amt;\n    }\n    public double getBalance() { return balance; }\n}",
                        "insert": "class InsufficientFundsException extends Exception {\n    InsufficientFundsException(String msg) {\n        super(msg);\n    }\n}\n\nclass BankAccount {\n    private double balance;\n    BankAccount(double init) {\n        balance = init;\n    }\n    public synchronized void deposit(double amt) {\n        balance += amt;\n    }\n    public synchronized void withdraw(double amt) throws InsufficientFundsException {\n        if (amt > balance) {\n            throw new InsufficientFundsException(\"Insufficient funds!\");\n        }\n        balance -= amt;\n    }\n    public double getBalance() {\n        return balance;\n    }\n}\n\n",
                        "title": "Define BankAccount & Custom Exception",
                        "instruction": "Define BankAccount with synchronized deposit, withdraw, and custom exception.",
                        "explanation": "Thread-safe banking model with transactional error handling.",
                        "type": "structure"
                    },
                    {
                        "token": "public class Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount(1000.0);\n        System.out.println(\"=== Secure ATM Banking Machine ===\");\n        acc.deposit(500.0);\n        try {\n            acc.withdraw(200.0);\n            System.out.println(\"Withdrawal successful. Current Balance: $\" + acc.getBalance());\n        } catch (InsufficientFundsException e) {\n            System.out.println(\"Transaction Error: \" + e.getMessage());\n        }\n    }\n}",
                        "insert": "public class Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount(1000.0);\n        System.out.println(\"=== Secure ATM Banking Machine ===\");\n        acc.deposit(500.0);\n        try {\n            acc.withdraw(200.0);\n            System.out.println(\"Withdrawal successful. Current Balance: $\" + acc.getBalance());\n        } catch (InsufficientFundsException e) {\n            System.out.println(\"Transaction Error: \" + e.getMessage());\n        }\n    }\n}\n",
                        "title": "Execute Transactions in Main",
                        "instruction": "Apply deposit and withdrawal inside try-catch and print balance.",
                        "explanation": "Demonstrates exception handling in banking transactions.",
                        "type": "statement"
                    }
                ])
            if is_int:
                return make_plan("Java", ["Define Account Class", "Execute Transactions in Main"], [
                    {
                        "token": "class Account {\n    double balance;\n    Account(double init) { balance = init; }\n    void deposit(double amt) { balance += amt; }\n    boolean withdraw(double amt) {\n        if (amt <= balance) { balance -= amt; return true; }\n        return false;\n    }\n}",
                        "insert": "class Account {\n    double balance;\n    Account(double init) {\n        balance = init;\n    }\n    void deposit(double amt) {\n        balance += amt;\n    }\n    boolean withdraw(double amt) {\n        if (amt <= balance) {\n            balance -= amt;\n            return true;\n        }\n        return false;\n    }\n}\n\n",
                        "title": "Define Account Class",
                        "instruction": "Define Account class with deposit and withdraw methods.",
                        "explanation": "Encapsulates account balance and transaction rules.",
                        "type": "structure"
                    },
                    {
                        "token": "public class Main {\n    public static void main(String[] args) {\n        Account acc = new Account(1000.0);\n        acc.deposit(500.0);\n        boolean ok = acc.withdraw(200.0);\n        System.out.println(\"Withdrawal status: \" + ok + \" | Balance: $\" + acc.balance);\n    }\n}",
                        "insert": "public class Main {\n    public static void main(String[] args) {\n        Account acc = new Account(1000.0);\n        acc.deposit(500.0);\n        boolean ok = acc.withdraw(200.0);\n        System.out.println(\"Withdrawal status: \" + ok + \" | Balance: $\" + acc.balance);\n    }\n}\n",
                        "title": "Execute Transactions in Main",
                        "instruction": "Instantiate Account, call deposit and withdraw, and print result.",
                        "explanation": "Demonstrates object transaction calls.",
                        "type": "statement"
                    }
                ])
            return make_plan("Java", ["Setup Main Class", "Declare Account Variables", "Process Transactions"], [
                {
                    "token": "public class Main {\n    public static void main(String[] args) {",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                    "title": "Setup Main Class",
                    "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                    "explanation": "Java entry point.",
                    "type": "structure"
                },
                {
                    "token": "double balance = 1000.0;\n        double deposit = 500.0;\n        double withdraw = 200.0;",
                    "insert": "double balance = 1000.0;\n        double deposit = 500.0;\n        double withdraw = 200.0;\n        ",
                    "title": "Declare ATM Balances",
                    "instruction": "Declare balance, deposit, and withdraw amounts.",
                    "explanation": "Account balance state.",
                    "type": "statement"
                },
                {
                    "token": "System.out.println(\"=== ATM Banking Machine ===\");\n        balance += deposit;\n        if (withdraw <= balance) {\n            balance -= withdraw;\n        }\n        System.out.println(\"Final Balance: $\" + balance);\n    }\n}",
                    "insert": "System.out.println(\"=== ATM Banking Machine ===\");\n        balance += deposit;\n        if (withdraw <= balance) {\n            balance -= withdraw;\n        }\n        System.out.println(\"Final Balance: $\" + balance);\n    }\n}\n",
                    "title": "Execute Transactions",
                    "instruction": "Apply deposit, validate sufficient balance for withdrawal, and print balance.",
                    "explanation": "Completes banking transaction.",
                    "type": "statement"
                }
            ])

        # 10. Linked List
        if "linked" in p_lower and "list" in p_lower:
            return make_plan("Java", ["Define Node Class", "Main Class Setup", "Link Nodes & Traverse"], [
                {
                    "token": "class Node {\n    int data;\n    Node next;\n    Node(int d) { data = d; next = null; }\n}",
                    "insert": "class Node {\n    int data;\n    Node next;\n    Node(int d) {\n        data = d;\n        next = null;\n    }\n}\n\n",
                    "title": "Define Node Class",
                    "instruction": "Define class Node with data and next pointer.",
                    "explanation": "Singly linked list node.",
                    "type": "structure"
                },
                {
                    "token": "public class Main {\n    public static void main(String[] args) {\n        Node head = new Node(10);\n        head.next = new Node(20);\n        head.next.next = new Node(30);\n        System.out.print(\"Linked List: \");\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.data + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}",
                    "insert": "public class Main {\n    public static void main(String[] args) {\n        Node head = new Node(10);\n        head.next = new Node(20);\n        head.next.next = new Node(30);\n        System.out.print(\"Linked List: \");\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.data + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}\n",
                    "title": "Create, Chain & Traverse Nodes in Main",
                    "instruction": "Instantiate head node, link subsequent nodes, and traverse displaying data.",
                    "explanation": "Constructs and traverses linked list in memory.",
                    "type": "statement"
                }
            ])

        # Default Java Universal Synthesizer
        return make_plan("Java", ["Class Setup", "Variables & Computation", "Output Result"], [
            {
                "token": "public class Main {\n    public static void main(String[] args) {",
                "insert": "public class Main {\n    public static void main(String[] args) {\n        ",
                "title": "Setup Main Entry Point",
                "instruction": "Type 'public class Main { public static void main(String[] args) {'.",
                "explanation": "Java entry point.",
                "type": "structure"
            },
            {
                "token": f"System.out.println(\"=== {proj} ===\");\n        int a = 25, b = 15;\n        int sum = a + b;\n        int diff = a - b;\n        int prod = a * b;",
                "insert": f"System.out.println(\"=== {proj} ===\");\n        int a = 25, b = 15;\n        int sum = a + b;\n        int diff = a - b;\n        int prod = a * b;\n        ",
                "title": f"Process {proj} Logic",
                "instruction": f"Declare variables and compute values for {proj}.",
                "explanation": f"Calculates results for {proj}.",
                "type": "statement"
            },
            {
                "token": "System.out.println(\"Sum: \" + sum + \" | Diff: \" + diff + \" | Product: \" + prod);\n    }\n}",
                "insert": "System.out.println(\"Sum: \" + sum + \" | Diff: \" + diff + \" | Product: \" + prod);\n    }\n}\n",
                "title": "Display Program Output",
                "instruction": "Print results to standard output.",
                "explanation": "Outputs computed result.",
                "type": "statement"
            }
        ])

    # =========================================================================
    # PYTHON FALLBACKS
    # =========================================================================
    if norm in ["python", "py"]:
        if "student" in p_lower or "mark" in p_lower:
            if is_adv:
                return make_plan("Python", ["Define Dataclass Model", "Manage Roster Analytics in main()"], [
                    {
                        "token": "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass StudentRecord:\n    name: str\n    roll_no: int\n    gpa: float",
                        "insert": "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass StudentRecord:\n    name: str\n    roll_no: int\n    gpa: float\n\n",
                        "title": "Define StudentRecord Dataclass",
                        "instruction": "Define typed dataclass StudentRecord.",
                        "explanation": "Typed Python data structure.",
                        "type": "structure"
                    },
                    {
                        "token": "def main():\n    roster: List[StudentRecord] = [\n        StudentRecord('Alice', 101, 3.9),\n        StudentRecord('Bob', 102, 3.4)\n    ]\n    print('=== Student Management System ===')\n    avg_gpa = sum(s.gpa for s in roster) / len(roster)\n    for s in roster:\n        print(f'Roll: {s.roll_no} | {s.name} | GPA: {s.gpa}')\n    print(f'Class Average GPA: {avg_gpa:.2f}')\n\nif __name__ == '__main__':\n    main()",
                        "insert": "def main():\n    roster: List[StudentRecord] = [\n        StudentRecord('Alice', 101, 3.9),\n        StudentRecord('Bob', 102, 3.4)\n    ]\n    print('=== Student Management System ===')\n    avg_gpa = sum(s.gpa for s in roster) / len(roster)\n    for s in roster:\n        print(f'Roll: {s.roll_no} | {s.name} | GPA: {s.gpa}')\n    print(f'Class Average GPA: {avg_gpa:.2f}')\n\nif __name__ == '__main__':\n    main()\n",
                        "title": "Process Roster Analytics in main()",
                        "instruction": "Iterate through roster list, calculate average GPA, and print summary.",
                        "explanation": "Demonstrates generator expressions and f-strings.",
                        "type": "statement"
                    }
                ])
            if is_int:
                return make_plan("Python", ["Define Student Class", "Instantiate & Display in main()"], [
                    {
                        "token": "class Student:\n    def __init__(self, name: str, roll_no: int, marks: list):\n        self.name = name\n        self.roll_no = roll_no\n        self.marks = marks\n    def get_average(self) -> float:\n        return sum(self.marks) / len(self.marks)\n    def get_grade(self) -> str:\n        avg = self.get_average()\n        return 'A' if avg >= 90 else 'B' if avg >= 75 else 'C'",
                        "insert": "class Student:\n    def __init__(self, name: str, roll_no: int, marks: list):\n        self.name = name\n        self.roll_no = roll_no\n        self.marks = marks\n\n    def get_average(self) -> float:\n        return sum(self.marks) / len(self.marks)\n\n    def get_grade(self) -> str:\n        avg = self.get_average()\n        return 'A' if avg >= 90 else 'B' if avg >= 75 else 'C'\n\n",
                        "title": "Define Student Class",
                        "instruction": "Define class Student with __init__, get_average(), and get_grade() methods.",
                        "explanation": "Encapsulates student attributes and grade calculations.",
                        "type": "structure"
                    },
                    {
                        "token": "def main():\n    s1 = Student('Alice', 101, [85, 92, 90])\n    s2 = Student('Bob', 102, [74, 78, 80])\n    print('=== Student Management System ===')\n    print(f'Student: {s1.name} | Average: {s1.get_average():.1f} | Grade: {s1.get_grade()}')\n    print(f'Student: {s2.name} | Average: {s2.get_average():.1f} | Grade: {s2.get_grade()}')\n\nif __name__ == '__main__':\n    main()",
                        "insert": "def main():\n    s1 = Student('Alice', 101, [85, 92, 90])\n    s2 = Student('Bob', 102, [74, 78, 80])\n    print('=== Student Management System ===')\n    print(f'Student: {s1.name} | Average: {s1.get_average():.1f} | Grade: {s1.get_grade()}')\n    print(f'Student: {s2.name} | Average: {s2.get_average():.1f} | Grade: {s2.get_grade()}')\n\nif __name__ == '__main__':\n    main()\n",
                        "title": "Instantiate & Display Students in main()",
                        "instruction": "Create student instances and print calculated grade cards.",
                        "explanation": "Demonstrates object creation and method calls in Python.",
                        "type": "statement"
                    }
                ])
            return make_plan("Python", ["Initialize Student Data", "Print Marksheet Output"], [
                {
                    "token": "def main():\n    student_name = 'Alice'\n    roll_no = 101\n    marks = [85, 90, 88]\n    total = sum(marks)\n    average = total / len(marks)",
                    "insert": "def main():\n    student_name = 'Alice'\n    roll_no = 101\n    marks = [85, 90, 88]\n    total = sum(marks)\n    average = total / len(marks)\n    ",
                    "title": "Initialize Student Marks Data",
                    "instruction": "Declare student_name, roll_no, marks list, and compute total & average.",
                    "explanation": "Direct variable assignments and calculations in main().",
                    "type": "structure"
                },
                {
                    "token": "    print('=== Student Marksheet ===')\n    print(f'Student: {student_name} | Roll: {roll_no}')\n    print(f'Total Marks: {total} | Average: {average:.1f}%')\n\nif __name__ == '__main__':\n    main()",
                    "insert": "print('=== Student Marksheet ===')\n    print(f'Student: {student_name} | Roll: {roll_no}')\n    print(f'Total Marks: {total} | Average: {average:.1f}%')\n\nif __name__ == '__main__':\n    main()\n",
                    "title": "Print Marksheet Output",
                    "instruction": "Print student marks summary using f-strings.",
                    "explanation": "Outputs calculated results.",
                    "type": "statement"
                }
            ])

        if "palindrome" in p_lower:
            return make_plan("Python", ["Define is_palindrome()", "Main Execution & Output"], [
                {
                    "token": "def is_palindrome(text: str) -> bool:\n    clean = str(text).lower().replace(' ', '')\n    return clean == clean[::-1]",
                    "insert": "def is_palindrome(text: str) -> bool:\n    clean = str(text).lower().replace(' ', '')\n    return clean == clean[::-1]\n\n",
                    "title": "Define Palindrome Checker",
                    "instruction": "Define is_palindrome function using string slicing [::-1].",
                    "explanation": "Compares string against its reverse.",
                    "type": "structure"
                },
                {
                    "token": "def main():\n    words = ['radar', 'level', 'python', 'madam', '12321']\n    print('=== Palindrome Evaluation ===')\n    for w in words:\n        print(f'\"{w}\" is palindrome? {is_palindrome(w)}')\n\nif __name__ == '__main__':\n    main()",
                    "insert": "def main():\n    words = ['radar', 'level', 'python', 'madam', '12321']\n    print('=== Palindrome Evaluation ===')\n    for w in words:\n        print(f'\"{w}\" is palindrome? {is_palindrome(w)}')\n\nif __name__ == '__main__':\n    main()\n",
                    "title": "Execute in main()",
                    "instruction": "Test sample words and print palindrome check results.",
                    "explanation": "Iterates and prints palindrome status.",
                    "type": "statement"
                }
            ])

        if "factorial" in p_lower:
            return make_plan("Python", ["Define Factorial Function", "Main Execution & Output"], [
                {
                    "token": "def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
                    "insert": "def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\n",
                    "title": "Define Recursive Factorial Function",
                    "instruction": "Define factorial(n) with base case checks.",
                    "explanation": "Computes factorial recursively.",
                    "type": "structure"
                },
                {
                    "token": "def main():\n    test_values = [0, 1, 5, 6, 7]\n    print('=== Factorial Computation ===')\n    for n in test_values:\n        print(f'Factorial of {n:2d} = {factorial(n)}')\n\nif __name__ == '__main__':\n    main()",
                    "insert": "def main():\n    test_values = [0, 1, 5, 6, 7]\n    print('=== Factorial Computation ===')\n    for n in test_values:\n        print(f'Factorial of {n:2d} = {factorial(n)}')\n\nif __name__ == '__main__':\n    main()\n",
                    "title": "Run Computations in main()",
                    "instruction": "Iterate through test values and print factorial output.",
                    "explanation": "Outputs computed factorials.",
                    "type": "statement"
                }
            ])

        if "atm" in p_lower or "bank" in p_lower:
            return make_plan("Python", ["Define main()", "Execute ATM Transactions"], [
                {
                    "token": "def main():",
                    "insert": "def main():\n    ",
                    "title": "Define Main Function",
                    "instruction": "Define def main(): entry point.",
                    "explanation": "Python entry point.",
                    "type": "structure"
                },
                {
                    "token": "balance = 1000.0\n    deposit = 500.0\n    withdraw = 200.0\n    print('=== ATM Machine ===')\n    balance += deposit\n    if withdraw <= balance:\n        balance -= withdraw\n    print(f'Final Balance: ${balance:.2f}')\n\nif __name__ == '__main__':\n    main()",
                    "insert": "balance = 1000.0\n    deposit = 500.0\n    withdraw = 200.0\n    print('=== ATM Machine ===')\n    balance += deposit\n    if withdraw <= balance:\n        balance -= withdraw\n    print(f'Final Balance: ${balance:.2f}')\n\nif __name__ == '__main__':\n    main()\n",
                    "title": "Process Banking Logic & Display",
                    "instruction": "Apply deposit and withdrawal logic, then print balance.",
                    "explanation": "Outputs final balance.",
                    "type": "statement"
                }
            ])

        # Default Python Synthesizer
        return make_plan("Python", ["Define main()", "Process Operations & Display"], [
            {
                "token": "def main():",
                "insert": "def main():\n    ",
                "title": "Define Main Function",
                "instruction": "Define def main(): entry point.",
                "explanation": "Standard Python entry point.",
                "type": "structure"
            },
            {
                "token": "print('=== " + proj + " ===')\n    a, b = 25, 15\n    print('Sum:', a + b, '| Diff:', a - b, '| Product:', a * b)\n\nif __name__ == '__main__':\n    main()",
                "insert": "print('=== " + proj + " ===')\n    a, b = 25, 15\n    print('Sum:', a + b, '| Diff:', a - b, '| Product:', a * b)\n\nif __name__ == '__main__':\n    main()\n",
                "title": f"Execute {proj} Logic",
                "instruction": f"Compute operations and print output for {proj}.",
                "explanation": f"Outputs computed result for {proj}.",
                "type": "statement"
            }
        ])

    # =========================================================================
    # C FALLBACKS
    # =========================================================================
    if norm == "c":
        if "linked" in p_lower and "list" in p_lower:
            return make_plan("C", ["Define Node Struct & Headers", "Allocate & Traverse in main()"], [
                {
                    "token": "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};",
                    "insert": "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\n",
                    "title": "Declare struct Node",
                    "instruction": "Include <stdio.h>, <stdlib.h> and declare struct Node.",
                    "explanation": "Self-referential struct for linked list nodes.",
                    "type": "structure"
                },
                {
                    "token": "int main() {\n    struct Node* head = (struct Node*)malloc(sizeof(struct Node));\n    head->data = 10;\n    head->next = (struct Node*)malloc(sizeof(struct Node));\n    head->next->data = 20;\n    head->next->next = NULL;\n    printf(\"=== C Linked List ===\\n\");\n    struct Node* curr = head;\n    while (curr != NULL) {\n        printf(\"%d -> \", curr->data);\n        curr = curr->next;\n    }\n    printf(\"NULL\\n\");\n    return 0;\n}",
                    "insert": "int main() {\n    struct Node* head = (struct Node*)malloc(sizeof(struct Node));\n    head->data = 10;\n    head->next = (struct Node*)malloc(sizeof(struct Node));\n    head->next->data = 20;\n    head->next->next = NULL;\n    printf(\"=== C Linked List ===\\n\");\n    struct Node* curr = head;\n    while (curr != NULL) {\n        printf(\"%d -> \", curr->data);\n        curr = curr->next;\n    }\n    printf(\"NULL\\n\");\n    return 0;\n}\n",
                    "title": "Allocate, Link & Print List",
                    "instruction": "Allocate nodes with malloc and traverse with while loop.",
                    "explanation": "Traverses and prints linked list.",
                    "type": "statement"
                }
            ])

        if "structure" in p_lower or "struct" in p_lower or "student" in p_lower:
            return make_plan("C", ["Define Student Struct", "Main Records Execution"], [
                {
                    "token": "#include <stdio.h>\n\nstruct Student {\n    int id;\n    char name[50];\n    float marks;\n};",
                    "insert": "#include <stdio.h>\n\nstruct Student {\n    int id;\n    char name[50];\n    float marks;\n};\n\n",
                    "title": "Define Student Struct in C",
                    "instruction": "Include <stdio.h> and declare struct Student.",
                    "explanation": "Encapsulates student attributes in C.",
                    "type": "structure"
                },
                {
                    "token": "int main() {\n    struct Student s1 = {101, \"Alice\", 89.5f};\n    printf(\"=== Student Record ===\\n\");\n    printf(\"ID: %d | Name: %s | Marks: %.1f\\n\", s1.id, s1.name, s1.marks);\n    return 0;\n}",
                    "insert": "int main() {\n    struct Student s1 = {101, \"Alice\", 89.5f};\n    printf(\"=== Student Record ===\\n\");\n    printf(\"ID: %d | Name: %s | Marks: %.1f\\n\", s1.id, s1.name, s1.marks);\n    return 0;\n}\n",
                    "title": "Instantiate & Print Record",
                    "instruction": "Initialize struct instance and display values via printf.",
                    "explanation": "Outputs student record.",
                    "type": "statement"
                }
            ])

        if "pointer" in p_lower:
            return make_plan("C", ["Header & Swap Function", "Main Execution & Output"], [
                {
                    "token": "#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}",
                    "insert": "#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\n",
                    "title": "Define Pointer Swap Function",
                    "instruction": "Include <stdio.h> and declare swap function using pointer dereferencing.",
                    "explanation": "Swaps variable values by memory address.",
                    "type": "structure"
                },
                {
                    "token": "int main() {\n    int x = 10, y = 20;\n    printf(\"Before: x = %d, y = %d\\n\", x, y);\n    swap(&x, &y);\n    printf(\"After:  x = %d, y = %d\\n\", x, y);\n    return 0;\n}",
                    "insert": "int main() {\n    int x = 10, y = 20;\n    printf(\"Before: x = %d, y = %d\\n\", x, y);\n    swap(&x, &y);\n    printf(\"After:  x = %d, y = %d\\n\", x, y);\n    return 0;\n}\n",
                    "title": "Pass Addresses to swap() in main()",
                    "instruction": "Pass memory addresses (&x, &y) to swap and print updated values.",
                    "explanation": "Demonstrates pass-by-pointer in C.",
                    "type": "statement"
                }
            ])

        if "atm" in p_lower or "bank" in p_lower:
            return make_plan("C", ["Header & Main Setup", "Execute ATM Transactions"], [
                {
                    "token": "#include <stdio.h>\n\nint main() {",
                    "insert": "#include <stdio.h>\n\nint main() {\n    ",
                    "title": "Setup C Entry Point",
                    "instruction": "Type '#include <stdio.h>' and 'int main() {'.",
                    "explanation": "Standard C entry point.",
                    "type": "structure"
                },
                {
                    "token": "double balance = 1000.0, deposit = 500.0, withdraw = 200.0;\n    printf(\"=== ATM Banking ===\\n\");\n    balance += deposit;\n    if (withdraw <= balance) balance -= withdraw;\n    printf(\"Final Balance: $%.2f\\n\", balance);\n    return 0;\n}",
                    "insert": "double balance = 1000.0, deposit = 500.0, withdraw = 200.0;\n    printf(\"=== ATM Banking ===\\n\");\n    balance += deposit;\n    if (withdraw <= balance) balance -= withdraw;\n    printf(\"Final Balance: $%.2f\\n\", balance);\n    return 0;\n}\n",
                    "title": "Execute Transactions & Output",
                    "instruction": "Compute deposit and withdrawal and print balance with printf.",
                    "explanation": "Outputs final balance.",
                    "type": "statement"
                }
            ])

        # Default C Synthesizer
        return make_plan("C", ["Header & Main Setup", "Process Operations & Display"], [
            {
                "token": "#include <stdio.h>\n\nint main() {",
                "insert": "#include <stdio.h>\n\nint main() {\n    ",
                "title": "Setup C Entry Point",
                "instruction": "Type '#include <stdio.h>' and 'int main() {'.",
                "explanation": "Standard C entry point.",
                "type": "structure"
            },
            {
                "token": f"printf(\"=== {proj} ===\\n\"); int a = 25, b = 15; printf(\"Sum: %d | Diff: %d | Prod: %d\\n\", (a + b), (a - b), (a * b)); return 0; }}",
                "insert": f"printf(\"=== {proj} ===\\n\");\n    int a = 25, b = 15;\n    printf(\"Sum: %d | Diff: %d | Prod: %d\\n\", (a + b), (a - b), (a * b));\n    return 0;\n}}\n",
                "title": f"Execute {proj} Logic",
                "instruction": f"Compute and print results for {proj}.",
                "explanation": f"Outputs result using printf.",
                "type": "statement"
            }
        ])

    # =========================================================================
    # C++ FALLBACKS
    # =========================================================================
    if norm in ["cpp", "c++"]:
        if "inheritance" in p_lower or "polymorphism" in p_lower:
            return make_plan("C++", ["Define Base Animal Class", "Define Derived Dog Class", "Execute Polymorphism in main()"], [
                {
                    "token": "#include <iostream>\n\nclass Animal {\npublic:\n    virtual void makeSound() const {\n        std::cout << \"Animal sound\" << std::endl;\n    }\n    virtual ~Animal() = default;\n};",
                    "insert": "#include <iostream>\n\nclass Animal {\npublic:\n    virtual void makeSound() const {\n        std::cout << \"Animal sound\" << std::endl;\n    }\n    virtual ~Animal() = default;\n};\n\n",
                    "title": "Define Base Animal Class",
                    "instruction": "Declare class Animal with virtual makeSound() method.",
                    "explanation": "Base polymorphic class.",
                    "type": "structure"
                },
                {
                    "token": "class Dog : public Animal {\npublic:\n    void makeSound() const override {\n        std::cout << \"Dog barks\" << std::endl;\n    }\n};",
                    "insert": "class Dog : public Animal {\npublic:\n    void makeSound() const override {\n        std::cout << \"Dog barks\" << std::endl;\n    }\n};\n\n",
                    "title": "Define Derived Dog Class",
                    "instruction": "Declare class Dog : public Animal with override keyword.",
                    "explanation": "Subclass overriding base method.",
                    "type": "structure"
                },
                {
                    "token": "int main() {\n    Animal* pet = new Dog();\n    pet->makeSound();\n    delete pet;\n    return 0;\n}",
                    "insert": "int main() {\n    Animal* pet = new Dog();\n    pet->makeSound();\n    delete pet;\n    return 0;\n}\n",
                    "title": "Execute Polymorphic Call in main()",
                    "instruction": "Instantiate Dog via Animal pointer, invoke method, and free memory.",
                    "explanation": "Demonstrates runtime polymorphism in C++.",
                    "type": "statement"
                }
            ])

        if "classes" in p_lower or "class" in p_lower or "student" in p_lower:
            return make_plan("C++", ["Define Student Class", "Manage Students in main()"], [
                {
                    "token": "#include <iostream>\n#include <vector>\n#include <string>\n\nclass Student {\nprivate:\n    std::string name;\n    int id;\n    double gpa;\npublic:\n    Student(std::string n, int i, double g) : name(n), id(i), gpa(g) {}\n    void display() const {\n        std::cout << \"ID: \" << id << \" | Name: \" << name << \" | GPA: \" << gpa << std::endl;\n    }\n};",
                    "insert": "#include <iostream>\n#include <vector>\n#include <string>\n\nclass Student {\nprivate:\n    std::string name;\n    int id;\n    double gpa;\npublic:\n    Student(std::string n, int i, double g) : name(n), id(i), gpa(g) {}\n    void display() const {\n        std::cout << \"ID: \" << id << \" | Name: \" << name << \" | GPA: \" << gpa << std::endl;\n    }\n};\n\n",
                    "title": "Define Student Class",
                    "instruction": "Define class Student with encapsulated private fields and display() method.",
                    "explanation": "Encapsulates student entity.",
                    "type": "structure"
                },
                {
                    "token": "int main() {\n    std::vector<Student> roster = {\n        Student(\"Alice\", 101, 3.9),\n        Student(\"Bob\", 102, 3.5)\n    };\n    std::cout << \"=== Student Management System ===\" << std::endl;\n    for (const auto& s : roster) {\n        s.display();\n    }\n    return 0;\n}",
                    "insert": "int main() {\n    std::vector<Student> roster = {\n        Student(\"Alice\", 101, 3.9),\n        Student(\"Bob\", 102, 3.5)\n    };\n    std::cout << \"=== Student Management System ===\" << std::endl;\n    for (const auto& s : roster) {\n        s.display();\n    }\n    return 0;\n}\n",
                    "title": "Manage Roster in main()",
                    "instruction": "Populate std::vector<Student> and iterate calling display().",
                    "explanation": "Outputs student roster.",
                    "type": "statement"
                }
            ])

        if "atm" in p_lower or "bank" in p_lower:
            return make_plan("C++", ["Header & Main Setup", "Execute Banking Transactions"], [
                {
                    "token": "#include <iostream>\n\nint main() {",
                    "insert": "#include <iostream>\n\nint main() {\n    ",
                    "title": "Setup C++ Entry Point",
                    "instruction": "Type '#include <iostream>' and 'int main() {'.",
                    "explanation": "Modern C++ entry point.",
                    "type": "structure"
                },
                {
                    "token": "double balance = 1000.0, deposit = 500.0, withdraw = 200.0;\n    std::cout << \"=== ATM Banking Machine ===\" << std::endl;\n    balance += deposit;\n    if (withdraw <= balance) balance -= withdraw;\n    std::cout << \"Final Balance: $\" << balance << std::endl;\n    return 0;\n}",
                    "insert": "double balance = 1000.0, deposit = 500.0, withdraw = 200.0;\n    std::cout << \"=== ATM Banking Machine ===\" << std::endl;\n    balance += deposit;\n    if (withdraw <= balance) balance -= withdraw;\n    std::cout << \"Final Balance: $\" << balance << std::endl;\n    return 0;\n}\n",
                    "title": "Process Banking Operations",
                    "instruction": "Execute deposit and withdrawal and print balance using std::cout.",
                    "explanation": "Outputs final balance.",
                    "type": "statement"
                }
            ])

        if "linked" in p_lower and "list" in p_lower:
            return make_plan("C++", ["Define Node Struct", "Main Setup & Traversal"], [
                {
                    "token": "#include <iostream>\n\nstruct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}\n};",
                    "insert": "#include <iostream>\n\nstruct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}\n};\n\n",
                    "title": "Define Node Struct in C++",
                    "instruction": "Include <iostream> and declare Node struct with constructor.",
                    "explanation": "Node struct with nullptr initialization.",
                    "type": "structure"
                },
                {
                    "token": "int main() {\n    Node* head = new Node(10);\n    head->next = new Node(20);\n    head->next->next = new Node(30);\n    std::cout << \"=== C++ Linked List ===\" << std::endl;\n    Node* curr = head;\n    while (curr != nullptr) {\n        std::cout << curr->data << \" -> \";\n        curr = curr->next;\n    }\n    std::cout << \"nullptr\" << std::endl;\n    return 0;\n}",
                    "insert": "int main() {\n    Node* head = new Node(10);\n    head->next = new Node(20);\n    head->next->next = new Node(30);\n    std::cout << \"=== C++ Linked List ===\" << std::endl;\n    Node* curr = head;\n    while (curr != nullptr) {\n        std::cout << curr->data << \" -> \";\n        curr = curr->next;\n    }\n    std::cout << \"nullptr\" << std::endl;\n    return 0;\n}\n",
                    "title": "Instantiate, Chain & Print List",
                    "instruction": "Allocate nodes with new and traverse displaying node values.",
                    "explanation": "Traverses and prints linked list.",
                    "type": "statement"
                }
            ])

        # Default C++ Universal Synthesizer
        return make_plan("C++", ["Header & Main Setup", "Process Operations & Display"], [
            {
                "token": "#include <iostream>\n\nint main() {",
                "insert": "#include <iostream>\n\nint main() {\n    ",
                "title": "Setup C++ Entry Point",
                "instruction": "Type '#include <iostream>' and 'int main() {'.",
                "explanation": "Standard modern C++ entry point.",
                "type": "structure"
            },
            {
                "token": f"std::cout << \"=== {proj} ===\" << std::endl;\n    int a = 25, b = 15;\n    std::cout << \"Sum: \" << (a + b) << \" | Diff: \" << (a - b) << \" | Prod: \" << (a * b) << std::endl;\n    return 0;\n}}",
                "insert": f"std::cout << \"=== {proj} ===\" << std::endl;\n    int a = 25, b = 15;\n    std::cout << \"Sum: \" << (a + b) << \" | Diff: \" << (a - b) << \" | Prod: \" << (a * b) << std::endl;\n    return 0;\n}}\n",
                "title": f"Execute {proj} Logic",
                "instruction": f"Compute and print results for {proj}.",
                "explanation": f"Outputs result using std::cout.",
                "type": "statement"
            }
        ])
