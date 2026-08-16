from orchestrator.orchestrator import AIOrchestrator


orchestrator = AIOrchestrator()


result = orchestrator.chat(
    "java",

    """public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}""",

    [],

    "Explain what this code does.",
)


print("\n========== FINAL RESULT ==========\n")

print(result)