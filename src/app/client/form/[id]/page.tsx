"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Alert, Button, Skeleton, Spin } from "antd";
import {
  CheckCircleOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  AnswerDto,
  FieldWithLogicResponseEntity,
  SubmitFormCommand,
} from "EduSmart/api/api-auth-service";
import { FormPreviewCard } from "EduSmart/components/FormPreview/FormPreviewCard";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useNotification } from "EduSmart/Provider/NotificationProvider";

type ClientFormPageProps = {
  params: Promise<{ id: string }>;
};

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formSessionKey, setFormSessionKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const {
    getPublishedFormWithFieldsAndLogic,
    getNextQuestion,
    submitForm,
  } = useFormsStore();
  const messageApi = useNotification();

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxY(window.scrollY || 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setLoadError(null);
    try {
      const result = await getPublishedFormWithFieldsAndLogic(formId);
      if (!result) {
        throw new Error("Failed to load form");
      }
      setFormTitle(result.title ?? null);
      setFormFields(result.fields);
    } catch (error) {
      console.error("Failed to load published form:", error);
      setLoadError("Không thể tải biểu mẫu. Vui lòng thử lại.");
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
    if (submitState === "error") {
      setSubmitState("idle");
      setSubmitError(null);
    }
  }, [submitState]);

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
      setSubmitError(null);
      try {
        const result = await submitForm(data);
        if (!result.success) {
          throw new Error(result.message ?? "Submit failed");
        }
        setSubmitState("success");
        setSubmitError(null);
        messageApi.success("Gửi biểu mẫu thành công!");
      } catch (error) {
        console.error("Submit form failed:", error);
        setSubmitState("error");
        const fallbackMessage = "Gửi biểu mẫu thất bại. Vui lòng thử lại.";
        setSubmitError(fallbackMessage);
        messageApi.error(fallbackMessage);
      }
    },
    [answers, submitForm, submitPayload, submitState, messageApi],
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

  const showSkeleton =
    isLoading && formFields.length === 0 && submitState !== "success";
  const cardMode = showSkeleton
    ? "loading"
    : submitState === "success"
      ? "success"
      : "form";
  const enterClass = cardMode === "success" ? "card-enter-corner" : "card-enter";
  const exitClass = cardMode === "success" ? "card-exit-corner" : "card-exit";

  useLayoutEffect(() => {
    setCardVisible(false);
  }, [cardMode]);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setCardVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [cardMode]);

  return (
    <div
      className={`${plusJakarta.variable} relative min-h-[100dvh] overflow-hidden bg-slate-50 px-4 py-6 font-[family-name:var(--font-plus-jakarta)] sm:py-8`}
    >
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-48 w-[560px] rounded-full bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100 blur-3xl opacity-65"
        style={{
          transform: `translate3d(-50%, ${parallaxY * 0.06}px, 0)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-slate-200/70 to-transparent blur-3xl"
        style={{
          transform: `translate3d(33%, ${parallaxY * -0.04}px, 0)`,
        }}
      />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5">
        <div
          className={`flex w-full flex-col items-center gap-1 text-center ${
            isMounted ? "fade-in" : "opacity-0"
          }`}
        >
          <span className="rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600 shadow-sm">
            Biểu mẫu công khai
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
            {formTitle ?? "Biểu mẫu"}
          </h1>
          <p className="max-w-[620px] text-xs text-slate-500">
            Điền biểu mẫu bên dưới. Các trường có dấu * là bắt buộc.
          </p>
        </div>

        {loadError && (
          <Alert
            type="error"
            message={loadError}
            showIcon
            className="w-full max-w-[980px]"
          />
        )}

        {showSkeleton ? (
          <div
            className={`w-full max-w-[980px] card-shell ${
              cardVisible ? enterClass : exitClass
            }`}
          >
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-center gap-3">
                <Spin
                  indicator={<LoadingOutlined className="text-indigo-500" />}
                />
                <div className="text-sm font-medium text-slate-600">
                  Đang tải biểu mẫu...
                </div>
              </div>
              <div className="mt-6">
                <Skeleton
                  active
                  title={{ width: 220 }}
                  paragraph={{
                    rows: 6,
                    width: ["100%", "92%", "96%", "88%", "100%", "70%"],
                  }}
                />
                <div className="mt-6 flex gap-3">
                  <Skeleton.Button active size="default" />
                  <Skeleton.Button active size="default" />
                </div>
              </div>
            </div>
          </div>
        ) : submitState !== "success" ? (
          <div
            className={`w-full max-w-[980px] card-shell ${
              cardVisible ? enterClass : exitClass
            }`}
          >
            <div className="relative">
              <FormPreviewCard
                key={formSessionKey}
                isView={false}
                frameClassName="h-[min(640px,calc(100dvh-190px))] w-full border-slate-200 bg-white/95 shadow-[0_18px_44px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/70 backdrop-blur"
                contentClassName="max-w-[760px] px-6 sm:px-10"
                fields={formFields}
                isLoading={isLoading}
                onAnswerCommit={handleAnswerCommit}
                onFormComplete={(payload) => handleSubmit(payload)}
                onNextQuestion={handleNextQuestion}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm">
                  <Spin
                    indicator={
                      <LoadingOutlined className="text-indigo-500 text-2xl" />
                    }
                    tip="Đang tải..."
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[980px] min-h-[min(640px,calc(100dvh-190px))] flex items-center justify-center">
            <div className="w-full card-shell success-shell success-morph">
              <div className="rounded-3xl border border-emerald-200/70 bg-white/95 p-10 md:p-12 text-center shadow-[0_22px_60px_rgba(15,23,42,0.1)] backdrop-blur min-h-[420px] flex flex-col items-center justify-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircleOutlined className="text-3xl" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                Gửi phản hồi thành công
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Cảm ơn bạn đã dành thời gian trả lời biểu mẫu.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSubmitState("idle");
                    setAnswers([]);
                    setSubmitError(null);
                    setFormSessionKey((prev) => prev + 1);
                  }}
                >
                  Gửi phản hồi khác
                </Button>
              </div>
              </div>
            </div>
          </div>
        )}

        {submitState === "submitting" && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Spin size="small" />
            Đang gửi...
          </div>
        )}
        {submitState === "error" && (
          <div className="flex flex-col items-center gap-2">
            <Button type="primary" onClick={() => handleSubmit()}>
              Thử gửi lại
            </Button>
            {submitError && (
              <span className="text-xs text-rose-500">{submitError}</span>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        .fade-in {
          animation: fadeUp 0.6s ease both;
        }
        .card-shell {
          will-change: transform, opacity, box-shadow, border-radius;
          transition:
            transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 820ms ease,
            box-shadow 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            border-radius 1100ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-exit {
          opacity: 0;
          transform: translate3d(0, 34px, 0) scale(0.96);
          border-radius: 44px;
          box-shadow: 0 0 0 rgba(15, 23, 42, 0);
        }
        .card-enter {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
        }
        .card-exit-corner {
          opacity: 0;
          transform-origin: top right;
          transform: translate3d(240px, -160px, 0) scale(0.84) rotate(1.4deg);
          border-radius: 48px;
          box-shadow: 0 0 0 rgba(15, 23, 42, 0);
        }
        .card-enter-corner {
          opacity: 1;
          transform-origin: top right;
          transform: translate3d(0, 0, 0) scale(1);
          border-radius: 28px;
          box-shadow: 0 28px 90px rgba(15, 23, 42, 0.16);
        }
        .success-morph {
          transform-origin: top right;
          animation: successMorph 1400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .success-shell {
          position: relative;
        }
        .success-shell::before {
          content: "";
          position: absolute;
          inset: -18px;
          border-radius: 36px;
          background: radial-gradient(
            120% 120% at 15% 10%,
            rgba(16, 185, 129, 0.25) 0%,
            rgba(16, 185, 129, 0.08) 45%,
            rgba(255, 255, 255, 0) 70%
          );
          filter: blur(24px);
          opacity: 0.8;
          z-index: -1;
        }
        .success-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: linear-gradient(
            135deg,
            rgba(209, 250, 229, 0.7),
            rgba(255, 255, 255, 0.9) 45%,
            rgba(167, 243, 208, 0.4)
          );
          opacity: 0.55;
          z-index: -1;
        }
        @keyframes successMorph {
          0% {
            opacity: 0;
            transform: translate3d(280px, -190px, 0) scale(0.8)
              rotate(1.6deg);
            border-radius: 56px;
            box-shadow: 0 0 0 rgba(15, 23, 42, 0);
          }
          60% {
            opacity: 1;
            transform: translate3d(-8px, 6px, 0) scale(1.02)
              rotate(-0.2deg);
            border-radius: 30px;
            box-shadow: 0 32px 90px rgba(15, 23, 42, 0.14);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0);
            border-radius: 28px;
            box-shadow: 0 22px 60px rgba(15, 23, 42, 0.1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .success-morph {
            animation: none;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
