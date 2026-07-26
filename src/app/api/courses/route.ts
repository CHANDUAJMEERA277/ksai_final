import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const LANGUAGE_COURSES = [
  {
    title: "C Language Mastery & System Programming",
    description: "Learn C programming from scratch: pointers, memory allocation (malloc/free), structs, file I/O, and low-level system design. 90-day course validity.",
    language: "c",
    price: 1499,
    validityDays: 90,
    instructor: "Dr. Elena Rostova",
    level: "Beginner",
    category: "C Programming",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    duration: "90 Days Access & stroke; 20 Hours",
    lessons: 15,
    rating: 4.95,
  },
  {
    title: "C++ Object-Oriented & STL Masterclass",
    description: "Master modern C++17/C++20: OOP design, smart pointers, Standard Template Library (STL vectors, maps), and performance optimization. 90-day course validity.",
    language: "cpp",
    price: 1999,
    validityDays: 90,
    instructor: "Marcus Vance",
    level: "Intermediate",
    category: "C++ Programming",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    duration: "90 Days Access & stroke; 25 Hours",
    lessons: 18,
    rating: 4.9,
  },
  {
    title: "Python AI & Data Structures Architecture",
    description: "Master Python programming: OOP, list comprehensions, decorators, algorithms, DSA, and AI model integration. 90-day course validity.",
    language: "python",
    price: 2499,
    validityDays: 90,
    instructor: "Sophia Chen",
    level: "Beginner to Advanced",
    category: "Python Programming",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    duration: "90 Days Access & stroke; 30 Hours",
    lessons: 22,
    rating: 4.98,
  },
  {
    title: "Java Enterprise & Object-Oriented Architecture",
    description: "Master Core Java, Multithreading, JVM Memory Management, Collections, Streams API, and Spring Boot foundations. 90-day course validity.",
    language: "java",
    price: 1999,
    validityDays: 90,
    instructor: "Alex Rivera",
    level: "Intermediate",
    category: "Java Programming",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    duration: "90 Days Access & stroke; 28 Hours",
    lessons: 20,
    rating: 4.88,
  },
];

export async function GET() {
  try {
    let courses = await db.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { chapters: true },
    });

    // Re-seed C, C++, Python, Java catalog if empty, outdated, or chapters are missing
   const pythonCourse = courses.find(
  (c: { language: string }) => c.language === "python"
);

const needsPythonReseed =
  !pythonCourse ||
  pythonCourse.chapters.some(
    (ch: { orderNumber: number; explanation: string }) =>
      (ch.orderNumber === 1 &&
        ch.explanation !== "content/python/chapter1.md") ||
      (ch.orderNumber === 2 &&
        ch.explanation !== "content/python/chapter2.md") ||
      (ch.orderNumber === 3 &&
        ch.explanation !== "content/python/chapter3.md") ||
      (ch.orderNumber === 4 &&
        ch.explanation !== "content/python/chapter4.md")
  );

if (
  courses.length === 0 ||
  !courses.some((c: { language: string }) => c.language === "c") ||
  courses.some((c: { chapters?: any[] | null }) => !c.chapters || c.chapters.length === 0) ||
  needsPythonReseed
) {
      await db.course.deleteMany({});
      
      for (const courseData of LANGUAGE_COURSES) {
        let chaptersToCreate = [];

        if (courseData.language === "python") {
          // Custom Python Chapters including Chapter 0
          chaptersToCreate = [
            {
              orderNumber: 0,
              title: "Chapter 0: Introduction to Programming",
              explanation: "content/python/chapter0.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is programming, in the simplest sense?", options: ["Designing a computer's hardware", "Giving a computer step-by-step instructions to perform a task", "Installing software on a computer", "Connecting a computer to the internet"], answer: 1 },
                { id: 2, question: "Which four ingredients make up essentially every program?", options: ["Data, Instructions, Decisions, Repetition", "Variables, Loops, Classes, Objects", "Hardware, Software, Firmware, Network", "Input, Output, Storage, Display"], answer: 0 },
                { id: 3, question: "Who created the Python programming language?", options: ["Dennis Ritchie", "James Gosling", "Guido van Rossum", "Bjarne Stroustrup"], answer: 2 },
                { id: 4, question: "What is Python's name actually inspired by?", options: ["The snake species", "The Monty Python comedy show", "A university project code name", "The Greek word for 'many'"], answer: 1 },
                { id: 5, question: "Python is best described as a:", options: ["Low-level, hardware-specific language", "High-level, general-purpose language", "Markup language", "Query language only for databases"], answer: 1 },
                { id: 6, question: "Which of these is NOT a common real-world use of Python mentioned in this chapter?", options: ["Web development", "Data science", "Operating system kernel development", "Automation / scripting"], answer: 2 },
                { id: 7, question: "When a .py file runs, Python first compiles it into:", options: ["Machine code", "Assembly code", "Bytecode", "HTML"], answer: 2 },
                { id: 8, question: "What actually executes Python's bytecode?", options: ["The operating system directly", "The Python Virtual Machine (PVM)", "The web browser", "The CPU's compiler"], answer: 1 },
                { id: 9, question: "Which statement about compiled languages is TRUE?", options: ["They are translated to machine code before the program runs", "They are translated one line at a time while running", "They never produce errors", "They cannot be platform-specific"], answer: 0 },
                { id: 10, question: "A key practical advantage of interpreted languages like Python is:", options: ["They always run faster than compiled languages", "Faster edit-test-run development cycle", "They don't need an interpreter installed", "They skip translation entirely"], answer: 1 },
                { id: 11, question: "What does the following code print?  print(\"Hello, World!\")", options: ["Hello, World! (with quotes)", "Hello, World!", "An error, because print needs two arguments", "Nothing, since print() only works in files named main.py"], answer: 1 },
                { id: 12, question: "If you get NameError: name 'print' is not defined, what is the most likely cause?", options: ["Python isn't installed", "print was typed with the wrong case, like Print", "The file wasn't saved", "The internet connection is down"], answer: 1 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 1,
              title: "Chapter 1: Language Syntax, Variables & Data Types",
              explanation: "content/python/chapter1.md",
              quizData: JSON.stringify([
                { id: 1, question: "Which of these is a valid Python variable name?", options: ["2nd_score", "student-name", "student_name", "class"], answer: 2 },
                { id: 2, question: "What does it mean that Python is \"dynamically typed\"?", options: ["Variable types must be declared before use", "A variable's type is determined by its current value and can change on reassignment", "Only numbers can be stored in variables", "Types are fixed permanently once a variable is created"], answer: 1 },
                { id: 3, question: "What is the type of the value produced by: 7 / 2", options: ["int", "float", "str", "bool"], answer: 1 },
                { id: 4, question: "In Program 1.3, what does num1 + num2 produce if num1 = \"12\" and num2 = \"8\" (without casting)?", options: ["20", "\"128\"", "An error", "20.0"], answer: 1 },
                { id: 5, question: "What does int(\"3.5\") do?", options: ["Returns 3", "Returns 3.5", "Raises a ValueError", "Returns \"3\""], answer: 2 },
                { id: 6, question: "What is the result of 17 % 5?", options: ["3", "2", "3.4", "12"], answer: 1 },
                { id: 7, question: "What is the result of 2 ** 3?", options: ["6", "8", "9", "5"], answer: 1 },
                { id: 8, question: "Which operator checks whether two values are equal?", options: ["=", "==", "!=", "eq"], answer: 1 },
                { id: 9, question: "What does input() always return, regardless of what the user types?", options: ["An int", "A float", "A str", "A bool"], answer: 2 },
                { id: 10, question: "In Program 1.5, what does the :.2f inside f\"{bmi:.2f}\" control?", options: ["The variable's type", "Rounding the number to 2 decimal places when displayed", "The number of times it prints", "Converting the number to a string permanently"], answer: 1 },
                { id: 11, question: "Which of these is the modern, recommended way to format a string with variables in Python 3.6+?", options: ["% formatting", ".format() method", "f-strings", "String concatenation with +"], answer: 2 },
                { id: 12, question: "According to PEP 8, how many spaces should be used per indentation level?", options: ["2", "3", "4", "8"], answer: 2 },
                { id: 13, question: "What will print(f\"{2 + 3}\") output?", options: ["2 + 3", "5", "\"2 + 3\"", "An error"], answer: 1 },
                { id: 14, question: "Which naming convention does PEP 8 recommend for variables and functions?", options: ["camelCase", "PascalCase", "snake_case", "kebab-case"], answer: 2 }
              ]),
              challenges: JSON.stringify([
                { id: "easy", title: "Print Hello World & User Age", difficulty: "Easy", initialCode: "// Write your code below\n" },
                { id: "medium", title: "Calculate Circle Area & Perimeter", difficulty: "Medium", initialCode: "// Calculate area = PI * r * r\n" },
                { id: "hard", title: "Swap Two Variables Without Temp Variable", difficulty: "Hard", initialCode: "// Swap a and b without third variable\n" },
              ]),
            },
            {
              orderNumber: 2,
              title: "Chapter 2: Conditional Logic, Loops & Control Flow",
              explanation: "content/python/chapter2.md",
              quizData: JSON.stringify([
                { id: 1, question: "What determines which lines belong to an if block in Python?", options: ["Curly braces {}", "Indentation", "Semicolons", "Parentheses"], answer: 1 },
                { id: 2, question: "In an if / elif / else chain, when does the else block run?", options: ["Always, after every if", "Only when its own condition is True", "When none of the earlier conditions were True", "Before the if block"], answer: 2 },
                { id: 3, question: "What does this code print?\n\nscore = 82\nif score >= 90:\n    print(\"A\")\nelif score >= 75:\n    print(\"B\")\nelif score >= 60:\n    print(\"C\")\nelse:\n    print(\"F\")", options: ["A", "B", "C", "F"], answer: 1 },
                { id: 4, question: "Which loop is best when you know exactly how many items you need to iterate over (e.g. a list)?", options: ["while loop", "for loop", "do-while loop", "if loop"], answer: 1 },
                { id: 5, question: "What does this code print?\n\nn = 3\nwhile n > 0:\n    print(n)\n    n -= 1", options: ["3 2 1", "3 2 1 0", "1 2 3", "An infinite loop"], answer: 0 },
                { id: 6, question: "What is the main risk with a while loop?", options: ["It can only run once", "It may become an infinite loop if the condition never becomes False", "It cannot use break", "It only works with numbers"], answer: 1 },
                { id: 7, question: "What does this code print?\n\nfor num in range(6):\n    if num == 4:\n        break\n    if num % 2 == 0:\n        continue\n    print(num)", options: ["1 3", "0 1 2 3", "1 3 5", "0 2"], answer: 0 },
                { id: 8, question: "What is pass used for?", options: ["To exit a loop early", "As a placeholder that does nothing, keeping the syntax valid", "To pause execution and wait for input", "To skip an iteration"], answer: 1 },
                { id: 9, question: "What does range(2, 10, 2) produce when looped over?", options: ["2 4 6 8", "2 4 6 8 10", "2 3 4 5 6 7 8 9", "0 2 4 6 8"], answer: 0 },
                { id: 10, question: "Fill in the blank so this loop prints each fruit with its position, starting from 1:\n\nfor i, fruit in ____(fruits, start=1):", options: ["range", "zip", "enumerate", "len"], answer: 2 },
                { id: 11, question: "What does this code print?\n\nnames = [\"A\", \"B\"]\nnums = [1, 2]\nfor n, x in zip(names, nums):\n    print(n, x)", options: ["A 1 B 2 (on two lines)", "A B 1 2 (on one line)", "An error, since zip only takes one list", "1 A 2 B (on two lines)"], answer: 0 },
                { id: 12, question: "Fill in the blank to correctly total the list using the accumulator pattern: total starts at 0.\n\nnums = [3, 6, 9]\ntotal = 0\nfor n in nums:\n    total ____ n\nprint(total) # should print 18", options: ["=", "+=", "==", "append"], answer: 1 },
                { id: 13, question: "In a nested loop (a for loop inside another for loop), what happens first?", options: ["Both loops run at the same time", "The outer loop finishes completely before the inner loop starts", "The inner loop completes all its iterations for each single iteration of the outer loop", "Nested loops are not allowed in Python"], answer: 2 },
                { id: 14, question: "What does this nested loop print, line by line?\n\nfor row in range(2):\n    for col in range(2):\n        print(row, col)", options: ["0 0 / 0 1 / 1 0 / 1 1", "0 0 / 1 1", "0 1 / 0 1", "An error — loops cannot be nested"], answer: 0 },
                { id: 15, question: "In the search pattern below, what keyword correctly belongs in the blank to stop the loop once the target is found?\n\nnames = [\"Kiran\", \"Divya\", \"Arjun\"]\ntarget = \"Divya\"\nfor name in names:\n    if name == target:\n        found = True\n        ____\nprint(found)", options: ["continue", "pass", "break", "return"], answer: 2 }
              ]),
              challenges: JSON.stringify([
                { id: "easy", title: "Check Even or Odd Number", difficulty: "Easy", initialCode: "// Write code to check if n is even or odd\n" },
              ]),
            },
            {
              orderNumber: 3,
              title: "Chapter 3: Data Structures",
              explanation: "content/python/chapter3.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is the index of the first item in a Python list?", options: ["-1", "1", "0", "It depends on the list"], answer: 2 },
                { id: 2, question: "What does this code print?\n\nletters = [\"a\",\"b\",\"c\",\"d\"]\nprint(letters[1:3])", options: ["['b','c']", "['b','c','d']", "['a','b','c']", "['c','d']"], answer: 0 },
                { id: 3, question: "Which of these correctly describes a tuple?", options: ["An ordered, mutable collection", "An ordered, immutable collection", "An unordered collection of unique items", "A key-value store"], answer: 1 },
                { id: 4, question: "What does this code print?\n\npoint=(1,2,3)\nx,y,z=point\nprint(x,y,z)", options: ["(1,2,3)", "1 2 3", "An error", "[1,2,3]"], answer: 1 },
                { id: 5, question: "Which method safely looks up a dictionary key, returning None instead of raising an error if it's missing?", options: ["dict.find()", "dict.get()", "dict.search()", "dict.lookup()"], answer: 1 },
                { id: 6, question: "What does this code print?\n\nd={\"a\":1,\"b\":2}\nfor k,v in d.items():\n    print(k,v)", options: ["dict_items([('a',1),('b',2)])", "a 1 / b 2 (each on its own line)", "An error — dictionaries can't be looped over", "['a','b']"], answer: 1 },
                { id: 7, question: "What is the result of {1,2,3} & {2,3,4}?", options: ["{1,2,3,4}", "{2,3}", "{1}", "{1,4}"], answer: 1 },
                { id: 8, question: "Why might converting a list to a set to remove duplicates be risky?", options: ["Sets cannot hold strings", "Sets don't preserve the original order", "Sets only allow numbers", "It always raises an error"], answer: 1 },
                { id: 9, question: "What does word[::-1] do to a string?", options: ["Removes all whitespace", "Converts it to uppercase", "Reverses the string", "Returns the first character only"], answer: 2 },
                { id: 10, question: "Why can't you do word[0] = \"P\" on a string called word?", options: ["Strings don't support indexing", "Strings are immutable", "Only lists support assignment", "It's actually allowed"], answer: 1 },
                { id: 11, question: "What is the output of this list comprehension?\n\nnums=[1,2,3,4,5]\nresult=[n**2 for n in nums]\nprint(result)", options: ["[1,2,3,4,5]", "[1,4,9,16,25]", "[2,4,6,8,10]", "An error"], answer: 1 },
                { id: 12, question: "In inventory[\"fruits\"].append(\"mango\"), what type must inventory[\"fruits\"] be?", options: ["A dictionary", "A set", "A list", "A tuple"], answer: 2 },
                { id: 13, question: "Fill in the blank so this correctly counts word frequency without a KeyError on new words:\n\nfrequency={}\nfor word in words:\n    ____", options: ["frequency[word] += 1", "frequency[word] = frequency.get(word, 0) + 1", "frequency.add(word)", "frequency[word] = 1"], answer: 1 },
                { id: 14, question: "Which data structure would best model a user's fixed home coordinates (latitude, longitude) that should never change?", options: ["List", "Dictionary", "Set", "Tuple"], answer: 3 },
                { id: 15, question: "What does print(inventory[\"vegetables\"][0]) require to work correctly?", options: ["inventory must be a list", "\"vegetables\" must be a valid key, and its value must be a list", "inventory must be a set", "Nothing — it always works"], answer: 1 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 4,
              title: "Chapter 4: Functions",
              explanation: "content/python/chapter4.md",
              quizData: JSON.stringify([
                { id: 1, question: "What keyword is used to define a function in Python?", options: ["func", "define", "def", "function"], answer: 2 },
                { id: 2, question: "What does this code print?\n\ndef greet(name):\n    print(f\"Hello, {name}!\")\ngreet(\"Ravi\")", options: ["Nothing — it just defines the function", "Hello, Ravi!", "An error", "Hello, name!"], answer: 1 },
                { id: 3, question: "In describe_pet(name, animal_type=\"dog\"), what happens if you call describe_pet(\"Rex\")?", options: ["TypeError — animal_type is required", "animal_type defaults to \"dog\"", "animal_type is None", "It's a syntax error"], answer: 1 },
                { id: 4, question: "What data type does *args collect its values into?", options: ["A list", "A dictionary", "A tuple", "A set"], answer: 2 },
                { id: 5, question: "What data type does **kwargs collect its values into?", options: ["A list", "A dictionary", "A tuple", "A set"], answer: 1 },
                { id: 6, question: "What does this function return when called as result = add_side_effect(2, 3)?\n\ndef add_side_effect(a,b):\n    print(a+b)", options: ["5", "None", "An error", "\"5\""], answer: 1 },
                { id: 7, question: "Why does this code raise an UnboundLocalError?\n\ncounter=0\ndef increment():\n    counter+=1", options: ["counter was never defined anywhere", "Python treats counter as local inside increment() without the global keyword", "+= is not a valid operator", "It doesn't — this code runs fine"], answer: 1 },
                { id: 8, question: "Which keyword lets a nested inner() function modify a variable from its enclosing outer() function (not the global scope)?", options: ["global", "nonlocal", "local", "outer"], answer: 1 },
                { id: 9, question: "Which of these is a valid lambda that squares a number?", options: ["lambda n: n ** 2", "lambda n: return n ** 2", "def lambda(n): n ** 2", "lambda(n) => n ** 2"], answer: 0 },
                { id: 10, question: "Why can't a lambda contain an if/else block with multiple statements?", options: ["Lambdas can only contain a single expression", "Lambdas don't support conditionals at all", "Lambdas must always return None", "This is actually allowed"], answer: 0 },
                { id: 11, question: "What are the two essential parts of any correct recursive function?", options: ["A loop and a counter", "A base case and a recursive case", "A return statement and a print statement", "Two function calls"], answer: 1 },
                { id: 12, question: "What error occurs if a recursive function's base case is never reached?", options: ["SyntaxError", "TypeError", "RecursionError (maximum recursion depth exceeded)", "No error — it just runs forever silently"], answer: 2 },
                { id: 13, question: "What does this code print?\n\ndef factorial(n):\n    if n==0 or n==1:\n        return 1\n    return n*factorial(n-1)\nprint(factorial(4))", options: ["6", "24", "120", "An error"], answer: 2 },
                { id: 14, question: "Where should a function's docstring be placed?", options: ["Anywhere in the file", "As the first line inside the function body", "Only in a separate documentation file", "Before the def keyword"], answer: 1 },
                { id: 15, question: "Which best describes when to prefer iteration over recursion?", options: ["Never — recursion is always better", "When either approach works cleanly, since iteration is typically faster and uses less memory", "Only when working with strings", "Iteration should never be used in Python"], answer: 1 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 5,
              title: "Chapter 5: Object-Oriented Design & Projects",
              explanation: "Chapter 5 brings everything together: classes, objects, inheritance, polymorphism, and building full-scale applications.",
              quizData: "[]",
              challenges: "[]",
            }
          ];
        } else {
          // Standard Chapters for other courses (C, C++, Java) starting at 1
          chaptersToCreate = [
            {
              orderNumber: 1,
              title: "Chapter 1: Language Syntax, Variables & Data Types",
              explanation: `Welcome to Chapter 1! In this lesson, we will explore fundamental data types, variable declarations, memory representation, and syntax rules for ${courseData.title}. Variables store data values in computer memory. Pay close attention to data type constraints and memory allocation.`,
              quizData: JSON.stringify([
                { id: 1, question: "What is the size of an integer in memory?", options: ["2 or 4 Bytes", "1 Byte", "8 Bytes", "Depends on OS"], answer: 0 },
                { id: 2, question: "Which keyword is used to declare a constant?", options: ["const", "final", "static", "immutable"], answer: 0 },
                { id: 3, question: "What is the default value of uninitialized local variables?", options: ["Garbage Value / Undefined", "Zero", "Null", "False"], answer: 0 },
                { id: 4, question: "Which operator is used to fetch memory address in C/C++?", options: ["& (Address-of)", "* (Dereference)", "%", "->"], answer: 0 },
                { id: 5, question: "What happens when you divide an integer by zero?", options: ["Runtime Error / DivideByZero Exception", "Infinity", "Zero", "NaN"], answer: 0 },
              ]),
              challenges: JSON.stringify([
                { id: "easy", title: "Print Hello World & User Age", difficulty: "Easy", initialCode: "// Write your code below\n" },
                { id: "medium", title: "Calculate Circle Area & Perimeter", difficulty: "Medium", initialCode: "// Calculate area = PI * r * r\n" },
                { id: "hard", title: "Swap Two Variables Without Temp Variable", difficulty: "Hard", initialCode: "// Swap a and b without third variable\n" },
              ]),
            },
            {
              orderNumber: 2,
              title: "Chapter 2: Conditional Logic, Loops & Control Flow",
              explanation: "Chapter 2 focuses on decision making using if-else statements, switch cases, and iteration loops (for, while, do-while). Control flow allows your code to branch and repeat execution dynamically.",
              quizData: JSON.stringify([
                { id: 1, question: "Which loop guarantees at least one execution?", options: ["do-while loop", "for loop", "while loop", "foreach loop"], answer: 0 },
              ]),
              challenges: JSON.stringify([
                { id: "easy", title: "Check Even or Odd Number", difficulty: "Easy", initialCode: "// Write code to check if n is even or odd\n" },
              ]),
            },
            {
              orderNumber: 3,
              title: "Chapter 3: Functions, Scope & Recursion",
              explanation: "Chapter 3 covers modular programming: function definitions, parameters, return types, call stack execution, and recursive algorithm design.",
              quizData: "[]",
              challenges: "[]",
            },
            {
              orderNumber: 4,
              title: "Chapter 4: Arrays, Pointers & Memory Management",
              explanation: "Chapter 4 delves into memory layout, array indexing, pointer arithmetic, and heap vs stack allocation.",
              quizData: "[]",
              challenges: "[]",
            },
            {
              orderNumber: 5,
              title: "Chapter 5: Object-Oriented Design & Projects",
              explanation: "Chapter 5 brings everything together: classes, objects, inheritance, polymorphism, and building full-scale applications.",
              quizData: "[]",
              challenges: "[]",
            }
          ];
        }

        await db.course.create({
          data: {
            ...courseData,
            chapters: {
              create: chaptersToCreate,
            },
          },
        });
      }

      courses = await db.course.findMany({
        orderBy: { createdAt: "desc" },
        include: { chapters: true },
      });
    }

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Fetch Courses Error:", error);
    return NextResponse.json(
      { error: "Failed to load programming courses catalog." },
      { status: 500 }
    );
  }
}
