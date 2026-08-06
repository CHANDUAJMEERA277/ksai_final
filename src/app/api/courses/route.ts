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
  pythonCourse.chapters.length < 11 ||
  pythonCourse.chapters.some(
    (ch: { orderNumber: number; explanation: string }) =>
      (ch.orderNumber === 1 &&
        ch.explanation !== "content/python/chapter1.md") ||
      (ch.orderNumber === 2 &&
        ch.explanation !== "content/python/chapter2.md") ||
      (ch.orderNumber === 3 &&
        ch.explanation !== "content/python/chapter3.md") ||
      (ch.orderNumber === 4 &&
        ch.explanation !== "content/python/chapter4.md") ||
      (ch.orderNumber === 5 &&
        ch.explanation !== "content/python/chapter5.md") ||
      (ch.orderNumber === 6 &&
        ch.explanation !== "content/python/chapter6.md") ||
      (ch.orderNumber === 7 &&
        ch.explanation !== "content/python/chapter7.md") ||
      (ch.orderNumber === 8 &&
        ch.explanation !== "content/python/chapter8.md") ||
      (ch.orderNumber === 9 &&
        ch.explanation !== "content/python/chapter9.md") ||
      (ch.orderNumber === 10 &&
        ch.explanation !== "content/python/chapter10.md")
  );

const javaCourse = courses.find(
  (c: { language: string }) => c.language === "java"
);

const needsJavaReseed =
  !javaCourse ||
  javaCourse.chapters.length < 15 ||
  javaCourse.chapters.some(
    (ch: { orderNumber: number; explanation: string }) =>
      ch.explanation !== `java/chapter${ch.orderNumber}.md`
  );

const cCourse = courses.find(
  (c: { language: string }) => c.language === "c"
);

const needsCReseed =
  !cCourse ||
  cCourse.chapters.length < 11 ||
  cCourse.chapters.some(
    (ch: { orderNumber: number; explanation: string }) =>
      (ch.orderNumber === 0 &&
        ch.explanation !== "content/c/chapter0.md") ||
      (ch.orderNumber === 1 &&
        ch.explanation !== "content/c/chapter1.md") ||
      (ch.orderNumber === 2 &&
        ch.explanation !== "content/c/chapter2.md") ||
      (ch.orderNumber === 3 &&
        ch.explanation !== "content/c/chapter3.md") ||
      (ch.orderNumber === 4 &&
        ch.explanation !== "content/c/chapter4.md") ||
      (ch.orderNumber === 5 &&
        ch.explanation !== "content/c/chapter5.md") ||
      (ch.orderNumber === 6 &&
        ch.explanation !== "content/c/chapter6.md") ||
      (ch.orderNumber === 7 &&
        ch.explanation !== "content/c/chapter7.md") ||
      (ch.orderNumber === 8 &&
        ch.explanation !== "content/c/chapter8.md") ||
      (ch.orderNumber === 9 &&
        ch.explanation !== "content/c/chapter9.md") ||
      (ch.orderNumber === 10 &&
        ch.explanation !== "content/c/chapter10.md")
  );

if (
  courses.length === 0 ||
  !courses.some((c: { language: string }) => c.language === "c") ||
  courses.some((c: { chapters?: any[] | null }) => !c.chapters || c.chapters.length === 0) ||
  needsPythonReseed ||
  needsJavaReseed ||
  needsCReseed
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
              title: "Chapter 5: Object-Oriented Programming",
              explanation: "content/python/chapter5.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is the purpose of the __init__ method in a class?", options: ["It deletes an object when no longer needed", "It runs automatically to set up a new object's initial state", "It defines the class name", "It is optional and rarely used"], answer: 1 },
                { id: 2, question: "In a method definition like def bark(self):, what does self refer to?", options: ["The class itself", "The specific object the method is called on", "A global variable", "Nothing — it's just a naming convention with no real use"], answer: 1 },
                { id: 3, question: "What will this code print?\n\nclass Dog:\n    def __init__(self,name):\n        self.name=name\nrex=Dog(\"Rex\")\nmilo=Dog(\"Milo\")\nprint(rex.name, milo.name)", options: ["Rex Rex", "Rex Milo", "An error", "None None"], answer: 1 },
                { id: 4, question: "What is a class attribute, as opposed to an instance attribute?", options: ["An attribute only usable inside __init__", "An attribute shared by every instance of the class", "An attribute that can never change", "An attribute only accessible from outside the class"], answer: 1 },
                { id: 5, question: "What does @classmethod change about a method's first parameter?", options: ["It becomes self, same as normal", "It becomes cls, referring to the class itself", "It is removed entirely", "It must be named class"], answer: 1 },
                { id: 6, question: "What does this code print?\n\nclass Animal:\n    def speak(self):\n        print(\"...makes a sound.\")\nclass Cat(Animal):\n    def speak(self):\n        print(\"Whiskers says Meow!\")\nCat().speak()", options: ["Whiskers makes a sound.", "Whiskers says Meow!", "An error — Cat has no speak method", "Nothing prints"], answer: 1 },
                { id: 7, question: "What is the purpose of calling super().__init__(...) inside a subclass's constructor?", options: ["To delete the parent class", "To reuse the parent class's setup logic instead of repeating it", "To make the subclass abstract", "It has no real purpose"], answer: 1 },
                { id: 8, question: "What best describes \"duck typing\" in Python?", options: ["Objects must share a common parent class to be used interchangeably", "Python checks whether an object has the needed method/behavior, regardless of its type", "It only applies to numeric types", "It means all objects are automatically compatible"], answer: 1 },
                { id: 9, question: "In Python's naming convention, what does a single leading underscore (e.g. self._pin) signal?", options: ["It is a private attribute enforced by the interpreter", "It is \"internal use\" by convention, but still accessible", "It is a syntax error", "It behaves identically to a double underscore"], answer: 1 },
                { id: 10, question: "Why does self.__balance get renamed internally to _BankAccount__balance?", options: ["This is called name mangling, discouraging accidental outside access", "It's a bug in Python", "It only happens with class attributes, not instance attributes", "It only happens if you use inheritance"], answer: 0 },
                { id: 11, question: "Which dunder method controls what print(my_object) displays?", options: ["__init__", "__repr__ only", "__str__", "__print__"], answer: 2 },
                { id: 12, question: "Without defining __eq__, what does b1 == b2 check for two objects with identical attribute values?", options: ["Whether all their attributes match", "Whether they are the exact same object in memory (identity)", "It always raises an error", "Whether their __str__ output matches"], answer: 1 },
                { id: 13, question: "What happens if you try to instantiate an abstract class directly, e.g. Shape() where Shape(ABC) has an @abstractmethod area()?", options: ["It works fine, returning an empty object", "TypeError — abstract classes with unimplemented abstract methods can't be instantiated", "It silently returns None", "It only fails when area() is later called"], answer: 1 },
                { id: 14, question: "Which relationship does composition model?", options: ["\"is-a\" (e.g. a Cat is an Animal)", "\"has-a\" (e.g. a Car has an Engine)", "Exactly the same thing as inheritance", "No relationship at all"], answer: 1 },
                { id: 15, question: "In the Library example, why is self.__books declared with a double underscore?", options: ["To make it faster to access", "To discourage code outside the class from directly modifying the book list, routing changes through methods like add_book()", "Because lists require double underscores in Python", "It has no functional purpose here"], answer: 1 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 6,
              title: "Chapter 6: Functional & Pythonic Concepts",
              explanation: "content/python/chapter6.md",
              quizData: JSON.stringify([
                { id: 1, question: "What exception does an iterator raise when it has no more values to produce?", options: ["IndexError", "StopIteration", "EndOfLoop", "ValueError"], answer: 1 },
                { id: 2, question: "Which two dunder methods must a custom class implement to be a valid iterator?", options: ["__init__ and __str__", "__iter__ and __next__", "__enter__ and __exit__", "__get__ and __set__"], answer: 1 },
                { id: 3, question: "What keyword turns a regular function into a generator function?", options: ["return", "yield", "async", "gen"], answer: 1 },
                { id: 4, question: "What does calling a generator function (e.g. countdown(3)) do immediately?", options: ["Runs the whole function body right away", "Returns a generator object without running the body yet", "Raises an error unless used in a loop", "Returns a list of all values"], answer: 1 },
                { id: 5, question: "Why are generators considered more memory-efficient than building a full list?", options: ["They compress data automatically", "They produce one value at a time instead of holding the entire sequence in memory", "They run on a separate thread", "They don't actually use any memory"], answer: 1 },
                { id: 6, question: "What does @timer above a function definition actually do?", options: ["Nothing — it's just a comment", "It replaces the function with timer(func), wrapping it with extra behavior", "It deletes the original function", "It only works on class methods"], answer: 1 },
                { id: 7, question: "What is a common real-world use of decorators?", options: ["Defining new data types", "Logging, timing, caching, or authentication checks", "Replacing all loops in a program", "Creating abstract classes"], answer: 1 },
                { id: 8, question: "What guarantee does a with statement provide over manual open()/close()?", options: ["It runs faster", "Cleanup (like closing a file) happens automatically, even if an error occurs inside the block", "It prevents all possible errors", "It automatically retries failed operations"], answer: 1 },
                { id: 9, question: "Which two dunder methods does a custom context manager need to implement?", options: ["__start__ and __stop__", "__enter__ and __exit__", "__open__ and __close__", "__init__ and __del__"], answer: 1 },
                { id: 10, question: "What does this code print?\n\nnumbers=[1,2,3,4,5]\ndoubled=list(map(lambda n: n*2, numbers))\nprint(doubled)", options: ["[1,2,3,4,5]", "[2,4,6,8,10]", "An error, since map needs to be converted first", "A generator object description"], answer: 1 },
                { id: 11, question: "Which module must be imported to use reduce()?", options: ["itertools", "functools", "collections", "operator"], answer: 1 },
                { id: 12, question: "Which bracket type produces a lazy generator expression instead of building the full sequence immediately?", options: ["Square brackets [ ]", "Curly braces { }", "Parentheses ( )", "Angle brackets < >"], answer: 2 },
                { id: 13, question: "What best describes \"first-class functions\" in Python?", options: ["Functions that run faster than others", "Functions that can be assigned to variables, passed as arguments, and returned from other functions", "Only functions defined at the top of a file", "Functions that cannot take any arguments"], answer: 1 },
                { id: 14, question: "In the closure example, what allows double and triple to behave differently even though both come from make_multiplier?", options: ["They are actually copies of the same function with no real difference", "Each closure remembers its own captured value of factor from when it was created", "Python re-runs make_multiplier every time double or triple is called", "It's random behavior"], answer: 1 },
                { id: 15, question: "What does this code print?\n\ndef make_multiplier(factor):\n    def multiplier(n):\n        return n*factor\n    return multiplier\ndouble=make_multiplier(2)\ntriple=make_multiplier(3)\nprint(double(5), triple(5))", options: ["10 15", "5 5", "An error", "None None"], answer: 0 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 7,
              title: "Chapter 7: Error Handling & File I/O",
              explanation: "content/python/chapter7.md",
              quizData: JSON.stringify([
                { id: 1, question: "Which block runs only if the try block completes with no exception?", options: ["except", "else", "finally", "raise"], answer: 1 },
                { id: 2, question: "Which block always runs, whether or not an exception occurred?", options: ["else", "except", "finally", "try"], answer: 2 },
                { id: 3, question: "Why is a bare except: (catching everything) considered risky?", options: ["It's a syntax error in Python 3", "It can silently hide bugs you didn't anticipate, not just the errors you expected", "It only works with ValueError", "It runs slower than specific except blocks"], answer: 1 },
                { id: 4, question: "What does this code print?\n\ndef safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        print(\"Cannot divide by zero.\")\n        return None\n\nprint(safe_divide(10, 0))", options: ["5.0", "Cannot divide by zero. / None", "An error is raised and the program crashes", "None, with no message"], answer: 1 },
                { id: 5, question: "What does the raise keyword do?", options: ["Catches an exception", "Deliberately triggers an exception", "Suppresses all future errors", "Only works inside except blocks"], answer: 1 },
                { id: 6, question: "How do you define a custom exception class in Python?", options: ["class MyError(Exception): pass", "def MyError(): raise", "exception MyError: pass", "class MyError(): pass"], answer: 0 },
                { id: 7, question: "Why define a custom exception instead of always using a built-in one like ValueError?", options: ["Custom exceptions run faster", "It gives calling code a precise, descriptive name to catch, clarifying intent", "Built-in exceptions are deprecated", "There's no real difference"], answer: 1 },
                { id: 8, question: "Which function writes a Python dictionary directly to an open file as JSON?", options: ["json.write()", "json.dump()", "json.save()", "json.export()"], answer: 1 },
                { id: 9, question: "What's the key difference between json.dump() and json.dumps()?", options: ["There is no difference", "dump() writes to a file object; dumps() returns a JSON string", "dumps() only works with lists", "dump() is for reading, dumps() is for writing"], answer: 1 },
                { id: 10, question: "Which csv reader lets you access each row's values by column name (like a dictionary)?", options: ["csv.reader", "csv.DictReader", "csv.ListReader", "csv.NamedReader"], answer: 1 },
                { id: 11, question: "In pathlib, what does the / operator do between two path parts?", options: ["Performs division", "Joins them into a combined path", "Raises an error — / isn't valid for paths", "Deletes the first path"], answer: 1 },
                { id: 12, question: "For a Path object p pointing to \"data/report.csv\", what does p.suffix return?", options: ["\"data\"", "\"report\"", "\".csv\"", "\"data/report.csv\""], answer: 2 },
                { id: 13, question: "Why is with open(...) as f: preferred over manual open()/close()?", options: ["It's shorter to type, with no other benefit", "It guarantees the file is closed automatically, even if an error occurs while reading/writing", "It's the only way to open a file in Python", "It automatically converts the file to JSON"], answer: 1 },
                { id: 14, question: "What does this code print if settings.txt does not exist?\n\ndef read_config(path):\n    try:\n        with open(path, \"r\") as f:\n            return f.read()\n    except FileNotFoundError:\n        print(f\"Config file not found: {path}\")\n        return None\n\nread_config(\"settings.txt\")", options: ["An unhandled FileNotFoundError, crashing the program", "Config file not found: settings.txt", "An empty string with no message", "It creates the file automatically with no error"], answer: 1 },
                { id: 15, question: "In the expense tracker project, why does add_expense() check amount <= 0 and raise before writing to the CSV?", options: ["To make the function run faster", "To prevent invalid data from ever being written to the file", "Because CSV files can't store negative numbers", "There's no real reason — it's just a style choice"], answer: 1 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 8,
              title: "Chapter 8: Modules, Packages & Environment",
              explanation: "content/python/chapter8.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is the main difference between a module and a package?", options: ["There is no difference", "A module is a single .py file; a package is a folder of related modules", "A package can only contain one module", "Modules can only be built-in, packages must be custom"], answer: 1 },
                { id: 2, question: "What is the traditional purpose of __init__.py in a package folder?", options: ["It stores the package's version number only", "Its presence marks the folder as a Python package (and can run setup code)", "It must contain all the package's functions directly", "It is required to run any Python script"], answer: 1 },
                { id: 3, question: "What does from math import sqrt as square_root do?", options: ["Imports the entire math module under a new name", "Imports only the sqrt function, accessible as square_root", "Raises an ImportError", "Imports sqrt but keeps its original name only"], answer: 1 },
                { id: 4, question: "Which standard library module would you use to get today's date?", options: ["os", "datetime", "itertools", "sys"], answer: 1 },
                { id: 5, question: "What does Counter(words) from the collections module return?", options: ["A sorted list of unique words", "A dictionary-like object mapping each word to its count", "The total number of words", "A single string of all words joined together"], answer: 1 },
                { id: 6, question: "Why is defaultdict(list) useful compared to a plain dictionary?", options: ["It automatically sorts its keys", "Accessing a missing key returns a new empty list instead of raising a KeyError", "It only stores lists, never other types", "It's simply a faster version of dict"], answer: 1 },
                { id: 7, question: "What is the main purpose of a virtual environment (venv)?", options: ["To make Python code run faster", "To isolate a project's dependencies from the system Python and other projects", "To automatically write your code for you", "To replace the need for pip entirely"], answer: 1 },
                { id: 8, question: "What happens if you run pip install requests without an activated virtual environment?", options: ["It fails immediately", "It typically installs the package globally on the system Python", "It only installs it temporarily for one script", "Nothing happens — pip requires a venv to function at all"], answer: 1 },
                { id: 9, question: "What command generates a requirements.txt from the currently installed packages?", options: ["pip list > requirements.txt", "pip freeze > requirements.txt", "pip save requirements.txt", "python freeze requirements.txt"], answer: 1 },
                { id: 10, question: "What does pip install -r requirements.txt do?", options: ["Creates a new requirements.txt file", "Installs every package listed in requirements.txt", "Removes all installed packages", "Only works for a single package at a time"], answer: 1 },
                { id: 11, question: "What's the difference between requests==2.31.0 and requests>=2.31.0 in a requirements.txt?", options: ["There is no difference", "== pins that exact version; >= allows that version or any newer one", "== means \"do not install\"; >= means \"install\"", ">= is not valid syntax in requirements.txt"], answer: 1 },
                { id: 12, question: "In from utils.validators import is_valid_email, what does utils.validators refer to?", options: ["A single file named utils.validators.py", "The validators module inside the utils package", "A built-in Python function", "An error — dots aren't allowed in imports"], answer: 1 },
                { id: 13, question: "What is the purpose of if __name__ == \"__main__\": in a module?", options: ["It prevents the file from ever being imported", "It lets code run only when the file is executed directly, not when imported elsewhere", "It marks the file as the main package file", "It has no functional effect in Python"], answer: 1 },
                { id: 14, question: "When validators.py is imported by main.py (not run directly), what is __name__ equal to inside validators.py?", options: ["\"__main__\"", "The module's own name, e.g. \"validators\"", "\"main.py\"", "An empty string"], answer: 1 },
                { id: 15, question: "Which real-world scenario best matches the purpose of splitting code into your own modules?", options: ["Making a single script file as long as possible", "Structuring a production codebase into organized, reusable pieces like models/, utils/, services/", "Avoiding the use of functions entirely", "Preventing any code reuse between files"], answer: 1 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 9,
              title: "Chapter 9: Applied Python",
              explanation: "content/python/chapter9.md",
              quizData: JSON.stringify([
                { id: 1, question: "Which library is the standard way to make HTTP requests to a web API in Python?", options: ["sockets", "requests", "http.client only", "urllib2"], answer: 1 },
                { id: 2, question: "What does response.json() do?", options: ["Saves the response to a file named response.json", "Parses the response body as JSON into a Python dict/list", "Converts a dict into a JSON string", "Checks whether the response was successful"], answer: 1 },
                { id: 3, question: "What does a status code of 200 indicate?", options: ["The request failed", "The request succeeded", "The server is down", "The response body is empty"], answer: 1 },
                { id: 4, question: "Why call response.raise_for_status() before using response.json()?", options: ["It formats the JSON nicely", "It raises an exception automatically if the response indicates an error (4xx/5xx)", "It speeds up the request", "It has no real effect"], answer: 1 },
                { id: 5, question: "What should you check before scraping a website's HTML?", options: ["Nothing — scraping is always allowed", "The site's robots.txt and terms of service", "Only the website's color scheme", "The scraping library's version number"], answer: 1 },
                { id: 6, question: "Which library is commonly used alongside requests to parse and search HTML content?", options: ["json", "BeautifulSoup", "re", "pathlib"], answer: 1 },
                { id: 7, question: "Why are OS-level schedulers (like cron) often preferred over a Python script with an infinite sleep loop for production automation?", options: ["Python can't use loops for scheduling", "They survive reboots and don't depend on one long-running process staying alive", "cron is written in Python internally", "sleep() doesn't work outside virtual environments"], answer: 1 },
                { id: 8, question: "What does the regex pattern \\d+ match?", options: ["Exactly one digit", "One or more digits", "Any word character", "Zero or more letters"], answer: 1 },
                { id: 9, question: "What does re.findall(r\"[\\w.]+@[\\w.]+\", text) return?", options: ["True or False depending on a match", "A list of all matching substrings (e.g. email addresses) found in text", "The first match only, as a string", "A modified version of text with matches removed"], answer: 1 },
                { id: 10, question: "Why should regex patterns in Python be written as raw strings (r\"...\")?", options: ["Raw strings run faster", "Without the r prefix, backslashes get interpreted as Python escape sequences first, breaking the pattern", "re.findall() only accepts raw strings as an argument type", "It's purely a style preference with no functional effect"], answer: 1 },
                { id: 11, question: "What does re.sub(r\"\\d\", \"*\", \"PIN 4821\") return?", options: ["\"PIN 4821\"", "\"PIN ****\"", "\"4821\"", "An error"], answer: 1 },
                { id: 12, question: "Which function converts a date string like \"2026-07-16\" into a datetime object?", options: ["datetime.strftime()", "datetime.strptime()", "datetime.parse()", "datetime.now()"], answer: 1 },
                { id: 13, question: "Which function converts a datetime object into a formatted display string?", options: ["datetime.strptime()", "datetime.strftime()", "datetime.today()", "datetime.format()"], answer: 1 },
                { id: 14, question: "What does due_date = parsed + timedelta(days=30) compute?", options: ["30 days before parsed", "A new datetime, 30 days after parsed", "The current date plus 30 days, ignoring parsed entirely", "An error, since datetimes can't be added to"], answer: 1 },
                { id: 15, question: "In the Weather CLI project, what is the purpose of is_valid_city() using a regex?", options: ["To fetch the weather data directly", "To reject clearly invalid input (like symbols or numbers) before making an API call", "To format the final display string", "To convert the city name to JSON"], answer: 1 }
              ]),
              challenges: "[]",
            },
            {
              orderNumber: 10,
              title: "Chapter 10: Advanced Python Concepts",
              explanation: "content/python/chapter10.md",
              quizData: JSON.stringify([
                { id: 1, question: "Which dunder method allows a custom object to support the + operator?", options: ["__plus__", "__add__", "__sum__", "__combine__"], answer: 1 },
                { id: 2, question: "Which dunder method allows a custom object to be indexed like obj[0]?", options: ["__index__", "__getitem__", "__get__", "__item__"], answer: 1 },
                { id: 3, question: "What is the primary mechanism CPython uses to manage memory for most objects?", options: ["Manual memory allocation by the programmer", "Reference counting", "A fixed memory pool per variable", "Memory is never freed automatically"], answer: 1 },
                { id: 4, question: "Why can't reference counting alone free a circular reference (two objects referencing each other)?", options: ["Circular references are not allowed in Python", "Each object's reference count never reaches zero because they keep each other \"alive\"", "Python doesn't support object references at all", "Reference counting only works for numbers"], answer: 1 },
                { id: 5, question: "What does Python's cyclic garbage collector do?", options: ["It deletes all objects periodically, regardless of use", "It periodically detects and cleans up circular references that reference counting can't free", "It only runs when the program exits", "It prevents any object from ever being freed"], answer: 1 },
                { id: 6, question: "What does this code print for `original`?\n\noriginal = [1, 2, 3]\nsame_object = original\nsame_object[0] = 99\nprint(original)", options: ["[1, 2, 3]", "[99, 2, 3]", "An error", "None"], answer: 1 },
                { id: 7, question: "In a shallow copy of a list containing a nested list, what happens if you modify the nested list through the copy?", options: ["Only the copy changes; the original is unaffected", "Both the copy and the original are affected, since the nested list is still shared", "It raises a TypeError", "Shallow copies don't allow modifying nested lists"], answer: 1 },
                { id: 8, question: "Which function creates a copy where even nested objects are fully independent?", options: ["copy.copy()", "copy.deepcopy()", "list.copy()", "Plain assignment (=)"], answer: 1 },
                { id: 9, question: "Which concurrency approach is best suited for CPU-bound, heavy computation?", options: ["threading", "multiprocessing", "asyncio", "None of these help with CPU-bound work"], answer: 1 },
                { id: 10, question: "Why doesn't threading speed up CPU-heavy Python code?", options: ["Threads can't be created in Python", "The Global Interpreter Lock (GIL) allows only one thread to run Python bytecode at a time", "Threads only work with asyncio", "threading is deprecated in modern Python"], answer: 1 },
                { id: 11, question: "What keyword pair is used to define and call asynchronous functions with asyncio?", options: ["async and await", "thread and join", "yield and next", "lambda and def"], answer: 0 },
                { id: 12, question: "What is a metaclass?", options: ["A class that has no methods", "A blueprint for classes themselves — classes are instances of it", "A synonym for a regular class", "A built-in Python data type like list or dict"], answer: 1 },
                { id: 13, question: "Are type hints enforced at runtime by the Python interpreter?", options: ["Yes, Python raises an error if a hinted type is violated", "No — they're optional annotations checked by external tools (linters, mypy), not enforced by the interpreter itself", "Only inside classes", "Only when using the asyncio module"], answer: 1 },
                { id: 14, question: "What does Optional[dict] from the typing module indicate?", options: ["The value must always be a dict", "The value is either a dict or None", "The value must be a list of dicts", "The function must return nothing"], answer: 1 },
                { id: 15, question: "Which is a strong real-world reason to use type hints in a large codebase?", options: ["They make the code run faster at runtime", "They make a function's expected inputs/outputs explicit, helping tools and teammates catch mismatches early", "They are required for Python code to execute at all", "They replace the need for testing entirely"], answer: 1 }
              ]),
              challenges: "[]",
            }
          ];
        } else if (courseData.language === "java") {
          chaptersToCreate = [
            { orderNumber: 1, title: "Chapter 1: Introduction to Java", explanation: "java/chapter1.md", quizData: JSON.stringify([{ id: 1, question: "What is the core philosophy of Java?", options: ["Write Once, Run Anywhere", "Compile Everywhere", "Script On The Fly", "Interpret Only"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 2, title: "Chapter 2: First Java Program & Architecture", explanation: "java/chapter2.md", quizData: JSON.stringify([{ id: 1, question: "Why is main static?", options: ["To run without instantiating an object", "To prevent access", "To speed up return", "To restrict memory"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 3, title: "Chapter 3: Variables, Data Types & Control Flow", explanation: "java/chapter3.md", quizData: JSON.stringify([{ id: 1, question: "What is the size of char in Java?", options: ["2 Bytes (Unicode)", "1 Byte", "4 Bytes", "8 Bytes"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 4, title: "Chapter 4: Principles of Object-Oriented Programming (OOPS)", explanation: "java/chapter4.md", quizData: JSON.stringify([{ id: 1, question: "Which relationship represents Composition?", options: ["Strong Part-Of", "Weak Has-A", "Is-A Inheritance", "Loose Coupling"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 5, title: "Chapter 5: Constructors, Design Patterns & Keywords", explanation: "java/chapter5.md", quizData: JSON.stringify([{ id: 1, question: "Which statement must be first in a constructor chain?", options: ["this(...)", "super.init()", "static()", "void()"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 6, title: "Chapter 6: Polymorphism & Method Binding", explanation: "java/chapter6.md", quizData: JSON.stringify([{ id: 1, question: "What runtime exception occurs on invalid downcasting?", options: ["ClassCastException", "NullPointerException", "IllegalArgumentException", "IndexOutOfBoundsException"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 7, title: "Chapter 7: Abstraction (Abstract Classes vs. Interfaces)", explanation: "java/chapter7.md", quizData: JSON.stringify([{ id: 1, question: "What keyword is required for concrete methods in Java 8 interfaces?", options: ["default", "abstract", "native", "synchronized"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 8, title: "Chapter 8: Packages, Access Modifiers & Encapsulation", explanation: "java/chapter8.md", quizData: JSON.stringify([{ id: 1, question: "Which access modifier allows access to external subclasses?", options: ["protected", "private", "default", "public"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 9, title: "Chapter 9: Arrays, Object Cloning & Math Utilities", explanation: "java/chapter9.md", quizData: JSON.stringify([{ id: 1, question: "What exception is thrown if clone() is called without Cloneable?", options: ["CloneNotSupportedException", "NullPointerException", "IllegalStateException", "ClassCastException"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 10, title: "Chapter 10: String Handling", explanation: "java/chapter10.md", quizData: JSON.stringify([{ id: 1, question: "Where are string literals stored in JVM memory?", options: ["String Constant Pool", "Stack", "Native Memory", "Code Segment"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 11, title: "Chapter 11: Exception Handling", explanation: "java/chapter11.md", quizData: JSON.stringify([{ id: 1, question: "Which block always executes in exception handling?", options: ["finally", "catch", "try", "throw"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 12, title: "Chapter 12: Multithreading", explanation: "java/chapter12.md", quizData: JSON.stringify([{ id: 1, question: "Which method starts a new thread of execution?", options: ["start()", "run()", "execute()", "init()"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 13, title: "Chapter 13: Synchronization & Concurrent Collections", explanation: "java/chapter13.md", quizData: JSON.stringify([{ id: 1, question: "Which concurrent collection uses lock striping?", options: ["ConcurrentHashMap", "Vector", "Hashtable", "ArrayList"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 14, title: "Chapter 14: Collections Framework & Generics", explanation: "java/chapter14.md", quizData: JSON.stringify([{ id: 1, question: "According to PECS, which wildcard is used for producers?", options: ["? extends T", "? super T", "?", "T"], answer: 0 }]), challenges: "[]" },
            { orderNumber: 15, title: "Chapter 15: File I/O, NIO & Streams API", explanation: "java/chapter15.md", quizData: JSON.stringify([{ id: 1, question: "Which stream operation is intermediate?", options: ["filter()", "collect()", "forEach()", "count()"], answer: 0 }]), challenges: "[]" },
          ];
        } else if (courseData.language === "c") {
          chaptersToCreate = [
            {
              orderNumber: 0,
              title: "Chapter 0: Setup & First Program",
              explanation: "content/c/chapter0.md",
              quizData: JSON.stringify([
                { id: 1, question: "Who created the C programming language, and where?", options: ["James Gosling at Sun Microsystems", "Dennis Ritchie at Bell Labs", "Guido van Rossum at CWI", "Bjarne Stroustrup at AT&T"], answer: 1 },
                { id: 2, question: "C is often described as a:", options: ["Purely high-level scripting language", "Mid-level language balancing control and readability", "Markup language", "Query language"], answer: 1 },
                { id: 3, question: "Which of the following is NOT a real-world use of C mentioned in this chapter?", options: ["Operating system kernels", "Embedded systems", "Designing website layouts with CSS", "Writing compilers and interpreters"], answer: 2 },
                { id: 4, question: "What must happen before a C program can run, unlike a Python script?", options: ["Nothing extra — it runs directly", "It must be compiled into an executable first", "It must be uploaded to a server", "It must be converted to bytecode by a virtual machine only"], answer: 1 },
                { id: 5, question: "Which command compiles hello.c into an executable named hello using GCC?", options: ["gcc run hello.c", "gcc hello.c -o hello", "python hello.c", "compile hello.c"], answer: 1 },
                { id: 6, question: "What will happen when this program is compiled?\n\n#include <stdio.h>\nint main() {\n printf(\"Hello\")\n return 0;\n}", options: ["It compiles and runs with no issues", "It fails with an error because of the missing semicolon", "It only produces a warning", "It runs but prints nothing"], answer: 1 },
                { id: 7, question: "What is the key difference between a compiler error and a warning?", options: ["Warnings stop compilation; errors do not", "Errors prevent an executable from being produced; warnings do not", "There is no real difference", "Warnings only appear in Python, not C"], answer: 1 },
                { id: 8, question: "In the line #include <stdio.h>, what does this do?", options: ["Declares the main function", "Includes the Standard Input/Output library needed for functions like printf()", "Compiles the program", "Prints text to the screen"], answer: 1 },
                { id: 9, question: "What does return 0; at the end of main() conventionally indicate?", options: ["The program crashed", "The program ran with errors", "The program finished successfully", "The program is still running"], answer: 2 },
                { id: 10, question: "What will this program print?\n\n#include <stdio.h>\nint main() {\n printf(\"Hello\\nWorld!\");\n return 0;\n}", options: ["Hello World! (with quotes)", "Hello then World! on two lines (because of \\n mid-string)", "An error", "Nothing"], answer: 1 },
                { id: 11, question: "If you edit and save your .c file after compiling, what must you do before your changes take effect when running the program?", options: ["Nothing, the executable updates automatically", "Re-compile the file to produce a new executable", "Restart your computer", "Rename the file"], answer: 1 },
                { id: 12, question: "Why should compiler warnings never be ignored, even if the program still runs?", options: ["Warnings always mean the program will crash immediately", "Some warnings point to real bugs (like uninitialized variables) that may cause problems later", "Warnings are just stylistic suggestions with no real risk", "The compiler will refuse to produce an executable if warnings are ignored"], answer: 1 }
              ]),
              challenges: JSON.stringify([
                { id: "easy", title: "Print Hello World & User Age", difficulty: "Easy", initialCode: "// Write your code below\n" },
                { id: "medium", title: "Calculate Circle Area & Perimeter", difficulty: "Medium", initialCode: "// Calculate area = PI * r * r\n" },
                { id: "hard", title: "Swap Two Variables Without Temp Variable", difficulty: "Hard", initialCode: "// Swap a and b without third variable\n" }
              ])
            },
            {
              orderNumber: 1,
              title: "Chapter 1: C Basics",
              explanation: "content/c/chapter1.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is the entry point of every C program?", options: ["start()", "main()", "begin()", "init()"], answer: 1 },
                { id: 2, question: "What does #include <stdio.h> do?", options: ["Declares the main function", "Pulls in the Standard Input/Output library before compilation", "Compiles the program", "Runs the program"], answer: 1 },
                { id: 3, question: "What must end every statement in C?", options: ["A colon", "A period", "A semicolon", "Nothing is required"], answer: 2 },
                { id: 4, question: "Which data type would you use to store a value like 3.14159265 with high precision?", options: ["int", "char", "float", "double"], answer: 3 },
                { id: 5, question: "What is true about variables in C, unlike Python?", options: ["Their type must be declared explicitly and cannot change later", "They never need a type", "They can hold any type interchangeably at runtime", "They are always global"], answer: 0 },
                { id: 6, question: "What does the const keyword do to a variable?", options: ["Makes it print automatically", "Prevents it from being modified after initialization", "Converts it to a string", "Deletes it after use"], answer: 1 },
                { id: 7, question: "In scanf(\"%d\", &age);, why is & used before age?", options: ["It's a typo and has no effect", "It passes the memory address of age so scanf can store a value there", "It converts age to a string", "It multiplies age by itself"], answer: 1 },
                { id: 8, question: "What is the result of 2 + 3 * 4 in C?", options: ["20", "14", "24", "9"], answer: 1 },
                { id: 9, question: "What does the %d format specifier represent?", options: ["A character", "A string", "An integer", "A float"], answer: 2 },
                { id: 10, question: "What is the difference between implicit and explicit type conversion?", options: ["There is no difference", "Implicit happens automatically; explicit (casting) is done manually by the programmer", "Explicit only happens with strings", "Implicit only works with char types"], answer: 1 }
              ]),
              challenges: JSON.stringify([
                { id: "easy", title: "Check Even or Odd Number", difficulty: "Easy", initialCode: "// Write code to check if n is even or odd\n" }
              ])
            },
            {
              orderNumber: 2,
              title: "Chapter 2: Control Flow",
              explanation: "content/c/chapter2.md",
              quizData: JSON.stringify([
                { id: 1, question: "Which keyword is used to test a condition in C?", options: ["loop", "if", "check", "test"], answer: 1 },
                { id: 2, question: "Which loop always executes its body at least once?", options: ["for", "while", "do-while", "switch"], answer: 2 },
                { id: 3, question: "What does the break statement do inside a loop?", options: ["Skips to the next iteration", "Ends the loop immediately", "Restarts the loop", "Pauses the program"], answer: 1 },
                { id: 4, question: "Which statement is required to prevent fall-through in a switch case?", options: ["return", "continue", "break", "exit"], answer: 2 },
                { id: 5, question: "What is the output of: for (int i = 0; i < 3; i++) printf(\"%d\", i);", options: ["123", "012", "0123", "321"], answer: 1 },
                { id: 6, question: "What is wrong with: if (x = 5) { printf(\"yes\"); }", options: ["Missing semicolon", "It assigns 5 to x instead of comparing, and is always true", "It won't compile", "Nothing, it's correct"], answer: 1 },
                { id: 7, question: "What does continue do inside a for loop?", options: ["Ends the loop", "Skips the rest of the current iteration and moves to the update step", "Restarts the program", "Skips the next two iterations"], answer: 1 },
                { id: 8, question: "What is the output of this code? for (int i = 1; i <= 3; i++) { if (i == 2) continue; printf(\"%d \", i); }", options: ["1 2 3", "1 3", "2 3", "1 2"], answer: 1 },
                { id: 9, question: "In a nested loop with an outer loop running 4 times and an inner loop running 3 times each, how many total times does the inner body execute?", options: ["4", "3", "7", "12"], answer: 3 },
                { id: 10, question: "Which of these correctly avoids an infinite loop?", options: ["while (1) { }", "for (int i = 0; i < 5;) { printf(\"%d\", i); }", "for (int i = 0; i < 5; i++) { printf(\"%d\", i); }", "while (i <= 5) { printf(\"%d\", i); }"], answer: 2 },
                { id: 11, question: "What does this switch print for day = 6? switch (day) { case 6: case 7: printf(\"Weekend\"); break; default: printf(\"Weekday\"); }", options: ["Weekday", "Weekend", "Nothing", "Compile error"], answer: 1 },
                { id: 12, question: "What is the output? int i = 5; do { printf(\"%d \", i); i++; } while (i < 5);", options: ["Nothing is printed", "5", "5 6 7 ...", "Infinite loop"], answer: 1 },
                { id: 13, question: "Find the bug: for (int i = 0; i < 5; i++); { printf(\"%d\", i); }", options: ["The condition should be i <= 5", "The semicolon after the header makes the loop body empty; the block runs once afterward", "printf needs a format specifier", "i must start at 1"], answer: 1 },
                { id: 14, question: "What values can a standard C switch statement compare against?", options: ["Any type, including floats and strings", "Only integer (or char/enum) constant expressions", "Only strings", "Only boolean expressions"], answer: 1 },
                { id: 15, question: "What is the output of this nested loop? for (int i = 1; i <= 2; i++) { for (int j = 1; j <= 2; j++) { printf(\"%d%d \", i, j); } }", options: ["11 12 21 22", "11 21 12 22", "12 21", "1 2 1 2"], answer: 0 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 3,
              title: "Chapter 3: Functions",
              explanation: "content/c/chapter3.md",
              quizData: JSON.stringify([
                { id: 1, question: "What keyword is used for a function that returns nothing?", options: ["null", "void", "empty", "none"], answer: 1 },
                { id: 2, question: "What is the term for the values passed into a function when it's called?", options: ["Parameters", "Arguments", "Returns", "Declarations"], answer: 1 },
                { id: 3, question: "How does C pass arguments to functions by default?", options: ["By reference", "By value", "By pointer only", "By global copy"], answer: 1 },
                { id: 4, question: "What must every correct recursive function have to avoid infinite recursion?", options: ["A loop", "A base case", "A global variable", "A static variable"], answer: 1 },
                { id: 5, question: "Where is a local variable's memory freed?", options: ["When the program ends", "When the function that declared it returns", "Never", "When main() starts"], answer: 1 },
                { id: 6, question: "What does this print?\n\nvoid f(int x) { x = x + 10; }\nint main() {\n int a = 5;\n f(a);\n printf(\"%d\", a);\n}", options: ["15", "5", "10", "0"], answer: 1 },
                { id: 7, question: "What is the output?\n\nvoid counter() {\n static int c = 0;\n c++;\n printf(\"%d \", c);\n}\nint main() {\n counter();\n counter();\n counter();\n}", options: ["1 1 1", "1 2 3", "0 1 2", "3 3 3"], answer: 1 },
                { id: 8, question: "What does factorial(0) return in the standard recursive definition?", options: ["0", "1", "-1", "Undefined"], answer: 1 },
                { id: 9, question: "Which keyword tells the compiler a global variable is defined in a different file?", options: ["static", "global", "extern", "const"], answer: 2 },
                { id: 10, question: "In fibonacci(n) = fibonacci(n-1) + fibonacci(n-2), what are the two base cases typically used?", options: ["n == 1 and n == 2", "n == 0 and n == 1", "n == 0 only", "There are no base cases"], answer: 1 },
                { id: 11, question: "Find the bug:\n\nint square(int n) {\n int result = n * n;\n}\nint main() {\n printf(\"%d\", square(4));\n}", options: ["Missing semicolon", "square() never returns result, so its return value is undefined", "n should be a float", "printf format is wrong"], answer: 1 },
                { id: 12, question: "What is the output?\n\nint x = 100;\nvoid change() {\n x = x + 1;\n}\nint main() {\n change();\n change();\n printf(\"%d\", x);\n}", options: ["100", "101", "102", "Compile error"], answer: 2 },
                { id: 13, question: "Tracing factorial(3) using factorial(n) = n * factorial(n-1) with factorial(0) = 1, what is the very first call to actually return a value (not wait on another call)?", options: ["factorial(3)", "factorial(2)", "factorial(1)", "factorial(0)"], answer: 3 },
                { id: 14, question: "Why is naive recursive fibonacci(n) considered inefficient for large n?", options: ["It uses too much global memory", "It recomputes the same smaller fibonacci values many times", "It cannot return a value", "It requires static variables"], answer: 1 },
                { id: 15, question: "Which statement about static local variables is correct?", options: ["They reset to their initial value on every function call, like ordinary locals", "They are visible to every function in the program", "They retain their value between calls but stay private to their own function", "They must always be declared outside any function"], answer: 2 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 4,
              title: "Chapter 4: Arrays and Strings",
              explanation: "content/c/chapter4.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is the index of the first element of an array in C?", options: ["1", "0", "-1", "Depends on the type"], answer: 1 },
                { id: 2, question: "What character marks the end of a C string?", options: ["A space", "\\n", "\\0", "The last letter"], answer: 2 },
                { id: 3, question: "Which function returns the length of a string (excluding the null terminator)?", options: ["strcpy", "strlen", "strcmp", "strcat"], answer: 1 },
                { id: 4, question: "How is a 2D array element accessed?", options: ["arr(row, col)", "arr[row][col]", "arr[row, col]", "arr{row}{col}"], answer: 1 },
                { id: 5, question: "How are arrays passed to functions in C?", options: ["By value, as a full copy", "By reference, via the address of the first element", "They cannot be passed to functions", "Only as global variables"], answer: 1 },
                { id: 6, question: "What is the output?\n\nint arr[5] = {10, 20, 30, 40, 50};\nprintf(\"%d\", arr[4]);", options: ["40", "50", "Error: index out of bounds", "0"], answer: 1 },
                { id: 7, question: "What does strcmp(\"cat\", \"cat\") return?", options: ["1", "-1", "0", "\"cat\""], answer: 2 },
                { id: 8, question: "Why is char word[5] = \"Hello\"; a problem?", options: ["\"Hello\" has 5 letters, but needs 6 bytes including the null terminator", "char arrays can't hold multiple letters", "strlen() will crash", "It won't compile"], answer: 0 },
                { id: 9, question: "In a 2D array declared int m[3][4], how many total elements does it have?", options: ["7", "12", "3", "4"], answer: 1 },
                { id: 10, question: "What is wrong with comparing two strings using if (str1 == str2)?", options: ["Nothing, it works correctly", "It compares addresses, not the actual text content", "Strings can't be compared at all in C", "It only works for single characters"], answer: 1 },
                { id: 11, question: "What is the output?\n\nint arr[4] = {1, 2, 3, 4};\nfor (int i = 0; i <= 4; i++) {\n printf(\"%d \", arr[i]);\n}", options: ["1 2 3 4", "1 2 3 4 followed by an unpredictable/garbage value (out-of-bounds read)", "Compile error", "0 1 2 3 4"], answer: 1 },
                { id: 12, question: "Tracing the reverse-string two-pointer algorithm on \"abcd\", what are start and end right before the loop condition (start < end) becomes false?", options: ["start=0, end=3", "start=1, end=2", "start=2, end=1", "start=4, end=0"], answer: 2 },
                { id: 13, question: "Fill in the missing code to check a palindrome: while (start < end) { if (str[start] != str[end]) return 0; ____; ____; } return 1;", options: ["start--; end++;", "start++; end--;", "start++; end++;", "start = end;"], answer: 1 },
                { id: 14, question: "What does this word-count condition check for each character?\n\nif (s[i] != ' ' && (i == 0 || s[i-1] == ' '))", options: ["The character is a vowel", "The character is the first character of a new word", "The character is a space", "The character is the last in the string"], answer: 1 },
                { id: 15, question: "Why must an array's size typically be passed as a separate parameter alongside the array itself?", options: ["C requires all functions to have exactly two parameters", "The array decays to a pointer to its first element, so the function has no way to know how many elements follow", "Arrays are always exactly 10 elements in C", "size is only needed for 2D arrays"], answer: 1 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 5,
              title: "Chapter 5: Pointers",
              explanation: "content/c/chapter5.md",
              quizData: JSON.stringify([
                { id: 1, question: "What does the & operator do when placed before a variable name?", options: ["Multiplies the variable by itself", "Returns the memory address of the variable", "Declares a new pointer", "Dereferences the variable"], answer: 1 },
                { id: 2, question: "Which declaration correctly creates a pointer to an int?", options: ["int p;", "int *p;", "pointer int p;", "int &p;"], answer: 1 },
                { id: 3, question: "What is the value of *p if p correctly points to a variable x holding 15?", options: ["The address of x", "15", "The address of p", "0"], answer: 1 },
                { id: 4, question: "What should an uninitialized pointer be set to before it is known to point at valid data?", options: ["0.0", "\"\" (empty string)", "NULL", "-1"], answer: 2 },
                { id: 5, question: "What is the output?\n\nint x = 5;\nint *p = &x;\n*p = 20;\nprintf(\"%d\", x);", options: ["5", "20", "The address of x", "Compilation error"], answer: 1 },
                { id: 6, question: "Given int arr[5]; int *p = arr;, what does p + 2 point to?", options: ["The address two bytes after arr[0]", "arr[2]", "A compile error, since arr is not a pointer variable", "arr[0] plus 2"], answer: 1 },
                { id: 7, question: "Why must a function that receives an array parameter also receive its size as a separate argument?", options: ["It doesn't need to — sizeof(arr) works fine inside the function", "Because the array decays to a pointer, which carries no length information", "Because C arrays cannot be passed to functions at all", "Because size is only needed for char arrays"], answer: 1 },
                { id: 8, question: "What is the output?\n\nvoid modify(int x) { x = 99; }\nint main() {\n int num = 1;\n modify(num);\n printf(\"%d\", num);\n}", options: ["99", "1", "0", "Compilation error"], answer: 1 },
                { id: 9, question: "What is the bug in this code?\n\nint* getValue() {\n int local = 10;\n return &local;\n}", options: ["It returns a pointer to a local variable that no longer exists after the function returns", "It should return local instead of &local", "The function must be declared void", "There is no bug — this is safe C code"], answer: 0 },
                { id: 10, question: "Which statement correctly describes a void pointer?", options: ["It can never be assigned an address", "It automatically knows what type it points to", "It can hold the address of any type but must be cast before being dereferenced", "It is only used for functions that return nothing"], answer: 2 },
                { id: 11, question: "What is the output?\n\nint a = 10, b = 20;\nint *p = &a;\np = &b;\n*p = 99;\nprintf(\"%d %d\", a, b);", options: ["10 20", "99 99", "10 99", "99 20"], answer: 2 },
                { id: 12, question: "What should replace the missing line so that main() prints 2?\n\nint* counter() {\n static int count = 0;\n count++;\n // MISSING LINE\n}\nint main() {\n int *p1 = counter();\n int *p2 = counter();\n printf(\"%d\", *p2);\n}", options: ["return count;", "return &count;", "return &local;", "return NULL;"], answer: 1 },
                { id: 13, question: "What happens when this program runs?\n\nint *p = NULL;\nprintf(\"%d\", *p);", options: ["It prints 0", "It prints NULL", "It crashes with a segmentation fault, since NULL is never a valid address to dereference", "It prints a random garbage integer safely"], answer: 2 },
                { id: 14, question: "What is the output?\n\nint arr[3] = {1, 2, 3};\nint *start = &arr[0];\nint *end = &arr[2];\nprintf(\"%ld\", end - start);", options: ["8 (the byte difference)", "2 (the element difference)", "1", "Undefined behavior in every case"], answer: 1 },
                { id: 15, question: "Why does swap(&x, &y) succeed in swapping two variables while swapWrong(x, y) does not, given identical logic inside each function?", options: ["swap uses a temp variable and swapWrong does not", "swapWrong passes copies of x and y by value, so its changes never reach the caller; swap passes addresses, giving it access to the original memory", "C does not allow int parameters to be swapped, only pointers", "There is no real difference; both would behave identically"], answer: 1 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 6,
              title: "Chapter 6: Dynamic Memory Allocation",
              explanation: "content/c/chapter6.md",
              quizData: JSON.stringify([
                { id: 1, question: "Which memory region is managed automatically, with variables destroyed as soon as their function returns?", options: ["The heap", "The stack", "Global memory", "ROM"], answer: 1 },
                { id: 2, question: "Which function allocates memory and initializes every byte to zero?", options: ["malloc", "calloc", "realloc", "free"], answer: 1 },
                { id: 3, question: "What must always be checked immediately after calling malloc?", options: ["Whether the returned pointer equals NULL", "Whether the value stored is even", "Whether the pointer is a global variable", "Nothing - malloc never fails"], answer: 0 },
                { id: 4, question: "What does free(p) do?", options: ["Deletes the variable p entirely", "Returns the memory p points to back to the heap for reuse", "Sets p to NULL automatically", "Converts p into a stack variable"], answer: 1 },
                { id: 5, question: "What is the output of: int *arr = (int*) calloc(3, sizeof(int)); printf(\"%d %d %d\", arr[0], arr[1], arr[2]);", options: ["Garbage values", "0 0 0", "1 1 1", "Compilation error"], answer: 1 },
                { id: 6, question: "Why is arr = realloc(arr, newSize); considered unsafe?", options: ["realloc always fails on the first call", "If realloc returns NULL, the original pointer is overwritten and the original block becomes an unreachable leak", "realloc cannot shrink memory, only grow it", "It is actually always safe and recommended"], answer: 1 },
                { id: 7, question: "What is the bug in this code? int *p = (int*) malloc(sizeof(int)); free(p); free(p);", options: ["malloc was called with the wrong size", "A double free - freeing the same pointer twice, which corrupts the heap", "p was never dereferenced", "There is no bug"], answer: 1 },
                { id: 8, question: "What happens when this program runs? int *p; *p = 10; printf(\"%d\", *p);", options: ["It prints 10 safely", "It prints 0", "Undefined behavior / likely crash - p is a wild pointer, never initialized", "It automatically allocates memory for p"], answer: 2 },
                { id: 9, question: "Why does a dynamic array typically double its capacity instead of growing by a fixed small amount each time?", options: ["Doubling is required by the C standard", "It reduces the total number of costly reallocation operations as the array grows large", "Fixed increments are illegal in C", "It has no real benefit; it's purely stylistic"], answer: 1 },
                { id: 10, question: "How many bytes should be allocated for a dynamic copy of a C string read into a buffer?", options: ["strlen(buffer)", "strlen(buffer) + 1", "sizeof(buffer)", "strlen(buffer) - 1"], answer: 1 },
                { id: 11, question: "What is the output of: int *p = (int*) malloc(sizeof(int)); *p = 5; free(p); p = NULL; if (p == NULL) printf(\"safe\"); else printf(\"%d\", *p);", options: ["5", "safe", "Compilation error", "Undefined behavior always"], answer: 1 },
                { id: 12, question: "What should replace the missing line so the block grows safely and no memory is leaked on failure?\n\nint *arr = (int*) malloc(4 * sizeof(int));\n// MISSING LINE\nif (temp == NULL) { free(arr); return 1; }\narr = temp;", options: ["int *temp = (int*) malloc(8 * sizeof(int));", "int *temp = (int*) realloc(arr, 8 * sizeof(int));", "arr = realloc(arr, 8 * sizeof(int));", "free(arr); arr = realloc(arr, 8 * sizeof(int));"], answer: 1 },
                { id: 13, question: "What is the key difference between a dangling pointer and a wild pointer?", options: ["There is no difference; the terms are interchangeable", "A dangling pointer once pointed to valid memory that has since been freed; a wild pointer was never initialized to a valid address at all", "A wild pointer only occurs with arrays, never with single variables", "A dangling pointer only occurs with calloc, never with malloc"], answer: 1 },
                { id: 14, question: "What is the bug in this code? void leaky() { int *p = (int*) malloc(sizeof(int)); *p = 5; } int main() { for (int i = 0; i < 1000; i++) leaky(); }", options: ["malloc's argument is wrong", "p is never dereferenced", "The allocated memory is never freed before the function returns, leaking 1000 blocks", "There is no bug"], answer: 2 },
                { id: 15, question: "Given a heap block allocated with malloc(3 * sizeof(int)) and later resized with realloc(arr, 6 * sizeof(int)), what happens to the original 3 values?", options: ["They are discarded and replaced with garbage", "They are preserved in the resized block, which may or may not be at the original address", "They are automatically set to zero", "realloc cannot grow a malloc'd block, only calloc'd blocks"], answer: 1 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 7,
              title: "Chapter 7: Structures, Unions & Enums",
              explanation: "content/c/chapter7.md",
              quizData: JSON.stringify([
                { id: 1, question: "What is the main difference between a structure and an array?", options: ["Arrays store different data types; structures store same data types", "Structures store different data types under one name; arrays store same data types", "Structures are dynamic; arrays are static", "There is no difference"], answer: 1 },
                { id: 2, question: "What is the mandatory character that must follow a structure's closing brace in C?", options: ["A period (.)", "A colon (:)", "A semicolon (;)", "Nothing is required"], answer: 2 },
                { id: 3, question: "Given a pointer to a struct: struct Student *p = &s1;. How do you access the member roll using the arrow operator?", options: ["p.roll", "*p.roll", "p->roll", "p&roll"], answer: 2 },
                { id: 4, question: "If p is a pointer to a structure, which of the following is equivalent to p->name?", options: ["*p.name", "*(p.name)", "(*p).name", "&p->name"], answer: 2 },
                { id: 5, question: "What is the main efficiency advantage of passing a structure pointer to a function rather than the whole structure by value?", options: ["It prevents any function from reading the structure", "It avoids copying the entire structure's bytes into memory, only copying the address", "It automatically converts the structure to a union", "It makes the structure constant"], answer: 1 },
                { id: 6, question: "Why is it dangerous to return a pointer to a local structure variable from a function?", options: ["Structures cannot be returned from functions", "The local structure variable is destroyed when the function returns, leaving a dangling pointer", "It causes compile errors immediately", "It uses too much heap memory"], answer: 1 },
                { id: 7, question: "How does a union's memory layout differ from a structure's?", options: ["Members of a union are stored in separate files", "Members of a union all share the same memory location, overlapping each other", "Unions do not use RAM", "Unions only allow integer types"], answer: 1 },
                { id: 8, question: "What is the size of union Data { int i; float f; char str[20]; }?", options: ["28 bytes", "4 bytes", "20 bytes", "8 bytes"], answer: 2 },
                { id: 9, question: "By default, what integer value is assigned to the first constant of an enum in C?", options: ["1", "-1", "0", "NULL"], answer: 2 },
                { id: 10, question: "Given enum Level { LOW = 5, MEDIUM, HIGH = 10, EXTREME };, what are the integer values of MEDIUM and EXTREME?", options: ["6 and 11", "0 and 1", "6 and 10", "5 and 10"], answer: 0 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 8,
              title: "Chapter 8: File Handling",
              explanation: "content/c/chapter8.md",
              quizData: JSON.stringify([
                { id: 1, question: "Where does every variable, array, or structure live in a C program, which gets wiped when the program ends?", options: ["ROM", "Disk", "RAM", "Cache"], answer: 2 },
                { id: 2, question: "What is the key difference between a text file and a binary file?", options: ["Text files store data as raw bytes; binary files store as human-readable characters", "Text files store data as ASCII/UTF-8 characters; binary files store data as raw memory bytes", "Binary files can be edited in Notepad; text files cannot", "There is no difference"], answer: 1 },
                { id: 3, question: "What does fopen() return if it fails to open a file?", options: ["0", "EOF", "NULL", "-1"], answer: 2 },
                { id: 4, question: "Which file mode should be used to append data to the end of an existing text file without erasing its contents?", options: ["w", "r", "a", "wb"], answer: 2 },
                { id: 5, question: "What happens if you open an existing file in 'w' (write) mode?", options: ["It reads the file contents", "It appends new data to the end", "It deletes/erases all existing content of the file", "It returns an error"], answer: 2 },
                { id: 6, question: "Why is it a bad practice to control a read loop with while (!feof(fp))?", options: ["It is deprecated in C", "feof only becomes true after a read operation has already failed, which can cause the loop to process the last read value twice", "It causes compile errors", "It clears the file position indicator"], answer: 1 },
                { id: 7, question: "Which function reads an entire line of text (including spaces) from a file safely by specifying a size limit?", options: ["fscanf()", "gets()", "fgets()", "fread()"], answer: 2 },
                { id: 8, question: "What are the arguments of fread(), in order?", options: ["FILE *fp, size_t size, size_t count, void *ptr", "void *ptr, size_t size, size_t count, FILE *fp", "void *ptr, FILE *fp, size_t size, size_t count", "FILE *fp, void *ptr, size_t size, size_t count"], answer: 1 },
                { id: 9, question: "Why should you always open binary files in binary modes like 'rb' or 'wb' rather than text modes on Windows?", options: ["To speed up compile times", "To prevent automatic translation of newline characters, which would corrupt binary data", "Binary files cannot be opened in text mode on any OS", "Text mode makes binary files read-only"], answer: 1 },
                { id: 10, question: "What does fclose() do beyond just ending file access?", options: ["It deletes the file", "It flushes any buffered data to disk and releases the system file handle resource", "It rewinds the file pointer to the start", "It changes the file mode"], answer: 1 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 9,
              title: "Chapter 9: Advanced C Programming",
              explanation: "content/c/chapter9.md",
              quizData: JSON.stringify([
                { id: 1, question: "What does the preprocessor do with the line #include <stdio.h>?", options: ["Compiles the stdio library into machine code", "Textually pastes the contents of stdio.h into the file at that location", "Links the stdio library into the final executable", "Nothing - it is only a comment for the programmer"], answer: 1 },
                { id: 2, question: "Which stage of compilation would catch a missing semicolon?", options: ["Linking", "Preprocessing", "Compilation", "Assembly"], answer: 2 },
                { id: 3, question: "What is printed by the following code? #define SQUARE(x) x * x; printf(\"%d\\\\n\", SQUARE(2 + 3));", options: ["25", "11", "10", "Compilation error"], answer: 1 },
                { id: 4, question: "Which directive prevents a header file's contents from being included more than once in a translation unit?", options: ["#once", "#ifndef / #define / #endif (include guard)", "#include", "#pragma link"], answer: 1 },
                { id: 5, question: "What kind of error does calling a declared-but-never-defined function produce?", options: ["A compiler error", "A linker error (\"undefined reference\")", "A runtime crash only", "No error at all"], answer: 1 },
                { id: 6, question: "What is the output of the following program? (using static count initialized to 0 and incremented on each function call)", options: ["1 1 1", "0 1 2", "1 2 3", "Compilation error"], answer: 2 },
                { id: 7, question: "Applying static to a global variable in a .c file has what effect?", options: ["It makes the variable persist longer than a normal global", "It restricts the variable's linkage to only that file", "It moves the variable to the heap", "It has no effect on global variables"], answer: 1 },
                { id: 8, question: "What does a & 1 determine for an integer a?", options: ["Whether a is negative", "Whether a is odd or even", "Whether a is a power of two", "The absolute value of a"], answer: 1 },
                { id: 9, question: "Which of these correctly declares that int total; is defined in another file?", options: ["static int total;", "auto int total;", "extern int total;", "register int total;"], answer: 2 },
                { id: 10, question: "What is wrong with the following code? FILE *f = fopen(\"data.txt\", \"r\"); fscanf(f, \"%d\", &value);", options: ["fscanf cannot read integers", "The return value of fopen is never checked for NULL", "fopen should use mode \"w\" instead", "Nothing is wrong with this code"], answer: 1 },
                { id: 11, question: "What is the output of the following program where g=2 (global), f has static s=0 and normal l=0, s+=g, l+=g, g++ are executed twice?", options: ["s=2 l=2 g=3 / s=4 l=2 g=4", "s=2 l=2 g=3 / s=5 l=3 g=4", "s=2 l=2 g=3 / s=2 l=2 g=3", "s=4 l=4 g=4 / s=8 l=8 g=5"], answer: 1 },
                { id: 12, question: "Which fix correctly resolves the bug in this macro usage? #define DOUBLE(x) x + x; int result = DOUBLE(3) * 5;", options: ["#define DOUBLE(x) (x) + (x)", "#define DOUBLE(x) ((x) + (x))", "#define DOUBLE(x) 2 * x", "No fix is needed; the output is already correct"], answer: 1 },
                { id: 13, question: "Given #define FLAG_A (1 << 0) and #define FLAG_B (1 << 1), what does flags &= ~FLAG_A; do, assuming flags currently has both flags set?", options: ["Sets both flags", "Clears FLAG_A only, leaving FLAG_B set", "Clears both flags", "Toggles FLAG_A"], answer: 1 },
                { id: 14, question: "Fill in the missing code so that this program compiles and links correctly across two files: file1.c has 'sharedValue = 100'; file2.c has 'sharedValue' and prints it.", options: ["static in file1.c, static in file2.c", "(nothing) in file1.c, extern in file2.c", "extern in file1.c, (nothing) in file2.c", "register in both files"], answer: 1 },
                { id: 15, question: "Why does the following program compile successfully but crash (or behave unpredictably) at runtime? printf(\"%d\\\\n\", divide(10, 0));", options: ["The compiler cannot detect division by zero at compile time; it is only checked (or not checked) at runtime, and this program never checks for it", "printf cannot print integers", "divide is missing a prototype", "This is a linker error, not a runtime error"], answer: 0 }
              ]),
              challenges: "[]"
            },
            {
              orderNumber: 10,
              title: "Chapter 10: Interview Preparation & Complete C Revision",
              explanation: "content/c/chapter10.md",
              quizData: JSON.stringify([
                { id: 1, question: "What does the following code print? printf(\"%d\", 7 / 2);", options: ["3.5", "3", "4", "Compilation error"], answer: 1 },
                { id: 2, question: "Which storage class keeps a local variable's value between function calls?", options: ["auto", "register", "static", "extern"], answer: 2 },
                { id: 3, question: "What is the correct format specifier to read a double using scanf?", options: ["%f", "%d", "%lf", "%c"], answer: 2 },
                { id: 4, question: "Which function checks if a character is a digit?", options: ["isalpha()", "isdigit()", "isupper()", "isnumeric()"], answer: 1 },
                { id: 5, question: "What does free(NULL) do?", options: ["Crashes the program", "Causes undefined behavior", "Does nothing (safe, well-defined)", "Frees all previously allocated memory"], answer: 2 },
                { id: 6, question: "What is the output of the following code? int x = 5; int *p = &x; *p = *p + 10; printf(\"%d\", x);", options: ["5", "10", "15", "Compilation error"], answer: 2 },
                { id: 7, question: "What is the size of the following union on a typical 64-bit system? union Data { int i; double d; char str[10]; };", options: ["4", "8", "10", "22"], answer: 1 },
                { id: 8, question: "Which of these correctly swaps two integers using pointers?", options: ["swap(int a, int b)", "swap(int *a, int *b) { int t = a; a = b; b = t; }", "swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }", "swap(int a, int b) { int t = *a; *a = *b; *b = t; }"], answer: 2 },
                { id: 9, question: "What does this code print? char arr[] = \"hello\"; printf(\"%lu\", sizeof(arr));", options: ["5", "6", "8", "Depends on the pointer size"], answer: 1 },
                { id: 10, question: "What is wrong with the following function? int* getArray(void) { int arr[5] = {1, 2, 3, 4, 5}; return arr; }", options: ["Nothing - this is correct", "Arrays can't be returned by value", "It returns a dangling pointer to a destroyed stack variable", "The array is too small"], answer: 2 },
                { id: 11, question: "What is the output? int a = 5; int b = a++ + ++a; printf(\"%d\", b);", options: ["10", "11", "12", "Undefined behavior in strict interpretation, but commonly 12 on many compilers"], answer: 3 },
                { id: 12, question: "Identify the bug: int *createArray(int size) { int *arr = malloc(size * sizeof(int)); for (int i = 0; i <= size; i++) { arr[i] = i; } return arr; }", options: ["malloc should be calloc", "Off-by-one: loop should use i < size, not i <= size", "arr should be freed before returning", "size should be a pointer"], answer: 1 },
                { id: 13, question: "What does this print, assuming a typical 64-bit little-endian system? union U { int i; char c[4]; }; union U u; u.i = 1; printf(\"%d\", u.c[0]);", options: ["0", "1", "Undefined - cannot be determined", "4"], answer: 1 },
                { id: 14, question: "What is missing to make this code correctly free all allocated memory with no leaks? int **matrix = malloc(3 * sizeof(int *)); for (int i = 0; i < 3; i++) { matrix[i] = malloc(4 * sizeof(int)); } // ... use matrix ... __________ free(matrix);", options: ["Nothing else needed", "free(matrix[0]); only", "A loop: for (int i = 0; i < 3; i++) free(matrix[i]);", "free(*matrix);"], answer: 2 },
                { id: 15, question: "What is the output? #define SQUARE(x) x * x; printf(\"%d\", 100 / SQUARE(5));", options: ["4", "100", "20", "500"], answer: 3 }
              ]),
              challenges: "[]"
            }
          ];
        } else {
          // Standard Chapters for other courses (C, C++) starting at 1
          chaptersToCreate = [
            {
              orderNumber: 0,
              title: "Chapter 0: Language Syntax, Variables & Data Types",
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
