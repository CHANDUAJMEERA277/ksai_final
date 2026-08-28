/**
 * Codenthra Universal AI Dictator Tokenizer & Pedagogical Synthesizer (Power Dictator V2)
 * Supports Java, Python, C, C++, and universal fallback across Beginner, Intermediate, and Advanced tiers.
 */

import type { DictatorStep } from "./DictatorPlanner";

export interface DictatorTeachingUnit {
    token: string;
    expectedToken: string;
    insertSnippet: string;
    fullAccumulatedCode: string;
    title: string;
    concept: string;
    instruction: string;
    explanation: string;
    why: string;
    hint: string;
    speech: string;
    category: "structure" | "statement" | "keyword" | "identifier" | "method";
    partOfStep: number;
    totalStepParts: number;
    stepTitle: string;
}

export type CurriculumTask =
    | "reverse_number"
    | "palindrome"
    | "factorial"
    | "prime"
    | "fibonacci"
    | "armstrong"
    | "array"
    | "sort"
    | "binary_search"
    | "linked_list"
    | "stack_queue"
    | "matrix"
    | "inheritance"
    | "override"
    | "constructor_overloading"
    | "student_management"
    | "atm"
    | "salary_payroll"
    | "electricity_bill"
    | "file_handling"
    | "exception_handling"
    | "multithreading"
    | "bst"
    | "graph"
    | "hello_world"
    | "calculator"
    | "pointers"
    | "structures"
    | "classes"
    | "stl"
    | "templates"
    | "recursion"
    | "database"
    | "general_task";

export function classifyProjectTask(project: string): CurriculumTask {
    const p = (project || "").toLowerCase().trim();
    if (p.includes("bst") || p.includes("binary search tree") || (p.includes("binary") && p.includes("tree"))) return "bst";
    if (p.includes("graph") || p.includes("traversal") || p.includes("bfs") || p.includes("dfs")) return "graph";
    if (p.includes("thread") || p.includes("multithread") || p.includes("concurrency")) return "multithreading";
    if (p.includes("database") || p.includes("sql") || p.includes("jdbc")) return "database";
    if (p.includes("pointer")) return "pointers";
    if (p.includes("struct") || p.includes("structure")) return "structures";
    if (p.includes("template") || p.includes("generic")) return "templates";
    if (p.includes("stl") || p.includes("vector") || p.includes("map")) return "stl";
    if (p.includes("recursi") || p.includes("tower of hanoi")) return "recursion";
    if (p.includes("reverse") || p.includes("reversing")) return "reverse_number";
    if (p.includes("palindrome")) return "palindrome";
    if (p.includes("factorial")) return "factorial";
    if (p.includes("prime")) return "prime";
    if (p.includes("fibonacci")) return "fibonacci";
    if (p.includes("armstrong")) return "armstrong";
    if (p.includes("sort") || p.includes("bubble") || p.includes("quick") || p.includes("merge") || p.includes("insertion")) return "sort";
    if (p.includes("binary search") || p.includes("searching") || p.includes("search")) return "binary_search";
    if (p.includes("linked") && p.includes("list")) return "linked_list";
    if (p.includes("stack") || p.includes("queue")) return "stack_queue";
    if (p.includes("matrix") || p.includes("2d array") || p.includes("grid")) return "matrix";
    if (p.includes("override") || p.includes("overriding") || p.includes("polymorphism")) return "override";
    if (p.includes("inherit") || p.includes("inheritance") || p.includes("subclass")) return "inheritance";
    if (p.includes("constructor") || p.includes("overload")) return "constructor_overloading";
    if (p.includes("class") || p.includes("object") || p.includes("oop") || p.includes("encapsulation")) return "classes";
    if (p.includes("student") || p.includes("mark") || p.includes("grade") || p.includes("report card")) return "student_management";
    if (p.includes("atm") || p.includes("bank") || p.includes("account")) return "atm";
    if (p.includes("salary") || p.includes("payroll") || p.includes("employee")) return "salary_payroll";
    if (p.includes("electricity") || p.includes("bill") || p.includes("tariff")) return "electricity_bill";
    if (p.includes("exception") || p.includes("error handling") || p.includes("try catch")) return "exception_handling";
    if (p.includes("read file") || p.includes("write file") || p.includes("csv") || p.includes("file handling") || p.includes("file io") || p.includes("files") || p.startsWith("file") || p.endsWith("file") || p.includes(" file")) return "file_handling";
    if (p.includes("hello") || p.includes("world") || p.includes("welcome")) return "hello_world";
    if (p.includes("calc") || p.includes("calculator") || p.includes("arithmetic") || p.includes("math")) return "calculator";
    if (p.includes("array") || p.includes("list")) return "array";
    return "general_task";
}

export function normalizeToken(token: string): string {
    return (token || "").replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

export interface CodeToken {
    value: string;
    line: number;
    col: number;
    type: "keyword" | "identifier" | "symbol" | "string" | "number" | "operator";
}

export function lexCode(code: string): CodeToken[] {
    const tokens: CodeToken[] = [];
    let line = 1;
    let col = 1;
    let i = 0;
    const len = (code || "").length;

    while (i < len) {
        const char = code[i];
        if (char === "\n") {
            line++;
            col = 1;
            i++;
            continue;
        }
        if (/\s/.test(char)) {
            col++;
            i++;
            continue;
        }
        if (char === "/" && code[i + 1] === "/") {
            while (i < len && code[i] !== "\n") {
                i++;
            }
            continue;
        }
        if (char === "#") {
            while (i < len && code[i] !== "\n") {
                i++;
            }
            continue;
        }
        if (char === "/" && code[i + 1] === "*") {
            i += 2;
            col += 2;
            while (i < len && !(code[i] === "*" && code[i + 1] === "/")) {
                if (code[i] === "\n") {
                    line++;
                    col = 1;
                } else {
                    col++;
                }
                i++;
            }
            i += 2;
            col += 2;
            continue;
        }
        if (char === '"') {
            const startCol = col;
            let strVal = '"';
            i++;
            col++;
            while (i < len && code[i] !== '"') {
                if (code[i] === "\\") {
                    strVal += code[i];
                    i++;
                    col++;
                    if (i < len) {
                        strVal += code[i];
                        i++;
                        col++;
                    }
                } else if (code[i] === "\n") {
                    break;
                } else {
                    strVal += code[i];
                    i++;
                    col++;
                }
            }
            if (i < len && code[i] === '"') {
                strVal += '"';
                i++;
                col++;
            }
            tokens.push({ value: strVal, line, col: startCol, type: "string" });
            continue;
        }
        if (char === "'") {
            const startCol = col;
            let strVal = "'";
            i++;
            col++;
            while (i < len && code[i] !== "'") {
                if (code[i] === "\\") {
                    strVal += code[i];
                    i++;
                    col++;
                    if (i < len) {
                        strVal += code[i];
                        i++;
                        col++;
                    }
                } else if (code[i] === "\n") {
                    break;
                } else {
                    strVal += code[i];
                    i++;
                    col++;
                }
            }
            if (i < len && code[i] === "'") {
                strVal += "'";
                i++;
                col++;
            }
            tokens.push({ value: strVal, line, col: startCol, type: "string" });
            continue;
        }
        const twoChar = code.slice(i, i + 2);
        if (["==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "->", "::", "<<", ">>"].includes(twoChar)) {
            tokens.push({ value: twoChar, line, col, type: "operator" });
            i += 2;
            col += 2;
            continue;
        }
        if ("{}()[];,:.".includes(char)) {
            tokens.push({ value: char, line, col, type: "symbol" });
            i++;
            col++;
            continue;
        }
        if ("=+-*/%<>!&|^~?@".includes(char)) {
            tokens.push({ value: char, line, col, type: "operator" });
            i++;
            col++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            const startCol = col;
            let numVal = "";
            while (i < len && /[0-9.a-fA-FxX]/.test(code[i])) {
                numVal += code[i];
                i++;
                col++;
            }
            tokens.push({ value: numVal, line, col: startCol, type: "number" });
            continue;
        }
        if (/[a-zA-Z_$]/.test(char)) {
            const startCol = col;
            let word = "";
            while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) {
                word += code[i];
                i++;
                col++;
            }
            tokens.push({ value: word, line, col: startCol, type: "identifier" });
            continue;
        }
        tokens.push({ value: char, line, col, type: "symbol" });
        i++;
        col++;
    }
    return tokens;
}

export function tokenizeCode(code: string): string[] {
    return lexCode(code).map((t) => t.value);
}

export function buildUnitsFromSequence(
    seq: Array<{
        token: string;
        insert: string;
        accum: string;
        title: string;
        instruction: string;
        explanation: string;
        why: string;
        hint: string;
        category: "structure" | "statement" | "keyword" | "identifier" | "method";
        step: number;
        stepTitle: string;
    }>
): DictatorTeachingUnit[] {
    const totalParts = seq.length;
    return seq.map((item, idx) => ({
        token: item.token,
        expectedToken: item.token,
        insertSnippet: item.insert,
        fullAccumulatedCode: item.accum,
        title: item.title,
        concept: item.stepTitle,
        instruction: item.instruction,
        explanation: item.explanation,
        why: item.why,
        hint: item.hint,
        speech: `Step ${idx + 1}. ${item.instruction}`,
        category: item.category,
        partOfStep: item.step,
        totalStepParts: totalParts,
        stepTitle: item.stepTitle,
    }));
}

export function convertStepsToTeachingUnits(
    steps: DictatorStep[],
    level: string = "beginner",
    language: string = "java"
): DictatorTeachingUnit[] {
    if (!steps || steps.length === 0) return [];
    let accumulated = "";
    const units: DictatorTeachingUnit[] = [];
    for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        const snippet = s.stepCode || s.code || "";
        if (s.code && s.code.length >= accumulated.length) {
            accumulated = s.code;
        } else {
            accumulated += (accumulated.length > 0 && !accumulated.endsWith("\n") ? "\n" : "") + snippet;
        }
        units.push({
            token: s.expected || snippet.trim(),
            expectedToken: s.expected || snippet.trim(),
            insertSnippet: snippet,
            fullAccumulatedCode: accumulated,
            title: s.title || `Step ${i + 1}`,
            concept: s.concept || s.title || `Step ${i + 1}`,
            instruction: s.instruction || `Type the required code for step ${i + 1}.`,
            explanation: s.explanation || "",
            why: s.why || "Core architectural component.",
            hint: s.hint || `Type: ${s.expected || snippet.trim()}`,
            speech: s.speech || `Step ${i + 1}. ${s.instruction || s.title}`,
            category: (s.type as any) || "statement",
            partOfStep: s.step || i + 1,
            totalStepParts: steps.length,
            stepTitle: s.title || `Step ${i + 1}`,
        });
    }
    return units;
}

export function synthesizeUniversalProgram(
    project: string,
    language: string = "java",
    level: string = "beginner"
): DictatorTeachingUnit[] {
    const normLang = (language || "java").toLowerCase().trim();
    const task = classifyProjectTask(project);
    const lvl = (level || "beginner").toLowerCase().trim();
    const isAdv = lvl === "advanced";
    const isInt = lvl === "intermediate";
    const p = project.trim() || "Program";

    // =========================================================================
    // JAVA SYNTHESIZER
    // =========================================================================
    if (normLang === "java") {
        // 1. ATM Program
        if (task === "atm") {
            if (isAdv) {
                const seq = [
                    {
                        token: "class InsufficientFundsException extends Exception {\n    public InsufficientFundsException(String msg) {\n        super(msg);\n    }\n}\n\nclass BankAccount {\n    private double balance;\n    public BankAccount(double init) {\n        balance = init;\n    }\n    public synchronized void deposit(double amt) {\n        balance += amt;\n    }\n    public synchronized void withdraw(double amt) throws InsufficientFundsException {\n        if (amt > balance) throw new InsufficientFundsException(\"Insufficient funds!\");\n        balance -= amt;\n    }\n    public double getBalance() { return balance; }\n}",
                        insert: "class InsufficientFundsException extends Exception {\n    public InsufficientFundsException(String msg) {\n        super(msg);\n    }\n}\n\nclass BankAccount {\n    private double balance;\n    public BankAccount(double init) {\n        balance = init;\n    }\n    public synchronized void deposit(double amt) {\n        balance += amt;\n    }\n    public synchronized void withdraw(double amt) throws InsufficientFundsException {\n        if (amt > balance) {\n            throw new InsufficientFundsException(\"Insufficient funds!\");\n        }\n        balance -= amt;\n    }\n    public double getBalance() {\n        return balance;\n    }\n}\n\n",
                        accum: "class InsufficientFundsException extends Exception {\n    public InsufficientFundsException(String msg) {\n        super(msg);\n    }\n}\n\nclass BankAccount {\n    private double balance;\n    public BankAccount(double init) {\n        balance = init;\n    }\n    public synchronized void deposit(double amt) {\n        balance += amt;\n    }\n    public synchronized void withdraw(double amt) throws InsufficientFundsException {\n        if (amt > balance) {\n            throw new InsufficientFundsException(\"Insufficient funds!\");\n        }\n        balance -= amt;\n    }\n    public double getBalance() {\n        return balance;\n    }\n}\n\n",
                        title: "Define Thread-Safe BankAccount & Custom Exception",
                        instruction: "Define BankAccount with synchronized deposit/withdraw methods and custom InsufficientFundsException.",
                        explanation: "Provides transactional integrity and prevents overdrafts through checked exceptions.",
                        why: "Thread-safe banking model with transactional error handling.",
                        hint: "Type BankAccount class and InsufficientFundsException.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Banking Model",
                    },
                    {
                        token: "public class Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount(1000.0);\n        System.out.println(\"=== Secure Enterprise ATM ===\");\n        acc.deposit(500.0);\n        try {\n            acc.withdraw(200.0);\n            System.out.println(\"Withdrawal successful. Current Balance: $\" + acc.getBalance());\n        } catch (InsufficientFundsException e) {\n            System.out.println(\"Transaction Error: \" + e.getMessage());\n        }\n    }\n}",
                        insert: "public class Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount(1000.0);\n        System.out.println(\"=== Secure Enterprise ATM ===\");\n        acc.deposit(500.0);\n        try {\n            acc.withdraw(200.0);\n            System.out.println(\"Withdrawal successful. Current Balance: $\" + acc.getBalance());\n        } catch (InsufficientFundsException e) {\n            System.out.println(\"Transaction Error: \" + e.getMessage());\n        }\n    }\n}\n",
                        accum: "class InsufficientFundsException extends Exception {\n    public InsufficientFundsException(String msg) {\n        super(msg);\n    }\n}\n\nclass BankAccount {\n    private double balance;\n    public BankAccount(double init) {\n        balance = init;\n    }\n    public synchronized void deposit(double amt) {\n        balance += amt;\n    }\n    public synchronized void withdraw(double amt) throws InsufficientFundsException {\n        if (amt > balance) {\n            throw new InsufficientFundsException(\"Insufficient funds!\");\n        }\n        balance -= amt;\n    }\n    public double getBalance() {\n        return balance;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount(1000.0);\n        System.out.println(\"=== Secure Enterprise ATM ===\");\n        acc.deposit(500.0);\n        try {\n            acc.withdraw(200.0);\n            System.out.println(\"Withdrawal successful. Current Balance: $\" + acc.getBalance());\n        } catch (InsufficientFundsException e) {\n            System.out.println(\"Transaction Error: \" + e.getMessage());\n        }\n    }\n}\n",
                        title: "Execute Transactions with Try-Catch in Main",
                        instruction: "Instantiate BankAccount, perform deposits and withdrawals within try-catch error handling.",
                        explanation: "Handles potential transaction exceptions gracefully.",
                        why: "Executes verified transactions.",
                        hint: "Type main() invoking deposit and withdraw inside try-catch.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            if (isInt) {
                const seq = [
                    {
                        token: "class Account {\n    double balance;\n    Account(double init) {\n        balance = init;\n    }\n    void deposit(double amt) {\n        balance += amt;\n    }\n    boolean withdraw(double amt) {\n        if (amt <= balance) {\n            balance -= amt;\n            return true;\n        }\n        return false;\n    }\n}",
                        insert: "class Account {\n    double balance;\n    Account(double init) {\n        balance = init;\n    }\n    void deposit(double amt) {\n        balance += amt;\n    }\n    boolean withdraw(double amt) {\n        if (amt <= balance) {\n            balance -= amt;\n            return true;\n        }\n        return false;\n    }\n}\n\n",
                        accum: "class Account {\n    double balance;\n    Account(double init) {\n        balance = init;\n    }\n    void deposit(double amt) {\n        balance += amt;\n    }\n    boolean withdraw(double amt) {\n        if (amt <= balance) {\n            balance -= amt;\n            return true;\n        }\n        return false;\n    }\n}\n\n",
                        title: "Define Account Class with Validation",
                        instruction: "Declare Account class with balance, deposit(amt), and boolean withdraw(amt).",
                        explanation: "Encapsulates account balance and transaction rules in an OOP class.",
                        why: "Object-oriented banking model.",
                        hint: "Type Account class with deposit and withdraw.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Account Class",
                    },
                    {
                        token: "public class Main {\n    public static void main(String[] args) {\n        Account acc = new Account(1000.0);\n        acc.deposit(500.0);\n        boolean ok = acc.withdraw(200.0);\n        System.out.println(\"Withdrawal status: \" + ok + \" | Balance: $\" + acc.balance);\n    }\n}",
                        insert: "public class Main {\n    public static void main(String[] args) {\n        Account acc = new Account(1000.0);\n        acc.deposit(500.0);\n        boolean ok = acc.withdraw(200.0);\n        System.out.println(\"Withdrawal status: \" + ok + \" | Balance: $\" + acc.balance);\n    }\n}\n",
                        accum: "class Account {\n    double balance;\n    Account(double init) {\n        balance = init;\n    }\n    void deposit(double amt) {\n        balance += amt;\n    }\n    boolean withdraw(double amt) {\n        if (amt <= balance) {\n            balance -= amt;\n            return true;\n        }\n        return false;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Account acc = new Account(1000.0);\n        acc.deposit(500.0);\n        boolean ok = acc.withdraw(200.0);\n        System.out.println(\"Withdrawal status: \" + ok + \" | Balance: $\" + acc.balance);\n    }\n}\n",
                        title: "Execute Transactions in Main",
                        instruction: "Instantiate Account, call deposit and withdraw, and print result.",
                        explanation: "Demonstrates object transaction calls.",
                        why: "Executes ATM transactions.",
                        hint: "Type main() creating Account instance.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            // Beginner: Step-by-step
            const seq = [
                {
                    token: "public class Main {\n    public static void main(String[] args) {",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        ",
                    title: "Setup Java Main Class",
                    instruction: "Type 'public class Main { public static void main(String[] args) {'.",
                    explanation: "public means accessible everywhere. class defines Main. static allows execution without object creation. void means no return value. main is entry point.",
                    why: "JVM entry requirement.",
                    hint: "Type class Main with main method.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Class Setup",
                },
                {
                    token: "double balance = 1000.0;\n        double deposit = 500.0;\n        double withdraw = 200.0;",
                    insert: "double balance = 1000.0;\n        double deposit = 500.0;\n        double withdraw = 200.0;\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        double balance = 1000.0;\n        double deposit = 500.0;\n        double withdraw = 200.0;\n        ",
                    title: "Declare ATM Balance Variables",
                    instruction: "Declare double variables for balance, deposit, and withdraw amounts.",
                    explanation: "double represents floating point money values. balance stores initial amount.",
                    why: "Maintains financial transaction state in memory.",
                    hint: "Type double balance = 1000.0; double deposit = 500.0; double withdraw = 200.0;",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Variables",
                },
                {
                    token: "System.out.println(\"=== ATM Banking Machine ===\");\n        balance += deposit;\n        if (withdraw <= balance) {\n            balance -= withdraw;\n        }\n        System.out.println(\"Final Balance: $\" + balance);\n    }\n}",
                    insert: "System.out.println(\"=== ATM Banking Machine ===\");\n        balance += deposit;\n        if (withdraw <= balance) {\n            balance -= withdraw;\n        }\n        System.out.println(\"Final Balance: $\" + balance);\n    }\n}\n",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        double balance = 1000.0;\n        double deposit = 500.0;\n        double withdraw = 200.0;\n        System.out.println(\"=== ATM Banking Machine ===\");\n        balance += deposit;\n        if (withdraw <= balance) {\n            balance -= withdraw;\n        }\n        System.out.println(\"Final Balance: $\" + balance);\n    }\n}\n",
                    title: "Execute Deposit, Withdrawal & Print Balance",
                    instruction: "Add deposit to balance, verify withdrawal with if (withdraw <= balance), deduct amount, and print final balance.",
                    explanation: "Validates sufficient funds before deducting withdrawal amount.",
                    why: "Completes ATM operations and prints final balance.",
                    hint: "Type balance += deposit and if validation.",
                    category: "statement" as const,
                    step: 3,
                    stepTitle: "Transaction Logic",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 2. Calculator Program
        if (task === "calculator") {
            if (isAdv) {
                const seq = [
                    {
                        token: "interface Operation {\n    double execute(double a, double b);\n}\n\nclass CalculatorEngine {\n    public double calculate(double a, double b, Operation op) {\n        return op.execute(a, b);\n    }\n}",
                        insert: "interface Operation {\n    double execute(double a, double b);\n}\n\nclass CalculatorEngine {\n    public double calculate(double a, double b, Operation op) {\n        return op.execute(a, b);\n    }\n}\n\n",
                        accum: "interface Operation {\n    double execute(double a, double b);\n}\n\nclass CalculatorEngine {\n    public double calculate(double a, double b, Operation op) {\n        return op.execute(a, b);\n    }\n}\n\n",
                        title: "Define Functional Strategy Interface & Engine",
                        instruction: "Declare Operation interface and CalculatorEngine class leveraging lambda execution.",
                        explanation: "Demonstrates the Strategy design pattern for extensible mathematical operations.",
                        why: "Enterprise extensible calculation engine.",
                        hint: "Type interface Operation and class CalculatorEngine.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Strategy Engine",
                    },
                    {
                        token: "public class Main {\n    public static void main(String[] args) {\n        CalculatorEngine engine = new CalculatorEngine();\n        double a = 20.0, b = 5.0;\n        System.out.println(\"=== Advanced Lambda Calculator ===\");\n        System.out.println(\"Add: \" + engine.calculate(a, b, (x, y) -> x + y));\n        System.out.println(\"Multiply: \" + engine.calculate(a, b, (x, y) -> x * y));\n        System.out.println(\"Divide: \" + engine.calculate(a, b, (x, y) -> y != 0 ? x / y : 0));\n    }\n}",
                        insert: "public class Main {\n    public static void main(String[] args) {\n        CalculatorEngine engine = new CalculatorEngine();\n        double a = 20.0, b = 5.0;\n        System.out.println(\"=== Advanced Lambda Calculator ===\");\n        System.out.println(\"Add: \" + engine.calculate(a, b, (x, y) -> x + y));\n        System.out.println(\"Multiply: \" + engine.calculate(a, b, (x, y) -> x * y));\n        System.out.println(\"Divide: \" + engine.calculate(a, b, (x, y) -> y != 0 ? x / y : 0));\n    }\n}\n",
                        accum: "interface Operation {\n    double execute(double a, double b);\n}\n\nclass CalculatorEngine {\n    public double calculate(double a, double b, Operation op) {\n        return op.execute(a, b);\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        CalculatorEngine engine = new CalculatorEngine();\n        double a = 20.0, b = 5.0;\n        System.out.println(\"=== Advanced Lambda Calculator ===\");\n        System.out.println(\"Add: \" + engine.calculate(a, b, (x, y) -> x + y));\n        System.out.println(\"Multiply: \" + engine.calculate(a, b, (x, y) -> x * y));\n        System.out.println(\"Divide: \" + engine.calculate(a, b, (x, y) -> y != 0 ? x / y : 0));\n    }\n}\n",
                        title: "Execute Calculation Strategies in Main",
                        instruction: "Pass lambda expressions for addition, multiplication, and division.",
                        explanation: "Demonstrates Java 8+ lambda closures.",
                        why: "Executes calculations.",
                        hint: "Type main() invoking engine.calculate.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            if (isInt) {
                const seq = [
                    {
                        token: "class Calculator {\n    static double add(double a, double b) { return a + b; }\n    static double subtract(double a, double b) { return a - b; }\n    static double multiply(double a, double b) { return a * b; }\n    static double divide(double a, double b) { return b != 0 ? a / b : 0; }\n}",
                        insert: "class Calculator {\n    static double add(double a, double b) {\n        return a + b;\n    }\n    static double subtract(double a, double b) {\n        return a - b;\n    }\n    static double multiply(double a, double b) {\n        return a * b;\n    }\n    static double divide(double a, double b) {\n        return b != 0 ? a / b : 0;\n    }\n}\n\n",
                        accum: "class Calculator {\n    static double add(double a, double b) {\n        return a + b;\n    }\n    static double subtract(double a, double b) {\n        return a - b;\n    }\n    static double multiply(double a, double b) {\n        return a * b;\n    }\n    static double divide(double a, double b) {\n        return b != 0 ? a / b : 0;\n    }\n}\n\n",
                        title: "Define Calculator Helper Class",
                        instruction: "Define Calculator class with static arithmetic helper methods.",
                        explanation: "Organizes arithmetic functions cleanly in a static utility class.",
                        why: "Modular calculator architecture.",
                        hint: "Type class Calculator with add, subtract, multiply, and divide methods.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Calculator Class",
                    },
                    {
                        token: "public class Main {\n    public static void main(String[] args) {\n        double x = 12.5, y = 2.5;\n        System.out.println(\"=== Modular Java Calculator ===\");\n        System.out.println(\"Addition: \" + Calculator.add(x, y));\n        System.out.println(\"Subtraction: \" + Calculator.subtract(x, y));\n        System.out.println(\"Multiplication: \" + Calculator.multiply(x, y));\n        System.out.println(\"Division: \" + Calculator.divide(x, y));\n    }\n}",
                        insert: "public class Main {\n    public static void main(String[] args) {\n        double x = 12.5, y = 2.5;\n        System.out.println(\"=== Modular Java Calculator ===\");\n        System.out.println(\"Addition: \" + Calculator.add(x, y));\n        System.out.println(\"Subtraction: \" + Calculator.subtract(x, y));\n        System.out.println(\"Multiplication: \" + Calculator.multiply(x, y));\n        System.out.println(\"Division: \" + Calculator.divide(x, y));\n    }\n}\n",
                        accum: "class Calculator {\n    static double add(double a, double b) {\n        return a + b;\n    }\n    static double subtract(double a, double b) {\n        return a - b;\n    }\n    static double multiply(double a, double b) {\n        return a * b;\n    }\n    static double divide(double a, double b) {\n        return b != 0 ? a / b : 0;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        double x = 12.5, y = 2.5;\n        System.out.println(\"=== Modular Java Calculator ===\");\n        System.out.println(\"Addition: \" + Calculator.add(x, y));\n        System.out.println(\"Subtraction: \" + Calculator.subtract(x, y));\n        System.out.println(\"Multiplication: \" + Calculator.multiply(x, y));\n        System.out.println(\"Division: \" + Calculator.divide(x, y));\n    }\n}\n",
                        title: "Test Calculator Methods in Main",
                        instruction: "Invoke calculator methods and display all arithmetic results.",
                        explanation: "Demonstrates static method calls.",
                        why: "Executes calculator logic.",
                        hint: "Type main() calling Calculator methods.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            // Beginner: Step-by-step
            const seq = [
                {
                    token: "public class Main {\n    public static void main(String[] args) {",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        ",
                    title: "Setup Main Class",
                    instruction: "Type 'public class Main { public static void main(String[] args) {'.",
                    explanation: "Java application entry point.",
                    why: "Entry point.",
                    hint: "Type public class Main { public static void main(String[] args) {",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Class Setup",
                },
                {
                    token: "int a = 20, b = 4;\n        int sum = a + b;\n        int diff = a - b;\n        int prod = a * b;\n        int quot = a / b;",
                    insert: "int a = 20, b = 4;\n        int sum = a + b;\n        int diff = a - b;\n        int prod = a * b;\n        int quot = a / b;\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        int a = 20, b = 4;\n        int sum = a + b;\n        int diff = a - b;\n        int prod = a * b;\n        int quot = a / b;\n        ",
                    title: "Declare Arithmetic Operands & Results",
                    instruction: "Declare operands a and b and compute sum, diff, prod, and quot.",
                    explanation: "Performs basic arithmetic operations (+, -, *, /).",
                    why: "Performs calculator calculations.",
                    hint: "Type int a = 20, b = 4; and compute arithmetic variables.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Arithmetic Operations",
                },
                {
                    token: "System.out.println(\"=== Basic Calculator ===\");\n        System.out.println(\"Sum: \" + sum + \" | Diff: \" + diff + \" | Prod: \" + prod + \" | Quot: \" + quot);\n    }\n}",
                    insert: "System.out.println(\"=== Basic Calculator ===\");\n        System.out.println(\"Sum: \" + sum + \" | Diff: \" + diff + \" | Prod: \" + prod + \" | Quot: \" + quot);\n    }\n}\n",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        int a = 20, b = 4;\n        int sum = a + b;\n        int diff = a - b;\n        int prod = a * b;\n        int quot = a / b;\n        System.out.println(\"=== Basic Calculator ===\");\n        System.out.println(\"Sum: \" + sum + \" | Diff: \" + diff + \" | Prod: \" + prod + \" | Quot: \" + quot);\n    }\n}\n",
                    title: "Print Calculator Results",
                    instruction: "Print computed arithmetic values using System.out.println.",
                    explanation: "Displays calculated results to the console.",
                    why: "Completes program output.",
                    hint: "Type System.out.println statements.",
                    category: "statement" as const,
                    step: 3,
                    stepTitle: "Output",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 3. Inheritance Program
        if (task === "inheritance") {
            const seq = [
                {
                    token: "class Animal {\n    String name;\n    Animal(String n) { name = n; }\n    void speak() { System.out.println(name + \" makes a sound.\"); }\n}\n\nclass Dog extends Animal {\n    String breed;\n    Dog(String n, String b) { super(n); breed = b; }\n    void bark() { System.out.println(name + \" the \" + breed + \" barks loudly!\"); }\n}",
                    insert: "class Animal {\n    String name;\n    Animal(String n) {\n        name = n;\n    }\n    void speak() {\n        System.out.println(name + \" makes a sound.\");\n    }\n}\n\nclass Dog extends Animal {\n    String breed;\n    Dog(String n, String b) {\n        super(n);\n        breed = b;\n    }\n    void bark() {\n        System.out.println(name + \" the \" + breed + \" barks loudly!\");\n    }\n}\n\n",
                    accum: "class Animal {\n    String name;\n    Animal(String n) {\n        name = n;\n    }\n    void speak() {\n        System.out.println(name + \" makes a sound.\");\n    }\n}\n\nclass Dog extends Animal {\n    String breed;\n    Dog(String n, String b) {\n        super(n);\n        breed = b;\n    }\n    void bark() {\n        System.out.println(name + \" the \" + breed + \" barks loudly!\");\n    }\n}\n\n",
                    title: "Define Animal Parent & Dog Child with extends",
                    instruction: "Declare Animal base class and Dog subclass using 'extends' and 'super()'.",
                    explanation: "extends inherits parent properties. super() passes parameters to base constructor.",
                    why: "Core OOP inheritance structure.",
                    hint: "Type class Animal and class Dog extends Animal.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Inheritance Hierarchy",
                },
                {
                    token: "public class Main {\n    public static void main(String[] args) {\n        Dog myDog = new Dog(\"Buddy\", \"Golden Retriever\");\n        System.out.println(\"=== Java Inheritance ===\");\n        myDog.speak();\n        myDog.bark();\n    }\n}",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        Dog myDog = new Dog(\"Buddy\", \"Golden Retriever\");\n        System.out.println(\"=== Java Inheritance ===\");\n        myDog.speak();\n        myDog.bark();\n    }\n}\n",
                    accum: "class Animal {\n    String name;\n    Animal(String n) {\n        name = n;\n    }\n    void speak() {\n        System.out.println(name + \" makes a sound.\");\n    }\n}\n\nclass Dog extends Animal {\n    String breed;\n    Dog(String n, String b) {\n        super(n);\n        breed = b;\n    }\n    void bark() {\n        System.out.println(name + \" the \" + breed + \" barks loudly!\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Dog myDog = new Dog(\"Buddy\", \"Golden Retriever\");\n        System.out.println(\"=== Java Inheritance ===\");\n        myDog.speak();\n        myDog.bark();\n    }\n}\n",
                    title: "Instantiate Subclass & Call Inherited Methods in Main",
                    instruction: "Instantiate Dog in main, invoke inherited speak() and specialized bark().",
                    explanation: "Demonstrates reuse of inherited base class members.",
                    why: "Executes inheritance demonstration.",
                    hint: "Type main() creating Dog and calling methods.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 4. Polymorphism / Override Program
        if (task === "override") {
            const seq = [
                {
                    token: "abstract class Shape {\n    abstract double getArea();\n}\n\nclass Circle extends Shape {\n    double radius;\n    Circle(double r) { radius = r; }\n    @Override\n    double getArea() { return Math.PI * radius * radius; }\n}",
                    insert: "abstract class Shape {\n    abstract double getArea();\n}\n\nclass Circle extends Shape {\n    double radius;\n    Circle(double r) {\n        radius = r;\n    }\n    @Override\n    double getArea() {\n        return Math.PI * radius * radius;\n    }\n}\n\n",
                    accum: "abstract class Shape {\n    abstract double getArea();\n}\n\nclass Circle extends Shape {\n    double radius;\n    Circle(double r) {\n        radius = r;\n    }\n    @Override\n    double getArea() {\n        return Math.PI * radius * radius;\n    }\n}\n\n",
                    title: "Define Abstract Shape & Override getArea() in Circle",
                    instruction: "Declare abstract Shape base class and Circle implementing getArea() with @Override.",
                    explanation: "Demonstrates runtime dynamic dispatch and method overriding in Java.",
                    why: "Polymorphism architectural contract.",
                    hint: "Type abstract class Shape and class Circle with @Override.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Polymorphic Contract",
                },
                {
                    token: "public class Main {\n    public static void main(String[] args) {\n        Shape s = new Circle(5.0);\n        System.out.println(\"=== Java Polymorphism ===\");\n        System.out.printf(\"Circle Area: %.2f%n\", s.getArea());\n    }\n}",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        Shape s = new Circle(5.0);\n        System.out.println(\"=== Java Polymorphism ===\");\n        System.out.printf(\"Circle Area: %.2f%n\", s.getArea());\n    }\n}\n",
                    accum: "abstract class Shape {\n    abstract double getArea();\n}\n\nclass Circle extends Shape {\n    double radius;\n    Circle(double r) {\n        radius = r;\n    }\n    @Override\n    double getArea() {\n        return Math.PI * radius * radius;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Shape s = new Circle(5.0);\n        System.out.println(\"=== Java Polymorphism ===\");\n        System.out.printf(\"Circle Area: %.2f%n\", s.getArea());\n    }\n}\n",
                    title: "Demonstrate Dynamic Method Dispatch in Main",
                    instruction: "Assign Circle instance to Shape reference variable and invoke getArea().",
                    explanation: "Calls the subclass method dynamically at runtime through parent reference.",
                    why: "Executes polymorphic dispatch.",
                    hint: "Type main() assigning Shape s = new Circle(5.0);",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 5. Exception Handling
        if (task === "exception_handling") {
            const seq = [
                {
                    token: "public class Main {\n    public static int divide(int a, int b) throws ArithmeticException {\n        if (b == 0) throw new ArithmeticException(\"Cannot divide by zero!\");\n        return a / b;\n    }",
                    insert: "public class Main {\n    public static int divide(int a, int b) throws ArithmeticException {\n        if (b == 0) {\n            throw new ArithmeticException(\"Cannot divide by zero!\");\n        }\n        return a / b;\n    }\n\n",
                    accum: "public class Main {\n    public static int divide(int a, int b) throws ArithmeticException {\n        if (b == 0) {\n            throw new ArithmeticException(\"Cannot divide by zero!\");\n        }\n        return a / b;\n    }\n\n",
                    title: "Define divide Method with Exception Guard",
                    instruction: "Declare divide method that explicitly checks divisor and throws ArithmeticException.",
                    explanation: "Validates inputs before calculation to prevent unhandled runtime crashes.",
                    why: "Defensive exception throwing.",
                    hint: "Type divide method with throws ArithmeticException.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Exception Guard",
                },
                {
                    token: "    public static void main(String[] args) {\n        System.out.println(\"=== Java Exception Handling ===\");\n        try {\n            int res = divide(10, 0);\n            System.out.println(\"Result: \" + res);\n        } catch (ArithmeticException e) {\n            System.out.println(\"Caught Error: \" + e.getMessage());\n        } finally {\n            System.out.println(\"Cleanup completed in finally block.\");\n        }\n    }\n}",
                    insert: "    public static void main(String[] args) {\n        System.out.println(\"=== Java Exception Handling ===\");\n        try {\n            int res = divide(10, 0);\n            System.out.println(\"Result: \" + res);\n        } catch (ArithmeticException e) {\n            System.out.println(\"Caught Error: \" + e.getMessage());\n        } finally {\n            System.out.println(\"Cleanup completed in finally block.\");\n        }\n    }\n}\n",
                    accum: "public class Main {\n    public static int divide(int a, int b) throws ArithmeticException {\n        if (b == 0) {\n            throw new ArithmeticException(\"Cannot divide by zero!\");\n        }\n        return a / b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Java Exception Handling ===\");\n        try {\n            int res = divide(10, 0);\n            System.out.println(\"Result: \" + res);\n        } catch (ArithmeticException e) {\n            System.out.println(\"Caught Error: \" + e.getMessage());\n        } finally {\n            System.out.println(\"Cleanup completed in finally block.\");\n        }\n    }\n}\n",
                    title: "Wrap Execution in Try-Catch-Finally Blocks",
                    instruction: "Call divide(10, 0) inside try block, handle ArithmeticException in catch, and clean up in finally.",
                    explanation: "Demonstrates complete try-catch-finally error recovery lifecycle.",
                    why: "Safe error handling.",
                    hint: "Type try, catch, and finally blocks in main.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Recovery & Finally",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 6. Linked List
        if (task === "linked_list") {
            const seq = [
                {
                    token: "class Node {\n    int data;\n    Node next;\n    Node(int d) {\n        data = d;\n        next = null;\n    }\n}",
                    insert: "class Node {\n    int data;\n    Node next;\n    Node(int d) {\n        data = d;\n        next = null;\n    }\n}\n\n",
                    accum: "class Node {\n    int data;\n    Node next;\n    Node(int d) {\n        data = d;\n        next = null;\n    }\n}\n\n",
                    title: "Define Node Data Structure",
                    instruction: "Declare Node class with int data and Node next pointer reference.",
                    explanation: "Blueprint for chaining dynamic elements in linear sequence without contiguous memory.",
                    why: "Foundational linked list data structure.",
                    hint: "Type class Node with int data and Node next.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Node Class",
                },
                {
                    token: "public class Main {\n    public static void main(String[] args) {\n        Node head = new Node(10);\n        head.next = new Node(20);\n        head.next.next = new Node(30);\n        System.out.println(\"=== Singly Linked List ===\");\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.data + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        Node head = new Node(10);\n        head.next = new Node(20);\n        head.next.next = new Node(30);\n        System.out.println(\"=== Singly Linked List ===\");\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.data + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}\n",
                    accum: "class Node {\n    int data;\n    Node next;\n    Node(int d) {\n        data = d;\n        next = null;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Node head = new Node(10);\n        head.next = new Node(20);\n        head.next.next = new Node(30);\n        System.out.println(\"=== Singly Linked List ===\");\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.data + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}\n",
                    title: "Link Nodes & Traverse with While Loop in Main",
                    instruction: "Chain head, head.next, and head.next.next, then traverse until null.",
                    explanation: "Iterates through pointer links from head to tail.",
                    why: "Completes linked list traversal.",
                    hint: "Type main() linking nodes and traversing with while loop.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Traversal",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 7. Sorting Program
        if (task === "sort") {
            const seq = [
                {
                    token: "public class Main {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n    }",
                    insert: "public class Main {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n    }\n\n",
                    accum: "public class Main {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n    }\n\n",
                    title: "Implement Bubble Sort Algorithm",
                    instruction: "Define bubbleSort method using adjacent element comparisons and swaps.",
                    explanation: "Bubbles the maximum element to the right in each pass.",
                    why: "Core comparison-based sorting algorithm.",
                    hint: "Type bubbleSort with nested for loops.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Sort Algorithm",
                },
                {
                    token: "    public static void main(String[] args) {\n        int[] numbers = {64, 34, 25, 12, 22, 11, 90};\n        System.out.println(\"=== Bubble Sort Program ===\");\n        bubbleSort(numbers);\n        System.out.print(\"Sorted Array: \");\n        for (int num : numbers) System.out.print(num + \" \");\n        System.out.println();\n    }\n}",
                    insert: "    public static void main(String[] args) {\n        int[] numbers = {64, 34, 25, 12, 22, 11, 90};\n        System.out.println(\"=== Bubble Sort Program ===\");\n        bubbleSort(numbers);\n        System.out.print(\"Sorted Array: \");\n        for (int num : numbers) {\n            System.out.print(num + \" \");\n        }\n        System.out.println();\n    }\n}\n",
                    accum: "public class Main {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n    }\n\n    public static void main(String[] args) {\n        int[] numbers = {64, 34, 25, 12, 22, 11, 90};\n        System.out.println(\"=== Bubble Sort Program ===\");\n        bubbleSort(numbers);\n        System.out.print(\"Sorted Array: \");\n        for (int num : numbers) {\n            System.out.print(num + \" \");\n        }\n        System.out.println();\n    }\n}\n",
                    title: "Sort Array & Display Output in Main",
                    instruction: "Initialize test array, call bubbleSort, and print sorted elements.",
                    explanation: "Executes sort and outputs ordered numbers.",
                    why: "Completes sorting demonstration.",
                    hint: "Type main() invoking bubbleSort.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 8. Array Program (Default array check)
        if (task === "array") {
            if (isAdv) {
                const seq = [
                    {
                        token: "import java.util.*;\n\npublic class Main {\n    public static void processArray(int[] arr) {\n        IntSummaryStatistics stats = Arrays.stream(arr).summaryStatistics();\n        System.out.println(\"=== Advanced Array Stream Analytics ===\");\n        System.out.println(\"Count: \" + stats.getCount() + \" | Sum: \" + stats.getSum());\n        System.out.println(\"Min: \" + stats.getMin() + \" | Max: \" + stats.getMax() + \" | Avg: \" + stats.getAverage());\n    }\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23, 77, 4};\n        processArray(numbers);\n    }\n}",
                        insert: "import java.util.*;\n\npublic class Main {\n    public static void processArray(int[] arr) {\n        IntSummaryStatistics stats = Arrays.stream(arr).summaryStatistics();\n        System.out.println(\"=== Advanced Array Stream Analytics ===\");\n        System.out.println(\"Count: \" + stats.getCount() + \" | Sum: \" + stats.getSum());\n        System.out.println(\"Min: \" + stats.getMin() + \" | Max: \" + stats.getMax() + \" | Avg: \" + stats.getAverage());\n    }\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23, 77, 4};\n        processArray(numbers);\n    }\n}\n",
                        accum: "import java.util.*;\n\npublic class Main {\n    public static void processArray(int[] arr) {\n        IntSummaryStatistics stats = Arrays.stream(arr).summaryStatistics();\n        System.out.println(\"=== Advanced Array Stream Analytics ===\");\n        System.out.println(\"Count: \" + stats.getCount() + \" | Sum: \" + stats.getSum());\n        System.out.println(\"Min: \" + stats.getMin() + \" | Max: \" + stats.getMax() + \" | Avg: \" + stats.getAverage());\n    }\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23, 77, 4};\n        processArray(numbers);\n    }\n}\n",
                        title: "Advanced Array Processing with Stream Analytics",
                        instruction: "Use Java Stream API and IntSummaryStatistics for array metrics in O(N).",
                        explanation: "Demonstrates Java 8+ Stream analytics pipeline.",
                        why: "High-performance functional array processing.",
                        hint: "Type processArray using Arrays.stream.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Stream Pipeline",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            if (isInt) {
                const seq = [
                    {
                        token: "public class Main {\n    public static int findMax(int[] arr) {\n        int max = arr[0];\n        for (int val : arr) if (val > max) max = val;\n        return max;\n    }\n    public static int calculateSum(int[] arr) {\n        int sum = 0;\n        for (int val : arr) sum += val;\n        return sum;\n    }",
                        insert: "public class Main {\n    public static int findMax(int[] arr) {\n        int max = arr[0];\n        for (int val : arr) {\n            if (val > max) max = val;\n        }\n        return max;\n    }\n\n    public static int calculateSum(int[] arr) {\n        int sum = 0;\n        for (int val : arr) {\n            sum += val;\n        }\n        return sum;\n    }\n\n",
                        accum: "public class Main {\n    public static int findMax(int[] arr) {\n        int max = arr[0];\n        for (int val : arr) {\n            if (val > max) max = val;\n        }\n        return max;\n    }\n\n    public static int calculateSum(int[] arr) {\n        int sum = 0;\n        for (int val : arr) {\n            sum += val;\n        }\n        return sum;\n    }\n\n",
                        title: "Define Modular Array Helper Methods",
                        instruction: "Define findMax and calculateSum static helper methods.",
                        explanation: "Separates algorithm computation into reusable helper functions.",
                        why: "Modular structure.",
                        hint: "Type findMax and calculateSum methods.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Helper Methods",
                    },
                    {
                        token: "    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23};\n        System.out.println(\"Max: \" + findMax(numbers) + \" | Sum: \" + calculateSum(numbers));\n    }\n}",
                        insert: "    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23};\n        System.out.println(\"Max: \" + findMax(numbers) + \" | Sum: \" + calculateSum(numbers));\n    }\n}\n",
                        accum: "public class Main {\n    public static int findMax(int[] arr) {\n        int max = arr[0];\n        for (int val : arr) {\n            if (val > max) max = val;\n        }\n        return max;\n    }\n\n    public static int calculateSum(int[] arr) {\n        int sum = 0;\n        for (int val : arr) {\n            sum += val;\n        }\n        return sum;\n    }\n\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23};\n        System.out.println(\"Max: \" + findMax(numbers) + \" | Sum: \" + calculateSum(numbers));\n    }\n}\n",
                        title: "Test Array Methods in Main",
                        instruction: "Initialize array and invoke methods in main.",
                        explanation: "Passes array to functions and prints calculated metrics.",
                        why: "Executes test run.",
                        hint: "Type main() calling array methods.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            const seq = [
                {
                    token: "public class Main {\n    public static void main(String[] args) {",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        ",
                    title: "Setup Java Main Class",
                    instruction: "Type 'public class Main { public static void main(String[] args) {'.",
                    explanation: "Java application entry point.",
                    why: "Entry requirement.",
                    hint: "Type class Main with main method.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Class Setup",
                },
                {
                    token: "int[] numbers = {15, 42, 8, 91, 23};\n        int sum = 0;\n        int max = numbers[0];",
                    insert: "int[] numbers = {15, 42, 8, 91, 23};\n        int sum = 0;\n        int max = numbers[0];\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23};\n        int sum = 0;\n        int max = numbers[0];\n        ",
                    title: "Declare Array & Trackers",
                    instruction: "Declare numbers array, sum, and max variable.",
                    explanation: "int[] stores a contiguous sequence of integers. sum accumulates values. max tracks largest item.",
                    why: "Holds array data.",
                    hint: "Type int[] numbers = {15, 42, 8, 91, 23};",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Data Initialization",
                },
                {
                    token: "for (int i = 0; i < numbers.length; i++) {\n            sum += numbers[i];\n            if (numbers[i] > max) max = numbers[i];\n        }",
                    insert: "for (int i = 0; i < numbers.length; i++) {\n            sum += numbers[i];\n            if (numbers[i] > max) {\n                max = numbers[i];\n            }\n        }\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23};\n        int sum = 0;\n        int max = numbers[0];\n        for (int i = 0; i < numbers.length; i++) {\n            sum += numbers[i];\n            if (numbers[i] > max) {\n                max = numbers[i];\n            }\n        }\n        ",
                    title: "Traverse Array with For Loop",
                    instruction: "Loop through array, compute sum, and find max element.",
                    explanation: "for loop iterates index i from 0 to numbers.length - 1.",
                    why: "Core array iteration.",
                    hint: "Type for loop over numbers.length.",
                    category: "statement" as const,
                    step: 3,
                    stepTitle: "Traversal",
                },
                {
                    token: "System.out.println(\"Sum: \" + sum + \" | Max: \" + max);\n    }\n}",
                    insert: "System.out.println(\"Sum: \" + sum + \" | Max: \" + max);\n    }\n}\n",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {15, 42, 8, 91, 23};\n        int sum = 0;\n        int max = numbers[0];\n        for (int i = 0; i < numbers.length; i++) {\n            sum += numbers[i];\n            if (numbers[i] > max) {\n                max = numbers[i];\n            }\n        }\n        System.out.println(\"Sum: \" + sum + \" | Max: \" + max);\n    }\n}\n",
                    title: "Print Array Metrics",
                    instruction: "Print sum and max to standard output.",
                    explanation: "System.out.println displays text in the console.",
                    why: "Completes program output.",
                    hint: "Type System.out.println.",
                    category: "statement" as const,
                    step: 4,
                    stepTitle: "Output",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 9. Student Management
        if (task === "student_management") {
            if (isAdv) {
                const seq = [
                    {
                        token: "import java.util.*;\n\nclass StudentRecord {\n    final String name;\n    final int rollNo;\n    final double gpa;\n    StudentRecord(String n, int r, double g) {\n        name = n; rollNo = r; gpa = g;\n    }\n}",
                        insert: "import java.util.*;\n\nclass StudentRecord {\n    final String name;\n    final int rollNo;\n    final double gpa;\n    StudentRecord(String n, int r, double g) {\n        name = n;\n        rollNo = r;\n        gpa = g;\n    }\n}\n\n",
                        accum: "import java.util.*;\n\nclass StudentRecord {\n    final String name;\n    final int rollNo;\n    final double gpa;\n    StudentRecord(String n, int r, double g) {\n        name = n;\n        rollNo = r;\n        gpa = g;\n    }\n}\n\n",
                        title: "Define StudentRecord Domain Model",
                        instruction: "Define immutable StudentRecord class with fields name, rollNo, and gpa.",
                        explanation: "Encapsulates student entity state.",
                        why: "Domain model definition.",
                        hint: "Type StudentRecord class.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Domain Model",
                    },
                    {
                        token: "public class Main {\n    public static void main(String[] args) {\n        List<StudentRecord> roster = Arrays.asList(\n            new StudentRecord(\"Alice\", 101, 3.9),\n            new StudentRecord(\"Bob\", 102, 3.4),\n            new StudentRecord(\"Charlie\", 103, 3.8)\n        );\n        System.out.println(\"=== Student Management System ===\");\n        double avgGpa = roster.stream().mapToDouble(s -> s.gpa).average().orElse(0.0);\n        roster.forEach(s -> System.out.println(\"Roll: \" + s.rollNo + \" | \" + s.name + \" | GPA: \" + s.gpa));\n        System.out.printf(\"Class Average GPA: %.2f%n\", avgGpa);\n    }\n}",
                        insert: "public class Main {\n    public static void main(String[] args) {\n        List<StudentRecord> roster = Arrays.asList(\n            new StudentRecord(\"Alice\", 101, 3.9),\n            new StudentRecord(\"Bob\", 102, 3.4),\n            new StudentRecord(\"Charlie\", 103, 3.8)\n        );\n        System.out.println(\"=== Student Management System ===\");\n        double avgGpa = roster.stream().mapToDouble(s -> s.gpa).average().orElse(0.0);\n        roster.forEach(s -> System.out.println(\"Roll: \" + s.rollNo + \" | \" + s.name + \" | GPA: \" + s.gpa));\n        System.out.printf(\"Class Average GPA: %.2f%n\", avgGpa);\n    }\n}\n",
                        accum: "import java.util.*;\n\nclass StudentRecord {\n    final String name;\n    final int rollNo;\n    final double gpa;\n    StudentRecord(String n, int r, double g) {\n        name = n;\n        rollNo = r;\n        gpa = g;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        List<StudentRecord> roster = Arrays.asList(\n            new StudentRecord(\"Alice\", 101, 3.9),\n            new StudentRecord(\"Bob\", 102, 3.4),\n            new StudentRecord(\"Charlie\", 103, 3.8)\n        );\n        System.out.println(\"=== Student Management System ===\");\n        double avgGpa = roster.stream().mapToDouble(s -> s.gpa).average().orElse(0.0);\n        roster.forEach(s -> System.out.println(\"Roll: \" + s.rollNo + \" | \" + s.name + \" | GPA: \" + s.gpa));\n        System.out.printf(\"Class Average GPA: %.2f%n\", avgGpa);\n    }\n}\n",
                        title: "Manage Student Roster via Streams",
                        instruction: "Use Java Streams to calculate average GPA and print roster.",
                        explanation: "Demonstrates modern Java Collections and Stream API.",
                        why: "Enterprise roster management.",
                        hint: "Type main() with Streams.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Roster Management",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            if (isInt) {
                const seq = [
                    {
                        token: "class Student {\n    String name;\n    int rollNo;\n    int marks;\n    Student(String n, int r, int m) {\n        name = n; rollNo = r; marks = m;\n    }\n    char getGrade() {\n        return marks >= 90 ? 'A' : marks >= 75 ? 'B' : 'C';\n    }\n}",
                        insert: "class Student {\n    String name;\n    int rollNo;\n    int marks;\n    Student(String n, int r, int m) {\n        name = n;\n        rollNo = r;\n        marks = m;\n    }\n    char getGrade() {\n        return marks >= 90 ? 'A' : marks >= 75 ? 'B' : 'C';\n    }\n}\n\n",
                        accum: "class Student {\n    String name;\n    int rollNo;\n    int marks;\n    Student(String n, int r, int m) {\n        name = n;\n        rollNo = r;\n        marks = m;\n    }\n    char getGrade() {\n        return marks >= 90 ? 'A' : marks >= 75 ? 'B' : 'C';\n    }\n}\n\n",
                        title: "Define Student Class with getGrade()",
                        instruction: "Declare Student class with constructor and grade evaluation method.",
                        explanation: "Encapsulates student attributes and grade logic.",
                        why: "Modular OOP representation.",
                        hint: "Type Student class.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Student Class",
                    },
                    {
                        token: "public class Main {\n    public static void main(String[] args) {\n        Student s1 = new Student(\"Alice\", 101, 92);\n        Student s2 = new Student(\"Bob\", 102, 78);\n        System.out.println(\"Student: \" + s1.name + \" | Grade: \" + s1.getGrade());\n        System.out.println(\"Student: \" + s2.name + \" | Grade: \" + s2.getGrade());\n    }\n}",
                        insert: "public class Main {\n    public static void main(String[] args) {\n        Student s1 = new Student(\"Alice\", 101, 92);\n        Student s2 = new Student(\"Bob\", 102, 78);\n        System.out.println(\"Student: \" + s1.name + \" | Grade: \" + s1.getGrade());\n        System.out.println(\"Student: \" + s2.name + \" | Grade: \" + s2.getGrade());\n    }\n}\n",
                        accum: "class Student {\n    String name;\n    int rollNo;\n    int marks;\n    Student(String n, int r, int m) {\n        name = n;\n        rollNo = r;\n        marks = m;\n    }\n    char getGrade() {\n        return marks >= 90 ? 'A' : marks >= 75 ? 'B' : 'C';\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Student s1 = new Student(\"Alice\", 101, 92);\n        Student s2 = new Student(\"Bob\", 102, 78);\n        System.out.println(\"Student: \" + s1.name + \" | Grade: \" + s1.getGrade());\n        System.out.println(\"Student: \" + s2.name + \" | Grade: \" + s2.getGrade());\n    }\n}\n",
                        title: "Instantiate & Test Students in Main",
                        instruction: "Create student objects and print their grades.",
                        explanation: "Demonstrates object instantiation and method invocation.",
                        why: "Completes OOP student execution.",
                        hint: "Type main() with Student instances.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            const seq = [
                {
                    token: "public class Main {\n    public static void main(String[] args) {",
                    insert: "public class Main {\n    public static void main(String[] args) {\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        ",
                    title: "Setup Java Main Class",
                    instruction: "Type 'public class Main { public static void main(String[] args) {'.",
                    explanation: "Java application entry point.",
                    why: "Entry requirement.",
                    hint: "Type class Main with main method.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Class Setup",
                },
                {
                    token: "String name = \"Alice\";\n        int rollNo = 101;\n        int sub1 = 85, sub2 = 90, sub3 = 88;\n        int total = sub1 + sub2 + sub3;\n        double avg = total / 3.0;",
                    insert: "String name = \"Alice\";\n        int rollNo = 101;\n        int sub1 = 85, sub2 = 90, sub3 = 88;\n        int total = sub1 + sub2 + sub3;\n        double avg = total / 3.0;\n        ",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        String name = \"Alice\";\n        int rollNo = 101;\n        int sub1 = 85, sub2 = 90, sub3 = 88;\n        int total = sub1 + sub2 + sub3;\n        double avg = total / 3.0;\n        ",
                    title: "Declare Student Variables & Compute Total",
                    instruction: "Declare student name, roll number, subject scores, and compute average.",
                    explanation: "Calculates total marks and average percentage.",
                    why: "Initializes student data.",
                    hint: "Type String name, rollNo, and score variables.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Variables",
                },
                {
                    token: "System.out.println(\"=== Student Marksheet ===\");\n        System.out.println(\"Student: \" + name + \" | Roll: \" + rollNo);\n        System.out.println(\"Total: \" + total + \" | Average: \" + avg + \"%\");\n    }\n}",
                    insert: "System.out.println(\"=== Student Marksheet ===\");\n        System.out.println(\"Student: \" + name + \" | Roll: \" + rollNo);\n        System.out.println(\"Total: \" + total + \" | Average: \" + avg + \"%\");\n    }\n}\n",
                    accum: "public class Main {\n    public static void main(String[] args) {\n        String name = \"Alice\";\n        int rollNo = 101;\n        int sub1 = 85, sub2 = 90, sub3 = 88;\n        int total = sub1 + sub2 + sub3;\n        double avg = total / 3.0;\n        System.out.println(\"=== Student Marksheet ===\");\n        System.out.println(\"Student: \" + name + \" | Roll: \" + rollNo);\n        System.out.println(\"Total: \" + total + \" | Average: \" + avg + \"%\");\n    }\n}\n",
                    title: "Print Marksheet Output",
                    instruction: "Print student marks summary.",
                    explanation: "Outputs formatted student record.",
                    why: "Completes mark calculation.",
                    hint: "Type System.out.println.",
                    category: "statement" as const,
                    step: 3,
                    stepTitle: "Output",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // Generic Java Synthesizer for arbitrary requested programs
        const className = p.replace(/[^a-zA-Z0-9]/g, "");
        const validClassName = /^[A-Z]/.test(className) ? className : "AppService";
        const seq = [
            {
                token: `class ${validClassName} {\n    private String title = \"${p}\";\n    public void runProcess() {\n        System.out.println(\"Processing \" + title + \"...\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {`,
                insert: `class ${validClassName} {\n    private String title = \"${p}\";\n    public void runProcess() {\n        System.out.println(\"Processing \" + title + \"...\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        `,
                accum: `class ${validClassName} {\n    private String title = \"${p}\";\n    public void runProcess() {\n        System.out.println(\"Processing \" + title + \"...\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        `,
                title: `Define ${validClassName} Structure & Main`,
                instruction: `Define class ${validClassName} with runProcess() method and entry point in Main.`,
                explanation: `Modular domain architecture for ${p}.`,
                why: `Structured Java component for ${p}.`,
                hint: `Type class ${validClassName} and public class Main.`,
                category: "structure" as const,
                step: 1,
                stepTitle: "Architecture Setup",
            },
            {
                token: `${validClassName} app = new ${validClassName}();\n        System.out.println(\"=== ${p} ===\");\n        app.runProcess();\n        System.out.println(\"Execution completed successfully.\");\n    }\n}`,
                insert: `${validClassName} app = new ${validClassName}();\n        System.out.println(\"=== ${p} ===\");\n        app.runProcess();\n        System.out.println(\"Execution completed successfully.\");\n    }\n}\n`,
                accum: `class ${validClassName} {\n    private String title = \"${p}\";\n    public void runProcess() {\n        System.out.println(\"Processing \" + title + \"...\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        ${validClassName} app = new ${validClassName}();\n        System.out.println(\"=== ${p} ===\");\n        app.runProcess();\n        System.out.println(\"Execution completed successfully.\");\n    }\n}\n`,
                title: `Execute ${p} in Main`,
                instruction: `Instantiate ${validClassName} and call runProcess().`,
                explanation: `Runs the domain business logic for ${p}.`,
                why: `Completes execution for ${p}.`,
                hint: `Type ${validClassName} app = new ${validClassName}(); and call app.runProcess();`,
                category: "statement" as const,
                step: 2,
                stepTitle: "Execution",
            },
        ];
        return buildUnitsFromSequence(seq);
    }

    // =========================================================================
    // PYTHON SYNTHESIZER
    // =========================================================================
    if (normLang === "python" || normLang === "py") {
        // 0. Python ATM / Bank Management
        if (task === "atm") {
            const seq = [
                {
                    token: "class BankAccount:\n    def __init__(self, acc_no: int, balance: float):\n        self.acc_no = acc_no\n        self.balance = balance\n    def deposit(self, amount: float):\n        self.balance += amount\n    def withdraw(self, amount: float) -> bool:\n        if amount <= self.balance:\n            self.balance -= amount\n            return True\n        return False",
                    insert: "class BankAccount:\n    def __init__(self, acc_no: int, balance: float):\n        self.acc_no = acc_no\n        self.balance = balance\n\n    def deposit(self, amount: float):\n        self.balance += amount\n\n    def withdraw(self, amount: float) -> bool:\n        if amount <= self.balance:\n            self.balance -= amount\n            return True\n        return False\n\n",
                    accum: "class BankAccount:\n    def __init__(self, acc_no: int, balance: float):\n        self.acc_no = acc_no\n        self.balance = balance\n\n    def deposit(self, amount: float):\n        self.balance += amount\n\n    def withdraw(self, amount: float) -> bool:\n        if amount <= self.balance:\n            self.balance -= amount\n            return True\n        return False\n\n",
                    title: "Define BankAccount Class in Python",
                    instruction: "Declare BankAccount with __init__, deposit(), and withdraw() methods.",
                    explanation: "Encapsulates banking state and transaction validation in Python OOP.",
                    why: "Python banking data model.",
                    hint: "Type class BankAccount with deposit and withdraw.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "BankAccount Class",
                },
                {
                    token: "def main():\n    account = BankAccount(1001, 1000.0)\n    account.deposit(500.0)\n    account.withdraw(200.0)\n    print('=== Python ATM Banking ===')\n    print(f'Account: {account.acc_no} | Current Balance: ${account.balance:.2f}')\n\nif __name__ == '__main__':\n    main()",
                    insert: "def main():\n    account = BankAccount(1001, 1000.0)\n    account.deposit(500.0)\n    account.withdraw(200.0)\n    print('=== Python ATM Banking ===')\n    print(f'Account: {account.acc_no} | Current Balance: ${account.balance:.2f}')\n\nif __name__ == '__main__':\n    main()\n",
                    accum: "class BankAccount:\n    def __init__(self, acc_no: int, balance: float):\n        self.acc_no = acc_no\n        self.balance = balance\n\n    def deposit(self, amount: float):\n        self.balance += amount\n\n    def withdraw(self, amount: float) -> bool:\n        if amount <= self.balance:\n            self.balance -= amount\n            return True\n        return False\n\ndef main():\n    account = BankAccount(1001, 1000.0)\n    account.deposit(500.0)\n    account.withdraw(200.0)\n    print('=== Python ATM Banking ===')\n    print(f'Account: {account.acc_no} | Current Balance: ${account.balance:.2f}')\n\nif __name__ == '__main__':\n    main()\n",
                    title: "Execute ATM Transactions in main()",
                    instruction: "Instantiate BankAccount, perform deposit and withdrawal, and display balance with print.",
                    explanation: "Demonstrates transaction execution and formatted print in Python.",
                    why: "Completes Python ATM execution.",
                    hint: "Type main() creating BankAccount and executing deposit/withdraw.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 1. Student Management
        if (task === "student_management") {
            if (isAdv) {
                const seq = [
                    {
                        token: "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass StudentRecord:\n    name: str\n    roll_no: int\n    gpa: float",
                        insert: "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass StudentRecord:\n    name: str\n    roll_no: int\n    gpa: float\n\n",
                        accum: "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass StudentRecord:\n    name: str\n    roll_no: int\n    gpa: float\n\n",
                        title: "Define StudentRecord Dataclass",
                        instruction: "Define typed dataclass StudentRecord.",
                        explanation: "Typed Python data structure.",
                        why: "Domain structure.",
                        hint: "Type @dataclass class StudentRecord.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Data Structure",
                    },
                    {
                        token: "def main():\n    roster: List[StudentRecord] = [\n        StudentRecord('Alice', 101, 3.9),\n        StudentRecord('Bob', 102, 3.4)\n    ]\n    print('=== Student Management System ===')\n    avg_gpa = sum(s.gpa for s in roster) / len(roster)\n    for s in roster:\n        print(f'Roll: {s.roll_no} | {s.name} | GPA: {s.gpa}')\n    print(f'Class Average GPA: {avg_gpa:.2f}')\n\nif __name__ == '__main__':\n    main()",
                        insert: "def main():\n    roster: List[StudentRecord] = [\n        StudentRecord('Alice', 101, 3.9),\n        StudentRecord('Bob', 102, 3.4)\n    ]\n    print('=== Student Management System ===')\n    avg_gpa = sum(s.gpa for s in roster) / len(roster)\n    for s in roster:\n        print(f'Roll: {s.roll_no} | {s.name} | GPA: {s.gpa}')\n    print(f'Class Average GPA: {avg_gpa:.2f}')\n\nif __name__ == '__main__':\n    main()\n",
                        accum: "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass StudentRecord:\n    name: str\n    roll_no: int\n    gpa: float\n\ndef main():\n    roster: List[StudentRecord] = [\n        StudentRecord('Alice', 101, 3.9),\n        StudentRecord('Bob', 102, 3.4)\n    ]\n    print('=== Student Management System ===')\n    avg_gpa = sum(s.gpa for s in roster) / len(roster)\n    for s in roster:\n        print(f'Roll: {s.roll_no} | {s.name} | GPA: {s.gpa}')\n    print(f'Class Average GPA: {avg_gpa:.2f}')\n\nif __name__ == '__main__':\n    main()\n",
                        title: "Process Roster Analytics in main()",
                        instruction: "Iterate through roster list, calculate average GPA, and print summary.",
                        explanation: "Demonstrates generator expressions and f-strings.",
                        why: "Completes roster reporting.",
                        hint: "Type main() with list analytics.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Analytics",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            if (isInt) {
                const seq = [
                    {
                        token: "class Student:\n    def __init__(self, name: str, roll_no: int, marks: list):\n        self.name = name\n        self.roll_no = roll_no\n        self.marks = marks\n    def get_average(self) -> float:\n        return sum(self.marks) / len(self.marks)\n    def get_grade(self) -> str:\n        avg = self.get_average()\n        return 'A' if avg >= 90 else 'B' if avg >= 75 else 'C'",
                        insert: "class Student:\n    def __init__(self, name: str, roll_no: int, marks: list):\n        self.name = name\n        self.roll_no = roll_no\n        self.marks = marks\n\n    def get_average(self) -> float:\n        return sum(self.marks) / len(self.marks)\n\n    def get_grade(self) -> str:\n        avg = self.get_average()\n        return 'A' if avg >= 90 else 'B' if avg >= 75 else 'C'\n\n",
                        accum: "class Student:\n    def __init__(self, name: str, roll_no: int, marks: list):\n        self.name = name\n        self.roll_no = roll_no\n        self.marks = marks\n\n    def get_average(self) -> float:\n        return sum(self.marks) / len(self.marks)\n\n    def get_grade(self) -> str:\n        avg = self.get_average()\n        return 'A' if avg >= 90 else 'B' if avg >= 75 else 'C'\n\n",
                        title: "Define Student Class",
                        instruction: "Define class Student with __init__, get_average(), and get_grade() methods.",
                        explanation: "Encapsulates student attributes and grade calculations.",
                        why: "OOP student entity.",
                        hint: "Type class Student.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "Class Definition",
                    },
                    {
                        token: "def main():\n    s1 = Student('Alice', 101, [85, 92, 90])\n    s2 = Student('Bob', 102, [74, 78, 80])\n    print('=== Student Management System ===')\n    print(f'Student: {s1.name} | Average: {s1.get_average():.1f} | Grade: {s1.get_grade()}')\n    print(f'Student: {s2.name} | Average: {s2.get_average():.1f} | Grade: {s2.get_grade()}')\n\nif __name__ == '__main__':\n    main()",
                        insert: "def main():\n    s1 = Student('Alice', 101, [85, 92, 90])\n    s2 = Student('Bob', 102, [74, 78, 80])\n    print('=== Student Management System ===')\n    print(f'Student: {s1.name} | Average: {s1.get_average():.1f} | Grade: {s1.get_grade()}')\n    print(f'Student: {s2.name} | Average: {s2.get_average():.1f} | Grade: {s2.get_grade()}')\n\nif __name__ == '__main__':\n    main()\n",
                        accum: "class Student:\n    def __init__(self, name: str, roll_no: int, marks: list):\n        self.name = name\n        self.roll_no = roll_no\n        self.marks = marks\n\n    def get_average(self) -> float:\n        return sum(self.marks) / len(self.marks)\n\n    def get_grade(self) -> str:\n        avg = self.get_average()\n        return 'A' if avg >= 90 else 'B' if avg >= 75 else 'C'\n\ndef main():\n    s1 = Student('Alice', 101, [85, 92, 90])\n    s2 = Student('Bob', 102, [74, 78, 80])\n    print('=== Student Management System ===')\n    print(f'Student: {s1.name} | Average: {s1.get_average():.1f} | Grade: {s1.get_grade()}')\n    print(f'Student: {s2.name} | Average: {s2.get_average():.1f} | Grade: {s2.get_grade()}')\n\nif __name__ == '__main__':\n    main()\n",
                        title: "Instantiate & Display Students in main()",
                        instruction: "Create student instances and print calculated grade cards.",
                        explanation: "Demonstrates object creation and method calls in Python.",
                        why: "Completes OOP execution.",
                        hint: "Type main() creating Student objects.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            const seq = [
                {
                    token: "def main():\n    student_name = 'Alice'\n    roll_no = 101\n    marks = [85, 90, 88]\n    total = sum(marks)\n    average = total / len(marks)",
                    insert: "def main():\n    student_name = 'Alice'\n    roll_no = 101\n    marks = [85, 90, 88]\n    total = sum(marks)\n    average = total / len(marks)\n    ",
                    accum: "def main():\n    student_name = 'Alice'\n    roll_no = 101\n    marks = [85, 90, 88]\n    total = sum(marks)\n    average = total / len(marks)\n    ",
                    title: "Initialize Student Marks Data in main()",
                    instruction: "Define main(), set student_name, roll_no, marks list, and compute total & average.",
                    explanation: "def main(): defines the main function. sum(marks) calculates the list sum. len(marks) gets count.",
                    why: "Sets up student data and calculations.",
                    hint: "Type def main(): and student variables.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Data Setup",
                },
                {
                    token: "print('=== Student Marksheet ===')\n    print(f'Student: {student_name} | Roll: {roll_no}')\n    print(f'Total Marks: {total} | Average: {average:.1f}%')\n\nif __name__ == '__main__':\n    main()",
                    insert: "print('=== Student Marksheet ===')\n    print(f'Student: {student_name} | Roll: {roll_no}')\n    print(f'Total Marks: {total} | Average: {average:.1f}%')\n\nif __name__ == '__main__':\n    main()\n",
                    accum: "def main():\n    student_name = 'Alice'\n    roll_no = 101\n    marks = [85, 90, 88]\n    total = sum(marks)\n    average = total / len(marks)\n    print('=== Student Marksheet ===')\n    print(f'Student: {student_name} | Roll: {roll_no}')\n    print(f'Total Marks: {total} | Average: {average:.1f}%')\n\nif __name__ == '__main__':\n    main()\n",
                    title: "Print Marksheet Output & Call main()",
                    instruction: "Print student marks summary using f-strings and call main().",
                    explanation: "print() outputs text. if __name__ == '__main__': executes main function.",
                    why: "Completes Python script execution.",
                    hint: "Type print statements and if __name__ == '__main__': main().",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Output",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 2. Python File Handling
        if (task === "file_handling") {
            const seq = [
                {
                    token: "def write_and_read_file():\n    filename = 'output.txt'\n    with open(filename, 'w') as f:\n        f.write('Hello from Python File Handling!\\n')",
                    insert: "def write_and_read_file():\n    filename = 'output.txt'\n    with open(filename, 'w') as f:\n        f.write('Hello from Python File Handling!\\n')\n    ",
                    accum: "def write_and_read_file():\n    filename = 'output.txt'\n    with open(filename, 'w') as f:\n        f.write('Hello from Python File Handling!\\n')\n    ",
                    title: "Write Data Using Context Manager",
                    instruction: "Open file in write mode 'w' using with open() context manager and write text.",
                    explanation: "with statement ensures the file is automatically closed upon completion.",
                    why: "Safe resource management.",
                    hint: "Type with open(filename, 'w') as f: f.write(...)",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "File Write",
                },
                {
                    token: "with open(filename, 'r') as f:\n        content = f.read()\n    print('=== File Content ===')\n    print(content.strip())\n\ndef main():\n    write_and_read_file()\n\nif __name__ == '__main__':\n    main()",
                    insert: "with open(filename, 'r') as f:\n        content = f.read()\n    print('=== File Content ===')\n    print(content.strip())\n\ndef main():\n    write_and_read_file()\n\nif __name__ == '__main__':\n    main()\n",
                    accum: "def write_and_read_file():\n    filename = 'output.txt'\n    with open(filename, 'w') as f:\n        f.write('Hello from Python File Handling!\\n')\n    with open(filename, 'r') as f:\n        content = f.read()\n    print('=== File Content ===')\n    print(content.strip())\n\ndef main():\n    write_and_read_file()\n\nif __name__ == '__main__':\n    main()\n",
                    title: "Read File & Print Output in main()",
                    instruction: "Read back file content in 'r' mode and print to console.",
                    explanation: "Reads file text into string and displays it.",
                    why: "Completes file handling roundtrip.",
                    hint: "Type with open(filename, 'r') as f: content = f.read()",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "File Read",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 3. Python OOP / Classes / Inheritance
        if (task === "inheritance" || task === "classes") {
            const seq = [
                {
                    token: "class Animal:\n    def __init__(self, name: str):\n        self.name = name\n    def speak(self) -> str:\n        return f'{self.name} makes a sound.'\n\nclass Dog(Animal):\n    def __init__(self, name: str, breed: str):\n        super().__init__(name)\n        self.breed = breed\n    def speak(self) -> str:\n        return f'{self.name} the {self.breed} barks!'",
                    insert: "class Animal:\n    def __init__(self, name: str):\n        self.name = name\n    def speak(self) -> str:\n        return f'{self.name} makes a sound.'\n\nclass Dog(Animal):\n    def __init__(self, name: str, breed: str):\n        super().__init__(name)\n        self.breed = breed\n    def speak(self) -> str:\n        return f'{self.name} the {self.breed} barks!'\n\n",
                    accum: "class Animal:\n    def __init__(self, name: str):\n        self.name = name\n    def speak(self) -> str:\n        return f'{self.name} makes a sound.'\n\nclass Dog(Animal):\n    def __init__(self, name: str, breed: str):\n        super().__init__(name)\n        self.breed = breed\n    def speak(self) -> str:\n        return f'{self.name} the {self.breed} barks!'\n\n",
                    title: "Define Animal Base & Dog Subclass in Python",
                    instruction: "Declare Animal class and Dog(Animal) subclass with super().__init__().",
                    explanation: "Demonstrates Python OOP inheritance and method overriding.",
                    why: "OOP class hierarchy.",
                    hint: "Type class Animal and class Dog(Animal).",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "OOP Hierarchy",
                },
                {
                    token: "def main():\n    my_dog = Dog('Rex', 'German Shepherd')\n    print('=== Python OOP Inheritance ===')\n    print(my_dog.speak())\n\nif __name__ == '__main__':\n    main()",
                    insert: "def main():\n    my_dog = Dog('Rex', 'German Shepherd')\n    print('=== Python OOP Inheritance ===')\n    print(my_dog.speak())\n\nif __name__ == '__main__':\n    main()\n",
                    accum: "class Animal:\n    def __init__(self, name: str):\n        self.name = name\n    def speak(self) -> str:\n        return f'{self.name} makes a sound.'\n\nclass Dog(Animal):\n    def __init__(self, name: str, breed: str):\n        super().__init__(name)\n        self.breed = breed\n    def speak(self) -> str:\n        return f'{self.name} the {self.breed} barks!'\n\ndef main():\n    my_dog = Dog('Rex', 'German Shepherd')\n    print('=== Python OOP Inheritance ===')\n    print(my_dog.speak())\n\nif __name__ == '__main__':\n    main()\n",
                    title: "Instantiate & Test Dog in main()",
                    instruction: "Create Dog instance and invoke overridden speak() method.",
                    explanation: "Demonstrates object execution in Python.",
                    why: "Completes OOP demonstration.",
                    hint: "Type main() creating Dog and calling speak().",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 4. Python Recursion
        if (task === "recursion" || task === "factorial") {
            const seq = [
                {
                    token: "def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
                    insert: "def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\n",
                    accum: "def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\n",
                    title: "Define Recursive Factorial Function",
                    instruction: "Declare factorial(n) with base case n <= 1 returning 1 and recursive step.",
                    explanation: "Recursive function calls itself with smaller sub-problems.",
                    why: "Fundamental recursion pattern.",
                    hint: "Type def factorial(n): with base case and recursive call.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Recursive Function",
                },
                {
                    token: "def main():\n    num = 5\n    res = factorial(num)\n    print('=== Python Recursion ===')\n    print(f'Factorial of {num} is {res}')\n\nif __name__ == '__main__':\n    main()",
                    insert: "def main():\n    num = 5\n    res = factorial(num)\n    print('=== Python Recursion ===')\n    print(f'Factorial of {num} is {res}')\n\nif __name__ == '__main__':\n    main()\n",
                    accum: "def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\ndef main():\n    num = 5\n    res = factorial(num)\n    print('=== Python Recursion ===')\n    print(f'Factorial of {num} is {res}')\n\nif __name__ == '__main__':\n    main()\n",
                    title: "Invoke Factorial & Print Result in main()",
                    instruction: "Call factorial(5) and print the computed result.",
                    explanation: "Outputs calculated factorial.",
                    why: "Completes recursive execution.",
                    hint: "Type main() calling factorial(num).",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // Generic Python Synthesizer
        const pyFunc = p.toLowerCase().replace(/[^a-z0-9]/g, "_") || "process_data";
        const seq = [
            {
                token: `def ${pyFunc}():\n    print('=== ${p} ===')\n    data = [10, 20, 30, 40, 50]\n    total = sum(data)\n    return total`,
                insert: `def ${pyFunc}():\n    print('=== ${p} ===')\n    data = [10, 20, 30, 40, 50]\n    total = sum(data)\n    return total\n\n`,
                accum: `def ${pyFunc}():\n    print('=== ${p} ===')\n    data = [10, 20, 30, 40, 50]\n    total = sum(data)\n    return total\n\n`,
                title: `Define ${p} Function`,
                instruction: `Declare function ${pyFunc}() and compute results for ${p}.`,
                explanation: `Modular logic for ${p}.`,
                why: `Structured Python function for ${p}.`,
                hint: `Type def ${pyFunc}():`,
                category: "structure" as const,
                step: 1,
                stepTitle: "Logic Definition",
            },
            {
                token: `def main():\n    result = ${pyFunc}()\n    print(f'Processed Result: {result}')\n\nif __name__ == '__main__':\n    main()`,
                insert: `def main():\n    result = ${pyFunc}()\n    print(f'Processed Result: {result}')\n\nif __name__ == '__main__':\n    main()\n`,
                accum: `def ${pyFunc}():\n    print('=== ${p} ===')\n    data = [10, 20, 30, 40, 50]\n    total = sum(data)\n    return total\n\ndef main():\n    result = ${pyFunc}()\n    print(f'Processed Result: {result}')\n\nif __name__ == '__main__':\n    main()\n`,
                title: `Execute ${p} in main()`,
                instruction: `Call ${pyFunc}() from main() and display output.`,
                explanation: `Runs the complete Python application.`,
                why: `Completes execution.`,
                hint: `Type def main(): and if __name__ == '__main__': main().`,
                category: "statement" as const,
                step: 2,
                stepTitle: "Execution",
            },
        ];
        return buildUnitsFromSequence(seq);
    }

    // =========================================================================
    // C SYNTHESIZER
    // =========================================================================
    if (normLang === "c") {
        // 0. C ATM / Bank Management
        if (task === "atm") {
            const seq = [
                {
                    token: "#include <stdio.h>\n\nstruct Account {\n    int accNo;\n    double balance;\n};",
                    insert: "#include <stdio.h>\n\nstruct Account {\n    int accNo;\n    double balance;\n};\n\n",
                    accum: "#include <stdio.h>\n\nstruct Account {\n    int accNo;\n    double balance;\n};\n\n",
                    title: "Define struct Account in C",
                    instruction: "Include <stdio.h> and declare struct Account with accNo and balance.",
                    explanation: "Represents bank account structure in C.",
                    why: "C banking data structure.",
                    hint: "Type struct Account with accNo and balance.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Account Structure",
                },
                {
                    token: "int main() {\n    struct Account acc = {1001, 1000.0};\n    double deposit = 500.0, withdraw = 200.0;\n    printf(\"=== C ATM Banking ===\\n\");\n    acc.balance += deposit;\n    if (withdraw <= acc.balance) {\n        acc.balance -= withdraw;\n    }\n    printf(\"Account: %d | Final Balance: $%.2f\\n\", acc.accNo, acc.balance);\n    return 0;\n}",
                    insert: "int main() {\n    struct Account acc = {1001, 1000.0};\n    double deposit = 500.0, withdraw = 200.0;\n    printf(\"=== C ATM Banking ===\\n\");\n    acc.balance += deposit;\n    if (withdraw <= acc.balance) {\n        acc.balance -= withdraw;\n    }\n    printf(\"Account: %d | Final Balance: $%.2f\\n\", acc.accNo, acc.balance);\n    return 0;\n}\n",
                    accum: "#include <stdio.h>\n\nstruct Account {\n    int accNo;\n    double balance;\n};\n\nint main() {\n    struct Account acc = {1001, 1000.0};\n    double deposit = 500.0, withdraw = 200.0;\n    printf(\"=== C ATM Banking ===\\n\");\n    acc.balance += deposit;\n    if (withdraw <= acc.balance) {\n        acc.balance -= withdraw;\n    }\n    printf(\"Account: %d | Final Balance: $%.2f\\n\", acc.accNo, acc.balance);\n    return 0;\n}\n",
                    title: "Execute Deposit & Withdrawal in main()",
                    instruction: "Perform arithmetic updates on struct Account balance and print final summary.",
                    explanation: "Demonstrates structure field manipulation in C.",
                    why: "Completes C banking operations.",
                    hint: "Type main() performing deposit and withdrawal.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 1. C Calculator
        if (task === "calculator") {
            const seq = [
                {
                    token: "#include <stdio.h>\n\nint calculate(int a, int b, char op) {\n    switch(op) {\n        case '+': return a + b;\n        case '-': return a - b;\n        case '*': return a * b;\n        case '/': return b != 0 ? a / b : 0;\n        default: return 0;\n    }\n}",
                    insert: "#include <stdio.h>\n\nint calculate(int a, int b, char op) {\n    switch(op) {\n        case '+': return a + b;\n        case '-': return a - b;\n        case '*': return a * b;\n        case '/': return b != 0 ? a / b : 0;\n        default: return 0;\n    }\n}\n\n",
                    accum: "#include <stdio.h>\n\nint calculate(int a, int b, char op) {\n    switch(op) {\n        case '+': return a + b;\n        case '-': return a - b;\n        case '*': return a * b;\n        case '/': return b != 0 ? a / b : 0;\n        default: return 0;\n    }\n}\n\n",
                    title: "Define calculate Function with switch",
                    instruction: "Include <stdio.h> and declare calculate(int a, int b, char op) using a switch statement.",
                    explanation: "Processes different arithmetic operators cleanly in C.",
                    why: "Modular arithmetic function in C.",
                    hint: "Type calculate function with switch statement.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Calculator Function",
                },
                {
                    token: "int main() {\n    int a = 20, b = 4;\n    printf(\"=== C Arithmetic Calculator ===\\n\");\n    printf(\"Add: %d\\n\", calculate(a, b, '+'));\n    printf(\"Subtract: %d\\n\", calculate(a, b, '-'));\n    printf(\"Multiply: %d\\n\", calculate(a, b, '*'));\n    printf(\"Divide: %d\\n\", calculate(a, b, '/'));\n    return 0;\n}",
                    insert: "int main() {\n    int a = 20, b = 4;\n    printf(\"=== C Arithmetic Calculator ===\\n\");\n    printf(\"Add: %d\\n\", calculate(a, b, '+'));\n    printf(\"Subtract: %d\\n\", calculate(a, b, '-'));\n    printf(\"Multiply: %d\\n\", calculate(a, b, '*'));\n    printf(\"Divide: %d\\n\", calculate(a, b, '/'));\n    return 0;\n}\n",
                    accum: "#include <stdio.h>\n\nint calculate(int a, int b, char op) {\n    switch(op) {\n        case '+': return a + b;\n        case '-': return a - b;\n        case '*': return a * b;\n        case '/': return b != 0 ? a / b : 0;\n        default: return 0;\n    }\n}\n\nint main() {\n    int a = 20, b = 4;\n    printf(\"=== C Arithmetic Calculator ===\\n\");\n    printf(\"Add: %d\\n\", calculate(a, b, '+'));\n    printf(\"Subtract: %d\\n\", calculate(a, b, '-'));\n    printf(\"Multiply: %d\\n\", calculate(a, b, '*'));\n    printf(\"Divide: %d\\n\", calculate(a, b, '/'));\n    return 0;\n}\n",
                    title: "Invoke Calculations in main()",
                    instruction: "Call calculate() with operators and print results using printf.",
                    explanation: "Prints formatted arithmetic output.",
                    why: "Completes C calculator execution.",
                    hint: "Type int main() invoking calculate and return 0.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 2. C Linked List
        if (task === "linked_list") {
            const seq = [
                {
                    token: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};",
                    insert: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\n",
                    accum: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\n",
                    title: "Define struct Node in C",
                    instruction: "Include <stdio.h>, <stdlib.h> and declare self-referential struct Node.",
                    explanation: "Defines memory blueprint for linked list nodes.",
                    why: "Linked list node structure in C.",
                    hint: "Type struct Node with int data and struct Node* next.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Node Structure",
                },
                {
                    token: "int main() {\n    struct Node* head = (struct Node*)malloc(sizeof(struct Node));\n    head->data = 10;\n    head->next = (struct Node*)malloc(sizeof(struct Node));\n    head->next->data = 20;\n    head->next->next = NULL;\n    printf(\"=== C Linked List ===\\n\");\n    struct Node* curr = head;\n    while (curr != NULL) {\n        printf(\"%d -> \", curr->data);\n        curr = curr->next;\n    }\n    printf(\"NULL\\n\");\n    return 0;\n}",
                    insert: "int main() {\n    struct Node* head = (struct Node*)malloc(sizeof(struct Node));\n    head->data = 10;\n    head->next = (struct Node*)malloc(sizeof(struct Node));\n    head->next->data = 20;\n    head->next->next = NULL;\n    printf(\"=== C Linked List ===\\n\");\n    struct Node* curr = head;\n    while (curr != NULL) {\n        printf(\"%d -> \", curr->data);\n        curr = curr->next;\n    }\n    printf(\"NULL\\n\");\n    return 0;\n}\n",
                    accum: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\nint main() {\n    struct Node* head = (struct Node*)malloc(sizeof(struct Node));\n    head->data = 10;\n    head->next = (struct Node*)malloc(sizeof(struct Node));\n    head->next->data = 20;\n    head->next->next = NULL;\n    printf(\"=== C Linked List ===\\n\");\n    struct Node* curr = head;\n    while (curr != NULL) {\n        printf(\"%d -> \", curr->data);\n        curr = curr->next;\n    }\n    printf(\"NULL\\n\");\n    return 0;\n}\n",
                    title: "Allocate, Link & Traverse List in main()",
                    instruction: "Allocate nodes with malloc, chain pointers, and traverse displaying data.",
                    explanation: "Dynamically builds and traverses singly linked list in heap memory.",
                    why: "Completes C linked list implementation.",
                    hint: "Type main() with malloc and traversal loop.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Traversal",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 3. C Pointers
        if (task === "pointers") {
            const seq = [
                {
                    token: "#include <stdio.h>\n\nvoid swap(int* x, int* y) {\n    int temp = *x;\n    *x = *y;\n    *y = temp;\n}",
                    insert: "#include <stdio.h>\n\nvoid swap(int* x, int* y) {\n    int temp = *x;\n    *x = *y;\n    *y = temp;\n}\n\n",
                    accum: "#include <stdio.h>\n\nvoid swap(int* x, int* y) {\n    int temp = *x;\n    *x = *y;\n    *y = temp;\n}\n\n",
                    title: "Define swap Function with Pointer Dereferencing",
                    instruction: "Declare swap(int* x, int* y) using dereference operator * to exchange values in place.",
                    explanation: "Passes memory addresses (call by reference) to modify original variables.",
                    why: "Core C pointer memory manipulation.",
                    hint: "Type void swap(int* x, int* y) with temporary variable.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Pointer Swap",
                },
                {
                    token: "int main() {\n    int a = 15, b = 42;\n    printf(\"=== C Pointers Demonstration ===\\n\");\n    printf(\"Before: a = %d, b = %d\\n\", a, b);\n    swap(&a, &b);\n    printf(\"After:  a = %d, b = %d\\n\", a, b);\n    return 0;\n}",
                    insert: "int main() {\n    int a = 15, b = 42;\n    printf(\"=== C Pointers Demonstration ===\\n\");\n    printf(\"Before: a = %d, b = %d\\n\", a, b);\n    swap(&a, &b);\n    printf(\"After:  a = %d, b = %d\\n\", a, b);\n    return 0;\n}\n",
                    accum: "#include <stdio.h>\n\nvoid swap(int* x, int* y) {\n    int temp = *x;\n    *x = *y;\n    *y = temp;\n}\n\nint main() {\n    int a = 15, b = 42;\n    printf(\"=== C Pointers Demonstration ===\\n\");\n    printf(\"Before: a = %d, b = %d\\n\", a, b);\n    swap(&a, &b);\n    printf(\"After:  a = %d, b = %d\\n\", a, b);\n    return 0;\n}\n",
                    title: "Pass Addresses with & Operator in main()",
                    instruction: "Invoke swap(&a, &b) passing address-of operator & and print results.",
                    explanation: "Demonstrates address passing in C.",
                    why: "Completes pointer swap execution.",
                    hint: "Type main() calling swap(&a, &b).",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 4. C Structures
        if (task === "structures") {
            const seq = [
                {
                    token: "#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    int id;\n    char name[50];\n    float gpa;\n};",
                    insert: "#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    int id;\n    char name[50];\n    float gpa;\n};\n\n",
                    accum: "#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    int id;\n    char name[50];\n    float gpa;\n};\n\n",
                    title: "Define struct Student in C",
                    instruction: "Include <stdio.h>, <string.h> and declare struct Student with id, name, and gpa fields.",
                    explanation: "User-defined composite type grouping related data.",
                    why: "Defines C structure type.",
                    hint: "Type struct Student definition.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Structure Definition",
                },
                {
                    token: "int main() {\n    struct Student s1;\n    s1.id = 101;\n    strcpy(s1.name, \"Alice\");\n    s1.gpa = 3.85f;\n    printf(\"=== C Structure Record ===\\n\");\n    printf(\"ID: %d | Name: %s | GPA: %.2f\\n\", s1.id, s1.name, s1.gpa);\n    return 0;\n}",
                    insert: "int main() {\n    struct Student s1;\n    s1.id = 101;\n    strcpy(s1.name, \"Alice\");\n    s1.gpa = 3.85f;\n    printf(\"=== C Structure Record ===\\n\");\n    printf(\"ID: %d | Name: %s | GPA: %.2f\\n\", s1.id, s1.name, s1.gpa);\n    return 0;\n}\n",
                    accum: "#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    int id;\n    char name[50];\n    float gpa;\n};\n\nint main() {\n    struct Student s1;\n    s1.id = 101;\n    strcpy(s1.name, \"Alice\");\n    s1.gpa = 3.85f;\n    printf(\"=== C Structure Record ===\\n\");\n    printf(\"ID: %d | Name: %s | GPA: %.2f\\n\", s1.id, s1.name, s1.gpa);\n    return 0;\n}\n",
                    title: "Instantiate & Populate Structure in main()",
                    instruction: "Declare struct Student s1, set fields, and print formatted data.",
                    explanation: "Accesses struct fields using member access dot (.) operator.",
                    why: "Completes struct demonstration.",
                    hint: "Type main() populating struct Student s1.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // Generic C Synthesizer
        const seq = [
            {
                token: "#include <stdio.h>\n\nint main() {",
                insert: "#include <stdio.h>\n\nint main() {\n    ",
                accum: "#include <stdio.h>\n\nint main() {\n    ",
                title: "Setup C Entry Point",
                instruction: "Include <stdio.h> and declare int main().",
                explanation: "Standard C application entry point.",
                why: "C execution requirement.",
                hint: "Type #include <stdio.h> and int main() {",
                category: "structure" as const,
                step: 1,
                stepTitle: "Entry Point",
            },
            {
                token: `printf("=== ${p} ===\\n");\n    int a = 25, b = 15;\n    printf("Sum: %d | Diff: %d | Prod: %d\\n", (a + b), (a - b), (a * b));\n    return 0;\n}`,
                insert: `printf("=== ${p} ===\\n");\n    int a = 25, b = 15;\n    printf("Sum: %d | Diff: %d | Prod: %d\\n", (a + b), (a - b), (a * b));\n    return 0;\n}\n`,
                accum: `#include <stdio.h>\n\nint main() {\n    printf("=== ${p} ===\\n");\n    int a = 25, b = 15;\n    printf("Sum: %d | Diff: %d | Prod: %d\\n", (a + b), (a - b), (a * b));\n    return 0;\n}\n`,
                title: `Execute ${p} Operations`,
                instruction: `Compute and print output for ${p} using printf.`,
                explanation: `Outputs result for ${p}.`,
                why: "Completes C execution.",
                hint: "Type printf and return 0.",
                category: "statement" as const,
                step: 2,
                stepTitle: "Output",
            },
        ];
        return buildUnitsFromSequence(seq);
    }

    // =========================================================================
    // C++ SYNTHESIZER
    // =========================================================================
    if (normLang === "cpp" || normLang === "c++") {
        // 0. C++ ATM / Bank Management
        if (task === "atm") {
            if (isAdv) {
                const seq = [
                    {
                        token: "#include <iostream>\n#include <string>\n#include <stdexcept>\n\nclass BankAccount {\nprivate:\n    std::string accountNumber;\n    double balance;\npublic:\n    BankAccount(std::string acc, double init) : accountNumber(acc), balance(init) {}\n    void deposit(double amt) {\n        if (amt <= 0) throw std::invalid_argument(\"Deposit amount must be positive.\");\n        balance += amt;\n    }\n    void withdraw(double amt) {\n        if (amt > balance) throw std::runtime_error(\"Insufficient balance.\");\n        balance -= amt;\n    }\n    double getBalance() const { return balance; }\n};",
                        insert: "#include <iostream>\n#include <string>\n#include <stdexcept>\n\nclass BankAccount {\nprivate:\n    std::string accountNumber;\n    double balance;\npublic:\n    BankAccount(std::string acc, double init) : accountNumber(acc), balance(init) {}\n    void deposit(double amt) {\n        if (amt <= 0) throw std::invalid_argument(\"Deposit amount must be positive.\");\n        balance += amt;\n    }\n    void withdraw(double amt) {\n        if (amt > balance) throw std::runtime_error(\"Insufficient balance.\");\n        balance -= amt;\n    }\n    double getBalance() const { return balance; }\n};\n\n",
                        accum: "#include <iostream>\n#include <string>\n#include <stdexcept>\n\nclass BankAccount {\nprivate:\n    std::string accountNumber;\n    double balance;\npublic:\n    BankAccount(std::string acc, double init) : accountNumber(acc), balance(init) {}\n    void deposit(double amt) {\n        if (amt <= 0) throw std::invalid_argument(\"Deposit amount must be positive.\");\n        balance += amt;\n    }\n    void withdraw(double amt) {\n        if (amt > balance) throw std::runtime_error(\"Insufficient balance.\");\n        balance -= amt;\n    }\n    double getBalance() const { return balance; }\n};\n\n",
                        title: "Define Secure BankAccount Class with Exception Safety",
                        instruction: "Declare BankAccount class with private encapsulation and exception validation.",
                        explanation: "Demonstrates robust C++ OOP banking domain model.",
                        why: "Enterprise C++ banking architecture.",
                        hint: "Type class BankAccount with deposit and withdraw.",
                        category: "structure" as const,
                        step: 1,
                        stepTitle: "BankAccount Model",
                    },
                    {
                        token: "int main() {\n    std::cout << \"=== Advanced C++ Banking System ===\" << std::endl;\n    try {\n        BankAccount account(\"ACC-99201\", 1500.0);\n        account.deposit(500.0);\n        account.withdraw(200.0);\n        std::cout << \"Transaction Approved. Current Balance: $\" << account.getBalance() << std::endl;\n    } catch (const std::exception& e) {\n        std::cerr << \"Error: \" << e.what() << std::endl;\n    }\n    return 0;\n}",
                        insert: "int main() {\n    std::cout << \"=== Advanced C++ Banking System ===\" << std::endl;\n    try {\n        BankAccount account(\"ACC-99201\", 1500.0);\n        account.deposit(500.0);\n        account.withdraw(200.0);\n        std::cout << \"Transaction Approved. Current Balance: $\" << account.getBalance() << std::endl;\n    } catch (const std::exception& e) {\n        std::cerr << \"Error: \" << e.what() << std::endl;\n    }\n    return 0;\n}\n",
                        accum: "#include <iostream>\n#include <string>\n#include <stdexcept>\n\nclass BankAccount {\nprivate:\n    std::string accountNumber;\n    double balance;\npublic:\n    BankAccount(std::string acc, double init) : accountNumber(acc), balance(init) {}\n    void deposit(double amt) {\n        if (amt <= 0) throw std::invalid_argument(\"Deposit amount must be positive.\");\n        balance += amt;\n    }\n    void withdraw(double amt) {\n        if (amt > balance) throw std::runtime_error(\"Insufficient balance.\");\n        balance -= amt;\n    }\n    double getBalance() const { return balance; }\n};\n\nint main() {\n    std::cout << \"=== Advanced C++ Banking System ===\" << std::endl;\n    try {\n        BankAccount account(\"ACC-99201\", 1500.0);\n        account.deposit(500.0);\n        account.withdraw(200.0);\n        std::cout << \"Transaction Approved. Current Balance: $\" << account.getBalance() << std::endl;\n    } catch (const std::exception& e) {\n        std::cerr << \"Error: \" << e.what() << std::endl;\n    }\n    return 0;\n}\n",
                        title: "Execute Transactions in main() with Exception Handling",
                        instruction: "Instantiate BankAccount in main and execute verified transactions.",
                        explanation: "Demonstrates exception handling and balance verification in C++.",
                        why: "Completes C++ bank execution.",
                        hint: "Type main() invoking account.deposit and account.withdraw.",
                        category: "statement" as const,
                        step: 2,
                        stepTitle: "Execution",
                    },
                ];
                return buildUnitsFromSequence(seq);
            }
            // Intermediate / Beginner
            const seq = [
                {
                    token: "#include <iostream>\n\nclass BankAccount {\npublic:\n    double balance = 1000.0;\n    void deposit(double amt) { balance += amt; }\n    bool withdraw(double amt) {\n        if (amt <= balance) { balance -= amt; return true; }\n        return false;\n    }\n};",
                    insert: "#include <iostream>\n\nclass BankAccount {\npublic:\n    double balance = 1000.0;\n    void deposit(double amt) { balance += amt; }\n    bool withdraw(double amt) {\n        if (amt <= balance) { balance -= amt; return true; }\n        return false;\n    }\n};\n\n",
                    accum: "#include <iostream>\n\nclass BankAccount {\npublic:\n    double balance = 1000.0;\n    void deposit(double amt) { balance += amt; }\n    bool withdraw(double amt) {\n        if (amt <= balance) { balance -= amt; return true; }\n        return false;\n    }\n};\n\n",
                    title: "Define BankAccount Class",
                    instruction: "Declare BankAccount class with balance, deposit(), and withdraw() methods.",
                    explanation: "Encapsulates banking operations in C++.",
                    why: "C++ banking class definition.",
                    hint: "Type class BankAccount with deposit and withdraw.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Class Definition",
                },
                {
                    token: "int main() {\n    std::cout << \"=== C++ ATM System ===\" << std::endl;\n    BankAccount acc;\n    acc.deposit(500.0);\n    acc.withdraw(200.0);\n    std::cout << \"Final Balance: $\" << acc.balance << std::endl;\n    return 0;\n}",
                    insert: "int main() {\n    std::cout << \"=== C++ ATM System ===\" << std::endl;\n    BankAccount acc;\n    acc.deposit(500.0);\n    acc.withdraw(200.0);\n    std::cout << \"Final Balance: $\" << acc.balance << std::endl;\n    return 0;\n}\n",
                    accum: "#include <iostream>\n\nclass BankAccount {\npublic:\n    double balance = 1000.0;\n    void deposit(double amt) { balance += amt; }\n    bool withdraw(double amt) {\n        if (amt <= balance) { balance -= amt; return true; }\n        return false;\n    }\n};\n\nint main() {\n    std::cout << \"=== C++ ATM System ===\" << std::endl;\n    BankAccount acc;\n    acc.deposit(500.0);\n    acc.withdraw(200.0);\n    std::cout << \"Final Balance: $\" << acc.balance << std::endl;\n    return 0;\n}\n",
                    title: "Execute Transactions in main()",
                    instruction: "Instantiate BankAccount and print final balance.",
                    explanation: "Executes transactions and prints result.",
                    why: "Completes ATM execution.",
                    hint: "Type main() calling deposit and withdraw.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 1. C++ Classes / OOP
        if (task === "classes") {
            const seq = [
                {
                    token: "#include <iostream>\n#include <string>\n\nclass Book {\nprivate:\n    std::string title;\n    double price;\npublic:\n    Book(std::string t, double p) : title(t), price(p) {}\n    void display() const {\n        std::cout << \"Book: \" << title << \" | Price: $\" << price << std::endl;\n    }\n};",
                    insert: "#include <iostream>\n#include <string>\n\nclass Book {\nprivate:\n    std::string title;\n    double price;\npublic:\n    Book(std::string t, double p) : title(t), price(p) {}\n    void display() const {\n        std::cout << \"Book: \" << title << \" | Price: $\" << price << std::endl;\n    }\n};\n\n",
                    accum: "#include <iostream>\n#include <string>\n\nclass Book {\nprivate:\n    std::string title;\n    double price;\npublic:\n    Book(std::string t, double p) : title(t), price(p) {}\n    void display() const {\n        std::cout << \"Book: \" << title << \" | Price: $\" << price << std::endl;\n    }\n};\n\n",
                    title: "Define Encapsulated Book Class with Member Initializer",
                    instruction: "Declare Book class with private member variables and constructor member initializer list.",
                    explanation: "Demonstrates data encapsulation and modern C++ member initializers.",
                    why: "C++ OOP class definition.",
                    hint: "Type class Book with private fields and public constructor.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Class Definition",
                },
                {
                    token: "int main() {\n    std::cout << \"=== C++ Class & Object ===\" << std::endl;\n    Book b1(\"The C++ Programming Language\", 59.99);\n    b1.display();\n    return 0;\n}",
                    insert: "int main() {\n    std::cout << \"=== C++ Class & Object ===\" << std::endl;\n    Book b1(\"The C++ Programming Language\", 59.99);\n    b1.display();\n    return 0;\n}\n",
                    accum: "#include <iostream>\n#include <string>\n\nclass Book {\nprivate:\n    std::string title;\n    double price;\npublic:\n    Book(std::string t, double p) : title(t), price(p) {}\n    void display() const {\n        std::cout << \"Book: \" << title << \" | Price: $\" << price << std::endl;\n    }\n};\n\nint main() {\n    std::cout << \"=== C++ Class & Object ===\" << std::endl;\n    Book b1(\"The C++ Programming Language\", 59.99);\n    b1.display();\n    return 0;\n}\n",
                    title: "Instantiate & Test Book in main()",
                    instruction: "Create Book instance and call display() method.",
                    explanation: "Demonstrates object creation and method dispatch in C++.",
                    why: "Completes class execution.",
                    hint: "Type main() creating Book b1.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 2. C++ Polymorphism / Override
        if (task === "override" || task === "inheritance") {
            const seq = [
                {
                    token: "#include <iostream>\n#include <memory>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default;\n    virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        std::cout << \"Drawing Circle with radius.\" << std::endl;\n    }\n};",
                    insert: "#include <iostream>\n#include <memory>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default;\n    virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        std::cout << \"Drawing Circle with radius.\" << std::endl;\n    }\n};\n\n",
                    accum: "#include <iostream>\n#include <memory>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default;\n    virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        std::cout << \"Drawing Circle with radius.\" << std::endl;\n    }\n};\n\n",
                    title: "Define Abstract Base Shape & Derived Circle with override",
                    instruction: "Declare pure virtual base Shape and Circle subclass with 'override'.",
                    explanation: "Demonstrates runtime polymorphism and virtual dispatch.",
                    why: "C++ OOP polymorphism hierarchy.",
                    hint: "Type class Shape and class Circle : public Shape.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Polymorphic Hierarchy",
                },
                {
                    token: "int main() {\n    std::cout << \"=== C++ Polymorphism ===\" << std::endl;\n    std::unique_ptr<Shape> shape = std::make_unique<Circle>();\n    shape->draw();\n    return 0;\n}",
                    insert: "int main() {\n    std::cout << \"=== C++ Polymorphism ===\" << std::endl;\n    std::unique_ptr<Shape> shape = std::make_unique<Circle>();\n    shape->draw();\n    return 0;\n}\n",
                    accum: "#include <iostream>\n#include <memory>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default;\n    virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        std::cout << \"Drawing Circle with radius.\" << std::endl;\n    }\n};\n\nint main() {\n    std::cout << \"=== C++ Polymorphism ===\" << std::endl;\n    std::unique_ptr<Shape> shape = std::make_unique<Circle>();\n    shape->draw();\n    return 0;\n}\n",
                    title: "Execute Polymorphic Dispatch in main()",
                    instruction: "Use std::unique_ptr<Shape> to invoke virtual draw() dynamically.",
                    explanation: "Demonstrates modern C++ smart pointers and polymorphic execution.",
                    why: "Completes C++ polymorphism demonstration.",
                    hint: "Type main() calling shape->draw().",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 3. C++ STL
        if (task === "stl" || task === "array") {
            const seq = [
                {
                    token: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>",
                    insert: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\n\n",
                    accum: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\n\n",
                    title: "Include C++ STL Headers",
                    instruction: "Include <iostream>, <vector>, <algorithm>, and <numeric>.",
                    explanation: "Provides standard vector container, std::accumulate, and std::max_element.",
                    why: "Standard Template Library imports.",
                    hint: "Type #include <iostream>, <vector>, <algorithm>, and <numeric>.",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "STL Headers",
                },
                {
                    token: "int main() {\n    std::vector<int> numbers = {15, 42, 8, 91, 23};\n    std::cout << \"=== C++ STL Vector Processing ===\" << std::endl;\n    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);\n    int maxVal = *std::max_element(numbers.begin(), numbers.end());\n    std::cout << \"Sum: \" << sum << \" | Max: \" << maxVal << std::endl;\n    return 0;\n}",
                    insert: "int main() {\n    std::vector<int> numbers = {15, 42, 8, 91, 23};\n    std::cout << \"=== C++ STL Vector Processing ===\" << std::endl;\n    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);\n    int maxVal = *std::max_element(numbers.begin(), numbers.end());\n    std::cout << \"Sum: \" << sum << \" | Max: \" << maxVal << std::endl;\n    return 0;\n}\n",
                    accum: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\n\nint main() {\n    std::vector<int> numbers = {15, 42, 8, 91, 23};\n    std::cout << \"=== C++ STL Vector Processing ===\" << std::endl;\n    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);\n    int maxVal = *std::max_element(numbers.begin(), numbers.end());\n    std::cout << \"Sum: \" << sum << \" | Max: \" << maxVal << std::endl;\n    return 0;\n}\n",
                    title: "Process Vector with STL Algorithms in main()",
                    instruction: "Initialize std::vector<int>, compute sum with std::accumulate, and find max with std::max_element.",
                    explanation: "Demonstrates modern C++ idiomatic STL container manipulation.",
                    why: "Completes C++ STL demonstration.",
                    hint: "Type main() with std::vector and algorithms.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // 4. C++ Templates
        if (task === "templates") {
            const seq = [
                {
                    token: "#include <iostream>\n\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}",
                    insert: "#include <iostream>\n\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\n",
                    accum: "#include <iostream>\n\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\n",
                    title: "Define Generic Function Template",
                    instruction: "Declare template <typename T> function getMax(T a, T b).",
                    explanation: "Allows writing type-agnostic code instantiated by the compiler.",
                    why: "Generic C++ programming.",
                    hint: "Type template <typename T> T getMax(T a, T b).",
                    category: "structure" as const,
                    step: 1,
                    stepTitle: "Template Definition",
                },
                {
                    token: "int main() {\n    std::cout << \"=== C++ Function Templates ===\" << std::endl;\n    std::cout << \"Max Int: \" << getMax<int>(10, 25) << std::endl;\n    std::cout << \"Max Double: \" << getMax<double>(4.5, 2.3) << std::endl;\n    return 0;\n}",
                    insert: "int main() {\n    std::cout << \"=== C++ Function Templates ===\" << std::endl;\n    std::cout << \"Max Int: \" << getMax<int>(10, 25) << std::endl;\n    std::cout << \"Max Double: \" << getMax<double>(4.5, 2.3) << std::endl;\n    return 0;\n}\n",
                    accum: "#include <iostream>\n\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    std::cout << \"=== C++ Function Templates ===\" << std::endl;\n    std::cout << \"Max Int: \" << getMax<int>(10, 25) << std::endl;\n    std::cout << \"Max Double: \" << getMax<double>(4.5, 2.3) << std::endl;\n    return 0;\n}\n",
                    title: "Instantiate & Test Template in main()",
                    instruction: "Call getMax with int and double types in main().",
                    explanation: "Demonstrates generic template specialization at compile-time.",
                    why: "Completes template execution.",
                    hint: "Type main() calling getMax<int> and getMax<double>.",
                    category: "statement" as const,
                    step: 2,
                    stepTitle: "Execution",
                },
            ];
            return buildUnitsFromSequence(seq);
        }

        // Generic C++ Synthesizer
        const seq = [
            {
                token: "#include <iostream>\n\nint main() {",
                insert: "#include <iostream>\n\nint main() {\n    ",
                accum: "#include <iostream>\n\nint main() {\n    ",
                title: "Setup C++ Entry Point",
                instruction: "Include <iostream> and declare int main().",
                explanation: "Modern C++ application entry point.",
                why: "C++ execution requirement.",
                hint: "Type #include <iostream> and int main() {",
                category: "structure" as const,
                step: 1,
                stepTitle: "Entry Point",
            },
            {
                token: `std::cout << "=== ${p} ===" << std::endl;\n    int a = 25, b = 15;\n    std::cout << "Sum: " << (a + b) << " | Diff: " << (a - b) << " | Prod: " << (a * b) << std::endl;\n    return 0;\n}`,
                insert: `std::cout << "=== ${p} ===" << std::endl;\n    int a = 25, b = 15;\n    std::cout << "Sum: " << (a + b) << " | Diff: " << (a - b) << " | Prod: " << (a * b) << std::endl;\n    return 0;\n}\n`,
                accum: `#include <iostream>\n\nint main() {\n    std::cout << "=== ${p} ===" << std::endl;\n    int a = 25, b = 15;\n    std::cout << "Sum: " << (a + b) << " | Diff: " << (a - b) << " | Prod: " << (a * b) << std::endl;\n    return 0;\n}\n`,
                title: `Execute ${p} Operations`,
                instruction: `Compute and print output for ${p} using std::cout.`,
                explanation: `Outputs calculated result for ${p}.`,
                why: "Completes C++ execution.",
                hint: "Type std::cout and return 0.",
                category: "statement" as const,
                step: 2,
                stepTitle: "Output",
            },
        ];
        return buildUnitsFromSequence(seq);
    }

    return [];
}

export function generatePythonUnits(project: string, level: string = "beginner"): DictatorTeachingUnit[] {
    return synthesizeUniversalProgram(project, "python", level);
}

export function generateCppUnits(project: string, level: string = "beginner"): DictatorTeachingUnit[] {
    return synthesizeUniversalProgram(project, "cpp", level);
}

export function generateCUnits(project: string, level: string = "beginner"): DictatorTeachingUnit[] {
    return synthesizeUniversalProgram(project, "c", level);
}

export function generateTeachingUnits(
    project: string,
    language: string = "java",
    level: string = "beginner"
): DictatorTeachingUnit[] {
    return synthesizeUniversalProgram(project, language, level);
}
