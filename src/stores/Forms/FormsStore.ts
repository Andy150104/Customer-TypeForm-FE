import { create } from "zustand";
import { useLoadingStore } from "../Loading/LoadingStore";
import {
  CreateFieldCommand,
  CreateFieldResponseEntity,
  CreateFormCommand,
  CreateOrUpdateLogicCommand,
  FieldWithLogicResponseEntity,
  FormResponseEntity,
  FormWithFieldsAndLogicResponseEntity,
  LogicResponseEntity,
  ReorderFieldsCommand,
  SubmitFormCommand,
  UpdateFieldCommand,
  UpdateFieldResponseEntity,
  UpdateFormCommand,
  UpdateFormPublishedStatusCommand,
  UpdateFormResponseEntity,
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
  updateForm: (
    data: UpdateFormCommand,
  ) => Promise<UpdateFormResponseEntity | null>;
  updateFormPublishedStatus: (
    data: UpdateFormPublishedStatusCommand,
  ) => Promise<boolean>;
  deleteForm: (formId: string) => Promise<boolean>;
  createField: (
    data: CreateFieldCommand,
  ) => Promise<CreateFieldResponseEntity | null>;
  updateField: (
    data: UpdateFieldCommand,
  ) => Promise<UpdateFieldResponseEntity | null>;
  deleteField: (fieldId: string) => Promise<boolean>;
  reorderFields: (data: ReorderFieldsCommand) => Promise<boolean>;
  createOrUpdateLogic: (
    data: CreateOrUpdateLogicCommand,
  ) => Promise<LogicResponseEntity | null>;
  deleteLogic: (fieldId: string, logicId: string) => Promise<boolean>;
  getFormWithFieldsAndLogic: (
    formId: string,
  ) => Promise<FormWithFieldsResult | null>;
  getPublishedFormWithFieldsAndLogic: (
    formId: string,
  ) => Promise<FormWithFieldsResult | null>;
  getNextQuestion: (
    formId: string,
    currentFieldId: string,
    currentValue: string | null,
  ) => Promise<NextQuestionResult>;
  submitForm: (
    data: SubmitFormCommand,
  ) => Promise<{ success: boolean; message?: string | null }>;
}

const orderFields = (fields?: FieldWithLogicResponseEntity[] | null) =>
  [...(fields ?? [])].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

export const useFormsStore = create<FormsState>((set) => ({
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
      const response =
        await apiClient.authEduService.api.v1FormsCreateFormCreate(data);
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
  updateForm: async (data: UpdateFormCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsUpdateFormUpdate(data);
      if (response.data?.success && response.data?.response) {
        const updatedForm = response.data.response;
        // Update form in local state
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === updatedForm.id
              ? {
                  ...f,
                  title: updatedForm.title,
                  slug: updatedForm.slug,
                  isPublished: updatedForm.isPublished,
                  updatedAt: updatedForm.updatedAt,
                }
              : f,
          ),
        }));
        return updatedForm;
      }
      return null;
    } catch (error) {
      console.error("updateForm error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },
  deleteForm: async (formId: string) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsDeleteFormDelete({
          formId,
        });
      if (response.data?.success) {
        // Remove form from local state
        set((state) => ({
          forms: state.forms.filter((f) => f.id !== formId),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("deleteForm error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  },
  updateFormPublishedStatus: async (data: UpdateFormPublishedStatusCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsUpdateFormPublishedStatusCreate(
          data,
        );
      if (response.data?.success && response.data?.response) {
        const updatedData = response.data.response;
        // Update local state with new published status
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === data.formId
              ? {
                  ...f,
                  isPublished: updatedData.isPublished,
                  updatedAt: updatedData.updatedAt,
                }
              : f,
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("updateFormPublishedStatus error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  },
  createField: async (data: CreateFieldCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsCreateFieldCreate(data);
      if (response.data?.success && response.data?.response) {
        return response.data.response;
      }
      return null;
    } catch (error) {
      console.error("createField error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },
  updateField: async (data: UpdateFieldCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsUpdateFieldUpdate(data);
      if (response.data?.success && response.data?.response) {
        return response.data.response;
      }
      return null;
    } catch (error) {
      console.error("updateField error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },
  deleteField: async (fieldId: string) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsDeleteFieldDelete({
          fieldId,
        });
      if (response.data?.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("deleteField error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  },
  reorderFields: async (data: ReorderFieldsCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsReorderFieldsCreate(data);
      if (response.data?.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("reorderFields error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  },
  createOrUpdateLogic: async (data: CreateOrUpdateLogicCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsCreateOrUpdateLogicCreate(
          data,
        );
      if (response.data?.success && response.data?.response) {
        return response.data.response;
      }
      return null;
    } catch (error) {
      console.error("createOrUpdateLogic error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },
  deleteLogic: async (fieldId: string, logicId: string) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1FormsDeleteLogicDelete({
          fieldId,
          logicId,
        });
      if (response.data?.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("deleteLogic error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  },
  getFormWithFieldsAndLogic: async (formId: string) => {
    try {
      const response =
        await apiClient.authEduService.api.v1FormsGetFormWithFieldsAndLogicList(
          {
            formId,
          },
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
}));
