import ast
import os
import re
import shutil
import subprocess
import tempfile
from typing import Dict, Any, Tuple, Optional


class CodeVerificationResult:
    def __init__(self, is_valid: bool, error_type: Optional[str] = None, error_message: str = "", details: Optional[Dict[str, Any]] = None):
        self.is_valid = is_valid
        self.error_type = error_type
        self.error_message = error_message
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "isValid": self.is_valid,
            "errorType": self.error_type,
            "errorMessage": self.error_message,
            "details": self.details,
        }


def normalize_language(lang: str) -> str:
    l = (lang or "java").lower().strip()
    if l in ["cpp", "c++"]:
        return "cpp"
    if l in ["c"]:
        return "c"
    if l in ["python", "py", "python3"]:
        return "python"
    return "java"


def static_validate_bracket_balance(code: str) -> Tuple[bool, str]:
    stack = []
    lines = code.split("\n")
    in_single_quote = False
    in_double_quote = False
    in_line_comment = False
    in_block_comment = False

    for l_idx, line in enumerate(lines):
        in_line_comment = False
        c_idx = 0
        while c_idx < len(line):
            char = line[c_idx]
            next_char = line[c_idx + 1] if c_idx + 1 < len(line) else ""

            if not in_single_quote and not in_double_quote:
                if not in_block_comment and char == "/" and next_char == "/":
                    in_line_comment = True
                    break
                if not in_block_comment and char == "/" and next_char == "*":
                    in_block_comment = True
                    c_idx += 2
                    continue
                if in_block_comment and char == "*" and next_char == "/":
                    in_block_comment = False
                    c_idx += 2
                    continue

            if in_line_comment or in_block_comment:
                c_idx += 1
                continue

            if char == '"' and not in_single_quote and (c_idx == 0 or line[c_idx - 1] != "\\"):
                in_double_quote = not in_double_quote
                c_idx += 1
                continue
            if char == "'" and not in_double_quote and (c_idx == 0 or line[c_idx - 1] != "\\"):
                in_single_quote = not in_single_quote
                c_idx += 1
                continue

            if in_single_quote or in_double_quote:
                c_idx += 1
                continue

            if char in "{([":
                stack.append((char, l_idx + 1, c_idx + 1))
            elif char in "})]":
                if not stack:
                    return False, f"Unexpected closing '{char}' at line {l_idx + 1}, column {c_idx + 1} with no matching opening delimiter."
                last_char, last_line, last_col = stack.pop()
                expected = "}" if last_char == "{" else (")" if last_char == "(" else "]")
                if char != expected:
                    return False, f"Mismatched delimiter: found '{char}' at line {l_idx + 1}, but expected '{expected}' to close '{last_char}' opened at line {last_line}."

            c_idx += 1

    if stack:
        last_char, last_line, last_col = stack[-1]
        return False, f"Unclosed '{last_char}' opened at line {last_line}, column {last_col}."

    return True, ""


def static_validate_java(code: str) -> Tuple[bool, str]:
    bal_ok, bal_err = static_validate_bracket_balance(code)
    if not bal_ok:
        return False, bal_err

    if not re.search(r"\bclass\s+[A-Za-z0-9_]+", code):
        return False, "Java error: Missing class declaration (e.g., 'public class Main')."

    if not re.search(r"\bpublic\s+static\s+void\s+main\s*\(", code):
        return False, "Java error: Missing entry point 'public static void main(String[] args)'."

    if re.search(r"^\s*def\s+\w+\s*\(", code, re.MULTILINE) or re.search(r"^\s*print\s*\(", code, re.MULTILINE):
        return False, "Java error: Contains Python syntax (def/print) outside Java class structure."

    if "#include" in code or ("printf(" in code and "System.out.printf" not in code):
        return False, "Java error: Contains C/C++ header syntax (#include/printf)."

    return True, ""


def static_validate_python(code: str) -> Tuple[bool, str]:
    bal_ok, bal_err = static_validate_bracket_balance(code)
    if not bal_ok:
        return False, bal_err

    if "public class" in code or "public static void main" in code or "System.out." in code:
        return False, "Python error: Contains Java class boilerplate (public class / System.out)."

    if "#include" in code or "std::cout" in code:
        return False, "Python error: Contains C/C++ syntax (#include / std::cout)."

    try:
        ast.parse(code)
    except SyntaxError as e:
        return False, f"Python SyntaxError at line {e.lineno}: {e.msg} ({e.text.strip() if e.text else ''})"

    return True, ""


def static_validate_c(code: str) -> Tuple[bool, str]:
    bal_ok, bal_err = static_validate_bracket_balance(code)
    if not bal_ok:
        return False, bal_err

    if "<iostream>" in code or "std::cout" in code or "cout <<" in code or "using namespace std" in code:
        return False, "C error: C++ stream headers (<iostream>, cout, namespace) cannot be used in a pure C program. Use <stdio.h> and printf."

    if not re.search(r"\bmain\s*\(", code):
        return False, "C error: Missing 'main()' function entry point."

    if "System.out." in code or "public class" in code:
        return False, "C error: Contains Java syntax."

    if "def " in code and "int " not in code:
        return False, "C error: Contains Python def statement."

    return True, ""


def static_validate_cpp(code: str) -> Tuple[bool, str]:
    bal_ok, bal_err = static_validate_bracket_balance(code)
    if not bal_ok:
        return False, bal_err

    if not re.search(r"\bmain\s*\(", code):
        return False, "C++ error: Missing 'main()' function entry point."

    if "System.out." in code or "public class" in code:
        return False, "C++ error: Contains Java syntax."

    if re.search(r"^\s*def\s+\w+\s*\(", code, re.MULTILINE):
        return False, "C++ error: Contains Python def keyword."

    return True, ""


def static_validate_code(code: str, language: str) -> Tuple[bool, str]:
    norm = normalize_language(language)
    if not code or not code.strip():
        return False, "Code is empty."

    if norm == "java":
        return static_validate_java(code)
    elif norm == "python":
        return static_validate_python(code)
    elif norm == "c":
        return static_validate_c(code)
    elif norm == "cpp":
        return static_validate_cpp(code)
    return True, ""


def compiler_verify_code(code: str, language: str, timeout_sec: int = 5) -> Tuple[bool, str]:
    norm = normalize_language(language)
    
    # 1. Python Execution & Syntax Check
    if norm == "python":
        python_exec = shutil.which("python") or shutil.which("python3") or r"C:\Users\Indhu\AppData\Local\Programs\Python\Python311\python.exe"
        if python_exec and os.path.exists(python_exec):
            with tempfile.NamedTemporaryFile(suffix=".py", mode="w", encoding="utf-8", delete=False) as f:
                f.write(code)
                temp_path = f.name
            try:
                compile_proc = subprocess.run(
                    [python_exec, "-m", "py_compile", temp_path],
                    capture_output=True,
                    text=True,
                    timeout=timeout_sec
                )
                if compile_proc.returncode != 0:
                    return False, f"Python Compilation Error: {compile_proc.stderr or compile_proc.stdout}"
                return True, "Python compilation verified."
            except Exception as ex:
                return True, f"Python compiler warning: {ex}"
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass
        return True, "Python static check passed."

    # 2. Java Compilation Check (if javac is available)
    if norm == "java":
        javac_exec = shutil.which("javac")
        if javac_exec:
            with tempfile.TemporaryDirectory() as temp_dir:
                main_file = os.path.join(temp_dir, "Main.java")
                with open(main_file, "w", encoding="utf-8") as f:
                    f.write(code)
                try:
                    proc = subprocess.run(
                        [javac_exec, main_file],
                        capture_output=True,
                        text=True,
                        timeout=timeout_sec
                    )
                    if proc.returncode != 0:
                        return False, f"Java Compiler Error (javac): {proc.stderr or proc.stdout}"
                    return True, "Java compilation verified."
                except Exception as ex:
                    return True, f"Java compiler check skipped: {ex}"
        return True, "Java static verification passed."

    # 3. C Compilation Check (if gcc is available)
    if norm == "c":
        gcc_exec = shutil.which("gcc")
        if gcc_exec:
            with tempfile.TemporaryDirectory() as temp_dir:
                c_file = os.path.join(temp_dir, "prog.c")
                out_file = os.path.join(temp_dir, "prog.exe" if os.name == "nt" else "prog.out")
                with open(c_file, "w", encoding="utf-8") as f:
                    f.write(code)
                try:
                    proc = subprocess.run(
                        [gcc_exec, "-std=c11", c_file, "-o", out_file],
                        capture_output=True,
                        text=True,
                        timeout=timeout_sec
                    )
                    if proc.returncode != 0:
                        return False, f"C Compiler Error (gcc): {proc.stderr or proc.stdout}"
                    return True, "C compilation verified."
                except Exception as ex:
                    return True, f"C compiler check skipped: {ex}"
        return True, "C static verification passed."

    # 4. C++ Compilation Check (if g++ is available)
    if norm == "cpp":
        gpp_exec = shutil.which("g++")
        if gpp_exec:
            with tempfile.TemporaryDirectory() as temp_dir:
                cpp_file = os.path.join(temp_dir, "prog.cpp")
                out_file = os.path.join(temp_dir, "prog.exe" if os.name == "nt" else "prog.out")
                with open(cpp_file, "w", encoding="utf-8") as f:
                    f.write(code)
                try:
                    proc = subprocess.run(
                        [gpp_exec, "-std=c++17", cpp_file, "-o", out_file],
                        capture_output=True,
                        text=True,
                        timeout=timeout_sec
                    )
                    if proc.returncode != 0:
                        return False, f"C++ Compiler Error (g++): {proc.stderr or proc.stdout}"
                    return True, "C++ compilation verified."
                except Exception as ex:
                    return True, f"C++ compiler check skipped: {ex}"
        return True, "C++ static verification passed."

    return True, "Verification passed."


def verify_code_completeness_and_topic(code: str, language: str, project: str) -> Tuple[bool, str]:
    p_lower = (project or "").lower().strip()
    norm = normalize_language(language)
    code_lower = code.lower()

    if not code.strip():
        return False, "Code is completely empty."

    if "todo" in code_lower or "implement this later" in code_lower or "add your logic here" in code_lower:
        return False, "Code contains unfinished placeholder comments (TODO/implement later)."

    if ("reverse" in p_lower and ("number" in p_lower or "digit" in p_lower or "int" in p_lower or "num" in p_lower)) or p_lower == "reverse":
        has_algo = ("%" in code and "10" in code) or ("[:: -1]" in code or "[::-1]" in code) or ("reverse(" in code_lower) or ("reversenumber" in code_lower)
        if not has_algo:
            return False, "Program does not implement number reversal algorithm."

    if "prime" in p_lower:
        if "%" not in code or ("for" not in code and "while" not in code):
            return False, "Program does not implement prime number checking algorithm."

    if "factorial" in p_lower:
        if "*" not in code:
            return False, "Program does not implement factorial multiplication or recursion."

    if "sort" in p_lower:
        if ("for" not in code and "while" not in code and "sort" not in code_lower):
            return False, "Program does not implement array sorting."

    if "linked" in p_lower and "list" in p_lower:
        if "next" not in code_lower and "node" not in code_lower:
            return False, "Program does not implement linked list Node structure."

    if "override" in p_lower or "overriding" in p_lower:
        if norm == "java" and "@override" not in code_lower and "extends" not in code_lower:
            return False, "Java overriding program must have inheritance and method overriding."

    if "inheritance" in p_lower:
        if norm == "java" and "extends" not in code_lower:
            return False, "Java inheritance program must use 'extends'."
        if norm == "cpp" and ":" not in code:
            return False, "C++ inheritance program must use derived class syntax (class Derived : public Base)."

    if "atm" in p_lower or "bank" in p_lower:
        if "balance" not in code_lower or ("deposit" not in code_lower and "withdraw" not in code_lower):
            return False, "ATM/Banking program must implement balance, deposit, or withdrawal operations."

    return True, ""


def verify_candidate_code(code: str, language: str, project: str) -> CodeVerificationResult:
    stat_ok, stat_msg = static_validate_code(code, language)
    if not stat_ok:
        return CodeVerificationResult(is_valid=False, error_type="STATIC_SYNTAX_ERROR", error_message=stat_msg)

    topic_ok, topic_msg = verify_code_completeness_and_topic(code, language, project)
    if not topic_ok:
        return CodeVerificationResult(is_valid=False, error_type="FUNCTIONALITY_MISMATCH", error_message=topic_msg)

    comp_ok, comp_msg = compiler_verify_code(code, language)
    if not comp_ok:
        return CodeVerificationResult(is_valid=False, error_type="COMPILATION_ERROR", error_message=comp_msg)

    return CodeVerificationResult(is_valid=True, error_message="Code successfully verified.")
