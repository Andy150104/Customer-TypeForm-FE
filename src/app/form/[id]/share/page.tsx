"use client";

import React, { useEffect, useState } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { FieldWithLogicResponseEntity } from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { SharePanel } from "EduSmart/components/Share/SharePanel";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

const tabs = ["Content", "Workflow", "Connect", "Share", "Results"];

export default function FormSharePage({ params }: SharePageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { getFormWithFieldsAndLogic } = useFormsStore();
  const [formFields, setFormFields] = useState<FieldWithLogicResponseEntity[]>(
    [],
  );
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const activeTabIndex = Math.max(0, tabs.indexOf("Share"));
  const tabSurface = isDarkMode
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-200 bg-white/90 shadow-sm";
  const tabInactiveClass = isDarkMode
    ? "text-slate-300 hover:bg-slate-800/80"
    : "text-slate-600 hover:bg-slate-100";
  const brandColor = "#6B46C1";

  const handleTabChange = (tab: string) => {
    if (tab === "Share") return;
    if (formId) {
      router.push(`/form/${formId}/edit`);
    }
  };

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
    if (!formId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://uniwrap.app";
    setShareUrl(`${origin}/client/form/${formId}`);
  }, [formId]);

  useEffect(() => {
    let isActive = true;
    const loadFormFields = async () => {
      setIsFormLoading(true);
      try {
        if (!formId) return;
        const result = await getFormWithFieldsAndLogic(formId);
        if (!isActive) return;
        setFormFields(result?.fields ?? []);
      } catch (error) {
        console.error("Failed to load form logic:", error);
        if (isActive) {
          setFormFields([]);
        }
      } finally {
        if (isActive) {
          setIsFormLoading(false);
        }
      }
    };

    loadFormFields();
    return () => {
      isActive = false;
    };
  }, [formId, getFormWithFieldsAndLogic]);

  useEffect(() => {
    if (!formFields.length) {
      setActiveFieldId(null);
      return;
    }
    const hasActive = formFields.some((field) => field.id === activeFieldId);
    if (!hasActive) {
      setActiveFieldId(formFields[0]?.id ?? null);
    }
  }, [activeFieldId, formFields]);

  return (
    <BaseScreenAdmin>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <div
          className={`relative inline-grid grid-cols-5 items-center rounded-full border p-1 ${tabSurface}`}
        >
          <span
            className="absolute left-1 top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
            style={{
              width: `calc((100% - 8px) / ${tabs.length})`,
              transform: `translateX(${activeTabIndex * 100}%)`,
              backgroundColor: brandColor,
            }}
          />
          {tabs.map((tab) => {
            const isActive = tab === "Share";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                style={isActive ? { color: "#ffffff" } : undefined}
                className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "text-white" : tabInactiveClass
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <SharePanel
          shareUrl={shareUrl}
          isDarkMode={isDarkMode}
          formFields={formFields}
          isFormLoading={isFormLoading}
          activeFieldId={activeFieldId}
          onActiveFieldChange={setActiveFieldId}
        />
      </div>
    </BaseScreenAdmin>
  );
}
