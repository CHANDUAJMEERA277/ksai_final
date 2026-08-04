import React from "react";
import { Info, Lightbulb, ChevronRight } from "lucide-react";

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
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-8 mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent border-b border-white/5 pb-2"
        >
          {line.slice(2)}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-8 mb-4 flex items-center gap-2"
        >
          <span className="w-1.5 h-6 rounded bg-gradient-to-b from-blue-500 to-purple-600" />
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-xl font-bold text-slate-200 mt-6 mb-3 tracking-wide"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-base font-semibold text-slate-300 mt-4 mb-2 tracking-wide uppercase"
        >
          {line.slice(5)}
        </h4>
      );
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

      // Custom Mermaid flow rendering for premium aesthetics
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
          <div
            key={`mermaid-${i}`}
            className="my-6 p-6 rounded-3xl glass-panel border border-white/10 flex flex-col items-center gap-3 bg-gradient-to-b from-slate-900/90 via-[#0A0A10] to-indigo-950/30 shadow-2xl"
          >
            <div className="w-full text-center pb-2 border-b border-white/10 flex items-center justify-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              Architecture & System Flowchart
            </div>

            <div className="w-full flex flex-col items-center gap-2.5 pt-2">
              {nodesToDisplay.map((stepLabel, idx) => (
                <React.Fragment key={idx}>
                  <div className="w-full max-w-lg px-5 py-3.5 rounded-2xl glass-panel border border-indigo-500/20 text-xs font-extrabold text-indigo-200 flex items-center justify-between gap-3 shadow-lg shadow-black/25 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] flex items-center justify-center text-indigo-300 font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{stepLabel}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 shrink-0" />
                  </div>
                  {idx < nodesToDisplay.length - 1 && (
                    <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500/50 to-purple-500/50" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
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
