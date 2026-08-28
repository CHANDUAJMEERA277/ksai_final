import { NextRequest, NextResponse } from "next/server";
import { getConceptsByCourse, CANONICAL_PREREQUISITES } from "@/lib/knowledge-graph/concept-registry";
import { SupportedCourse } from "@/lib/knowledge-graph/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const course = (request.nextUrl.searchParams.get("course") || "python").toLowerCase() as SupportedCourse;
    const concepts = getConceptsByCourse(course);
    const conceptSlugs = new Set(concepts.map((c) => c.slug));

    const edges = CANONICAL_PREREQUISITES.filter(
      (e) => conceptSlugs.has(e.fromConceptSlug) || conceptSlugs.has(e.toConceptSlug)
    );

    return NextResponse.json({
      success: true,
      data: {
        course,
        concepts,
        edges,
      },
    });
  } catch (error: any) {
    console.error("Knowledge Graph concepts GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load knowledge graph structure." },
      { status: 500 }
    );
  }
}
