import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ chapterSlug: string }>;
}

export default async function DirectJavaRoutePage({ params }: PageProps) {
  const { chapterSlug } = await params;
  
  // Extract digits from chapterSlug (e.g. "chapter1" -> 1, "chapter15" -> 15, "1" -> 1)
  const numMatch = chapterSlug.match(/\d+/);
  const chapterNumber = numMatch ? parseInt(numMatch[0], 10) : 1;

  redirect(`/courses/java/chapter/${chapterNumber}`);
}
