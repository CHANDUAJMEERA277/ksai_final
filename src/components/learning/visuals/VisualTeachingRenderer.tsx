"use client";

import React from "react";
import { TeachingInstruction } from "@/types/teaching-types";
import { MemoryVisualizer } from "./MemoryVisualizer";
import { CodeWalkthroughVisualizer } from "./CodeWalkthroughVisualizer";
import { FlowAndControlVisualizer } from "./FlowAndControlVisualizer";
import { DataStructuresVisualizer } from "./DataStructuresVisualizer";
import { PointerMemoryVisualizer } from "./PointerMemoryVisualizer";
import { InteractiveQuestionCard } from "./InteractiveQuestionCard";

interface VisualTeachingRendererProps {
  instruction: TeachingInstruction;
  activeSentenceIndex?: number;
  onAnswerSubmit?: (isCorrect: boolean, answer: string) => void;
  onStepChange?: (stepIndex: number) => void;
}

export function VisualTeachingRenderer({
  instruction,
  activeSentenceIndex = 0,
  onAnswerSubmit,
  onStepChange,
}: VisualTeachingRendererProps) {
  const { visualType, language = "python" } = instruction;

  if (!visualType) return null;

  switch (visualType) {
    case "MEMORY_DIAGRAM":
    case "VARIABLE_VISUALIZATION":
      return (
        <MemoryVisualizer
          data={instruction.memoryData}
          variables={instruction.variablesData}
          language={language}
          activeStep={activeSentenceIndex}
        />
      );

    case "CODE_WALKTHROUGH":
      if (instruction.codeWalkthrough) {
        return (
          <CodeWalkthroughVisualizer
            data={instruction.codeWalkthrough}
            activeStepIndex={activeSentenceIndex}
            onStepChange={onStepChange}
            language={language}
          />
        );
      }
      return null;

    case "POINTER_MEMORY_VISUALIZATION":
      if (instruction.pointerData) {
        return <PointerMemoryVisualizer data={instruction.pointerData} />;
      }
      return null;

    case "FLOW_DIAGRAM":
    case "LOOP_VISUALIZATION":
    case "CONDITIONAL_FLOW":
    case "FUNCTION_FLOW":
      return (
        <FlowAndControlVisualizer
          flowData={instruction.flowDiagram}
          loopData={instruction.loopData}
          conditionalData={instruction.conditionalData}
          activeStep={activeSentenceIndex}
        />
      );

    case "ARRAY_VISUALIZATION":
    case "STACK_VISUALIZATION":
    case "QUEUE_VISUALIZATION":
    case "LINKED_LIST_VISUALIZATION":
    case "TREE_VISUALIZATION":
    case "OBJECT_CLASS_VISUALIZATION":
      return (
        <DataStructuresVisualizer
          arrayData={instruction.arrayData}
          stackQueueData={instruction.stackQueueData}
          linkedListData={instruction.linkedListData}
          treeData={instruction.treeData}
          objectClassData={instruction.objectClassData}
        />
      );

    case "QUESTION_INTERACTION":
    case "CODE_PREDICTION":
    case "DEBUGGING_VISUALIZATION":
      return (
        <InteractiveQuestionCard
          questionData={instruction.questionData}
          predictionData={instruction.predictionData}
          debuggingData={instruction.debuggingData}
          onAnswerSubmit={onAnswerSubmit}
        />
      );

    default:
      return null;
  }
}
