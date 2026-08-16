"use client";

import { useMemo, useState } from "react";

type VisualNode = {
  id?: string;
  label: string;
  description?: string;
};

type VisualData = {
  type?: "flow" | "sequence" | "diagram" | "comparison" | "linked_list";
  title?: string;
  description?: string;

  nodes?: VisualNode[];

  steps?: string[];

  before?: string[];
  after?: string[];

  operation?: string;

  columns?: {
    title: string;
    items: string[];
  }[];

  replayable?: boolean;
};

interface VisualNoteRendererProps {
  metadata?: string | VisualData | null;
  content?: string;
}

function parseVisual(
  metadata?: string | VisualData | null
): VisualData | null {
  if (!metadata) return null;

  if (typeof metadata === "object") {
    return metadata;
  }

  try {
    const parsed = JSON.parse(metadata);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export default function VisualNoteRenderer({
  metadata,
  content,
}: VisualNoteRendererProps) {
  const visual = useMemo(
    () => parseVisual(metadata),
    [metadata]
  );

  const [replayStep, setReplayStep] =
    useState(0);

  if (!visual) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="mb-2 text-sm font-semibold">
          🎨 Visual
        </div>

        <pre className="whitespace-pre-wrap text-sm leading-6">
          {content || "No visual content available."}
        </pre>
      </div>
    );
  }

  const type = visual.type || "flow";

  /*
   * FLOW
   */
  if (type === "flow") {
    const steps =
      visual.steps ||
      visual.nodes?.map(
        node => node.label
      ) ||
      [];

    return (
      <div className="rounded-2xl border border-border bg-background p-5">
        {visual.title && (
          <h3 className="mb-2 text-lg font-semibold">
            {visual.title}
          </h3>
        )}

        {visual.description && (
          <p className="mb-5 text-sm text-muted-foreground">
            {visual.description}
          </p>
        )}

        <div className="flex flex-col items-center gap-2">
          {steps.map((step, index) => (
            <div
              key={`${step}-${index}`}
              className="flex flex-col items-center"
            >
              <div
                className={`min-w-[180px] rounded-xl border px-5 py-3 text-center transition-all ${
                  visual.replayable &&
                  index > replayStep
                    ? "opacity-40"
                    : ""
                }`}
              >
                {step}
              </div>

              {index <
                steps.length - 1 && (
                <div className="py-1 text-xl">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>

        {visual.replayable &&
          steps.length > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setReplayStep(0)
                }
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() =>
                  setReplayStep(
                    Math.min(
                      replayStep + 1,
                      steps.length - 1
                    )
                  )
                }
                className="rounded-lg border px-3 py-2 text-sm"
              >
                ▶ Replay
              </button>
            </div>
          )}
      </div>
    );
  }

  /*
   * LINKED LIST
   */
  if (type === "linked_list") {
    const before =
      visual.before || [];

    const after =
      visual.after || [];

    return (
      <div className="rounded-2xl border border-border bg-background p-5">
        {visual.title && (
          <h3 className="mb-4 text-lg font-semibold">
            {visual.title}
          </h3>
        )}

        <div className="mb-5">
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Before
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {before.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-2"
              >
                <div className="rounded-lg border px-4 py-2 font-mono">
                  {item}
                </div>

                {index <
                  before.length - 1 && (
                  <span>→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {visual.operation && (
          <div className="my-5 rounded-xl border border-dashed p-4 text-center">
            <span className="text-sm font-medium">
              Operation:
            </span>{" "}
            {visual.operation}
          </div>
        )}

        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            After
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {after.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-2"
              >
                <div className="rounded-lg border px-4 py-2 font-mono">
                  {item}
                </div>

                {index <
                  after.length - 1 && (
                  <span>→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {visual.replayable && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm"
            >
              ▶ Replay
            </button>
          </div>
        )}
      </div>
    );
  }

  /*
   * SEQUENCE
   */
  if (type === "sequence") {
    const steps =
      visual.steps || [];

    return (
      <div className="rounded-2xl border border-border bg-background p-5">
        {visual.title && (
          <h3 className="mb-4 text-lg font-semibold">
            {visual.title}
          </h3>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={`${step}-${index}`}
              className="flex gap-4 rounded-xl border p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
                {index + 1}
              </div>

              <div className="pt-1 text-sm">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * COMPARISON
   */
  if (type === "comparison") {
    return (
      <div className="rounded-2xl border border-border bg-background p-5">
        {visual.title && (
          <h3 className="mb-4 text-lg font-semibold">
            {visual.title}
          </h3>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {(visual.columns || []).map(
            (column, index) => (
              <div
                key={`${column.title}-${index}`}
                className="rounded-xl border p-4"
              >
                <h4 className="mb-3 font-semibold">
                  {column.title}
                </h4>

                <ul className="space-y-2 text-sm">
                  {column.items.map(
                    (item, itemIndex) => (
                      <li
                        key={`${item}-${itemIndex}`}
                        className="flex gap-2"
                      >
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  /*
   * GENERIC DIAGRAM
   */
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      {visual.title && (
        <h3 className="mb-4 text-lg font-semibold">
          {visual.title}
        </h3>
      )}

      {visual.description && (
        <p className="mb-4 text-sm text-muted-foreground">
          {visual.description}
        </p>
      )}

      <div className="space-y-3">
        {(visual.nodes || []).map(
          (node, index) => (
            <div
              key={`${node.id || node.label}-${index}`}
              className="rounded-xl border p-4"
            >
              <div className="font-semibold">
                {node.label}
              </div>

              {node.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {node.description}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}