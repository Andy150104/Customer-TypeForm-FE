import { create } from "zustand";
import { useLoadingStore } from "../Loading/LoadingStore";
import {
  CreateFormCommand,
  FieldWithLogicResponseEntity,
  FormResponseEntity,
  FormWithFieldsAndLogicResponseEntity,
  SubmitFormCommand,
} from "EduSmart/api/api-auth-service";
import apiClient from "EduSmart/hooks/apiClient";

type FormWithFieldsResult = {
  title: string | null;
  form: FormWithFieldsAndLogicResponseEntity | null;
  fields: FieldWithLogicResponseEntity[];
};

type NextQuestionResult = {
  nextFieldId: string | null;
  isEndOfForm: boolean;
};

interface FormsState {
  forms: FormResponseEntity[];
  fetchForms: () => Promise<void>;
  createForm: (data: CreateFormCommand) => Promise<FormResponseEntity | null>;
  getFormWithFieldsAndLogic: (formId: string) => Promise<FormWithFieldsResult | null>;
  getPublishedFormWithFieldsAndLogic: (
    formId: string,
  ) => Promise<FormWithFieldsResult | null>;
  getNextQuestion: (
    formId: string,
    currentFieldId: string,
    currentValue: string | null,
  ) => Promise<NextQuestionResult>;
  submitForm: (data: SubmitFormCommand) => Promise<{ success: boolean; message?: string | null }>;
}

const orderFields = (fields?: FieldWithLogicResponseEntity[] | null) =>
  [...(fields ?? [])].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

export const useFormsStore = create<FormsState>(
  (set) => ({
    forms: [],
    fetchForms: async () => {
      const setLoading = useLoadingStore.getState().setLoading;
      setLoading(true);
      try {
        const response = await apiClient.authEduService.api.v1FormsGetFormsList();
        if (response.data?.success && response.data?.response) {
          set({ forms: response.data.response });
        }
      } catch (error) {
        console.error("fetchForms error:", error);
      } finally {
        setLoading(false);
      }
    },
    createForm: async (data: CreateFormCommand) => {
      const setLoading = useLoadingStore.getState().setLoading;
      setLoading(true);
      try {
        const response = await apiClient.authEduService.api.v1FormsCreateFormCreate(data);
        if (response.data?.success && response.data?.response) {
          const newForm: FormResponseEntity = {
            id: response.data.response.id,
            title: response.data.response.title,
            slug: response.data.response.slug,
            isPublished: response.data.response.isPublished,
            createdAt: response.data.response.createdAt,
            updatedAt: response.data.response.createdAt, // Use createdAt as updatedAt if not available
          };
          // Thêm form mới vào đầu danh sách
          set((state) => ({ forms: [newForm, ...state.forms] }));
          return newForm;
        }
        return null;
      } catch (error) {
        console.error("createForm error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    getFormWithFieldsAndLogic: async (formId: string) => {
      try {
        const response =
          await apiClient.authEduService.api.v1FormsGetFormWithFieldsAndLogicList({
            formId,
          });
        if (!response.data?.success) {
          return null;
        }
        const form = response.data?.response ?? null;
        return {
          title: form?.title ?? null,
          form,
          fields: orderFields(form?.fields ?? []),
        };
      } catch (error) {
        console.error("getFormWithFieldsAndLogic error:", error);
        return null;
      }
    },
    getPublishedFormWithFieldsAndLogic: async (formId: string) => {
      try {
        const response =
          await apiClient.authEduService.api.v1FormsGetPublishedFormWithFieldsAndLogicList(
            { formId },
          );
        if (!response.data?.success) {
          return null;
        }
        const form = response.data?.response ?? null;
        return {
          title: form?.title ?? null,
          form,
          fields: orderFields(form?.fields ?? []),
        };
      } catch (error) {
        console.error("getPublishedFormWithFieldsAndLogic error:", error);
        return null;
      }
    },
    getNextQuestion: async (
      formId: string,
      currentFieldId: string,
      currentValue: string | null,
    ) => {
      const response =
        await apiClient.authEduService.api.v1FormsGetNextQuestionCreate({
          formId,
          currentFieldId,
          currentValue,
        });
      if (!response.data?.success) {
        throw new Error(response.data?.message ?? "Get next question failed");
      }
      return {
        nextFieldId: response.data.response?.nextFieldId ?? null,
        isEndOfForm: Boolean(response.data.response?.isEndOfForm),
      };
    },
    submitForm: async (data: SubmitFormCommand) => {
      try {
        const response =
          await apiClient.authEduService.api.v1FormsSubmitFormCreate(data);
        return {
          success: Boolean(response.data?.success),
          message: response.data?.message ?? null,
        };
      } catch (error) {
        console.error("submitForm error:", error);
        return { success: false, message: "Submit failed" };
      }
    },
  }),
);
