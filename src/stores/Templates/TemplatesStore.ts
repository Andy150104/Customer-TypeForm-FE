import { create } from "zustand";
import { useLoadingStore } from "../Loading/LoadingStore";
import {
  CreateTemplateCommand,
  CreateTemplateResponseEntity,
  TemplateSummaryResponseEntity,
  TemplateWithFieldsResponseEntity,
  CreateFormFromTemplateCommand,
  CreateFormFromTemplateResponseEntity,
} from "EduSmart/api/api-auth-service";
import apiClient from "EduSmart/hooks/apiClient";

interface TemplatesState {
  templates: TemplateSummaryResponseEntity[];
  fetchTemplates: () => Promise<void>;
  createTemplate: (
    data: CreateTemplateCommand,
  ) => Promise<CreateTemplateResponseEntity | null>;
  getTemplateWithFields: (
    templateId: string,
  ) => Promise<TemplateWithFieldsResponseEntity | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  createFormFromTemplate: (
    data: CreateFormFromTemplateCommand,
  ) => Promise<CreateFormFromTemplateResponseEntity | null>;
}

export const useTemplatesStore = create<TemplatesState>((set) => ({
  templates: [],

  fetchTemplates: async () => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1TemplatesGetTemplatesList();
      if (response.data?.success && response.data?.response) {
        set({ templates: response.data.response });
      }
    } catch (error) {
      console.error("fetchTemplates error:", error);
    } finally {
      setLoading(false);
    }
  },

  createTemplate: async (data: CreateTemplateCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1TemplatesCreateTemplateCreate(
          data,
        );
      if (response.data?.success && response.data?.response) {
        // Refresh templates list
        const listResponse =
          await apiClient.authEduService.api.v1TemplatesGetTemplatesList();
        if (listResponse.data?.success && listResponse.data?.response) {
          set({ templates: listResponse.data.response });
        }
        return response.data.response;
      }
      return null;
    } catch (error) {
      console.error("createTemplate error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },

  getTemplateWithFields: async (templateId: string) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1TemplatesGetTemplateWithFieldsList(
          { templateId },
        );
      if (response.data?.success && response.data?.response) {
        return response.data.response;
      }
      return null;
    } catch (error) {
      console.error("getTemplateWithFields error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },

  deleteTemplate: async (templateId: string) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1TemplatesDeleteTemplateDelete({
          templateId,
        });
      if (response.data?.success) {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("deleteTemplate error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  },

  createFormFromTemplate: async (data: CreateFormFromTemplateCommand) => {
    const setLoading = useLoadingStore.getState().setLoading;
    setLoading(true);
    try {
      const response =
        await apiClient.authEduService.api.v1TemplatesCreateFormFromTemplateCreate(
          data,
        );
      if (response.data?.success && response.data?.response) {
        return response.data.response;
      }
      return null;
    } catch (error) {
      console.error("createFormFromTemplate error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  },
}));
