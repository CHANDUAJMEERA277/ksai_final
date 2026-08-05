import React, { useState } from "react";
import { Info, Lightbulb, ChevronRight, ChevronDown, Sparkles } from "lucide-react";

function getConceptDetail(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("preprocessor") || t.includes("phase 1")) {
    return "Phase 1: Preprocessor scans your source code for lines starting with '#'. It expands included header files (#include), substitutes macro definitions (#define), and strips comments out before compilation begins.";
  }
  if (t.includes("compiler") || t.includes("phase 2")) {
    return "Phase 2: Compiler checks syntax and static types within a single translation unit. It translates preprocessed C++ source text into architecture-specific CPU assembly code (.s).";
  }
  if (t.includes("assembler") || t.includes("phase 3")) {
    return "Phase 3: Assembler converts intermediate CPU assembly text into binary machine code object files (.o or .obj) containing raw machine instructions.";
  }
  if (t.includes("linker") || t.includes("phase 4")) {
    return "Phase 4: Linker stitches together all compiled object files (.o/.obj) and external system libraries (e.g. libstdc++). It resolves symbol addresses and outputs the final executable binary.";
  }
  if (t.includes("scope resolution") || t.includes("::")) {
    return "Scope Resolution Operator (::): Operates at the highest precedence level. Accesses global variables, namespace symbols (std::cout), or static class members.";
  }
  if (t.includes("postfix") || t.includes("->")) {
    return "Postfix Operators (() [] . ->): Evaluated left-to-right. Used for function calls, array indexing, struct/class dot member access, and pointer arrow dereference.";
  }
  if (t.includes("unary") || t.includes("sizeof")) {
    return "Unary Operators (++ -- ! ~ sizeof): Evaluated right-to-left. Performs increment/decrement, logical NOT, bitwise NOT, type casting, and compile-time byte sizing.";
  }
  if (t.includes("multiplicative") || t.includes("* / %")) {
    return "Multiplicative Operators (* / %): Takes precedence over addition/subtraction. Performs multiplication, division (with integer truncation), and modulus remainder calculation.";
  }
  if (t.includes("additive") || t.includes("+ -")) {
    return "Additive Operators (+ -): Evaluated left-to-right after multiplicative operators for basic addition and subtraction.";
  }
  if (t.includes("shift") || t.includes("<<")) {
    return "Shift & Stream I/O (<< >>): Used for bitwise left/right shift operations and streaming data into std::cout or out of std::cin.";
  }
  if (t.includes("relational") || t.includes("< >")) {
    return "Relational Operators (< <= > >=): Evaluates numeric order comparisons between variables, returning boolean true or false.";
  }
  if (t.includes("equality") || t.includes("==")) {
    return "Equality Operators (== !=): Checks whether two values are strictly equal or not equal. Caution: Avoid comparing floating-point numbers directly with ==.";
  }
  if (t.includes("logical and") || t.includes("&&")) {
    return "Logical AND (&&): Performs short-circuit evaluation. If the first operand evaluates to false, the second operand is never executed.";
  }
  if (t.includes("logical or") || t.includes("||")) {
    return "Logical OR (||): Performs short-circuit evaluation. If the first operand evaluates to true, the second operand is skipped.";
  }
  if (t.includes("assignment") || t.includes("=")) {
    return "Assignment Operators (= += -= *= /=): Operates right-to-left. Updates variable values in-place, returning the assigned reference.";
  }
  if (t.includes("lvalue")) {
    return "Lvalue (Locator Value): Refers to a persistent object with a named address in RAM that survives beyond the current expression.";
  }
  if (t.includes("rvalue")) {
    return "Rvalue (Read Value): A temporary expiring value without a persistent memory address (literals, temporary calculations) whose resources can be safely stolen via move semantics.";
  }

  return `System Concept: ${title}. Click to review architecture, execution mechanics, and memory allocation details for this step in Modern C++.`;
}

function InteractiveFlowchart({ nodes }: { nodes: string[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="my-6 p-6 rounded-3xl glass-panel border border-white/10 flex flex-col items-center gap-3 bg-gradient-to-b from-slate-900/90 via-[#0A0A10] to-indigo-950/30 shadow-2xl">
      <div className="w-full text-center pb-2 border-b border-white/10 flex items-center justify-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
        <Sparkles size={14} className="animate-pulse" />
        Interactive Architecture & System Flowchart (Click block or arrow for details)
      </div>

      <div className="w-full flex flex-col items-center gap-2.5 pt-2">
        {nodes.map((stepLabel, idx) => {
          const isExpanded = expandedIndex === idx;
          const detailText = getConceptDetail(stepLabel);

          return (
            <React.Fragment key={idx}>
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className={`w-full max-w-lg p-4 rounded-2xl glass-panel border text-xs font-extrabold flex flex-col gap-3 shadow-lg transition-all cursor-pointer select-none ${
                  isExpanded
                    ? "bg-indigo-600/20 border-indigo-400 text-white shadow-indigo-500/20"
                    : "bg-white/5 border-indigo-500/20 text-indigo-200 hover:border-indigo-500/50 hover:bg-indigo-500/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-full border text-xs flex items-center justify-center font-mono font-bold shrink-0 transition-all ${
                      isExpanded
                        ? "bg-indigo-500 text-slate-950 border-indigo-300"
                        : "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate text-sm">{stepLabel}</span>
                  </div>

                  <div className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                    isExpanded ? "bg-indigo-500/30 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-indigo-500/30 text-xs font-normal text-slate-200 leading-relaxed space-y-2 animate-fadeIn">
                    <div className="flex items-start gap-2 text-indigo-300 font-bold">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <span>Detailed Concept Explanation:</span>
                    </div>
                    <p className="pl-6 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                      {detailText}
                    </p>
                  </div>
                )}
              </div>

              {idx < nodes.length - 1 && (
                <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500/50 to-purple-500/50" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Inline helper to parse bold, italic, and inline code
function parseInline(text: string): React.ReactNode[] {
  // Regex to match bold (**text**) or inline code (`code`)
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const matches = text.split(regex);

  return matches.map((match, idx) => {
    if (match.startsWith("**") && match.endsWith("**")) {
      return (
        <strong key={idx} className="font-extrabold text-white text-shadow-sm">
          {match.slice(2, -2)}
        </strong>
      );
    } else if (match.startsWith("`") && match.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-cyan-300 text-xs shadow-inner"
        >
          {match.slice(1, -1)}
        </code>
      );
    }
    return match;
  });
}

export function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // 1. Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // 2. Headings
    if (/^#+\s/.test(line)) {
      const level = line.match(/^(#+)\s/)?.[1].length || 1;
      const titleText = line.replace(/^#+\s/, "").trim();

      if (level === 1) {
        elements.push(
          <h1
            key={`h1-${i}`}
            className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-8 mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent border-b border-white/5 pb-2"
          >
            {titleText}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-8 mb-4 flex items-center gap-2"
          >
            <span className="w-1.5 h-6 rounded bg-gradient-to-b from-blue-500 to-purple-600" />
            {titleText}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-xl font-bold text-slate-200 mt-6 mb-3 tracking-wide"
          >
            {titleText}
          </h3>
        );
      } else if (level === 4) {
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-base font-semibold text-slate-300 mt-4 mb-2 tracking-wide uppercase"
          >
            {titleText}
          </h4>
        );
      } else if (level === 5) {
        elements.push(
          <h5
            key={`h5-${i}`}
            className="text-sm font-bold text-indigo-300 mt-4 mb-2 tracking-wide flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {titleText}
          </h5>
        );
      } else {
        elements.push(
          <h6
            key={`h6-${i}`}
            className="text-xs font-semibold text-slate-400 mt-3 mb-1 uppercase tracking-wider"
          >
            {titleText}
          </h6>
        );
      }
      i++;
      continue;
    }

    // 3. Horizontal Rule
    if (line === "---") {
      elements.push(
        <hr key={`hr-${i}`} className="border-t border-white/10 my-8" />
      );
      i++;
      continue;
    }

    // 4. Code Blocks
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```

      const codeText = codeLines.join("\n");

      // Custom Mermaid flow rendering for premium interactive aesthetics
      if (lang === "mermaid") {
        // Extract node labels dynamically from the markdown source code
        const extractedNodes: string[] = [];
        const codeLinesList = codeText.split("\n");

        for (const l of codeLinesList) {
          const trimmed = l.trim();
          if (!trimmed || trimmed.startsWith("graph") || trimmed.startsWith("timeline") || trimmed.startsWith("title")) {
            continue;
          }

          // Match patterns: Node["Label"] or Node[Label] or Node("Label") or Node(Label)
          const bracketMatches = [...trimmed.matchAll(/(?:\["([^"]+)"\]|\[([^\]]+)\]|\("([^"]+)"\)|\(([^)]+)\))/g)];
          for (const m of bracketMatches) {
            const label = (m[1] || m[2] || m[3] || m[4] || "").trim();
            if (label && !extractedNodes.includes(label)) {
              extractedNodes.push(label);
            }
          }
        }

        const nodesToDisplay = extractedNodes.length > 0
          ? extractedNodes
          : codeLinesList.map(l => l.trim()).filter(l => l && !l.startsWith("graph"));

        elements.push(
          <InteractiveFlowchart key={`mermaid-${i}`} nodes={nodesToDisplay} />
        );
        continue;
      }

      elements.push(
        <div
          key={`code-${i}`}
          className="my-5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group bg-[#0D0D12]"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#06060A] text-[10px] font-mono text-slate-400">
            <span>{lang.toUpperCase() || "CODE"}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">Copy</span>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed custom-scrollbar">
            <code>{codeText}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 5. Blockquotes & Custom Alert Boxes
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().slice(1).trim());
        i++;
      }

      const quoteText = quoteLines.join(" ");

      if (quoteText.startsWith("[!NOTE]")) {
        elements.push(
          <div
            key={`alert-note-${i}`}
            className="my-5 p-5 rounded-2xl bg-blue-500/10 border-l-4 border-blue-500 text-slate-300 text-xs sm:text-sm flex gap-3.5 shadow-xl shadow-blue-500/5"
          >
            <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <div className="font-extrabold text-white text-xs uppercase tracking-wider">Key Note</div>
              <div>{parseInline(quoteText.replace("[!NOTE]", "").trim())}</div>
            </div>
          </div>
        );
      } else if (quoteText.startsWith("[!TIP]")) {
        elements.push(
          <div
            key={`alert-tip-${i}`}
            className="my-5 p-5 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 text-slate-300 text-xs sm:text-sm flex gap-3.5 shadow-xl shadow-emerald-500/5"
          >
            <Lightbulb className="text-emerald-400 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <div className="font-extrabold text-white text-xs uppercase tracking-wider">Pro Tip</div>
              <div>{parseInline(quoteText.replace("[!TIP]", "").trim())}</div>
            </div>
          </div>
        );
      } else {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="my-5 p-4 rounded-2xl bg-white/5 border-l-4 border-purple-500 text-slate-300 text-xs sm:text-sm italic pl-5"
          >
            {parseInline(quoteText)}
          </blockquote>
        );
      }
      continue;
    }

    // 6. Lists (Unordered / Ordered)
    if (line.startsWith("* ") || line.startsWith("- ") || /^\d+\.\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      const isOrdered = /^\d+\.\s/.test(line);

      while (
        i < lines.length &&
        (lines[i].trim().startsWith("* ") ||
          lines[i].trim().startsWith("- ") ||
          /^\d+\.\s/.test(lines[i].trim()))
      ) {
        const itemLine = lines[i].trim();
        const contentStr = itemLine.replace(/^(\*\s|-\s|\d+\.\s)/, "");
        listItems.push(
          <li
            key={`li-${i}`}
            className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-2.5"
          >
            <span className="text-cyan-400 shrink-0 mt-1.5 font-bold">•</span>
            <span>{parseInline(contentStr)}</span>
          </li>
        );
        i++;
      }

      elements.push(
        <ul key={`ul-${i}`} className="space-y-2 my-4 pl-2">
          {listItems}
        </ul>
      );
      continue;
    }

    // 7. Markdown Tables
    if (line.startsWith("|")) {
      const headers = line
        .split("|")
        .map((x) => x.trim())
        .filter((x) => x);
      i++; // Skip header
      // Check for separator line e.g. | :--- | :--- |
      if (i < lines.length && lines[i].trim().includes("---")) {
        i++;
      }

      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const rowData = lines[i]
          .split("|")
          .map((x) => x.trim())
          .filter((x) => x);
        if (rowData.length > 0) {
          rows.push(rowData);
        }
        i++;
      }

      elements.push(
        <div key={`table-${i}`} className="my-6 overflow-hidden rounded-2xl border border-white/10 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0C0C14] border-b border-white/10 text-slate-300 font-bold uppercase tracking-wider font-mono">
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-3.5 font-extrabold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/5">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-white/5 transition-colors text-slate-300"
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 font-medium">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 8. Default: Paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-slate-300 leading-relaxed my-4 text-justify"
      >
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-4 font-sans leading-relaxed">{elements}</div>;
}
