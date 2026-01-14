export enum DropdownOptions {
  Latest = 1,
  Oldest = 2,
  Popular = 3,
}

export enum CourseLevel {
  Beginner = 1,
  Intermidiate = 2,
  Advanced = 3,
}

export enum CourseSortBy {
  Latest = 1,        // UpdatedAt desc (default)
	Popular = 2,       // LearnerCount desc
	TitleAsc = 3,       // Title asc
	TitleDesc = 4,      // Title desc
}

export enum UserBehaviourActionType {
  RetryLesson = 16,
  PlayVideo = 20,
  PauseVideo = 21,
  ScrollVideo = 24,
}

export enum UserBehaviourTargetType {
  Course = 1,
  Lesson = 2,
  Quiz = 4,
  Test = 5,
  LearningPath = 6,
  SearchQuery = 7,
  Profile = 8,
  Other = 99,
}

// Technology Type enum - matches BE enum
export enum TechnologyType {
  ProgrammingLanguage = 1,
  Framework = 2,
  Tool = 3,
  Platform = 4,
  Database = 5,
  Other = 6,
}

export enum ChatBotRawReason
{
    GetAllLearningPath = "GetAllLearningPath",
    GetDetailTrainingPath = "GetDetailTrainingPath",
    SkipSubjectLearningPath = "SkipSubjectLearningPath",
}

// Technology Type display names
export const TechnologyTypeLabels: Record<TechnologyType, string> = {
  [TechnologyType.ProgrammingLanguage]: "Ngôn ngữ lập trình",
  [TechnologyType.Framework]: "Framework",
  [TechnologyType.Tool]: "Công cụ",
  [TechnologyType.Platform]: "Nền tảng",
  [TechnologyType.Database]: "Cơ sở dữ liệu",
  [TechnologyType.Other]: "Khác",
};


export enum JudgeLanguageId {
  // 5 thằng cũ giữ nguyên
  CSharpMono = 51,
  CppGcc = 54,
  JavaOpenJdk = 91,
  Python = 71,
  JavaScriptNode = 102,

  // Phần còn lại theo list JSON
  PlainText = 43,
  Executable = 44,
  AssemblyNasm_2_14_02 = 45,
  Bash_5_0_0 = 46,
  BasicFbc_1_07_1 = 47,
  CGcc_7_4_0 = 48,
  CGcc_8_3_0 = 49,
  CGcc_9_2_0 = 50,
  CppGcc_7_4_0 = 52,
  CppGcc_8_3_0 = 53,
  CommonLispSbcl_2_0_0 = 55,
  D_Dmd_2_089_1 = 56,
  Elixir_1_9_4 = 57,
  ErlangOtp_22_2 = 58,
  FortranGfortran_9_2_0 = 59,
  Go_1_13_5 = 60,
  HaskellGhc_8_8_1 = 61,
  JavaOpenJdk_13_0_1 = 62, // Java (OpenJDK 13.0.1)
  JavaScriptNode_12_14_0 = 63,
  Lua_5_3_5 = 64,
  OCaml_4_09_0 = 65,
  Octave_5_1_0 = 66,
  PascalFpc_3_0_4 = 67,
  Php_7_4_1 = 68,
  PrologGnuProlog_1_4_5 = 69,
  Python_2_7_17 = 70,
  Ruby_2_7_0 = 72,
  Rust_1_40_0 = 73,
  TypeScript_3_7_4 = 74,
  CClang_7_0_1 = 75,
  CppClang_7_0_1 = 76,
  CobolGnuCobol_2_2 = 77,
  Kotlin_1_3_70 = 78,
  ObjectiveCClang_7_0_1 = 79,
  R_4_0_0 = 80,
  Scala_2_13_2 = 81,
  SqlSqlite_3_27_2 = 82,
  Swift_5_2_3 = 83,
  VisualBasicNetVbnc_0_0_0_5943 = 84,
  Perl_5_28_1 = 85,
  Clojure_1_10_1 = 86,
  FSharpDotNetCoreSdk_3_1_202 = 87,
  Groovy_3_0_3 = 88,
  MultiFileProgram = 89,
  Dart_2_19_2 = 90,
  Python_3_11_2 = 92,
  JavaScriptNode_18_15_0 = 93,
  TypeScript_5_0_3 = 94,
  Go_1_18_5 = 95,
  JavaFxJdk17_OpenJfx_22_0_2 = 96,
  JavaScriptNode_20_17_0 = 97,
  Php_8_3_11 = 98,
  R_4_4_1 = 99,
  Python_3_12_5 = 100,
  TypeScript_5_6_2 = 101,
  CGcc_14_1_0 = 103,
  CClang_18_1_8 = 104,
  CppGcc_14_1_0 = 105,
  Go_1_22_0 = 106,
  Go_1_23_5 = 107,
  Rust_1_85_0 = 108,
  Python_3_13_2 = 109,
  CClang_19_1_7 = 110,
  Kotlin_2_1_10 = 111,
  Scala_3_4_2 = 112,
  Python_3_14_0 = 113,
}

export const judgeLanguageToMonaco: Record<number, string> = {
  [JudgeLanguageId.CSharpMono]: "csharp",
  [JudgeLanguageId.CppGcc]: "cpp",
  [JudgeLanguageId.JavaOpenJdk]: "java",
  [JudgeLanguageId.Python]: "python",
  [JudgeLanguageId.JavaScriptNode]: "javascript",

  [JudgeLanguageId.JavaScriptNode_12_14_0]: "javascript",
  [JudgeLanguageId.JavaScriptNode_18_15_0]: "javascript",
  [JudgeLanguageId.JavaScriptNode_20_17_0]: "javascript",

  [JudgeLanguageId.TypeScript_3_7_4]: "typescript",
  [JudgeLanguageId.TypeScript_5_0_3]: "typescript",
  [JudgeLanguageId.TypeScript_5_6_2]: "typescript",

  [JudgeLanguageId.Go_1_13_5]: "go",
  [JudgeLanguageId.Go_1_18_5]: "go",
  [JudgeLanguageId.Go_1_22_0]: "go",
  [JudgeLanguageId.Go_1_23_5]: "go",

  [JudgeLanguageId.Rust_1_40_0]: "rust",
  [JudgeLanguageId.Rust_1_85_0]: "rust",

  [JudgeLanguageId.Php_7_4_1]: "php",
  [JudgeLanguageId.Php_8_3_11]: "php",

  [JudgeLanguageId.R_4_0_0]: "r",
  [JudgeLanguageId.R_4_4_1]: "r",

  [JudgeLanguageId.Ruby_2_7_0]: "ruby",
  [JudgeLanguageId.Kotlin_1_3_70]: "kotlin",
  [JudgeLanguageId.Kotlin_2_1_10]: "kotlin",
};
