"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Spin } from "antd";
import {
  AnswerDto,
  FieldWithLogicResponseEntity,
  SubmitFormCommand,
} from "EduSmart/api/api-auth-service";
import { FormPreviewCard } from "EduSmart/components/FormPreview/FormPreviewCard";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";

type ClientFormPageProps = {
  params: Promise<{ id: string }>;
};

const mergeAnswers = (current: AnswerDto[], payload: AnswerDto[]) => {
  if (!payload.length) return current;
  const fieldId = payload[0]?.fieldId;
  if (!fieldId) return current;
  const filtered = current.filter((answer) => answer.fieldId !== fieldId);
  return [...filtered, ...payload];
};

export default function ClientFormPage({ params }: ClientFormPageProps) {
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FieldWithLogicResponseEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<AnswerDto[]>([]);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    getPublishedFormWithFieldsAndLogic,
    getNextQuestion,
    submitForm,
  } = useFormsStore();

  useEffect(() => {
    let isActive = true;
    Promise.resolve(params)
      .then((resolved) => {
        if (isActive) {
          setFormId(resolved.id);
        }
      })
      .catch((error) => {
        console.error("Failed to resolve route params:", error);
      });
    return () => {
      isActive = false;
    };
  }, [params]);

  const submitPayload = useMemo(
    () =>
      formId
        ? {
            formId,
            metaData: { submittedAt: new Date().toISOString() },
          }
        : null,
    [formId],
  );

  const fetchForm = useCallback(async () => {
    if (!formId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await getPublishedFormWithFieldsAndLogic(formId);
      if (!result) {
        throw new Error("Failed to load form");
      }
      setFormTitle(result.title ?? null);
      setFormFields(result.fields);
    } catch (error) {
      console.error("Failed to load published form:", error);
      setErrorMessage("Unable to load the form. Please try again.");
      setFormFields([]);
    } finally {
      setIsLoading(false);
    }
  }, [formId, getPublishedFormWithFieldsAndLogic]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const handleAnswerCommit = useCallback((payload: AnswerDto[]) => {
    setAnswers((prev) => mergeAnswers(prev, payload));
  }, []);

  const handleSubmit = useCallback(
    async (payload?: AnswerDto[]) => {
      if (submitState === "submitting") return;
      const combinedAnswers = payload?.length
        ? mergeAnswers(answers, payload)
        : answers;
      if (!submitPayload) return;
      const data: SubmitFormCommand = {
        ...submitPayload,
        answers: combinedAnswers,
      };

      setSubmitState("submitting");
      setErrorMessage(null);
      try {
        const result = await submitForm(data);
        if (!result.success) {
          throw new Error(result.message ?? "Submit failed");
        }
        setSubmitState("success");
      } catch (error) {
        console.error("Submit form failed:", error);
        setSubmitState("error");
        setErrorMessage("Form submission failed. Please try again.");
      }
    },
    [answers, submitForm, submitPayload, submitState],
  );

  const handleNextQuestion = useCallback(
    async (currentFieldId: string, currentValue: string) => {
      const payloadValue =
        currentValue && currentValue.trim() !== "" ? currentValue : null;
      if (!formId) {
        return null;
      }
      const result = await getNextQuestion(formId, currentFieldId, payloadValue);
      if (result.isEndOfForm) {
        return null;
      }
      return result.nextFieldId ?? null;
    },
    [formId, getNextQuestion],
  );

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-slate-50 px-4 py-6 sm:py-8">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-48 w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100 blur-3xl opacity-65" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/3 rounded-full bg-gradient-to-br from-slate-200/70 to-transparent blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5">
        <div className="flex w-full flex-col items-center gap-1 text-center">
          <span className="rounded-full border border-indigo-200/60 bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 shadow-sm">
            Public form
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
            {formTitle ?? "Form"}
          </h1>
          <p className="max-w-[620px] text-xs text-slate-500">
            Fill in the form below. Fields marked * are required.
          </p>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            showIcon
            className="w-full max-w-[980px]"
          />
        )}

        <FormPreviewCard
          isView={false}
          frameClassName="h-[min(640px,calc(100dvh-190px))] w-full border-slate-200 bg-white/95 shadow-[0_18px_44px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/70 backdrop-blur"
          contentClassName="max-w-[760px] px-6 sm:px-10"
          fields={formFields}
          isLoading={isLoading}
          onAnswerCommit={handleAnswerCommit}
          onFormComplete={(payload) => handleSubmit(payload)}
          onNextQuestion={handleNextQuestion}
        />

        {submitState === "submitting" && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Spin size="small" />
            Submitting...
          </div>
        )}
        {submitState === "success" && (
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Form submitted successfully. Thank you!
          </div>
        )}
        {submitState === "error" && (
          <Button type="primary" onClick={() => handleSubmit()}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
