export interface DictatorStep {
    step: number;

    title: string;

    // What the student is learning
    concept: string;

    // What the student should type/do
    instruction: string;

    // Teacher explanation
    explanation: string;

    // Why this concept is needed
    why: string;

    // Small example
    example: string;

    // Help if the student is stuck
    hint: string;

    // Voice explanation
    speech: string;

    // What the engine checks
    expected: string;

    // How the engine checks it
    type:
        | "keyword"
        | "identifier"
        | "symbol"
        | "method"
        | "statement"
        | "structure";
}


/*
 * =========================================================
 * DICTATOR PLANNER
 * =========================================================
 *
 * Creates small, teacher-like learning steps.
 *
 * Example:
 *
 * Student Marks
 *
 * Step 1 → public
 * Step 2 → class
 * Step 3 → StudentMarks
 * Step 4 → {
 * Step 5 → public
 * Step 6 → static
 * Step 7 → void
 * Step 8 → main
 *
 * The student is guided one small piece at a time.
 */


/*
 * =========================================================
 * CREATE A VALID JAVA CLASS NAME
 * =========================================================
 */

function createJavaClassName(
    project: string
): string {

    const words =
        project
            .trim()
            .split(/[^A-Za-z0-9]+/)
            .filter(Boolean);

    if (words.length === 0) {
        return "Main";
    }

    const className =
        words
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLowerCase()
            )
            .join("");

    /*
     * Java identifiers cannot safely start
     * with a number.
     */

    if (/^\d/.test(className)) {
        return `Program${className}`;
    }

    return className || "Main";
}


/*
 * =========================================================
 * JAVA CLASS MICRO-STEPS
 * =========================================================
 */

function createJavaClassSteps(
    className: string
): DictatorStep[] {

    return [

        {
    step: 1,

    title:
        "Start the class declaration",

    concept:
        "public",

    instruction:
        "Start the class declaration by typing the keyword public.",

    explanation:
        "public is an access modifier in Java. It controls the visibility of the class and allows it to be accessed from other parts of the program.",

    why:
        "We use public so our main class can be accessed normally by the Java runtime.",

    example:
        "public class Main",

    hint:
        "Java keywords are written in lowercase.",

    speech:
        "Let's start with the public keyword. Public is an access modifier that controls the visibility of our class.",

    expected:
        "public",

    type:
        "keyword",
},


        {
    step: 2,

    title:
        "Declare a class",

    concept:
        "class",

    instruction:
        "After public, type the class keyword.",

    explanation:
        "The class keyword tells Java that we are defining a class. A class is a blueprint that contains data and behavior.",

    why:
        "Our Hello World program needs a class because Java programs are organized around classes.",

    example:
        "public class Main",

    hint:
        "The keyword must be lowercase: class.",

    speech:
        "Good. Now let's add the class keyword. Class tells Java that we are defining a class.",

    expected:
        "class",

    type:
        "keyword",
},


        {
    step: 3,

    title:
        "Name the class",

    concept:
        "Main",

    instruction:
        "After class, type the class name Main.",

    explanation:
        "Main is the name we give to our class. We use Main because this class contains the starting point of our program.",

    why:
        "Giving the class a clear name helps us identify what the program contains.",

    example:
        "public class Main",

    hint:
        "Class names normally begin with a capital letter in Java.",

    speech:
        "Excellent. Now let's name our class Main. Main will contain the starting point of our Hello World program.",

    expected:
        "Main",

    type:
        "identifier",
},
{
    step: 4,

    title:
        "Open the class body",

    concept:
        "{",

    instruction:
        "Add an opening curly brace to begin the class body.",

    explanation:
        "The opening curly brace marks the beginning of the class body. Everything belonging to the class will be placed inside these braces.",

    why:
        "Java uses braces to define the boundaries of classes, methods and other blocks of code.",

    example:
        "public class Main {",

    hint:
        "Use the opening curly brace: {",

    speech:
        "Now let's open the class body. The opening curly brace tells Java where the contents of our class begin.",

    expected:
        "{",

    type:
        "symbol",
},

        {
    step: 5,

    title:
        "Start the main method",

    concept:
        "public",

    instruction:
        "Inside the class, type the keyword public.",

    explanation:
        "public is an access modifier. It allows the main method to be accessible to the Java runtime.",

    why:
        "The main method needs to be accessible so Java can start our program from it.",

    example:
        "public static void main(String[] args)",

    hint:
        "The main method begins with the lowercase keyword public.",

    speech:
        "Step 5. Let's begin the main method with public. Public is an access modifier that allows Java to access the method.",

    expected:
        "public",

    type:
        "keyword",
},


       {
    step: 6,

    title:
        "Make the main method static",

    concept:
        "static",

    instruction:
        "After public, type the keyword static.",

    explanation:
        "static means the method belongs to the class rather than requiring an object to be created first.",

    why:
        "Java needs to be able to call main when the program starts, before we create an object of the class.",

    example:
        "public static void main(String[] args)",

    hint:
        "The standard Java main method uses public static.",

    speech:
        "Correct. Now add static. Static allows Java to call the main method without creating an object of the class.",

    expected:
        "static",

    type:
        "keyword",
},

      {
    step: 7,

    title:
        "Define the return type",

    concept:
        "void",

    instruction:
        "After static, type the keyword void.",

    explanation:
        "void means this method does not return a value to the code that called it.",

    why:
        "Our main method starts the program, so it does not need to return a value.",

    example:
        "public static void main(String[] args)",

    hint:
        "The main method does not return a value.",

    speech:
        "Good. Now add void. Void tells Java that our main method does not return a value.",

    expected:
        "void",

    type:
        "keyword",
},

       {
    step: 8,

    title:
        "Name the entry method",

    concept:
        "main",

    instruction:
        "Now type the method name main.",

    explanation:
        "main is the special method where Java begins executing this program.",

    why:
        "Every standard Java application needs a main method as its starting point.",

    example:
        "public static void main(String[] args)",

    hint:
        "The method name must be lowercase: main.",

    speech:
        "Step 8. Now type main. Main is the entry point where Java begins executing our program.",

    expected:
        "main",

    type:
        "identifier",
},


       {
    step: 9,

    title:
        "Open the parameter list",

    concept:
        "Parentheses",

    instruction:
        "Add an opening parenthesis after main.",

    explanation:
        "Parentheses define the parameter list of a method.",

    why:
        "Our main method needs a place to declare its input parameter.",

    example:
        "main(",

    hint:
        "Method parameters are written inside parentheses.",

    speech:
        "Step 9. Add the opening parenthesis. This begins the parameter list of our main method.",

    expected:
        "(",

    type:
        "symbol",
},
        {
    step: 10,

    title:
        "Define the parameter type",

    concept:
        "String",

    instruction:
        "Type String as the parameter type.",

    explanation:
        "String is the Java type used for text.",

    why:
        "The main method receives command-line arguments as text.",

    example:
        "String[] args",

    hint:
        "String begins with a capital S because it is a Java class name.",

    speech:
        "Step 10. Type String. String is the Java type we use for text.",

    expected:
        "String",

    type:
        "identifier",
},

       {
    step: 11,

    title:
        "Create a String array",

    concept:
        "Array brackets",

    instruction:
        "Add square brackets after String.",

    explanation:
        "Square brackets indicate that we are declaring an array.",

    why:
        "The main method receives multiple command-line arguments, so it uses an array of Strings.",

    example:
        "String[] args",

    hint:
        "Add [] directly after String.",

    speech:
        "Step 11. Add the square brackets. They tell Java that the parameter is an array of Strings.",

    expected:
        "[]",

    type:
        "symbol",
},

       {
    step: 12,

    title:
        "Name the parameter",

    concept:
        "args",

    instruction:
        "Type args as the parameter name.",

    explanation:
        "args is the variable name used to refer to the String array passed to the main method.",

    why:
        "We need a name so the program can refer to the command-line arguments.",

    example:
        "String[] args",

    hint:
        "args is the conventional name used for the main method parameter.",

    speech:
        "Step 12. Now type args. Args is the name we use for the String array passed to the main method.",

    expected:
        "args",

    type:
        "identifier",
},


       {
    step: 13,

    title:
        "Close the parameter list",

    concept:
        "Closing parenthesis",

    instruction:
        "Add the closing parenthesis.",

    explanation:
        "The closing parenthesis marks the end of the method's parameter list.",

    why:
        "We have finished declaring the input parameter for the main method.",

    example:
        "main(String[] args)",

    hint:
        "Close the parameter list with ).",

    speech:
        "Step 13. Add the closing parenthesis. This finishes the parameter list of the main method.",

    expected:
        ")",

    type:
        "symbol",
},

       {
    step: 14,

    title:
        "Open the main method",

    concept:
        "Method body",

    instruction:
        "Add an opening curly brace for the main method.",

    explanation:
        "The opening curly brace begins the body of the main method. The statements that execute when the program starts will go inside it.",

    why:
        "We need a method body where we can write the instructions for our Hello World program.",

    example:
        "public static void main(String[] args) {",

    hint:
        "Add { after the closing parenthesis.",

    speech:
        "Step 14. Add the opening curly brace. This begins the body of our main method, where we'll write the program instructions.",

    expected:
        "{",

    type:
        "symbol",
},
    ];
}


/*
 * =========================================================
 * HELLO WORLD STEPS
 * =========================================================
 */

function createHelloWorldSteps(
    className: string
): DictatorStep[] {

    return [

        ...createJavaClassSteps(className),


        /*
         * =====================================================
         * STEP 15
         * =====================================================
         */

        {
            step: 15,

            title:
                "Access standard Java functionality",

            concept:
                "System",

            instruction:
                "Inside the main method, type System.",

            explanation:
                "System is a Java class that provides access to standard system functionality, including input and output.",

            why:
                "We use System because we want to display Hello World in the console.",

            example:
                "System.out",

            hint:
                "Type System with a capital S because it is a Java class name.",

            speech:
                "Step 15. Now let's start printing our message. System is a Java class that gives us access to standard input and output functionality.",

            expected:
                "System",

            type:
                "identifier",
        },


        /*
         * =====================================================
         * STEP 16
         * =====================================================
         */

        {
            step: 16,

            title:
                "Access standard output",

            concept:
                "System.out",

            instruction:
                "After System, type .out.",

            explanation:
                "System.out represents the standard output stream, which normally points to the console.",

            why:
                "We use System.out because we want our Hello World message to appear in the console.",

            example:
                "System.out",

            hint:
                "Use a dot between System and out.",

            speech:
                "Step 16. Now add dot out. System dot out gives our program access to the standard console output.",

            expected:
                "System.out",

            type:
                "statement",
        },


        /*
         * =====================================================
         * STEP 17
         * =====================================================
         */

        {
            step: 17,

            title:
                "Call println",

            concept:
                "println",

            instruction:
                "Now type println.",

            explanation:
                "println is a method that prints information to the console and then moves the cursor to the next line.",

            why:
                "We use println because we want to display Hello World as a complete line in the console.",

            example:
                "System.out.println",

            hint:
                "println is written with a lowercase p.",

            speech:
                "Step 17. Now let's use println. Println is a method that displays text in the console and then moves to the next line.",

            expected:
                "println",

            type:
                "method",
        },


        /*
         * =====================================================
         * STEP 18
         * =====================================================
         */

        {
            step: 18,

            title:
                "Print Hello World",

            concept:
                "String literal",

            instruction:
                'Inside println, write "Hello World".',

            explanation:
                "Text written inside double quotes is called a String literal. It represents the exact text we want the program to display.",

            why:
                "Our goal is to display the message Hello World, so we place that text inside double quotes.",

            example:
                'System.out.println("Hello World");',

            hint:
                'Put Hello World inside double quotes.',

            speech:
                "Step 18. Now let's write the message. Put Hello World inside double quotes because Java treats quoted text as a String.",

            expected:
                'System.out.println("Hello World");',

            type:
                "statement",
        },


        /*
         * =====================================================
         * STEP 19
         * =====================================================
         */

        {
            step: 19,

            title:
                "Close the main method",

            concept:
                "Closing curly brace",

            instruction:
                "Add the closing curly brace for the main method.",

            explanation:
                "The closing curly brace marks the end of the main method body.",

            why:
                "We have finished writing the instructions that should execute inside the main method.",

            example:
                `public static void main(String[] args) {
    System.out.println("Hello World");
}`,

            hint:
                "Add } to close the main method.",

            speech:
                "Step 19. We have finished the instructions inside the main method. Now add the closing curly brace to close the method.",

            expected:
                "}",

            type:
                "symbol",
        },


        /*
         * =====================================================
         * STEP 20
         * =====================================================
         */

        {
            step: 20,

            title:
                "Close the class",

            concept:
                "Class closing brace",

            instruction:
                "Add the final closing curly brace for the class.",

            explanation:
                "The final curly brace closes the class body and completes the Java program structure.",

            why:
                "Every opening class brace must have a matching closing brace.",

            example:
                `public class ${className} {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,

            hint:
                "The final } closes the ${className} class.",

            speech:
                "Step 20. We have finished our Hello World program. Add the final closing curly brace to close the class.",

            expected:
                "}",

            type:
                "symbol",
        },

    ];
}


/*
 * =========================================================
 * CALCULATOR STEPS
 * =========================================================
 */

function createCalculatorSteps(
    className: string
): DictatorStep[] {

    return [

        ...createJavaClassSteps(className),


        /*
         * =====================================================
         * STEP 15
         * =====================================================
         */

        {
            step: 15,

            title:
                "Create the first integer variable",

            concept:
                "int",

            instruction:
                "Inside the main method, type int to begin the first integer variable.",

            explanation:
                "int is a Java primitive data type used to store whole numbers such as 10, 20, or 100.",

            why:
                "Our calculator needs numbers to perform calculations, so we use int to store whole-number values.",

            example:
                "int a = 10;",

            hint:
                "Use the lowercase keyword int.",

            speech:
                "Step 15. Let's create our first variable. Int is a Java data type used to store whole numbers. We'll use it to store a number for our calculator.",

            expected:
                "int",

            type:
                "keyword",
        },


        /*
         * =====================================================
         * STEP 16
         * =====================================================
         */

        {
            step: 16,

            title:
                "Name the first variable",

            concept:
                "Variable name",

            instruction:
                "Name the first variable a.",

            explanation:
                "A variable name is an identifier that allows us to refer to a stored value later in the program.",

            why:
                "We need a name so we can use this number in our calculation. Here we are using a as the first number.",

            example:
                "int a = 10;",

            hint:
                "Use the variable name a.",

            speech:
                "Step 16. Now give our first variable a name. We'll call it A so we can refer to this number later.",

            expected:
                "a",

            type:
                "identifier",
        },


        /*
         * =====================================================
         * STEP 17
         * =====================================================
         */

        {
            step: 17,

            title:
                "Assign a value to a",

            concept:
                "Assignment operator",

            instruction:
                "Assign an integer value to a.",

            explanation:
                "The equals sign is the assignment operator. It stores the value on the right inside the variable on the left.",

            why:
                "Our calculator needs an actual number stored in a before we can use it in a calculation.",

            example:
                "int a = 10;",

            hint:
                "For example, you can assign 10 to a.",

            speech:
                "Step 17. Now let's give A a value. The equals sign assigns the value on the right to the variable on the left. For example, A can store 10.",

            expected:
                "int a = 10;",

            type:
                "statement",
        },


        /*
         * =====================================================
         * STEP 18
         * =====================================================
         */

        {
            step: 18,

            title:
                "Create the second variable",

            concept:
                "Second integer variable",

            instruction:
                "Create another integer variable named b.",

            explanation:
                "We can create another variable using the same int data type and give it a different name.",

            why:
                "A calculator needs two numbers so that we can perform an operation such as addition.",

            example:
                "int b = 20;",

            hint:
                "Use int b followed by an assignment.",

            speech:
                "Step 18. Now let's create our second number. We'll use another integer variable named B and store 20 in it.",

            expected:
                "int b = 20;",

            type:
                "statement",
        },


        /*
         * =====================================================
         * STEP 19
         * =====================================================
         */

        {
            step: 19,

            title:
                "Calculate the sum",

            concept:
                "Addition operator",

            instruction:
                "Create a variable that stores a plus b.",

            explanation:
                "The plus operator adds the values stored in a and b.",

            why:
                "This is the actual calculation performed by our simple calculator. We combine the two numbers to get their sum.",

            example:
                "int sum = a + b;",

            hint:
                "Use the plus operator to add a and b.",

            speech:
                "Step 19. Now let's perform our calculation. The plus operator adds the values stored in A and B. We can store the result in another variable called sum.",

            expected:
                "a + b",

            type:
                "statement",
        },


        /*
         * =====================================================
         * STEP 20
         * =====================================================
         */

        {
            step: 20,

            title:
                "Print the result",

            concept:
                "System.out.println",

            instruction:
                "Print the calculated result using System.out.println().",

            explanation:
                "System.out.println is used to display information in the console. It prints the value and then moves to the next line.",

            why:
                "The calculation is useful only if the student can see the result, so we display it in the console.",

            example:
                "System.out.println(sum);",

            hint:
                "Pass the variable containing the sum to println.",

            speech:
                "Step 20. Our calculation is complete. Now let's display the result using System out println. This prints the calculated value to the console.",

            expected:
                "System.out.println",

            type:
                "statement",
        },

    ];
}


/*
 * =========================================================
 * CREATE DICTATOR PLAN
 * =========================================================
 */

export function createDictatorPlan(
    project: string,
    language: string = "java",
    level: string = "beginner"
): DictatorStep[] {

    const normalizedProject =
        project.trim().toLowerCase();

    const normalizedLanguage =
        language.trim().toLowerCase();


    /*
     * Currently our detailed micro-step planner
     * is implemented for Java.
     *
     * For other languages, provide a safe
     * generic starting step.
     */

    if (normalizedLanguage !== "java") {

        return [

            {
                step: 1,

                title:
                    "Start the project",

                concept:
                    "Program structure",

                instruction:
                    `Start building your ${project} project.`,

                explanation:
                    `Every ${language} program needs a basic structure before we add the main logic.`,

                why:
                    `We start with the basic structure so the rest of the ${project} project has a clear foundation.`,

                example:
                    `Basic ${language} program structure`,

                hint:
                    `Begin with the basic structure required for ${language}.`,

                speech:
                    `Step 1. Let's start building your ${project} project. First, we'll create the basic structure required for ${language}.`,

                expected:
                    "",

                type:
                    "structure",
            },

        ];
    }


    /*
     * =========================================================
     * JAVA PROJECT PLANNING
     * =========================================================
     *
     * Detailed Java project plans are created below.
     */

    /*
     * Generate a proper class name from the
     * student's project.
     *
     * student marks
     *      ↓
     * StudentMarks
     */

    const className =
        createJavaClassName(project);


    /*
     * =====================================================
     * HELLO WORLD
     * =====================================================
     */

    if (
        normalizedProject.includes("hello world") ||
        normalizedProject === "hello"
    ) {

        return createHelloWorldSteps(
            className
        );
    }


    /*
     * =====================================================
     * CALCULATOR
     * =====================================================
     */

    if (
        normalizedProject.includes("calculator") ||
        normalizedProject.includes("calculate")
    ) {

        return createCalculatorSteps(
            className
        );
    }


    /*
     * =====================================================
     * GENERIC JAVA PROJECT
     * =====================================================
     *
     * Unknown projects still receive a personalized
     * class-building sequence.
     */

    return createJavaClassSteps(
        className
    );
}