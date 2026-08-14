import {
    createDictatorPlan,
    DictatorStep,
} from "./DictatorPlanner";


export interface DictatorCheckResult {
    correct: boolean;

    message: string;

    nextStep?: number;

    speech?: string;

    /*
     * Teacher information
     */

    concept?: string;

    explanation?: string;

    why?: string;

    example?: string;
}


/*
 * =========================================================
 * NORMALIZE CODE
 * =========================================================
 */

function normalizeCode(code: string): string {

    return code
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .trim();
}


/*
 * =========================================================
 * GET CURRENT STEP
 * =========================================================
 */

function getCurrentStep(
    project: string,
    step: number,
    language: string = "java"
): DictatorStep | null {

    const plan =
        createDictatorPlan(
            project,
            language,
            "beginner"
        );

    return (
        plan.find(
            item => item.step === step
        ) ?? null
    );
}


/*
 * =========================================================
 * JAVA KEYWORD MISTAKE DETECTOR
 * =========================================================
 */

function detectJavaMistake(
    code: string,
    expected: string,
    step: DictatorStep
) {

    const lines =
        code.split("\n");

    /*
     * Java keyword capitalization
     */

    const keywordMap: Record<
        string,
        string
    > = {
        public: "public",
        class: "class",
        static: "static",
        void: "void",
        int: "int",
        new: "new",
        return: "return",
    };


    const expectedLower =
        expected.toLowerCase();


    /*
     * Check capitalization mistakes.
     */

    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        for (
            const correctKeyword
            of Object.keys(keywordMap)
        ) {

            const wrongKeyword =
                correctKeyword.charAt(0)
                    .toUpperCase()
                +
                correctKeyword.slice(1);


            if (
                new RegExp(
                    `\\b${wrongKeyword}\\b`
                ).test(line)
            ) {

                if (
                    correctKeyword ===
                    expectedLower
                ) {

                    return {

                        line: i + 1,

                        message:
                            `❌ Not quite.\n\n` +
                            `There is a small mistake on line ${i + 1}.\n\n` +
                            `Java keywords are case-sensitive.\n\n` +
                            `You wrote "${wrongKeyword}", but the correct keyword is "${correctKeyword}".\n\n` +
                            `💡 Hint: Change "${wrongKeyword}" to "${correctKeyword}".`,

                        speech:
                            `There is a small mistake on line ${i + 1}. ` +
                            `Java keywords are case-sensitive. ` +
                            `You wrote ${wrongKeyword}. ` +
                            `Change it to ${correctKeyword}.`
                    };
                }
            }
        }
    }


    /*
     * Specific common mistake:
     * String must use capital S.
     */

    if (
        expected === "String" &&
        /\bstring\b/.test(code)
    ) {

        return {

            line:
                lines.findIndex(
                    line =>
                        /\bstring\b/.test(
                            line
                        )
                ) + 1,

            message:
                `❌ Not quite.\n\n` +
                `Java uses "String" with a capital S.\n\n` +
                `You wrote "string".\n\n` +
                `💡 Hint: Change "string" to "String".`,

            speech:
                `Not quite. Java uses String with a capital S. ` +
                `Change string to String.`
        };
    }


    return null;
}


/*
 * =========================================================
 * CHECK EXPECTED CONTENT
 * =========================================================
 */

function hasExpectedContent(
    code: string,
    step: DictatorStep
): boolean {

    const expected =
        step.expected.trim();


    if (!expected) {
        return false;
    }


    const normalized =
        normalizeCode(code);


    /*
     * -----------------------------------------------------
     * KEYWORD
     * -----------------------------------------------------
     */

    if (
        step.type === "keyword"
    ) {

        const regex =
            new RegExp(
                `\\b${expected}\\b`
            );

        return regex.test(
            normalized
        );
    }


    /*
     * -----------------------------------------------------
     * IDENTIFIER
     * -----------------------------------------------------
     */

    if (
        step.type === "identifier"
    ) {

        const regex =
            new RegExp(
                `\\b${expected}\\b`
            );

        return regex.test(
            normalized
        );
    }


    /*
     * -----------------------------------------------------
     * SYMBOL
     * -----------------------------------------------------
     */

    if (
        step.type === "symbol"
    ) {

        if (
            expected === "[]"
        ) {

            return (
                normalized.includes("[]")
            );
        }

        return normalized.includes(
            expected
        );
    }


    /*
     * -----------------------------------------------------
     * METHOD
     * -----------------------------------------------------
     */

    if (
        step.type === "method"
    ) {

        return normalized.includes(
            expected
        );
    }


    /*
     * -----------------------------------------------------
     * STATEMENT
     * -----------------------------------------------------
     */

    if (
        step.type === "statement"
    ) {

        /*
         * For a complete statement,
         * compare important content rather
         * than requiring identical whitespace.
         */

        const compactCode =
            normalized
                .replace(/\s+/g, "");

        const compactExpected =
            expected
                .replace(/\s+/g, "");

        return compactCode.includes(
            compactExpected
        );
    }


    /*
     * -----------------------------------------------------
     * STRUCTURE
     * -----------------------------------------------------
     */

    return normalized.includes(
        expected
    );
}


/*
 * =========================================================
 * PARTIAL PROGRESS CHECK
 * =========================================================
 */

function isPartialProgress(
    code: string,
    expected: string
): boolean {

    const normalized =
        normalizeCode(code);


    if (!normalized) {
        return false;
    }


    const words =
        normalized.split(/\s+/);


    const lastWord =
        words[words.length - 1]
            ?.replace(
                /[{}();,[\].]/g,
                ""
            )
            .toLowerCase();


    const expectedClean =
        expected
            .replace(
                /[{}();,[\].]/g,
                ""
            )
            .toLowerCase();


    if (
        !lastWord ||
        !expectedClean
    ) {

        return false;
    }


    return (
        expectedClean.startsWith(
            lastWord
        ) &&
        lastWord !== expectedClean
    );
}

/*
 * =========================================================
 * MAIN DICTATOR CHECKER
 * =========================================================
 */

export function checkDictatorStep(
    code: string,
    step: number,
    project: string,
    language: string = "java"
): DictatorCheckResult {

    const currentStep =
        getCurrentStep(
            project,
            step,
            language
        );


    /*
     * =====================================================
     * NO STEP FOUND
     * =====================================================
     */

    if (!currentStep) {

        return {
            correct: false,

            message:
                "🎙 This Dictator step could not be found.",

            speech:
                "This Dictator step could not be found."
        };
    }


    const expected =
        currentStep.expected.trim();


    /*
     * =====================================================
     * MISTAKE DETECTION
     * =====================================================
     */

    if (
        language.toLowerCase() ===
        "java"
    ) {

        const mistake =
            detectJavaMistake(
                code,
                expected,
                currentStep
            );


        if (mistake) {

            return {

                correct: false,

                message:
                    mistake.message,

                speech:
                    mistake.speech,

                concept:
                    currentStep.concept,

                explanation:
                    currentStep.explanation,

                why:
                    currentStep.why,

                example:
                    currentStep.example
            };
        }
    }


    /*
     * =====================================================
     * CHECK CURRENT STEP
     * =====================================================
     */

    if (
        hasExpectedContent(
            code,
            currentStep
        )
    ) {

        const plan =
            createDictatorPlan(
                project,
                language,
                "beginner"
            );


        const next =
            plan.find(
                item =>
                    item.step ===
                    step + 1
            );


        /*
         * =================================================
         * FINAL STEP
         * =================================================
         */

        if (!next) {

            return {

                correct: true,

                message:
                    `🎉 Excellent!\n\n` +

                    `🧠 Concept:\n` +
                    `${currentStep.concept}\n\n` +

                    `📖 Explanation:\n` +
                    `${currentStep.explanation}\n\n` +

                    `💡 Why?\n` +
                    `${currentStep.why}\n\n` +

                    `📝 Example:\n` +
                    `${currentStep.example}\n\n` +

                    `You completed the ${project} program.\n\n` +

                    `🎉 Your Dictator learning session is complete!`,

                speech:
                    `${currentStep.speech} ` +
                    `${currentStep.explanation} ` +
                    `Excellent! You completed the ${project} program. ` +
                    `Your Dictator learning session is complete.`,

                concept:
                    currentStep.concept,

                explanation:
                    currentStep.explanation,

                why:
                    currentStep.why,

                example:
                    currentStep.example
            };
        }


        /*
         * =================================================
         * CURRENT STEP COMPLETED
         * =================================================
         */

        return {

            correct: true,

            message:

                `✅ Correct!\n\n` +

                `🧠 Concept:\n` +
                `${currentStep.concept}\n\n` +

                `📖 Explanation:\n` +
                `${currentStep.explanation}\n\n` +

                `💡 Why do we need it?\n` +
                `${currentStep.why}\n\n` +

                `📝 Example:\n` +
                `${currentStep.example}\n\n` +

                `🎙 Next Step ${next.step}:\n` +
                `${next.instruction}`,

            nextStep:
                next.step,

            speech:

                `Correct. ` +

                `${currentStep.explanation} ` +

                `Now let's continue. ` +

                `${next.speech}`,

            concept:
                currentStep.concept,

            explanation:
                currentStep.explanation,

            why:
                currentStep.why,

            example:
                currentStep.example
        };
    }


    /*
     * =====================================================
     * PARTIAL INPUT
     * =====================================================
     */

    if (
        isPartialProgress(
            code,
            expected
        )
    ) {

        return {

            correct: false,

            message:

                `⚠️ You're close.\n\n` +

                `🧠 Current concept:\n` +
                `${currentStep.concept}\n\n` +

                `${currentStep.explanation}\n\n` +

                `The current step expects:\n` +
                `"${expected}"\n\n` +

                `💡 Hint:\n` +
                `${currentStep.hint}`,

            speech:

                `You're close. ` +

                `${currentStep.explanation} ` +

                `${currentStep.hint}`,

            concept:
                currentStep.concept,

            explanation:
                currentStep.explanation,

            why:
                currentStep.why,

            example:
                currentStep.example
        };
    }


    /*
     * =====================================================
     * NOT COMPLETE
     * =====================================================
     */

    return {

        correct: false,

        message:

            `❌ Step ${currentStep.step} is not complete yet.\n\n` +

            `🧠 Concept:\n` +
            `${currentStep.concept}\n\n` +

            `📖 ${currentStep.explanation}\n\n` +

            `🎯 Your task:\n` +
            `${currentStep.instruction}\n\n` +

            `💡 Hint:\n` +
            `${currentStep.hint}`,

        speech:

            `Step ${currentStep.step} is not complete yet. ` +

            `${currentStep.instruction} ` +

            `${currentStep.hint}`,

        concept:
            currentStep.concept,

        explanation:
            currentStep.explanation,

        why:
            currentStep.why,

        example:
            currentStep.example
    };
}


    

