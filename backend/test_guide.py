from orchestrator.orchestrator import AIOrchestrator


orchestrator = AIOrchestrator()


code = """
public class Main {

    public static void main(String[] args) {

        int x = ;

        System.out.println(x);

    }
}
"""


errors = [
    {
        "file": "Main.java",
        "line": 5,
        "column": 17,
        "message": "illegal start of expression",
        "severity": "error",
    }
]


result = orchestrator.guide(
    "java",
    code,
    errors,
)


print()
print("========== FINAL GUIDE RESULT ==========")
print(result)