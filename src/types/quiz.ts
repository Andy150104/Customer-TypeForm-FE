// File định nghĩa interface, types, enum liên quan đến quiz

// ======================== ENUMS ========================
export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
  SINGLE_CHOICE = "single_choice",
}

export function mapBackendQuestionType(type: number | string): QuestionType {
  switch (type) {
    case 1:
    case "1":
      return QuestionType.MULTIPLE_CHOICE; // Chọn nhiều đáp án
    case 2:
    case "2":
      return QuestionType.TRUE_FALSE; // Đúng/Sai
    case 3:
    case "3":
      return QuestionType.SINGLE_CHOICE; // Chọn 1 đáp án
    default:
      return QuestionType.SINGLE_CHOICE;
  }
}

export enum QuestionDifficulty {
  EASY = "Dễ",
  MEDIUM = "Trung bình",
  HARD = "Khó",
}

export function mapBackendDifficulty(
  level: number | string,
): QuestionDifficulty {
  switch (level) {
    case 1:
    case "1":
      return QuestionDifficulty.EASY;
    case 2:
    case "2":
      return QuestionDifficulty.MEDIUM;
    case 3:
    case "3":
      return QuestionDifficulty.HARD;
    default:
      return QuestionDifficulty.MEDIUM;
  }
}

// ======================== API RESPONSE TYPES ========================
// Exact types matching backend API format

export interface QuizListItem {
  quizId: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectCodeName: string;
  totalQuestions: number;
  difficultyLevel: string;
}

export interface QuizListResponse {
  response: QuizListItem[];
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: null;
}

export interface QuizAnswer {
  answerId: string;
  answerText: string;
  isCorrectAnswer?: boolean;
  selectedByStudent?: boolean;
}

export interface QuizQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  answers: QuizAnswer[];
  answerExplanation?: string;
  difficultyLevel: number;
}

export interface QuizDetail {
  quizId: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectCodeName: string;
  totalQuestions: number;
  difficultyLevel: string;
  questions: QuizQuestion[];
  correctedQuestions?: number;
  questionsResult?: QuizQuestion[];
}

export interface TestDetail {
  testId: string;
  testName: string;
  description: string;
  quizzes: QuizDetail[];
}

export interface TestDetailResponse {
  response: TestDetail;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: null;
}

export interface StudentTestResult {
  studentTestId: string;
  testId: string;
  testName: string;
  description: string;
  startedAt: string;
  finishedAt: string;
  quizzesResults: QuizDetail[];
}

export interface StudentTestResultResponse {
  response: StudentTestResult;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: null;
}

export interface SubmitTestRequest {
  testId: string;
  answers: Array<{
    questionId: string;
    selectedAnswers: string[];
  }>;
}

export interface SubmitTestResponse {
  response: {
    studentTestId: string;
  };
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: null;
}

// Quiz-level status
export enum QuizStatus {
  NOT_STARTED = "not_started", // Khi vừa mới get series về và render lên UI
  SELECTED = "selected", // User chọn làm quiz này nhưng chưa bắt đầu
  SKIPPED = "skipped", // Skip quiz này trong series
  IN_PROGRESS = "in_progress", // Khi user bắt đầu làm quiz (chọn ít nhất 1 answer)
  COMPLETED = "completed", // Hoàn thành một quiz
}

// Series-level status
export enum SeriesStatus {
  QUIZ_SELECTION = "quiz_selection", // ở bước đang chọn quiz để làm
  IN_PROGRESS = "in_progress", // đang làm các quiz đã chọn
  COMPLETED = "completed", // đã hoàn thành tất cả quiz đã chọn
  READY_TO_SUBMIT = "ready_to_submit", // đã hoàn thành tất cả quiz đã chọn, chờ submit
  SUBMITTED = "submitted",
  SKIPPED = "skipped", // Skip toàn bộ series
}

// ======================== SERIES ========================
export interface QuizSeries {
  id: string;
  title?: string;
  description?: string;
  quizzes: Quiz[];
}

export interface QuizSeriesResult {
  seriesId: string;
  userId?: string;
  title?: string;
  description?: string;
  quizResults: QuizResult[]; // Chi tiết kết quả từng quiz
  totalScore?: number; // Tổng điểm của series
  completedAt?: Date;
  totalCorrectAnswers?: number;
  totalIncorrectAnswers?: number;
  seriesStatus: SeriesStatus; // SUBMITTED hoặc SKIPPED
}

// ======================== QUIZ STRUCTURE ========================
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  status: QuizStatus; // Trạng thái của quiz
  subjectCode?: string; // Mã môn học
  subjectCodeName?: string; // Tên môn học
  totalQuestions?: number; // Tổng số câu hỏi (dùng cho UI)
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

// ======================== ANSWERS & RESULTS ========================
// Lưu trữ câu trả lời của user với mỗi question trong quiz
export interface UserAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface QuizResult {
  quizId: string;
  userId?: string;
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completedAt?: Date;
  detailedResults: QuestionResult[];
  quizStatus: QuizStatus; // COMPLETED vì chỉ có quiz đã hoàn thành mới có result
}

export interface QuestionResult {
  id: string;
  text: string;
  type: QuestionType;
  isCorrect: boolean;
  userAnswer: UserAnswer; // Câu trả lời của user
  correctAnswer: string[]; // Đáp án đúng
  availableOptions?: QuestionOptionWithCorrectness[]; // Tất cả options với thông tin đúng/sai
  explanation?: string; // Giải thích đáp án (nếu có)
}

export interface QuestionOptionWithCorrectness {
  id: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean; // User có chọn option này không
  explanation?: string; // Giải thích option (nếu có)
}

// ======================== PROGESS, NAVIGATION HELPERS ========================
// Thông tin điều hướng giữa các quiz trong series. Use case: nút next/prev, hiển thị quiz hiện tại
export interface NavigationInfo {
  currentIndex: number;
  totalSelected: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  nextQuizId: string | null;
  prevQuizId: string | null;
}

// Cho tiến độ làm quiz trong series. Use case: hiển thị progress bar, stepper, submission controls
export interface SeriesProgress {
  totalQuizzes: number;
  selectedQuizzes: number;
  completedQuizzes: number;
  inProgressQuizzes: number;
  totalQuestions: number;
  answeredQuestions: number;
  overallProgress: number;
  canSubmit: boolean;
}

export interface QuizProgress {
  total: number; // Tổng số câu hỏi trong quiz
  answered: number; // Số câu hỏi đã trả lời
  completed: boolean;
  percentage: number;
}

// ======================== VALIDATION TYPES ========================
// Test
export type ValidationResult = {
  canSubmitSeries: boolean; // Series này có hợp lệ để submit không?
  missingAnswers: string[]; // Danh sách quizId có câu hỏi chưa trả lời
  areSelectedQuizzesCompleted: boolean; // Tất cả selected quiz đã hoàn thành?
  incompleteSelectedQuizIds: string[]; // Quiz đã chọn nhưng chưa hoàn thành
};

export interface SubmissionValidation {
  canSubmit: boolean;
  missingRequirements: string[];
  completedQuizzes: string[];
  incompleteQuizzes: string[];
}

// ======================== GET APIs - LẤY DỮ LIỆU ========================
export interface GetSeriesAPIRequest {
  seriesId: string; // Request parameter
  userId?: string; // Optional for authorization
}

export interface GetSeriesAPIResponse {
  success: boolean;
  data: QuizSeries; // Chứa toàn bộ quizzes
  message?: string;
}

// ======================== SUBMIT APIs - NỘP BÀI ========================
// Request payload khi submit toàn bộ series
export interface SubmitSeriesAPIRequest {
  seriesId: string;
  userId?: string;
  selectedQuizIds: string[]; // Quiz IDs user đã chọn và hoàn thành
  quizSubmissions: QuizSubmissionPayload[]; // CHỈ những quiz đã selected
  totalTimeSpent?: number;
  submittedAt?: Date;
  seriesStatus: SeriesStatus; // SUBMITTED hoặc SKIPPED
}

// Payload cho những quiz đã được selected và hoàn thành trong series
export interface QuizSubmissionPayload {
  quizId: string;
  answers: UserAnswer[]; // Tất cả answers cho quiz này
  timeSpent?: number; // Thời gian làm quiz này (seconds)
  completedAt?: Date; // Timestamp hoàn thành quiz này
}

// ======================== SUBMIT RESPONSE - KẾT QUẢ ========================
// Response sau khi submit - trả về resultId của series để lấy kết quả
export interface SubmitSeriesAPIResponse {
  success: boolean;
  data: {
    resultId: string; // ID to retrieve results
    seriesId: string; // ID của series gốc
    submissionId?: string; // Optional tracking ID
    message?: string;
  };
  message?: string;
}

// ======================== RESULT RETRIEVAL APIs (Optional) ========================
export interface GetResultsAPIRequest {
  resultId: string; // ID returned from submission
  userId?: string; // Optional for authorization
}

export interface GetResultsAPIResponse {
  success: boolean;
  data: {
    seriesResult: QuizSeriesResult; // Overall series result
  };
  message?: string;
}
