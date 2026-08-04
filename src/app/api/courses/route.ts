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

const cppCourse = courses.find(
  (c: { language: string }) => c.language === "cpp"
);

const needsCppReseed =
  !cppCourse ||
  cppCourse.chapters.length < 15 ||
  cppCourse.chapters.some(
    (ch: { orderNumber: number; explanation: string; quizData?: string | null }) =>
      ch.explanation !== `cpp/chapter${ch.orderNumber}.md` ||
      !ch.quizData ||
      JSON.parse(ch.quizData).length < 10
  );

if (
  courses.length === 0 ||
  !courses.some((c: { language: string }) => c.language === "c") ||
  courses.some((c: { chapters?: any[] | null }) => !c.chapters || c.chapters.length === 0) ||
  needsPythonReseed ||
  needsJavaReseed ||
  needsCppReseed
) {
      await db.chapterProgress.deleteMany({});
      await db.enrollment.deleteMany({});
      await db.chapter.deleteMany({});
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
        } else if (courseData.language === "cpp") {
          chaptersToCreate = [
            { orderNumber: 1, title: "Chapter 1: C++ Foundations and the Development Environment", explanation: "cpp/chapter1.md", quizData: JSON.stringify([
              { id: 1, question: "Which build phase expands #include directives?", options: ["The linker", "The preprocessor", "The assembler", "The loader"], answer: 1 },
              { id: 2, question: "An undefined reference to a function you declared but never defined is reported by:", options: ["The preprocessor", "The compiler front end", "The linker", "The operating system"], answer: 2 },
              { id: 3, question: "What does the value returned from main() communicate?", options: ["The number of lines executed", "The process exit status to the OS", "The amount of memory used", "Nothing at all"], answer: 1 },
              { id: 4, question: "The principal reason C++ outperforms interpreted languages is that it:", options: ["Uses shorter keywords", "Compiles directly to native machine instructions", "Avoids using functions", "Runs inside a virtual machine"], answer: 1 },
              { id: 5, question: "std is best described as:", options: ["A reserved keyword", "A namespace containing the standard library", "A compiler flag", "A type of pointer"], answer: 1 },
              { id: 6, question: "Object files produced by the assembler typically end in:", options: [".cpp", ".hpp", ".o or .obj", ".exe"], answer: 2 },
              { id: 7, question: "CMake's primary role is to:", options: ["Compile C++ directly to binary", "Generate build files for a platform's native build tool", "Replace the linker", "Format source code"], answer: 1 },
              { id: 8, question: "Which C++ standard introduced move semantics and smart pointers?", options: ["C++98", "C++11", "C++17", "C++23"], answer: 1 },
              { id: 9, question: "The insertion operator used with std::cout is:", options: ["<<", ">>", "->", "::"], answer: 0 },
              { id: 10, question: "Zero-overhead abstraction means:", options: ["Abstractions are forbidden", "You pay no runtime cost for features you do not use", "All code runs at the same speed", "Memory is always freed automatically"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 2, title: "Chapter 2: Types, Variables, Scope, and Immutability", explanation: "cpp/chapter2.md", quizData: JSON.stringify([
              { id: 1, question: "Which initialisation form rejects a narrowing conversion at compile time?", options: ["int x = 3.9;", "int x(3.9);", "int x{3.9};", "All of them"], answer: 2 },
              { id: 2, question: "Reading an uninitialised local int is:", options: ["Guaranteed to yield 0", "Undefined behaviour", "A compiler error always", "Guaranteed to yield -1"], answer: 1 },
              { id: 3, question: "The C++ standard guarantees that int is:", options: ["Exactly 4 bytes", "Exactly 2 bytes", "At least a specified minimum width", "The same size as double"], answer: 2 },
              { id: 4, question: "constexpr differs from const in that constexpr:", options: ["Allows later modification", "Requires compile-time evaluation", "Only works on pointers", "Is a runtime check"], answer: 1 },
              { id: 5, question: "Which is the safer default for general real-number arithmetic?", options: ["float", "double", "short", "char"], answer: 1 },
              { id: 6, question: "sizeof is evaluated:", options: ["At link time", "At compile time", "At load time", "On every loop iteration"], answer: 1 },
              { id: 7, question: "Scope refers to:", options: ["How long storage lives", "The region where a name is visible", "The number of bytes used", "The CPU register assigned"], answer: 1 },
              { id: 8, question: "Comparing two double values with == is dangerous because:", options: ["== is not defined for double", "Binary approximation makes exact equality unreliable", "It always returns true", "It is a compiler error"], answer: 1 },
              { id: 9, question: "Const-correctness primarily improves:", options: ["Compilation speed only", "Readability and compiler-enforced safety", "Binary size only", "Nothing measurable"], answer: 1 },
              { id: 10, question: "Unsigned integer overflow in C++ is defined to:", options: ["Crash the program", "Wrap around modulo 2^N", "Produce a negative number", "Be undefined behaviour"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 3, title: "Chapter 3: Operators, Conversions, and Input/Output", explanation: "cpp/chapter3.md", quizData: JSON.stringify([
              { id: 1, question: "What is the value of 7 / 2 when both operands are int?", options: ["3.5", "3", "4", "Undefined"], answer: 1 },
              { id: 2, question: "Which cast is checked at runtime for polymorphic types?", options: ["static_cast", "dynamic_cast", "const_cast", "reinterpret_cast"], answer: 1 },
              { id: 3, question: "The modulus operator % may be applied to:", options: ["Only floating-point types", "Only integral types", "Any type", "Only unsigned types"], answer: 1 },
              { id: 4, question: "auto determines a variable's type:", options: ["At run time", "At compile time from the initialiser", "From the variable's name", "From the first assignment after declaration"], answer: 1 },
              { id: 5, question: "Short-circuit evaluation means that in a && b:", options: ["b is always evaluated", "b is skipped if a is false", "a is skipped if b is true", "Both are evaluated in parallel"], answer: 1 },
              { id: 6, question: "To read a line of text containing spaces you should use:", options: ["std::cin >>", "std::getline", "std::cout <<", "std::setw"], answer: 1 },
              { id: 7, question: "std::setprecision combined with std::fixed controls:", options: ["Digits after the decimal point", "Total field width", "Integer base", "Buffer size"], answer: 0 },
              { id: 8, question: "Assignment operators associate:", options: ["Left to right", "Right to left", "They do not associate", "Depends on the compiler"], answer: 1 },
              { id: 9, question: "Which expression is grouped as ((a) + (b * c))?", options: ["a + b * c", "(a + b) * c", "a * b + c", "a + b + c"], answer: 0 },
              { id: 10, question: "Converting double to int via static_cast:", options: ["Rounds to nearest", "Truncates toward zero", "Always rounds up", "Is a compile error"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 4, title: "Chapter 4: Control Flow, Functions, Arrays, and Strings", explanation: "cpp/chapter4.md", quizData: JSON.stringify([
              { id: 1, question: "Which loop is guaranteed to execute its body at least once?", options: ["for", "while", "do-while", "range-for"], answer: 2 },
              { id: 2, question: "Omitting break in a switch case results in:", options: ["A compiler error", "Fall-through to the next case", "The program terminating", "The case repeating"], answer: 1 },
              { id: 3, question: "Passing a large object by const reference rather than by value primarily avoids:", options: ["A compiler warning", "An expensive copy", "Undefined behaviour", "Name mangling"], answer: 1 },
              { id: 4, question: "A recursive function without a reachable base case will typically cause:", options: ["A compile error", "A stack overflow", "A memory leak", "A linker error"], answer: 1 },
              { id: 5, question: "The first valid index of an array of size n is:", options: ["1", "0", "-1", "n"], answer: 1 },
              { id: 6, question: "When a raw array is passed to a function it:", options: ["Is copied element by element", "Decays to a pointer, losing size information", "Becomes a std::vector", "Cannot be passed at all"], answer: 1 },
              { id: 7, question: "std::array differs from a raw array chiefly because it:", options: ["Lives on the heap", "Carries its size and offers member functions", "Can change size", "Is slower by design"], answer: 1 },
              { id: 8, question: "Which reads a whole line including spaces into a std::string?", options: ["cin >> s", "std::getline(std::cin, s)", "cin.get(s)", "scanf"], answer: 1 },
              { id: 9, question: "Function overloading distinguishes functions by:", options: ["Return type alone", "Parameter list", "Their comments", "Order of definition"], answer: 1 },
              { id: 10, question: "continue inside a loop causes:", options: ["The loop to end", "The next iteration to begin immediately", "The function to return", "The program to exit"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 5, title: "Chapter 5: Pointers, References, and Memory Management", explanation: "cpp/chapter5.md", quizData: JSON.stringify([
              { id: 1, question: "Which operator retrieves the address of a variable?", options: ["*", "&", "->", "::"], answer: 1 },
              { id: 2, question: "A reference in C++ can:", options: ["Be null", "Be reseated to another object", "Neither be null nor reseated", "Only refer to pointers"], answer: 2 },
              { id: 3, question: "Memory allocated with new[] must be released with:", options: ["delete", "free", "delete[]", "It is released automatically"], answer: 2 },
              { id: 4, question: "Accessing memory through a pointer after delete is called:", options: ["A memory leak", "A dangling pointer dereference", "Stack overflow", "Aliasing"], answer: 1 },
              { id: 5, question: "std::unique_ptr is:", options: ["Copyable and movable", "Move-only", "Copy-only", "Neither copyable nor movable"], answer: 1 },
              { id: 6, question: "Two shared_ptr objects referring to each other cause:", options: ["Immediate crash", "A reference cycle and a leak", "A compiler error", "Automatic cleanup"], answer: 1 },
              { id: 7, question: "The preferred way to create a unique_ptr is:", options: ["new T()", "std::make_unique<T>()", "malloc", "std::shared_ptr<T>()"], answer: 1 },
              { id: 8, question: "RAII ties resource release to:", options: ["Program exit", "The destructor of a scope-bound object", "A manual cleanup function", "The garbage collector"], answer: 1 },
              { id: 9, question: "Which is the modern, type-safe null pointer literal?", options: ["NULL", "0", "nullptr", "void*"], answer: 2 },
              { id: 10, question: "weak_ptr differs from shared_ptr in that it:", options: ["Owns the object exclusively", "Does not contribute to the strong reference count", "Cannot be created from a shared_ptr", "Deletes the object immediately"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 6, title: "Chapter 6: Object-Oriented Programming", explanation: "cpp/chapter6.md", quizData: JSON.stringify([
              { id: 1, question: "The default access level for members of a class (not a struct) is:", options: ["public", "private", "protected", "internal"], answer: 1 },
              { id: 2, question: "A pure virtual function is declared by:", options: ["virtual void f();", "virtual void f() = 0;", "void f() override;", "static void f();"], answer: 1 },
              { id: 3, question: "A class containing at least one pure virtual function is:", options: ["Concrete", "Abstract and cannot be instantiated", "Final", "A template"], answer: 1 },
              { id: 4, question: "Deleting a derived object through a base pointer without a virtual destructor causes:", options: ["A compiler error", "Undefined behaviour and typically a partial destruction", "Automatic correct cleanup", "A linker error"], answer: 1 },
              { id: 5, question: "Runtime polymorphism in C++ is implemented via:", options: ["Macros", "A vtable and a vptr", "Preprocessor conditionals", "Templates only"], answer: 1 },
              { id: 6, question: "The member initialiser list is preferred over assignment in the constructor body because it:", options: ["Is shorter to type", "Initialises directly instead of default-constructing then assigning", "Is required by the standard", "Disables copying"], answer: 1 },
              { id: 7, question: "The override keyword primarily:", options: ["Makes a function virtual", "Asks the compiler to verify the signature really overrides a base virtual", "Prevents inheritance", "Improves speed"], answer: 1 },
              { id: 8, question: "Encapsulation chiefly provides:", options: ["Faster execution", "Control over invariants and a smaller breakable surface", "Smaller binaries", "Automatic threading"], answer: 1 },
              { id: 9, question: "Members declared protected are accessible to:", options: ["Everyone", "Only the class itself", "The class and its derived classes", "Only free functions"], answer: 2 },
              { id: 10, question: "Destructors of members run:", options: ["In declaration order", "In reverse declaration order, after the destructor body", "In random order", "Only if explicitly called"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 7, title: "Chapter 7: Modern Data Structures: Vectors and Iterators", explanation: "cpp/chapter7.md", quizData: JSON.stringify([
              { id: 1, question: "The difference between size() and capacity() is that capacity() is:", options: ["Always equal to size()", "The number of elements storable before reallocation", "The number of bytes used", "Always zero"], answer: 1 },
              { id: 2, question: "push_back on a full vector triggers:", options: ["An exception", "Reallocation and element migration", "Silent data loss", "A compile error"], answer: 1 },
              { id: 3, question: "Which access method performs bounds checking?", options: ["operator[]", "at()", "front()", "data()"], answer: 1 },
              { id: 4, question: "v.end() refers to:", options: ["The last element", "One position past the last element", "The first element", "A null pointer"], answer: 1 },
              { id: 5, question: "Reallocation invalidates:", options: ["Nothing", "Existing iterators, pointers and references", "Only const iterators", "Only the vector's size"], answer: 1 },
              { id: 6, question: "reserve(1000) changes:", options: ["size only", "capacity only", "both size and capacity", "neither"], answer: 1 },
              { id: 7, question: "std::vector guarantees its elements are:", options: ["Scattered on the heap", "Contiguous in memory", "Sorted", "Unique"], answer: 1 },
              { id: 8, question: "Erasing from the middle of a vector costs:", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], answer: 2 },
              { id: 9, question: "A random-access iterator supports:", options: ["Only ++", "++ and --", "it + n in constant time", "No arithmetic"], answer: 2 },
              { id: 10, question: "clear() on a vector:", options: ["Frees the capacity", "Removes elements but typically retains capacity", "Does nothing", "Invalidates the vector object"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 8, title: "Chapter 8: Advanced Templates and the Standard Template Library (STL)", explanation: "cpp/chapter8.md", quizData: JSON.stringify([
              { id: 1, question: "Template instantiation happens:", options: ["At run time", "At compile time", "At link time only", "During preprocessing"], answer: 1 },
              { id: 2, question: "std::map provides lookup in:", options: ["O(1) guaranteed", "O(log n)", "O(n)", "O(n log n)"], answer: 1 },
              { id: 3, question: "std::unordered_map requires which two things for its key type?", options: ["operator< and operator>", "std::hash and operator==", "A constructor only", "Nothing"], answer: 1 },
              { id: 4, question: "Which container silently rejects duplicate keys?", options: ["std::multiset", "std::set", "std::vector", "std::multimap"], answer: 1 },
              { id: 5, question: "Iterating a std::unordered_map yields elements:", options: ["In sorted key order", "In unspecified order", "In insertion order", "In reverse order"], answer: 1 },
              { id: 6, question: "STL algorithms are written against:", options: ["Specific container types", "Iterator ranges", "Raw pointers only", "Macros"], answer: 1 },
              { id: 7, question: "A lambda's capture clause [ ] controls:", options: ["Its return type", "Which enclosing variables it can use and how", "Its parameter list", "Its calling convention"], answer: 1 },
              { id: 8, question: "Template error messages are notoriously long because:", options: ["Compilers are poorly written", "The error is reported through the full instantiation chain", "Templates are interpreted", "They include the whole standard"], answer: 1 },
              { id: 9, question: "std::sort requires which iterator category?", options: ["Input", "Forward", "Bidirectional", "Random access"], answer: 3 },
              { id: 10, question: "A class template Stack is instantiated for int by writing:", options: ["Stack s;", "Stack<int> s;", "Stack(int) s;", "template Stack s;"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 9, title: "Chapter 9: Exception Handling and Robust Error Management", explanation: "cpp/chapter9.md", quizData: JSON.stringify([
              { id: 1, question: "Exceptions should be caught by:", options: ["Value", "const reference", "Pointer", "Raw address"], answer: 1 },
              { id: 2, question: "Catching a derived exception by value causes:", options: ["Nothing unusual", "Object slicing", "A compile error", "Immediate termination"], answer: 1 },
              { id: 3, question: "During stack unwinding the compiler guarantees:", options: ["Memory from new is freed automatically", "Destructors of local objects run", "All threads pause", "Files are flushed"], answer: 1 },
              { id: 4, question: "If no matching handler exists anywhere, the program:", options: ["Continues silently", "Calls std::terminate()", "Returns 0", "Retries the throw"], answer: 1 },
              { id: 5, question: "std::out_of_range derives from:", options: ["std::runtime_error", "std::logic_error", "std::bad_alloc", "std::string"], answer: 1 },
              { id: 6, question: "A function marked noexcept that throws will:", options: ["Propagate normally", "Terminate the program", "Return an error code", "Retry"], answer: 1 },
              { id: 7, question: "Catch blocks should be ordered:", options: ["Base class first", "Most derived first", "Alphabetically", "Order is irrelevant"], answer: 1 },
              { id: 8, question: "The member function every standard exception provides is:", options: ["message()", "what()", "error()", "text()"], answer: 1 },
              { id: 9, question: "Allowing an exception to escape a destructor:", options: ["Is good practice", "Can terminate the program during unwinding", "Is required by RAII", "Is silently ignored"], answer: 1 },
              { id: 10, question: "The strong exception guarantee means an operation:", options: ["Never throws", "Either completes fully or leaves state unchanged", "Leaves state valid but unspecified", "Always throws"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 10, title: "Chapter 10: File I/O and Streams", explanation: "cpp/chapter10.md", quizData: JSON.stringify([
              { id: 1, question: "Which class is used for reading from a file?", options: ["ofstream", "ifstream", "ostringstream", "ostream"], answer: 1 },
              { id: 2, question: "Which mode appends to an existing file rather than truncating it?", options: ["ios::trunc", "ios::app", "ios::in", "ios::binary"], answer: 1 },
              { id: 3, question: "After a failed extraction, subsequent reads:", options: ["Work normally", "Do nothing until clear() is called", "Throw an exception", "Reopen the file"], answer: 1 },
              { id: 4, question: "eofbit indicates:", options: ["Stream corruption", "End of file was reached", "A formatting error", "The file is locked"], answer: 1 },
              { id: 5, question: "To read a whole line including spaces from a file stream, use:", options: [">>", "getline()", "read()", "seekg()"], answer: 1 },
              { id: 6, question: "seekg positions the:", options: ["Write pointer", "Read pointer", "File size", "Buffer size"], answer: 1 },
              { id: 7, question: "Binary mode is required when:", options: ["Writing plain text", "Writing non-text data whose bytes must not be translated", "Appending", "Reading integers"], answer: 1 },
              { id: 8, question: "An fstream object closes its file:", options: ["Only if close() is called", "Automatically in its destructor", "At program exit only", "Never"], answer: 1 },
              { id: 9, question: "tellp() returns:", "options": ["The file size", "The current write position", "The last error", "The open mode"], answer: 1 },
              { id: 10, question: "With fixed-size records, the offset of record n is:", "options": ["n", "n * sizeof(Record)", "sizeof(Record)", "Unknowable"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 11, title: "Chapter 11: Multithreading and Concurrency", explanation: "cpp/chapter11.md", quizData: JSON.stringify([
              { id: 1, question: "A data race requires that:", options: ["Two threads read the same variable", "Two threads access the same memory concurrently with at least one write, unsynchronised", "Two threads run on the same core", "A mutex is used"], answer: 1 },
              { id: 2, question: "std::lock_guard releases its mutex:", options: ["When unlock() is called manually", "At the end of its scope, including during exception unwinding", "At program exit", "Never"], answer: 1 },
              { id: 3, question: "A joinable std::thread destroyed without join() or detach() causes:", options: ["A memory leak only", "std::terminate to be called", "Silent success", "A compile error"], answer: 1 },
              { id: 4, question: "Condition variables should be waited on with a predicate because:", options: ["It is stylistic", "Spurious wakeups can occur", "Predicates are faster", "The standard forbids the alternative"], answer: 1 },
              { id: 5, question: "std::async returns:", options: ["A thread", "A future", "A mutex", "A promise"], answer: 1 },
              { id: 6, question: "Deadlock is most simply prevented by:", options: ["Using more threads", "Acquiring locks in a globally consistent order", "Removing all locks", "Calling detach()"], answer: 1 },
              { id: 7, question: "Calling future.get() twice on the same std::future:", options: ["Returns the value twice", "Is undefined behaviour", "Blocks forever always", "Creates a new future"], answer: 1 },
              { id: 8, question: "std::atomic is used for:", options: ["File I/O", "Lock-free access to a single shared value", "Thread creation", "Exception handling"], answer: 1 },
              { id: 9, question: "Holding a mutex while performing blocking network I/O:", options: ["Improves throughput", "Serialises all other threads behind slow I/O", "Is required", "Prevents deadlock"], answer: 1 },
              { id: 10, question: "hardware_concurrency() returns:", options: ["A guarantee of thread count", "A hint at the number of concurrent threads supported", "The number of running threads", "The CPU frequency"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 12, title: "Chapter 12: Move Semantics and Rvalue References", explanation: "cpp/chapter12.md", quizData: JSON.stringify([
              { id: 1, question: "std::move does what at run time?", options: ["Moves the object", "Nothing — it is a compile-time cast to an rvalue", "Frees memory", "Copies the object"], answer: 1 },
              { id: 2, question: "After being moved from, an object is:", options: ["Destroyed", "Valid but unspecified", "Undefined and unusable", "Unchanged"], answer: 1 },
              { id: 3, question: "A move constructor for a heap-owning class costs:", options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"], answer: 1 },
              { id: 4, question: "Move operations should be marked noexcept because:", options: ["It is required syntax", "Containers fall back to copying if moves may throw", "It makes them faster to compile", "It disables copying"], answer: 1 },
              { id: 5, question: "In template<class T> void f(T&& x), T&& is:", options: ["Always an rvalue reference", "A forwarding reference", "An lvalue reference", "Invalid"], answer: 1 },
              { id: 6, question: "Inside a function, a parameter named x of type T&& is:", options: ["An rvalue", "An lvalue, because it is named", "Neither", "Both"], answer: 1 },
              { id: 7, question: "std::forward differs from std::move in that it:", options: ["Always casts to rvalue", "Conditionally preserves the original value category", "Copies", "Deletes"], answer: 1 },
              { id: 8, question: "The Rule of Five concerns:", options: ["Five loop types", "Destructor, copy ctor, copy assign, move ctor, move assign", "Five containers", "Five standards"], answer: 1 },
              { id: 9, question: "std::unique_ptr is move-only because:", options: ["Of a compiler limitation", "Copying would duplicate exclusive ownership", "It is a template", "Moves are always faster"], answer: 1 },
              { id: 10, question: "Which of these is an rvalue?", options: ["A named local variable", "std::string(\"temp\")", "A reference parameter", "A global variable"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 13, title: "Chapter 13: C++20 Concepts and Ranges", explanation: "cpp/chapter13.md", quizData: JSON.stringify([
              { id: 1, question: "An arena allocator frees all of its objects by:", options: ["Calling delete on each", "Resetting an offset pointer", "Running a garbage collector", "Calling free() per object"], answer: 1 },
              { id: 2, question: "Fragmentation means:", options: ["Memory is corrupted", "Free memory exists but not as one usable contiguous block", "The heap is full", "Pointers are invalid"], answer: 1 },
              { id: 3, question: "Placement new:", options: ["Allocates and constructs", "Constructs in memory you already own", "Frees memory", "Is deprecated"], answer: 1 },
              { id: 4, question: "After placement new, the object must be destroyed by:", options: ["delete p", "Explicitly calling p->~T()", "free(p)", "Nothing"], answer: 1 },
              { id: 5, question: "A pool allocator is best suited to:", options: ["Objects of wildly varying size", "Many objects of the same fixed size", "A single large object", "Stack variables"], answer: 1 },
              { id: 6, question: "A typical cache line size is:", options: ["8 bytes", "64 bytes", "4096 bytes", "1 byte"], answer: 1 },
              { id: 7, question: "Struct of Arrays can outperform Array of Structs because it:", options: ["Uses less total memory", "Wastes less of each fetched cache line", "Avoids all allocation", "Is required by the standard"], answer: 1 },
              { id: 8, question: "The main drawback of an arena is:", options: ["It is slow", "Individual objects cannot be freed independently", "It fragments badly", "It cannot be reset"], answer: 1 },
              { id: 9, question: "Accessing main memory versus L1 cache is roughly:", options: ["The same speed", "About 50 times slower", "Twice as slow", "Faster"], answer: 1 },
              { id: 10, question: "The correct first step before any low-level optimisation is to:", options: ["Rewrite in assembly", "Profile and measure", "Add more threads", "Increase cache size"], answer: 1 }
            ]), challenges: "[]" },

            { orderNumber: 14, title: "Chapter 14: C++20 Coroutines and Modules", explanation: "cpp/chapter14.md", quizData: JSON.stringify([
              { id: 1, question: "A lambda expression compiles to:", options: ["A macro", "A class with an operator()", "A function pointer only", "Inline assembly"], answer: 1 },
              { id: 2, question: "Capturing by reference is dangerous when:", options: ["The lambda is called immediately", "The lambda outlives the captured variable", "The variable is const", "The capture list is empty"], answer: 1 },
              { id: 3, question: "A closure is:", options: ["A lambda's parameter list", "Code together with its captured environment", "A type of container", "A destructor"], answer: 1 },
              { id: 4, question: "std::views::filter performs its work:", options: ["Immediately when written", "Lazily, when the range is iterated", "At compile time", "Never"], answer: 1 },
              { id: 5, question: "Range views are:", options: ["Owning copies of the data", "Non-owning lightweight adaptors", "Always sorted", "Thread-safe by default"], answer: 1 },
              { id: 6, question: "The mutable keyword on a lambda allows:", options: ["Reference captures", "Modification of by-value captures", "Recursion", "Multiple returns"], answer: 1 },
              { id: 7, question: "std::function's main runtime cost is:", options: ["Nothing", "Possible heap allocation and an indirect call", "Extra compilation only", "Memory leaks"], answer: 1 },
              { id: 8, question: "Init capture [p = std::move(ptr)] exists chiefly to:", options: ["Rename variables", "Capture move-only types into a lambda", "Improve readability only", "Force by-reference capture"], answer: 1 },
              { id: 9, question: "Composing filter | transform | take over a million elements to get 5 results processes:", options: ["All million through every stage", "Only as many elements as needed to yield 5", "Exactly 5 elements total", "None"], answer: 1 },
              { id: 10, question: "A projection in ranges::sort lets you:", options: ["Sort by a member without writing a comparator", "Sort in parallel", "Sort in place only", "Avoid comparisons"], answer: 0 }
            ]), challenges: "[]" },

            { orderNumber: 15, title: "Chapter 15: C++23 Features and High-Performance Best Practices", explanation: "cpp/chapter15.md", quizData: JSON.stringify([
              { id: 1, question: "The Factory pattern primarily decouples client code from:", options: ["The interface", "The concrete class being constructed", "The compiler", "The destructor"], answer: 1 },
              { id: 2, question: "Observer describes a relationship that is:", options: ["One-to-one", "One-to-many notification", "Many-to-one only", "Static and compile-time"], answer: 1 },
              { id: 3, question: "Strategy allows you to:", options: ["Create one instance only", "Swap algorithms behind a common interface", "Adapt incompatible interfaces", "Add behaviour by wrapping"], answer: 1 },
              { id: 4, question: "The 'O' in SOLID stands for:", "options": ["Object oriented", "Open/Closed", "Overloading", "Ownership"], answer: 1 },
              { id: 5, question: "Dependency Inversion says high-level modules should depend on:", options: ["Concrete implementations", "Abstractions", "Global variables", "The database"], answer: 1 },
              { id: 6, question: "Liskov Substitution is violated when a derived class:", options: ["Adds new members", "Breaks a behavioural guarantee the base promised", "Is larger in memory", "Uses templates"], answer: 1 },
              { id: 7, question: "Singleton is criticised mainly because it:", options: ["Is slow", "Introduces global state and hinders testing", "Cannot compile", "Requires templates"], answer: 1 },
              { id: 8, question: "The Rule of Zero advises you to:", options: ["Define all five special members", "Design classes that need none of them", "Avoid classes entirely", "Never use destructors"], answer: 1 },
              { id: 9, question: "Interface Segregation prefers:", options: ["One large interface", "Several small focused interfaces", "No interfaces", "Only concrete classes"], answer: 1 },
              { id: 10, question: "The Core Guidelines recommend which default for resource management?", options: ["Manual new/delete", "RAII", "Global allocation", "Garbage collection"], answer: 1 }
            ]), challenges: "[]" },
          ];
        } else {
          // Standard Chapters for other courses (C, C++) starting at 1
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
