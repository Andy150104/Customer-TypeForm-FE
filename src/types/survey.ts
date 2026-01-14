export interface Survey1FormValues {
  semester: string; // Kỳ học
  major: string; // Chuyên ngành chính (luôn hiển thị)
  specialization?: string; // Chuyên ngành hẹp (chỉ hiển thị khi kỳ > 4 và có major)
  learningGoal: string; // Mục tiêu học tập
  interestSurveyAnswers?: InterestSurveyAnswer[]; // Câu trả lời khảo sát sở thích (khi chọn "Chưa có định hướng")
}

export interface InterestSurveyAnswer {
  questionId: string;
  selectedAnswerId: string;
}

export interface InterestSurveyQuestion {
  questionId: string;
  questionText: string;
  questionType: number; // 4 = single choice
  answers: InterestSurveyAnswerOption[];
}

export interface InterestSurveyAnswerOption {
  answerId: string;
  answerText: string;
  isCorrect: boolean; // Trong khảo sát sở thích, tất cả đều false
}

export interface SemesterOption {
  label: string;
  value: string;
}

export interface SpecializationOption {
  label: string;
  value: string;
}

export interface LearningGoalOption {
  label: string;
  value: string;
}

export interface InterestOption {
  label: string;
  value: string;
  description?: string;
}

// ============ SURVEY 2: Technology Knowledge ============
export interface Survey2FormValues {
  programmingLanguages: TechnologyLevel[]; // Ngôn ngữ lập trình
  frameworks: TechnologyLevel[]; // Framework
  tools: TechnologyLevel[]; // Tool
  platforms: TechnologyLevel[]; // Platform
  databases: TechnologyLevel[]; // Database
  others?: TechnologyLevel[]; // Other
}

export interface TechnologyLevel {
  technologyId: string;
  technologyName: string;
  level: TechLevel; // Mức độ am hiểu
}

export type TechLevel =
  | "none"
  | "basic"
  | "intermediate"
  | "advanced"
  | "expert";

export interface TechnologyOption {
  id: string;
  name: string;
  type: TechnologyType;
  description?: string;
}

export type TechnologyType =
  | "programming_language"
  | "framework"
  | "tool"
  | "platform"
  | "database"
  | "other";

// ============ SURVEY 3: Study Habits ============
export interface Survey3FormValues {
  studyHabits: StudyHabitAnswer[];
}

export interface StudyHabitAnswer {
  questionId: string;
  selectedAnswers: string[]; // Có thể chọn nhiều đáp án
}

export interface StudyHabitQuestion {
  id: string;
  questionText: string;
  questionType: SurveyQuestionType;
  answers: StudyHabitAnswerOption[];
  isRequired: boolean;
  allowMultiple: boolean; // Cho phép chọn nhiều đáp án
}

export interface StudyHabitAnswerOption {
  id: string;
  answerText: string;
  value: string;
}

export type SurveyQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "text"
  | "rating";

// ============ COMBINED SURVEY DATA ============
export interface CompleteSurveyData {
  survey1: Survey1FormValues;
  survey2: Survey2FormValues;
  survey3: Survey3FormValues;
  completedAt: Date;
  userId: string;
}

// ============ SURVEY FLOW STATE ============
export interface SurveyFlowState {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
  survey1Data: Survey1FormValues | null;
  survey2Data: Survey2FormValues | null;
  survey3Data: Survey3FormValues | null;
  isLoading: boolean;
  error: string | null;
}

// ============ API RESPONSE TYPES ============
export interface SurveyDataResponse {
  semesters: SemesterOption[];
  specializations: SpecializationOption[];
  learningGoals: LearningGoalOption[];
  interests: InterestOption[];
  technologies: TechnologyOption[];
  studyHabitQuestions: StudyHabitQuestion[];
}

export interface SurveySubmissionRequest {
  survey1: Survey1FormValues;
  survey2: Survey2FormValues;
  survey3: Survey3FormValues;
}

export interface SurveySubmissionResponse {
  success: boolean;
  message: string;
  submissionId: string;
}

// ============ CONSTANTS ============
export const TECH_LEVELS: { label: string; value: TechLevel }[] = [
  { label: "Không biết", value: "none" },
  { label: "Cơ bản", value: "basic" },
  { label: "Trung bình", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
  { label: "Chuyên gia", value: "expert" },
];

export const TECHNOLOGY_TYPES: { label: string; value: TechnologyType }[] = [
  { label: "Ngôn ngữ lập trình", value: "programming_language" },
  { label: "Framework", value: "framework" },
  { label: "Tool", value: "tool" },
  { label: "Platform", value: "platform" },
  { label: "Database", value: "database" },
  { label: "Khác", value: "other" },
];

// ============ UTILITY TYPES ============
export type SurveyStep = 1 | 2 | 3;

export interface SurveyStepInfo {
  step: SurveyStep;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}