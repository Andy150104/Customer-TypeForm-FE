"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Dayjs } from "dayjs";
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Rate,
  Slider,
  TimePicker,
  Image as AntdImage,
} from "antd";
import { createStyles } from "antd-style";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import {
  AnswerDto,
  FieldWithLogicResponseEntity,
  LogicCondition,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";

const useGradientButtonStyles = createStyles(({ prefixCls, css }) => ({
  gradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      position: relative;
      overflow: hidden;

      > span,
      .${prefixCls}-btn-icon, .${prefixCls}-btn-loading-icon {
        position: relative;
        z-index: 1;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: opacity 0.3s ease;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

type FieldLogicCategory =
  | "number"
  | "rating"
  | "scale"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "radio"
  | "yesno"
  | "multiselect"
  | "text"
  | "email"
  | "phone"
  | "textarea";

const normalizeText = (value: unknown) =>
  value === null || value === undefined ? "" : String(value).toLowerCase();
const parseNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseTimeValue = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object") {
    const timeLike = value as { hour?: () => number; minute?: () => number; second?: () => number };
    if (typeof timeLike.hour === "function" && typeof timeLike.minute === "function") {
      const hours = timeLike.hour();
      const minutes = timeLike.minute();
      const seconds = typeof timeLike.second === "function" ? timeLike.second() : 0;
      if (Number.isFinite(hours) && Number.isFinite(minutes) && Number.isFinite(seconds)) {
        return hours * 60 + minutes + seconds / 60;
      }
    }
  }
  const raw = String(value).trim();
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return undefined;
  }
  return hours * 60 + minutes + seconds / 60;
};

const parseDateValue = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  if (
    typeof value === "object" &&
    typeof (value as { valueOf?: () => number }).valueOf === "function"
  ) {
    const ts = (value as { valueOf: () => number }).valueOf();
    return Number.isFinite(ts) ? ts : undefined;
  }
  const raw = String(value).trim();
  if (!raw) return undefined;

  const match =
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(
      raw,
    );
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4] ?? 0);
    const minute = Number(match[5] ?? 0);
    const second = Number(match[6] ?? 0);
    if (
      [year, month, day, hour, minute, second].every((v) =>
        Number.isFinite(v),
      )
    ) {
      const dt = new Date(year, month - 1, day, hour, minute, second);
      const ts = dt.getTime();
      return Number.isFinite(ts) ? ts : undefined;
    }
  }

  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : undefined;
};

const normalizeMultiValues = (value: unknown): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const raw = String(value).trim();
  if (!raw) return [];
  if (raw.includes("||")) {
    return raw.split("||").map((item) => item.trim()).filter(Boolean);
  }
  if (raw.includes(",")) {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [raw];
};

const getLogicFieldCategory = (type?: string | null): FieldLogicCategory => {
  const normalized = (type ?? "").toLowerCase().trim();
  if (normalized.includes("datetime")) return "datetime";
  if (normalized.includes("date")) return "date";
  if (normalized.includes("time")) return "time";
  if (normalized.includes("number")) return "number";
  if (normalized.includes("rating")) return "rating";
  if (normalized.includes("scale")) return "scale";
  if (normalized.includes("multiselect") || normalized.includes("multi_select"))
    return "multiselect";
  if (normalized.includes("select")) return "select";
  if (normalized.includes("radio")) return "radio";
  if (normalized.includes("yesno") || normalized.includes("yes_no"))
    return "yesno";
  if (normalized.includes("email")) return "email";
  if (normalized.includes("phone")) return "phone";
  if (normalized.includes("textarea")) return "textarea";
  return "text";
};

const evaluateLogicCondition = (
  condition: LogicCondition | string | null | undefined,
  currentValue: unknown,
  logicValue: string | null | undefined,
  fieldCategory?: FieldLogicCategory,
) => {
  const isEmptyValue =
    currentValue === null ||
    currentValue === undefined ||
    (typeof currentValue === "string" && currentValue.trim() === "") ||
    (Array.isArray(currentValue) && currentValue.length === 0);

  if (isEmptyValue) {
    return condition === LogicCondition.Always || condition === "Always";
  }

  const target = logicValue ?? "";
  const currentLower = normalizeText(currentValue);
  const targetLower = normalizeText(target);

  const category = fieldCategory ?? "text";

  if (category === "multiselect") {
    const currentList = normalizeMultiValues(currentValue);
    const targetList = normalizeMultiValues(target);
    switch (condition) {
      case LogicCondition.Contains:
      case "Contains":
        return (
          targetList.length > 0 &&
          currentList.some((item) =>
            targetList.some(
              (targetItem) => normalizeText(item) === normalizeText(targetItem),
            ),
          )
        );
      case LogicCondition.DoesNotContain:
      case "DoesNotContain":
        return (
          targetList.length > 0 &&
          !currentList.some((item) =>
            targetList.some(
              (targetItem) => normalizeText(item) === normalizeText(targetItem),
            ),
          )
        );
      case LogicCondition.Always:
      case "Always":
        return true;
      case LogicCondition.Is:
      case "Is":
        return currentLower === targetLower;
      case LogicCondition.IsNot:
      case "IsNot":
        return currentLower !== targetLower;
      default:
        return false;
    }
  }

  if (category === "number" || category === "rating" || category === "scale") {
    const currentNumber = parseNumber(currentValue);
    const targetNumber = parseNumber(target);
    switch (condition) {
      case LogicCondition.Is:
      case "Is":
        if (currentNumber !== undefined && targetNumber !== undefined) {
          return currentNumber === targetNumber;
        }
        return currentLower === targetLower;
      case LogicCondition.IsNot:
      case "IsNot":
        if (currentNumber !== undefined && targetNumber !== undefined) {
          return currentNumber !== targetNumber;
        }
        return currentLower !== targetLower;
      case LogicCondition.GreaterThan:
      case "GreaterThan":
        return currentNumber !== undefined && targetNumber !== undefined
          ? currentNumber > targetNumber
          : false;
      case LogicCondition.LessThan:
      case "LessThan":
        return currentNumber !== undefined && targetNumber !== undefined
          ? currentNumber < targetNumber
          : false;
      case LogicCondition.GreaterThanOrEqual:
      case "GreaterThanOrEqual":
        return currentNumber !== undefined && targetNumber !== undefined
          ? currentNumber >= targetNumber
          : false;
      case LogicCondition.LessThanOrEqual:
      case "LessThanOrEqual":
        return currentNumber !== undefined && targetNumber !== undefined
          ? currentNumber <= targetNumber
          : false;
      case LogicCondition.Always:
      case "Always":
        return true;
      default:
        return false;
    }
  }

  if (category === "date" || category === "datetime") {
    const currentDate = parseDateValue(currentValue);
    const targetDate = parseDateValue(target);
    switch (condition) {
      case LogicCondition.Is:
      case "Is":
        return currentDate !== undefined && targetDate !== undefined
          ? currentDate === targetDate
          : currentLower === targetLower;
      case LogicCondition.IsNot:
      case "IsNot":
        return currentDate !== undefined && targetDate !== undefined
          ? currentDate !== targetDate
          : currentLower !== targetLower;
      case LogicCondition.GreaterThan:
      case "GreaterThan":
        return currentDate !== undefined && targetDate !== undefined
          ? currentDate > targetDate
          : false;
      case LogicCondition.LessThan:
      case "LessThan":
        return currentDate !== undefined && targetDate !== undefined
          ? currentDate < targetDate
          : false;
      case LogicCondition.Always:
      case "Always":
        return true;
      default:
        return false;
    }
  }

  if (category === "time") {
    const currentTime = parseTimeValue(currentValue);
    const targetTime = parseTimeValue(target);
    switch (condition) {
      case LogicCondition.Is:
      case "Is":
        return currentTime !== undefined && targetTime !== undefined
          ? currentTime === targetTime
          : currentLower === targetLower;
      case LogicCondition.IsNot:
      case "IsNot":
        return currentTime !== undefined && targetTime !== undefined
          ? currentTime !== targetTime
          : currentLower !== targetLower;
      case LogicCondition.GreaterThan:
      case "GreaterThan":
        return currentTime !== undefined && targetTime !== undefined
          ? currentTime > targetTime
          : false;
      case LogicCondition.LessThan:
      case "LessThan":
        return currentTime !== undefined && targetTime !== undefined
          ? currentTime < targetTime
          : false;
      case LogicCondition.Always:
      case "Always":
        return true;
      default:
        return false;
    }
  }

  switch (condition) {
    case LogicCondition.Is:
    case "Is":
      return currentLower === targetLower;
    case LogicCondition.IsNot:
    case "IsNot":
      return currentLower !== targetLower;
    case LogicCondition.Contains:
    case "Contains":
      return currentLower.includes(targetLower);
    case LogicCondition.DoesNotContain:
    case "DoesNotContain":
      return !currentLower.includes(targetLower);
    case LogicCondition.Always:
    case "Always":
      return true;
    default:
      return false;
  }
};

const getNextFieldId = (
  currentField: FieldWithLogicResponseEntity,
  orderedFields: FieldWithLogicResponseEntity[],
  currentValue: unknown,
  fieldCategory?: FieldLogicCategory,
) => {
  let appliedLogicId: string | null = null;
  let nextFieldId: string | null = null;

  if (
    currentField.logicRules?.length &&
    currentValue !== null &&
    currentValue !== undefined
  ) {
    const sortedLogic = [...currentField.logicRules].sort(
      (a, b) => (a?.order ?? 0) - (b?.order ?? 0),
    );

    for (const logic of sortedLogic) {
      if (!logic) continue;
      const matches = evaluateLogicCondition(
        logic.condition,
        currentValue,
        logic.value,
        fieldCategory,
      );
      if (matches) {
        appliedLogicId = logic.id ?? null;
        nextFieldId = logic.destinationFieldId ?? null;
        break;
      }
    }
  }

  if (!nextFieldId) {
    nextFieldId = currentField.defaultNextFieldId ?? null;
  }

  if (!nextFieldId) {
    const currentIndex = orderedFields.findIndex(
      (field) => field.id === currentField.id,
    );
    nextFieldId = orderedFields[currentIndex + 1]?.id ?? null;
  }

  return { nextFieldId, appliedLogicId };
};

type FormPreviewCardProps = {
  isView?: boolean;
  frameClassName?: string;
  contentClassName?: string;
  fields?: FieldWithLogicResponseEntity[] | null;
  isLoading?: boolean;
  currentFieldId?: string | null;
  onCurrentFieldChange?: (fieldId: string | null) => void;
  onAnswerCommit?: (answers: AnswerDto[]) => void;
  onFormComplete?: (answers: AnswerDto[]) => void;
  onNextQuestion?: (
    currentFieldId: string,
    currentValue: string,
  ) => Promise<string | null> | string | null;
};

type FieldAnswerState = {
  value?: string;
  numberValue?: number | null;
  selectedValue?: string | null;
  multiValues?: string[];
  ratingValue?: number;
  scaleValue?: number | null;
  dateValue?: Dayjs | null;
  timeValue?: Dayjs | null;
  dateTimeValue?: Dayjs | null;
};

export const FormPreviewCard: React.FC<FormPreviewCardProps> = ({
  isView = true,
  frameClassName = "",
  contentClassName = "",
  fields = null,
  isLoading = false,
  currentFieldId: controlledFieldId,
  onCurrentFieldChange,
  onAnswerCommit,
  onFormComplete,
  onNextQuestion,
}) => {
  const { styles } = useGradientButtonStyles();
  const { isDarkMode } = useTheme();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [internalFieldId, setInternalFieldId] = useState<string | null>(null);
  const [isEndOfForm, setIsEndOfForm] = useState(false);
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [multiValues, setMultiValues] = useState<string[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const [timeValue, setTimeValue] = useState<Dayjs | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState<Dayjs | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const answerStoreRef = useRef<Record<string, FieldAnswerState>>({});
  const [needsScrollPadding, setNeedsScrollPadding] = useState(false);
  const [actionBarHeight, setActionBarHeight] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentMeasureRef = useRef<HTMLDivElement | null>(null);
  const actionBarRef = useRef<HTMLDivElement | null>(null);
  const navigationRef = useRef<"next" | "back" | null>(null);
  const isControlled = controlledFieldId !== undefined;
  const activeFieldId = isControlled
    ? (controlledFieldId ?? null)
    : internalFieldId;
  const setActiveFieldId = useCallback(
    (nextId: string | null) => {
      if (isControlled) {
        onCurrentFieldChange?.(nextId);
      } else {
        setInternalFieldId(nextId);
      }
    },
    [isControlled, onCurrentFieldChange],
  );
  const orderedFields = useMemo(
    () =>
      Array.isArray(fields)
        ? [...fields].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
        : [],
    [fields],
  );
  const hasFields = orderedFields.length > 0;
  const currentField =
    orderedFields.find((field) => field.id === activeFieldId) ??
    orderedFields[0] ??
    null;
  const currentIndex = currentField
    ? orderedFields.findIndex((field) => field.id === currentField.id)
    : -1;
  const questionNumber =
    currentField?.order ?? (currentIndex >= 0 ? currentIndex + 1 : 1);
  const normalizedType = currentField?.type?.toLowerCase() ?? "text";
  const fieldOptions = useMemo(() => {
    const options = currentField?.options ?? [];
    return [...options].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [currentField]);
  const isInputLocked = isView || isLoading || !hasFields;
  const isActive = !isInputLocked && (isFocused || value.length > 0);
  const inputValue = value;
  const titleText = currentField?.title ?? "Your email";
  const descriptionText = currentField?.description ?? "Description (optional)";
  const imageUrl = currentField?.imageUrl ?? null;
  const placeholderValue =
    typeof currentField?.properties?.placeholder === "string"
      ? currentField.properties.placeholder
      : "name@example.com";
  const isRequired = currentField?.isRequired;
  const numberMin = parseNumber(currentField?.properties?.min);
  const numberMax = parseNumber(currentField?.properties?.max);
  const numberStep = parseNumber(currentField?.properties?.step) ?? 1;
  const scaleMin = parseNumber(currentField?.properties?.min) ?? 1;
  const scaleMax = parseNumber(currentField?.properties?.max) ?? 10;
  const scaleStep = parseNumber(currentField?.properties?.step) ?? 1;

  // Extract design properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const designProps = (currentField?.properties as any)?.design as
    | {
        fontFamily?: string;
        isBold?: boolean;
        isItalic?: boolean;
        isUnderlined?: boolean;
        textColor?: string;
        textAlign?: "left" | "center" | "right";
      }
    | undefined;

  const titleStyle: React.CSSProperties = useMemo(() => {
    if (!designProps) return {};
    return {
      fontFamily: designProps.fontFamily || undefined,
      fontWeight: designProps.isBold ? "bold" : undefined,
      fontStyle: designProps.isItalic ? "italic" : undefined,
      textDecoration: designProps.isUnderlined ? "underline" : undefined,
      color: designProps.textColor || undefined,
      textAlign: designProps.textAlign || undefined,
    };
  }, [designProps]);

  const hasCustomDesign = Boolean(
    designProps?.fontFamily ||
      designProps?.isBold ||
      designProps?.isItalic ||
      designProps?.isUnderlined ||
      designProps?.textColor ||
      designProps?.textAlign,
  );

  const isOptionListType = ["select", "multiselect", "radio"].includes(
    normalizedType,
  );
  const totalSteps = orderedFields.length;
  const stepIndex =
    currentIndex >= 0
      ? currentIndex + 1
      : Math.min(history.length + 1, totalSteps || 1);
  const progressPercent = totalSteps
    ? Math.min(100, Math.max(6, (stepIndex / totalSteps) * 100))
    : 0;
  const progressTrackColor = isDarkMode
    ? "rgba(30, 41, 59, 0.8)"
    : "rgba(226, 232, 240, 0.9)";
  const progressFillClass = isDarkMode
    ? "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600"
    : "bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600";
  const scrollTrackColor = isDarkMode
    ? "rgba(15, 23, 42, 0.35)"
    : "rgba(226, 232, 240, 0.7)";
  const scrollThumbColor = isDarkMode
    ? "rgba(99, 102, 241, 0.75)"
    : "rgba(99, 102, 241, 0.6)";
  const scrollThumbHoverColor = isDarkMode
    ? "rgba(129, 140, 248, 0.9)"
    : "rgba(79, 70, 229, 0.7)";
  const labelColor = isDarkMode ? "text-indigo-300" : "text-indigo-600";
  const titleColor = isDarkMode ? "text-slate-100" : "text-slate-900";
  const descriptionColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const inputBorderColor = isDarkMode ? "#4B6EF5" : "#1F4AB8";
  const inputMutedBorderColor = isDarkMode ? "#334155" : "#CBD5F5";
  const inputTextColor = isDarkMode ? "text-indigo-200" : "text-indigo-500";
  const inputPlaceholderColor = "placeholder:text-indigo-300";
  const placeholderTitle = isLoading ? "Loading..." : "No questions yet";
  const placeholderDescription = isLoading
    ? "Fetching form data."
    : "Add a question to preview.";
  const okButtonClass = isDarkMode
    ? "relative overflow-hidden bg-[#2F5BFF] hover:bg-[#2B52E8] text-white border-0 shadow-xl shadow-blue-500/35 hover:shadow-blue-500/55 ring-1 ring-white/10 disabled:opacity-60 disabled:shadow-none"
    : "relative overflow-hidden bg-[#2F5BFF] hover:bg-[#2B52E8] text-white border-0 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/55 ring-1 ring-blue-500/25 disabled:opacity-60 disabled:shadow-none";
  const backButtonClass = isDarkMode
    ? "border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white bg-slate-900/70 hover:bg-slate-800/90 shadow-md shadow-slate-950/40 ring-1 ring-slate-700/70 disabled:opacity-50 disabled:shadow-none"
    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900 bg-white hover:bg-slate-50 shadow-md shadow-slate-200/60 ring-1 ring-slate-200/80 disabled:opacity-50 disabled:shadow-none";
  const actionBarClass = isDarkMode
    ? "border-slate-800/70 bg-slate-950/60 shadow-slate-950/50"
    : "border-slate-200/80 bg-white/90 shadow-slate-200/70";
  const contentPadding = isOptionListType ? "pt-8 pb-16" : "pt-16 pb-28";
  const canAdvance =
    !isInputLocked && Boolean(currentField) && !isEndOfForm && !isNavigating;
  const questionAnimationClass = "question-zoom";
  const scrollPaddingBottom =
    !isView && needsScrollPadding ? actionBarHeight + 40 : 0;

  const persistAnswerState = useCallback(
    (next: Partial<FieldAnswerState>) => {
      if (!currentField?.id) return;
      const stored = answerStoreRef.current[currentField.id] ?? {};
      answerStoreRef.current[currentField.id] = { ...stored, ...next };
    },
    [currentField?.id],
  );

  useEffect(() => {
    if (!hasFields) return;
    const firstId = orderedFields[0]?.id ?? null;
    const hasCurrent = orderedFields.some(
      (field) => field.id === activeFieldId,
    );
    if (!activeFieldId || !hasCurrent) {
      setActiveFieldId(firstId);
    }
    setIsEndOfForm(false);
  }, [activeFieldId, hasFields, orderedFields, setActiveFieldId]);

  useEffect(() => {
    setIsFocused(false);
    setIsEndOfForm(false);
    if (activeFieldId && answerStoreRef.current[activeFieldId]) {
      const stored = answerStoreRef.current[activeFieldId];
      setValue(stored.value ?? "");
      setNumberValue(stored.numberValue ?? null);
      setSelectedValue(stored.selectedValue ?? null);
      setMultiValues(stored.multiValues ?? []);
      setRatingValue(stored.ratingValue ?? 0);
      setScaleValue(stored.scaleValue ?? null);
      setDateValue(stored.dateValue ?? null);
      setTimeValue(stored.timeValue ?? null);
      setDateTimeValue(stored.dateTimeValue ?? null);
    } else {
      setValue("");
      setNumberValue(null);
      setSelectedValue(null);
      setMultiValues([]);
      setRatingValue(0);
      setScaleValue(null);
      setDateValue(null);
      setTimeValue(null);
      setDateTimeValue(null);
    }
  }, [activeFieldId]);

  useEffect(() => {
    if (navigationRef.current === null) {
      setHistory([]);
    }
    navigationRef.current = null;
  }, [activeFieldId]);

  useLayoutEffect(() => {
    if (isView) {
      setNeedsScrollPadding(false);
      setActionBarHeight(0);
      return;
    }
    const scrollEl = scrollRef.current;
    const contentEl = contentMeasureRef.current;
    if (!scrollEl || !contentEl) return;
    const barHeight = actionBarRef.current?.offsetHeight ?? 0;
    const availableHeight = scrollEl.clientHeight;
    const contentHeight = contentEl.getBoundingClientRect().height;
    setActionBarHeight(barHeight);
    setNeedsScrollPadding(contentHeight + 24 > availableHeight);
  }, [activeFieldId, isView, fieldOptions.length, normalizedType]);

  const handleNext = async () => {
    if (!currentField || !canAdvance) return;
    const answerPayload = buildAnswerPayload();
    if (answerPayload.length) {
      onAnswerCommit?.(answerPayload);
    }
    let nextFieldId: string | null = null;
    if (onNextQuestion) {
      setIsNavigating(true);
      try {
        nextFieldId = await onNextQuestion(currentField.id ?? "", value);
      } catch (error) {
        console.error("Failed to load next question:", error);
        return;
      } finally {
        setIsNavigating(false);
      }
    } else {
      const fieldCategory = getLogicFieldCategory(currentField.type);
      const logicValue =
        normalizedType === "number"
          ? numberValue ?? value
          : normalizedType === "rating"
            ? ratingValue ?? value
            : normalizedType === "scale"
              ? scaleValue ?? value
              : normalizedType === "date"
                ? dateValue ?? value
                : normalizedType === "time"
                  ? timeValue ?? value
                  : normalizedType === "datetime"
                    ? dateTimeValue ?? value
                    : normalizedType === "multiselect"
                      ? multiValues
                      : normalizedType === "select" ||
                          normalizedType === "radio" ||
                          normalizedType === "yesno"
                        ? selectedValue ?? value
                        : value;
      const next = getNextFieldId(
        currentField,
        orderedFields,
        logicValue,
        fieldCategory,
      );
      nextFieldId = next.nextFieldId;
    }

    if (!nextFieldId) {
      setIsEndOfForm(true);
      onFormComplete?.(answerPayload);
      return;
    }

    if (currentField.id) {
      setHistory((prev) => [...prev, currentField.id as string]);
    }
    navigationRef.current = "next";
    setActiveFieldId(nextFieldId);
    setIsEndOfForm(false);
  };

  const handleBack = () => {
    if (!history.length) return;
    setHistory((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const previousId = next.pop();
      if (previousId) {
        navigationRef.current = "back";
        setActiveFieldId(previousId);
      }
      return next;
    });
  };

  const handleTextValue = (nextValue: string) => {
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setValue(nextValue);
    persistAnswerState({ value: nextValue });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleTextValue(event.target.value);
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    handleTextValue(event.target.value);
  };

  const handleNumberChange = (nextValue: number | null) => {
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setNumberValue(nextValue);
    const nextText = nextValue === null ? "" : String(nextValue);
    setValue(nextText);
    persistAnswerState({ numberValue: nextValue, value: nextText });
  };

  const handleSingleSelect = (nextValue: string) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setSelectedValue(nextValue);
    setValue(nextValue);
    persistAnswerState({ selectedValue: nextValue, value: nextValue });
  };

  const handleMultiSelect = (nextValue: string) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setMultiValues((prev) => {
      const exists = prev.includes(nextValue);
      const updated = exists
        ? prev.filter((item) => item !== nextValue)
        : [...prev, nextValue];
      const joined = updated.join(",");
      setValue(joined);
      persistAnswerState({ multiValues: updated, value: joined });
      return updated;
    });
  };


  const handleYesNo = (nextValue: "Yes" | "No") => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setSelectedValue(nextValue);
    setValue(nextValue);
    persistAnswerState({ selectedValue: nextValue, value: nextValue });
  };

  const handleRatingChange = (nextValue: number) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setRatingValue(nextValue);
    setValue(String(nextValue));
    persistAnswerState({ ratingValue: nextValue, value: String(nextValue) });
  };

  const handleScaleChange = (nextValue: number) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    setScaleValue(nextValue);
    setValue(String(nextValue));
    persistAnswerState({ scaleValue: nextValue, value: String(nextValue) });
  };

  const handleDateChange = (
    nextValue: Dayjs | null,
    formatted: string | string[],
  ) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    const formattedValue = Array.isArray(formatted)
      ? formatted.join(" ")
      : formatted;
    setDateValue(nextValue);
    setValue(formattedValue ?? "");
    persistAnswerState({
      dateValue: nextValue,
      value: formattedValue ?? "",
    });
  };

  const handleTimeChange = (
    nextValue: Dayjs | null,
    formatted: string | string[],
  ) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    const formattedValue = Array.isArray(formatted)
      ? formatted.join(" ")
      : formatted;
    setTimeValue(nextValue);
    setValue(formattedValue ?? "");
    persistAnswerState({
      timeValue: nextValue,
      value: formattedValue ?? "",
    });
  };

  const handleDateTimeChange = (
    nextValue: Dayjs | null,
    formatted: string | string[],
  ) => {
    if (isInputLocked) return;
    if (isEndOfForm) {
      setIsEndOfForm(false);
    }
    const formattedValue = Array.isArray(formatted)
      ? formatted.join(" ")
      : formatted;
    setDateTimeValue(nextValue);
    setValue(formattedValue ?? "");
    persistAnswerState({
      dateTimeValue: nextValue,
      value: formattedValue ?? "",
    });
  };


  const optionSurface = isDarkMode
    ? "border-slate-700 bg-slate-900/40"
    : "border-slate-200 bg-white";
  const optionSelectedSurface = isDarkMode
    ? "border-indigo-400 bg-indigo-500/10"
    : "border-indigo-500 bg-indigo-50";
  const optionTextColor = isDarkMode ? "text-slate-200" : "text-slate-700";
  const optionMutedText = isDarkMode ? "text-slate-400" : "text-slate-500";
  const optionChipBase = isDarkMode
    ? "border-slate-600 text-slate-300"
    : "border-slate-300 text-slate-500";
  const optionChipActive = isDarkMode
    ? "border-indigo-400 text-indigo-200 bg-indigo-500/10"
    : "border-indigo-500 text-indigo-600 bg-white";

  const renderUnderlinedInput = (inputNode: React.ReactNode) => (
    <div className="relative pt-3">
      {inputNode}
      <span
        className="absolute left-0 right-0 bottom-0 h-[2px]"
        style={{ backgroundColor: inputMutedBorderColor }}
      />
      <span
        className="absolute left-0 right-0 bottom-0 h-[2px] origin-left transition-transform duration-300"
        style={{
          backgroundColor: inputBorderColor,
          transform: isActive ? "scaleX(1)" : "scaleX(0)",
        }}
      />
      <span
        className="absolute bottom-[-6px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transition-opacity duration-300"
        style={{
          backgroundColor: inputBorderColor,
          opacity: isActive ? 1 : 0,
        }}
      />
    </div>
  );

  const renderOptionList = ({
    mode,
  }: {
    mode: "select" | "multiselect" | "radio";
  }) => (
    <div className="mx-auto flex w-[86%] flex-col gap-3 pt-6 sm:w-[90%]">
      {fieldOptions.map((option, index) => {
        const optionValue = option.value ?? option.label ?? `${index + 1}`;
        const optionLabel =
          option.label ?? option.value ?? `Option ${index + 1}`;
        const isSelected =
          mode === "multiselect"
            ? multiValues.includes(optionValue)
            : selectedValue === optionValue;
        const isDisabled = isInputLocked;
        const letterIndex = String.fromCharCode(65 + index); // A, B, C, D...
        return (
          <button
            key={option.id ?? `${optionValue}-${index}`}
            type="button"
            onClick={() =>
              mode === "multiselect"
                ? handleMultiSelect(optionValue)
                : handleSingleSelect(optionValue)
            }
            disabled={isDisabled}
            className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200 ease-out transform-gpu ${
              isSelected ? optionSelectedSurface : optionSurface
            } ${
              isDisabled
                ? "opacity-70"
                : "hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-400 active:translate-y-0 active:scale-[0.98] active:shadow-inner"
            } ${isSelected ? "ring-2 ring-indigo-400/20" : ""}`}
          >
            {mode === "select" && (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                  isSelected ? optionChipActive : optionChipBase
                }`}
              >
                {letterIndex}
              </span>
            )}
            {mode === "multiselect" && (
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-slate-300 bg-transparent"
                }`}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-sm bg-white transition-transform duration-200 scale-110" />
                )}
              </span>
            )}
            {mode === "radio" && (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-indigo-500"
                    : isDarkMode
                      ? "border-slate-500"
                      : "border-slate-300"
                }`}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500 transition-transform duration-200 scale-110" />
                )}
              </span>
            )}
            <span className={`text-sm font-medium ${optionTextColor}`}>
              {optionLabel}
            </span>
          </button>
        );
      })}
      {!fieldOptions.length && (
        <div className={`rounded-xl border px-3 py-3 text-sm ${optionSurface}`}>
          <span className={optionMutedText}>No options yet.</span>
        </div>
      )}
    </div>
  );

  const buildAnswerPayload = (): AnswerDto[] => {
    if (!currentField?.id) return [];
    const fieldId = currentField.id;
    const getOptionId = (optionValue: string) => {
      const matched = fieldOptions.find((option) => {
        const rawValue = option.value ?? option.label ?? "";
        return rawValue === optionValue;
      });
      return matched?.id ?? null;
    };

    switch (normalizedType) {
      case "select":
      case "radio": {
        if (!selectedValue) return [];
        return [
          {
            fieldId,
            value: selectedValue,
            fieldOptionId: getOptionId(selectedValue),
          },
        ];
      }
      case "multiselect":
        return multiValues.map((optionValue) => ({
          fieldId,
          value: optionValue,
          fieldOptionId: getOptionId(optionValue),
        }));
      case "yesno":
        return selectedValue
          ? [
              {
                fieldId,
                value: selectedValue,
                fieldOptionId: null,
              },
            ]
          : [];
      case "number":
        return [
          {
            fieldId,
            value: numberValue ?? value,
            fieldOptionId: null,
          },
        ];
      case "rating":
        return [
          {
            fieldId,
            value: ratingValue,
            fieldOptionId: null,
          },
        ];
      case "scale":
        return [
          {
            fieldId,
            value: scaleValue ?? value,
            fieldOptionId: null,
          },
        ];
      case "date":
      case "time":
      case "datetime":
      case "textarea":
      case "text":
      case "email":
      case "phone":
      default:
        return [
          {
            fieldId,
            value,
            fieldOptionId: null,
          },
        ];
    }
  };

  const renderFieldInput = () => {
    if (!currentField) {
      return renderUnderlinedInput(
        <Input
          value={inputValue}
          placeholder={placeholderValue}
          bordered={false}
          disabled
          className={`h-12 rounded-none border-0 px-0 text-2xl font-medium leading-tight tracking-tight focus:shadow-none sm:text-3xl ${inputTextColor} ${inputPlaceholderColor}`}
        />,
      );
    }

    switch (normalizedType) {
      case "number":
        return renderUnderlinedInput(
          <InputNumber
            value={numberValue ?? undefined}
            min={numberMin}
            max={numberMax}
            step={numberStep}
            controls={false}
            bordered={false}
            disabled={isInputLocked}
            placeholder={placeholderValue}
            onChange={handleNumberChange}
            onFocus={isInputLocked ? undefined : () => setIsFocused(true)}
            onBlur={isInputLocked ? undefined : () => setIsFocused(false)}
            style={{ width: "100%" }}
            className={`h-12 w-full rounded-none border-0 px-0 text-2xl font-medium leading-tight tracking-tight focus:shadow-none sm:text-3xl ${inputTextColor}`}
          />,
        );
      case "email":
        return renderUnderlinedInput(
          <Input
            type="email"
            value={inputValue}
            onChange={isInputLocked ? undefined : handleInputChange}
            placeholder={placeholderValue}
            bordered={false}
            autoFocus={!isInputLocked}
            readOnly={isInputLocked}
            tabIndex={isInputLocked ? -1 : 0}
            aria-readonly={isInputLocked}
            onPressEnter={canAdvance ? handleNext : undefined}
            onFocus={isInputLocked ? undefined : () => setIsFocused(true)}
            onBlur={isInputLocked ? undefined : () => setIsFocused(false)}
            style={{
              caretColor: isInputLocked ? "transparent" : inputBorderColor,
            }}
            className={`h-12 rounded-none border-0 px-0 text-2xl font-medium leading-tight tracking-tight transition-colors focus:shadow-none sm:text-3xl ${inputTextColor} ${inputPlaceholderColor} ${
              isInputLocked ? "pointer-events-none" : ""
            }`}
          />,
        );
      case "phone":
        return renderUnderlinedInput(
          <Input
            type="tel"
            value={inputValue}
            onChange={isInputLocked ? undefined : handleInputChange}
            placeholder={placeholderValue}
            bordered={false}
            autoFocus={!isInputLocked}
            readOnly={isInputLocked}
            tabIndex={isInputLocked ? -1 : 0}
            aria-readonly={isInputLocked}
            onPressEnter={canAdvance ? handleNext : undefined}
            onFocus={isInputLocked ? undefined : () => setIsFocused(true)}
            onBlur={isInputLocked ? undefined : () => setIsFocused(false)}
            style={{
              caretColor: isInputLocked ? "transparent" : inputBorderColor,
            }}
            className={`h-12 rounded-none border-0 px-0 text-2xl font-medium leading-tight tracking-tight transition-colors focus:shadow-none sm:text-3xl ${inputTextColor} ${inputPlaceholderColor} ${
              isInputLocked ? "pointer-events-none" : ""
            }`}
          />,
        );
      case "textarea":
        return (
          <div className="pt-3">
            <Input.TextArea
              value={inputValue}
              onChange={isInputLocked ? undefined : handleTextAreaChange}
              placeholder={placeholderValue}
              autoSize={{ minRows: 3, maxRows: 5 }}
              disabled={isInputLocked}
              className={`rounded-2xl border px-4 py-3 text-base shadow-none ${optionSurface} ${optionTextColor}`}
            />
          </div>
        );
      case "date":
        return renderUnderlinedInput(
          <DatePicker
            value={dateValue}
            onChange={handleDateChange}
            disabled={isInputLocked}
            bordered={false}
            placeholder={placeholderValue}
            style={{ width: "100%" }}
            className={`h-12 w-full rounded-none border-0 px-0 text-base ${optionTextColor}`}
          />,
        );
      case "time":
        return renderUnderlinedInput(
          <TimePicker
            value={timeValue}
            onChange={handleTimeChange}
            disabled={isInputLocked}
            bordered={false}
            placeholder={placeholderValue}
            style={{ width: "100%" }}
            className={`h-12 w-full rounded-none border-0 px-0 text-base ${optionTextColor}`}
          />,
        );
      case "datetime":
        return renderUnderlinedInput(
          <DatePicker
            showTime
            value={dateTimeValue}
            onChange={handleDateTimeChange}
            disabled={isInputLocked}
            bordered={false}
            placeholder={placeholderValue}
            style={{ width: "100%" }}
            className={`h-12 w-full rounded-none border-0 px-0 text-base ${optionTextColor}`}
          />,
        );
      case "select":
        return renderOptionList({ mode: "select" });
      case "multiselect":
        return renderOptionList({ mode: "multiselect" });
      case "radio":
        return renderOptionList({ mode: "radio" });
      case "yesno":
        return (
          <div className="flex gap-3 pt-4">
            {(["Yes", "No"] as const).map((option) => {
              const isSelected = selectedValue === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleYesNo(option)}
                  disabled={isInputLocked}
                  className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out transform-gpu ${
                    isSelected ? optionSelectedSurface : optionSurface
                  } ${
                    isInputLocked
                      ? "opacity-70"
                      : "hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-400 active:translate-y-0 active:scale-[0.98] active:shadow-inner"
                  } ${isSelected ? "ring-2 ring-indigo-400/20" : ""}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );
      case "rating":
        return (
          <div className="pt-4">
            <Rate
              value={ratingValue}
              onChange={handleRatingChange}
              disabled={isInputLocked}
            />
          </div>
        );
      case "scale":
        return (
          <div className="pt-4">
            <Slider
              min={scaleMin}
              max={scaleMax}
              step={scaleStep}
              value={scaleValue ?? undefined}
              onChange={handleScaleChange}
              disabled={isInputLocked}
            />
            <div className={`flex justify-between text-xs ${optionMutedText}`}>
              <span>{scaleMin}</span>
              <span>{scaleMax}</span>
            </div>
          </div>
        );
      case "text":
      default:
        return renderUnderlinedInput(
          <Input
            value={inputValue}
            onChange={isInputLocked ? undefined : handleInputChange}
            placeholder={placeholderValue}
            bordered={false}
            autoFocus={!isInputLocked}
            readOnly={isInputLocked}
            tabIndex={isInputLocked ? -1 : 0}
            aria-readonly={isInputLocked}
            onPressEnter={canAdvance ? handleNext : undefined}
            onFocus={isInputLocked ? undefined : () => setIsFocused(true)}
            onBlur={isInputLocked ? undefined : () => setIsFocused(false)}
            style={{
              caretColor: isInputLocked ? "transparent" : inputBorderColor,
            }}
            className={`h-12 rounded-none border-0 px-0 text-2xl font-medium leading-tight tracking-tight transition-colors focus:shadow-none sm:text-3xl ${inputTextColor} ${inputPlaceholderColor} ${
              isInputLocked ? "pointer-events-none" : ""
            }`}
          />,
        );
    }
  };

  return (
    <div
      className={`relative mx-auto w-full rounded-[28px] border shadow-sm transition-all duration-300 ${frameClassName}`}
    >
      <div
        className="absolute left-0 right-0 top-0 h-[4px] overflow-hidden rounded-t-[28px]"
        style={{ backgroundColor: progressTrackColor }}
      >
        <div
          className={`h-full transition-[width] duration-500 ease-out ${progressFillClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div
        className={`mx-auto flex h-full w-full flex-col ${contentClassName} ${contentPadding}`}
      >
        <div className="flex flex-1 min-h-0 flex-col">
          <div
            ref={scrollRef}
            className="preview-scroll flex-1 overflow-y-auto overflow-x-hidden pr-2"
            style={
              {
                "--scrollbar-track": scrollTrackColor,
                "--scrollbar-thumb": scrollThumbColor,
                "--scrollbar-thumb-hover": scrollThumbHoverColor,
                paddingBottom: `${scrollPaddingBottom}px`,
              } as React.CSSProperties
            }
          >
            <div className="flex min-h-full flex-col justify-center">
              <div
                key={currentField?.id ?? "placeholder"}
                ref={contentMeasureRef}
                className={`space-y-5 transform-gpu ${questionAnimationClass}`}
              >
                <div
                  className={`text-lg font-semibold sm:text-xl ${designProps?.textAlign === "center" ? "text-center" : designProps?.textAlign === "right" ? "text-right" : ""}`}
                  style={
                    hasCustomDesign
                      ? {
                          fontFamily: titleStyle.fontFamily,
                        }
                      : undefined
                  }
                >
                  <span className={labelColor}>{questionNumber}.</span>{" "}
                  <span
                    className={
                      hasCustomDesign && titleStyle.color ? "" : titleColor
                    }
                    style={
                      hasCustomDesign
                        ? {
                            fontWeight: titleStyle.fontWeight,
                            fontStyle: titleStyle.fontStyle,
                            textDecoration: titleStyle.textDecoration,
                            color: titleStyle.color,
                          }
                        : undefined
                    }
                  >
                    {currentField ? titleText : placeholderTitle}
                  </span>
                  {isRequired && <span className="text-rose-500"> *</span>}
                </div>

                <div
                  className={`text-sm italic ${descriptionColor} ${designProps?.textAlign === "center" ? "text-center" : designProps?.textAlign === "right" ? "text-right" : ""}`}
                  style={
                    hasCustomDesign
                      ? {
                          fontFamily: titleStyle.fontFamily,
                        }
                      : undefined
                  }
                >
                  {currentField ? descriptionText : placeholderDescription}
                </div>
                {imageUrl && (
                  <div className="my-4">
                    <AntdImage
                      src={imageUrl}
                      alt={titleText}
                      style={{
                        maxWidth: "100%",
                        maxHeight: 280,
                        objectFit: "contain",
                        borderRadius: 12,
                      }}
                      className={`shadow-md ${
                        isDarkMode
                          ? "shadow-slate-900/50"
                          : "shadow-slate-200/70"
                      }`}
                      placeholder={
                        <div
                          className={`flex h-40 w-full items-center justify-center rounded-xl ${
                            isDarkMode ? "bg-slate-800" : "bg-slate-100"
                          }`}
                        >
                          <span className={descriptionColor}>Loading...</span>
                        </div>
                      }
                    />
                  </div>
                )}

                {renderFieldInput()}
                {isEndOfForm && (
                  <div className={`text-xs font-medium ${descriptionColor}`}>
                    End of form reached.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {!isView && (
          <div className="absolute bottom-8 left-0 right-0" ref={actionBarRef}>
            <div className={`mx-auto w-full ${contentClassName}`}>
              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 shadow-xl backdrop-blur-sm ${actionBarClass}`}
              >
                <Button
                  type="default"
                  icon={
                    <ArrowLeftOutlined className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                  }
                  onClick={handleBack}
                  disabled={!history.length}
                  className={`group h-12 min-w-[120px] gap-2 rounded-full px-5 text-base font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${backButtonClass}`}
                >
                  Back
                </Button>
                <Button
                  type="primary"
                  icon={
                    <ArrowRightOutlined className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  }
                  onClick={handleNext}
                  disabled={!canAdvance}
                  loading={isNavigating}
                  className={`group h-12 flex-1 gap-2 rounded-full text-base font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${okButtonClass} ${styles.gradientButton}`}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .preview-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
        }
        .preview-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .preview-scroll::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border-radius: 999px;
        }
        .preview-scroll::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .preview-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
        }
        .question-zoom {
          animation: questionZoom 460ms cubic-bezier(0.16, 1, 0.3, 1) both;
          transform-origin: center;
        }
        @keyframes questionZoom {
          0% {
            opacity: 0;
            transform: scale(1.04);
          }
          60% {
            opacity: 1;
            transform: scale(0.995);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .question-zoom {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
