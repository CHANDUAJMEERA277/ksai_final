import { SupportedCourse } from "../knowledge-graph/types";

export interface CollegeOverviewMetrics {
  collegeName: string;
  totalStudents: number;
  activeCoursesCount: number;
  averageMasteryRate: number; // 0 - 100
  assessmentPassRate: number; // 0 - 100
  careerReadyPercentage: number;
}

export interface CourseHealthMetric {
  courseSlug: SupportedCourse;
  courseTitle: string;
  enrolledCount: number;
  averageMastery: number;
  commonWeakConcepts: Array<{ name: string; struggleRate: number }>;
  completionRate: number;
}

export interface FacultyInsight {
  id: string;
  category: "CURRICULUM_BOTTLENECK" | "ENGAGEMENT_SIGNAL" | "STUDENT_SUPPORT";
  title: string;
  insight: string;
  recommendedFacultyAction: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface CollegeAnalyticsData {
  overview: CollegeOverviewMetrics;
  courseHealth: CourseHealthMetric[];
  insights: FacultyInsight[];
  skillDistribution: Array<{ skillName: string; proficientPercentage: number }>;
  studentsNeedingSupportCount: number;
}
