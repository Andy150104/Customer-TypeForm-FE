"use client";

import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import { Button, Modal, Popconfirm, Tooltip } from "antd";
import {
  PlusOutlined,
  BgColorsOutlined,
  LaptopOutlined,
  MobileOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined,
  UploadOutlined,
  MailOutlined,
  FormOutlined,
  BarsOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  PaperClipOutlined,
  StarOutlined,
  SlidersOutlined,
  NumberOutlined,
  BulbOutlined,
  DownOutlined,
  DeleteOutlined,
  HolderOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  CreateFieldResponseEntity,
  FieldWithLogicResponseEntity,
  UpdateFieldResponseEntity,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { FormPreviewCard } from "EduSmart/components/FormPreview/FormPreviewCard";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useRouter } from "next/navigation";
import { AddContentModal } from "EduSmart/components/Modal/AddContentModal";
import { EditFieldModal } from "EduSmart/components/Modal/EditFieldModal";
import { DesignFieldModal } from "EduSmart/components/Modal/DesignFieldModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const tabs = ["Content", "Workflow", "Share", "Results"];

const getFieldTone = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email") || normalized.includes("phone")) {
    return "orange";
  }
  return "amber";
};

const getFieldIcon = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email")) return <MailOutlined />;
  if (normalized.includes("phone")) return <PhoneOutlined />;
  if (normalized.includes("date")) return <CalendarOutlined />;
  if (normalized.includes("time")) return <ClockCircleOutlined />;
  if (normalized.includes("number")) return <NumberOutlined />;
  if (normalized.includes("rating")) return <StarOutlined />;
  if (normalized.includes("scale")) return <SlidersOutlined />;
  if (normalized.includes("file")) return <PaperClipOutlined />;
  if (normalized.includes("checkbox")) return <CheckSquareOutlined />;
  if (normalized.includes("radio") || normalized.includes("yesno")) {
    return <CheckCircleOutlined />;
  }
  if (normalized.includes("select")) return <FormOutlined />;
  if (normalized.includes("textarea") || normalized.includes("text")) {
    return <BarsOutlined />;
  }
  return <BarsOutlined />;
};

type SortableFieldItemProps = {
  field: FieldWithLogicResponseEntity;
  index: number;
  isActive: boolean;
  isDarkMode: boolean;
  isDeletingField: boolean;
  onSelect: (id: string) => void;
  onEdit: (field: FieldWithLogicResponseEntity) => void;
  onDelete: (id: string) => void;
};

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  index,
  isActive,
  isDarkMode,
  isDeletingField,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id ?? `field-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  const tone = getFieldTone(field.type);
  const badgeTone =
    tone === "orange"
      ? isDarkMode
        ? "bg-orange-500/20 text-orange-200"
        : "bg-orange-100 text-orange-700"
      : isDarkMode
        ? "bg-amber-500/20 text-amber-200"
        : "bg-amber-100 text-amber-700";
  const label = field.title?.trim() || `Question ${index + 1}`;
  const order = field.order ?? index + 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors ${
        isActive
          ? isDarkMode
            ? "bg-amber-950/40 border border-amber-800/30"
            : "bg-amber-50 border border-amber-200"
          : "bg-transparent hover:bg-amber-50/50"
      } ${isDarkMode ? "hover:bg-amber-950/30" : ""} ${isDragging ? "shadow-lg" : ""}`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className={`flex h-8 w-6 cursor-grab items-center justify-center rounded-lg transition-colors active:cursor-grabbing ${
          isDarkMode
            ? "text-amber-500/50 hover:text-amber-400 hover:bg-amber-950/50"
            : "text-amber-400 hover:text-amber-600 hover:bg-amber-100"
        }`}
        {...attributes}
        {...listeners}
      >
        <HolderOutlined />
      </button>

      {/* Content */}
      <button
        type="button"
        onClick={() => field.id && onSelect(field.id)}
        disabled={!field.id}
        className="flex flex-1 min-w-0 items-center gap-3 text-left"
      >
        <div
          className={`flex h-10 w-14 flex-shrink-0 items-center justify-center gap-1 rounded-xl ${badgeTone}`}
        >
          {getFieldIcon(field.type)}
          <span className="text-sm font-semibold">{order}</span>
        </div>
        <span
          className={`flex-1 min-w-0 text-sm font-medium truncate ${isDarkMode ? "text-amber-100" : "text-amber-900"}`}
        >
          {label}
          {field.isRequired && <span className="text-rose-500"> *</span>}
        </span>
      </button>

      {/* Actions */}
      {field.id && (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit field">
            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100 ${
                isDarkMode
                  ? "text-amber-400/60 hover:bg-amber-500/20 hover:text-amber-400"
                  : "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(field);
              }}
            >
              <EditOutlined />
            </button>
          </Tooltip>
          <Popconfirm
            title="Delete this field?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(field.id!)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              loading: isDeletingField,
            }}
          >
            <Tooltip title="Delete field">
              <button
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100 ${
                  isDarkMode
                    ? "text-amber-400/60 hover:bg-red-500/20 hover:text-red-400"
                    : "text-amber-500 hover:bg-red-50 hover:text-red-500"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteOutlined />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function FormEditorPage({ params }: EditorPageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const messageApi = useNotification();
  const [formId, setFormId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const isMobilePreview = previewMode === "mobile";
  const [isPlayOpen, setIsPlayOpen] = useState(false);
  const [isPlayVisible, setIsPlayVisible] = useState(false);
  const [formFields, setFormFields] = useState<FieldWithLogicResponseEntity[]>(
    [],
  );
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isDeletingField, setIsDeletingField] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const {
    getFormWithFieldsAndLogic,
    deleteField,
    reorderFields,
    updateFormPublishedStatus,
  } = useFormsStore();
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [isEditFieldModalOpen, setIsEditFieldModalOpen] = useState(false);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [editingField, setEditingField] =
    useState<FieldWithLogicResponseEntity | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !formId) return;

      const oldIndex = formFields.findIndex((f) => f.id === active.id);
      const newIndex = formFields.findIndex((f) => f.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Optimistic update - cập nhật UI ngay với order mới
      const newFields = arrayMove(formFields, oldIndex, newIndex).map(
        (field, index) => ({
          ...field,
          order: index + 1,
        }),
      );
      setFormFields(newFields);

      // Call API to persist the new order
      const fieldIdsInOrder = newFields
        .map((f) => f.id)
        .filter(Boolean) as string[];
      try {
        const success = await reorderFields({
          formId,
          fieldIdsInOrder,
        });
        if (success) {
          messageApi.success("Đã cập nhật thứ tự câu hỏi");
        } else {
          // Revert on failure
          setFormFields(formFields);
          messageApi.error("Không thể cập nhật thứ tự");
        }
      } catch (error) {
        console.error("Reorder fields error:", error);
        setFormFields(formFields);
        messageApi.error("Không thể cập nhật thứ tự");
      }
    },
    [formId, formFields, reorderFields, messageApi],
  );

  const handleFieldCreated = useCallback(
    async (field: CreateFieldResponseEntity) => {
      if (!formId) {
        return;
      }
      setIsFormLoading(true);
      try {
        const result = await getFormWithFieldsAndLogic(formId);
        const orderedFields = result?.fields ?? [];
        setFormFields(orderedFields);
        const nextActiveId =
          field.id && orderedFields.some((item) => item.id === field.id)
            ? field.id
            : (orderedFields[0]?.id ?? null);
        setActiveFieldId(nextActiveId);
      } catch (error) {
        console.error("Failed to refresh form fields:", error);
      } finally {
        setIsFormLoading(false);
      }
    },
    [formId, getFormWithFieldsAndLogic],
  );

  const handleDeleteField = useCallback(
    async (fieldId: string) => {
      if (!formId || !fieldId) return;
      setIsDeletingField(true);
      try {
        const success = await deleteField(fieldId);
        if (success) {
          messageApi.success("Field deleted successfully");
          // Refresh fields list
          const result = await getFormWithFieldsAndLogic(formId);
          const orderedFields = result?.fields ?? [];
          setFormFields(orderedFields);
          // Update active field if deleted
          if (activeFieldId === fieldId) {
            setActiveFieldId(orderedFields[0]?.id ?? null);
          }
        } else {
          messageApi.error("Failed to delete field");
        }
      } catch (error) {
        console.error("Delete field error:", error);
        messageApi.error("Failed to delete field");
      } finally {
        setIsDeletingField(false);
      }
    },
    [formId, deleteField, messageApi, getFormWithFieldsAndLogic, activeFieldId],
  );

  const handleFieldUpdated = useCallback(
    async (field: UpdateFieldResponseEntity) => {
      if (!formId) return;
      setIsFormLoading(true);
      try {
        const result = await getFormWithFieldsAndLogic(formId);
        const orderedFields = result?.fields ?? [];
        setFormFields(orderedFields);
        // Keep the updated field as active
        if (field.id) {
          setActiveFieldId(field.id);
        }
      } catch (error) {
        console.error("Failed to refresh form fields:", error);
      } finally {
        setIsFormLoading(false);
      }
    },
    [formId, getFormWithFieldsAndLogic],
  );

  const handleEditField = useCallback((field: FieldWithLogicResponseEntity) => {
    setEditingField(field);
    setIsEditFieldModalOpen(true);
  }, []);

  const handleOpenPublishModal = useCallback(() => {
    setIsPublishModalOpen(true);
  }, []);

  const handleClosePublishModal = useCallback(() => {
    setIsPublishModalOpen(false);
  }, []);

  const handleConfirmPublish = useCallback(async () => {
    if (!formId) {
      messageApi.error("Không tìm thấy form");
      return;
    }
    setIsPublishing(true);
    try {
      const success = await updateFormPublishedStatus({
        formId,
        isPublished: true,
      });
      if (success) {
        messageApi.success("Đã publish form thành công!");
        setIsPublishModalOpen(false);
      } else {
        messageApi.error("Không thể publish form");
      }
    } catch (error) {
      console.error("Publish form error:", error);
      messageApi.error("Có lỗi xảy ra khi publish form");
    } finally {
      setIsPublishing(false);
    }
  }, [formId, updateFormPublishedStatus, messageApi]);

  const mutedText = isDarkMode ? "text-amber-400/60" : "text-amber-600/60";
  const panelSurface = isDarkMode
    ? "bg-amber-950/30 border-amber-800/30"
    : "bg-amber-50/70 border-amber-200";
  const tabSurface = isDarkMode
    ? "border-amber-800/30 bg-amber-950/40"
    : "border-amber-200 bg-amber-50/90 shadow-sm";
  const tabInactiveClass = isDarkMode
    ? "text-amber-200 hover:bg-amber-900/60"
    : "text-amber-700 hover:bg-amber-100";
  const brandColor = "#f59e0b";
  const previewWidth = isMobilePreview ? "max-w-[420px]" : "max-w-[720px]";
  const previewFramePadding = isMobilePreview ? "px-8" : "px-12";
  const previewContentWidth = isMobilePreview
    ? "max-w-[360px]"
    : "max-w-[520px]";
  const previewFrameHeight = isMobilePreview ? "h-[720px]" : "h-[520px]";
  const previewFrameSurface = isDarkMode
    ? "border-amber-800/30 bg-amber-950/20"
    : "border-amber-200 bg-white";
  const activeTabIndex = Math.max(0, tabs.indexOf(activeTab));
  const previewIndex = previewMode === "desktop" ? 0 : 1;
  const tabGridTemplate: CSSProperties = {
    gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
  };
  const previewFrameClassName = `${previewWidth} ${previewFrameHeight} ${previewFrameSurface} ${previewFramePadding}`;
  const previewContentClassName = `${previewContentWidth}`;
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) {
      return;
    }

    if (!formId) {
      setActiveTab(tab);
      return;
    }

    const tabRoutes: Record<string, string> = {
      Content: `/form/${formId}/edit`,
      Workflow: `/form/${formId}/workflow`,
      Share: `/form/${formId}/share`,
      Results: `/form/${formId}/results`,
    };

    const nextRoute = tabRoutes[tab];
    if (!nextRoute || tab === "Content") {
      setActiveTab(tab);
      return;
    }

    router.push(nextRoute);
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
    let isActive = true;
    const loadFormFields = async () => {
      if (!formId) return;
      setIsFormLoading(true);
      try {
        const result = await getFormWithFieldsAndLogic(formId);
        if (!isActive) return;
        const orderedFields = result?.fields ?? [];
        setFormFields(orderedFields);
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

  useEffect(() => {
    if (isPlayOpen) {
      const id = requestAnimationFrame(() => setIsPlayVisible(true));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [isPlayOpen]);

  useEffect(() => {
    if (!isPlayVisible && isPlayOpen) {
      const id = window.setTimeout(() => setIsPlayOpen(false), 180);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isPlayVisible, isPlayOpen]);

  const openPlayPreview = () => setIsPlayOpen(true);
  const closePlayPreview = () => setIsPlayVisible(false);

  const handleAddContent = () => {
    setIsAddContentModalOpen(true);
  };

  return (
    <>
      <BaseScreenAdmin>
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className={`relative inline-grid items-center rounded-full border p-1 ${
                tabSurface
              }`}
              style={tabGridTemplate}
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
                const isActive = tab === activeTab;
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
            <Tooltip title="Publish edits">
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={handleOpenPublishModal}
                className={`rounded-full px-4 font-medium ${
                  isDarkMode
                    ? "border-amber-700 text-amber-100 hover:border-amber-500 hover:text-amber-300"
                    : "border-amber-300 text-amber-700 hover:border-amber-400 hover:text-amber-800"
                }`}
              >
                Publish edits
              </Button>
            </Tooltip>
          </div>

          {activeTab !== "Share" && (
            <div
              className={`flex flex-wrap items-center gap-2 rounded-2xl border p-3 shadow-sm ${
                isDarkMode
                  ? "border-amber-800/30 bg-amber-950/30"
                  : "border-amber-200 bg-amber-50/80"
              }`}
            >
              <Tooltip title="Add content">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="rounded-full !bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600 px-4"
                  onClick={handleAddContent}
                >
                  Add content
                </Button>
              </Tooltip>
              <Tooltip title="Design">
                <Button
                  type="default"
                  icon={<BgColorsOutlined />}
                  className={`rounded-full ${
                    isDarkMode
                      ? "border-amber-700 text-amber-100 hover:border-amber-500"
                      : "border-amber-200 text-amber-700 hover:border-amber-400"
                  }`}
                  onClick={() => {
                    const currentField = formFields.find(
                      (f) => f.id === activeFieldId,
                    );
                    if (currentField) {
                      setEditingField(currentField);
                      setIsDesignModalOpen(true);
                    } else if (formFields.length > 0) {
                      setEditingField(formFields[0]);
                      setIsDesignModalOpen(true);
                    } else {
                      messageApi.info("Please add a question first");
                    }
                  }}
                  disabled={formFields.length === 0}
                >
                  Design
                </Button>
              </Tooltip>
              <div
                className={`relative inline-grid grid-cols-2 items-center rounded-full border p-1 ${
                  isDarkMode
                    ? "border-amber-800/30 bg-amber-950/40"
                    : "border-amber-200 bg-white"
                }`}
              >
                <span
                  className="absolute left-1 top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
                  style={{
                    width: "calc((100% - 8px) / 2)",
                    transform: `translateX(${previewIndex * 100}%)`,
                    backgroundColor: brandColor,
                  }}
                />
                <Tooltip title="Desktop view">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    aria-pressed={previewMode === "desktop"}
                    aria-label="Desktop preview"
                    style={
                      previewMode === "desktop"
                        ? { color: "#ffffff" }
                        : undefined
                    }
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      previewMode === "desktop"
                        ? "text-white"
                        : tabInactiveClass
                    }`}
                  >
                    <LaptopOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Mobile view">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    aria-pressed={previewMode === "mobile"}
                    aria-label="Mobile preview"
                    style={
                      previewMode === "mobile"
                        ? { color: "#ffffff" }
                        : undefined
                    }
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      previewMode === "mobile" ? "text-white" : tabInactiveClass
                    }`}
                  >
                    <MobileOutlined />
                  </button>
                </Tooltip>
              </div>
              <div
                className={`flex items-center gap-1 rounded-full border px-2 py-1 ${
                  isDarkMode ? "border-amber-800/30" : "border-amber-200"
                }`}
              >
                <Tooltip title="Preview">
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    onClick={openPlayPreview}
                  />
                </Tooltip>
                <Tooltip title="Undo">
                  <Button type="text" icon={<UndoOutlined />} />
                </Tooltip>
                <Tooltip title="Redo">
                  <Button type="text" icon={<RedoOutlined />} />
                </Tooltip>
                <Tooltip title="Settings">
                  <Button type="text" icon={<SettingOutlined />} />
                </Tooltip>
              </div>
              <span className={`ml-auto text-xs ${mutedText}`}>
                Form ID: {formId ?? "-"}
              </span>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div
              className={`flex h-full max-h-[720px] flex-col overflow-hidden rounded-2xl border p-4 shadow-sm ${panelSurface}`}
            >
              <div className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-2">
                {isFormLoading && !formFields.length && (
                  <div
                    className={`rounded-2xl border px-3 py-2 text-sm ${panelSurface}`}
                  >
                    Loading questions...
                  </div>
                )}
                {!isFormLoading && !formFields.length && (
                  <div
                    className={`rounded-2xl border px-3 py-2 text-sm ${panelSurface}`}
                  >
                    No questions yet.
                  </div>
                )}
                {formFields.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={formFields.map(
                        (f) => f.id ?? `field-${formFields.indexOf(f)}`,
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      {formFields.map((field, index) => (
                        <SortableFieldItem
                          key={field.id ?? `field-${index}`}
                          field={field}
                          index={index}
                          isActive={field.id === activeFieldId}
                          isDarkMode={isDarkMode}
                          isDeletingField={isDeletingField}
                          onSelect={setActiveFieldId}
                          onEdit={handleEditField}
                          onDelete={handleDeleteField}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl border border-dashed px-4 py-4 text-left ${
                    isDarkMode
                      ? "border-amber-700/50 text-amber-200 hover:border-amber-600 hover:bg-amber-950/30"
                      : "border-amber-300 text-amber-700 hover:border-amber-400 hover:bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isDarkMode
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      <BulbOutlined />
                    </div>
                    <span className="text-sm font-semibold">
                      Add a Welcome Screen
                    </span>
                  </div>
                  <DownOutlined className={mutedText} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <FormPreviewCard
                isView
                frameClassName={previewFrameClassName}
                contentClassName={previewContentClassName}
                fields={formFields}
                isLoading={isFormLoading}
                currentFieldId={activeFieldId}
                onCurrentFieldChange={setActiveFieldId}
              />
            </div>
          </div>

          {isPlayOpen && (
            <div
              className={`fixed inset-0 z-50 flex items-start justify-center overflow-auto transition-opacity duration-200 ${
                isDarkMode ? "bg-amber-950/80" : "bg-amber-50/90"
              } ${isPlayVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              onClick={closePlayPreview}
            >
              <div
                className={`relative flex min-h-full w-full flex-col items-center justify-start px-6 pb-12 pt-10 transition-transform duration-200 ${
                  isPlayVisible ? "scale-100" : "scale-95"
                }`}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <div
                  className={`sticky top-6 z-10 flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm ${
                    isDarkMode
                      ? "border-amber-800/30 bg-amber-950/90 text-amber-100"
                      : "border-amber-200 bg-white/90 text-amber-700"
                  }`}
                >
                  <Tooltip title="Close preview">
                    <button
                      type="button"
                      onClick={closePlayPreview}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        isDarkMode ? "hover:bg-amber-900" : "hover:bg-amber-100"
                      }`}
                      aria-label="Close preview"
                    >
                      <CloseOutlined />
                    </button>
                  </Tooltip>
                  <span
                    className={`h-6 w-px ${isDarkMode ? "bg-amber-800" : "bg-amber-200"}`}
                  />
                  <div
                    className={`relative inline-grid grid-cols-2 items-center rounded-full border p-1 ${
                      isDarkMode
                        ? "border-amber-800/50 bg-amber-950/80"
                        : "border-amber-200 bg-white"
                    }`}
                  >
                    <span
                      className="absolute left-1 top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
                      style={{
                        width: "calc((100% - 8px) / 2)",
                        transform: `translateX(${previewIndex * 100}%)`,
                        backgroundColor: brandColor,
                      }}
                    />
                    <Tooltip title="Desktop view">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("desktop")}
                        aria-pressed={previewMode === "desktop"}
                        aria-label="Desktop preview"
                        style={
                          previewMode === "desktop"
                            ? { color: "#ffffff" }
                            : undefined
                        }
                        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                          previewMode === "desktop"
                            ? "text-white"
                            : tabInactiveClass
                        }`}
                      >
                        <LaptopOutlined />
                      </button>
                    </Tooltip>
                    <Tooltip title="Mobile view">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("mobile")}
                        aria-pressed={previewMode === "mobile"}
                        aria-label="Mobile preview"
                        style={
                          previewMode === "mobile"
                            ? { color: "#ffffff" }
                            : undefined
                        }
                        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                          previewMode === "mobile"
                            ? "text-white"
                            : tabInactiveClass
                        }`}
                      >
                        <MobileOutlined />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <FormPreviewCard
                  isView={false}
                  frameClassName={`${previewFrameClassName} shadow-xl mt-6`}
                  contentClassName={previewContentClassName}
                  fields={formFields}
                  isLoading={isFormLoading}
                  currentFieldId={activeFieldId}
                  onCurrentFieldChange={setActiveFieldId}
                />
              </div>
            </div>
          )}
        </div>
      </BaseScreenAdmin>

      <AddContentModal
        open={isAddContentModalOpen}
        formId={formId}
        onClose={() => setIsAddContentModalOpen(false)}
        onCreated={handleFieldCreated}
      />

      <EditFieldModal
        open={isEditFieldModalOpen}
        field={editingField}
        onClose={() => {
          setIsEditFieldModalOpen(false);
          setEditingField(null);
        }}
        onUpdated={handleFieldUpdated}
      />

      <DesignFieldModal
        open={isDesignModalOpen}
        field={editingField}
        onClose={() => {
          setIsDesignModalOpen(false);
          setEditingField(null);
        }}
        onUpdated={handleFieldUpdated}
      />

      <Modal
        open={isPublishModalOpen}
        title="Xác nhận Publish Form"
        onCancel={handleClosePublishModal}
        footer={[
          <Button key="cancel" onClick={handleClosePublishModal}>
            Hủy
          </Button>,
          <Button
            key="publish"
            type="primary"
            loading={isPublishing}
            onClick={handleConfirmPublish}
            className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
          >
            Publish
          </Button>,
        ]}
        centered
      >
        <div className="py-4">
          <p className="text-base">
            Bạn có chắc chắn muốn publish form này không?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Sau khi publish, form sẽ được công khai và người dùng có thể truy
            cập.
          </p>
        </div>
      </Modal>
    </>
  );
}
