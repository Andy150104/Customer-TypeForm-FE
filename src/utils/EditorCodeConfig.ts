// handleEditorWillMount.ts
import { BeforeMount } from "@monaco-editor/react";
import * as Monaco from "monaco-editor";

// ✨ Dark + Light đều style GitHub
import githubDarkTheme from "monaco-themes/themes/idleFingers.json";
import githubLightTheme from "monaco-themes/themes/GitHub Light.json";

export const handleEditorWillMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(
    "edusmart-night",
    githubDarkTheme as Monaco.editor.IStandaloneThemeData,
  );

  monaco.editor.defineTheme(
    "edusmart-light",
    githubLightTheme as Monaco.editor.IStandaloneThemeData,
  );
};
