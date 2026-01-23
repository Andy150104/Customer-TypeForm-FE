import { create } from "zustand";
import { useLoadingStore } from "../Loading/LoadingStore";
import { FormResponseEntity, CreateFormCommand } from "EduSmart/api/api-auth-service";
import apiClient from "EduSmart/hooks/apiClient";

interface FormsState {
  forms: FormResponseEntity[];
  fetchForms: () => Promise<void>;
  createForm: (data: CreateFormCommand) => Promise<FormResponseEntity | null>;
}

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
  }),
);
