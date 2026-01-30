"use client";

import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BaseScreenAdmin from "EduSmart/layout/BaseScreenAdmin";
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Rate,
  Select,
  Slider,
  Tag,
  TimePicker,
  Tooltip,
} from "antd";
import {
  AimOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  MinusOutlined,
  NodeExpandOutlined,
  PlusOutlined,
  ReloadOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import {
  FieldWithLogicResponseEntity,
  LogicCondition,
} from "EduSmart/api/api-auth-service";
import { useTheme } from "EduSmart/Provider/ThemeProvider";
import { useFormsStore } from "EduSmart/stores/Forms/FormsStore";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeChange,
  NodeProps,
  Position,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  updateEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Dayjs } from "dayjs";

// FieldType categories for logic UI
type FieldCategory =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "datetime"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "rating"
  | "scale"
  | "yesno";

const detectFieldCategory = (type?: string | null): FieldCategory => {
  const normalized = (type ?? "").toLowerCase().trim();
  if (normalized.includes("datetime")) return "datetime";
  if (normalized.includes("date")) return "date";
  if (normalized.includes("time")) return "time";
  if (normalized.includes("number")) return "number";
  if (normalized.includes("email")) return "email";
  if (normalized.includes("phone")) return "phone";
  if (normalized.includes("textarea")) return "textarea";
  if (normalized.includes("multiselect") || normalized.includes("multi_select"))
    return "multiselect";
  if (normalized.includes("select")) return "select";
  if (normalized.includes("radio")) return "radio";
  if (normalized.includes("rating")) return "rating";
  if (normalized.includes("scale")) return "scale";
  if (normalized.includes("yesno") || normalized.includes("yes_no"))
    return "yesno";
  return "text";
};

const getConditionsForCategory = (
  category: FieldCategory,
): LogicCondition[] => {
  switch (category) {
    case "number":
    case "rating":
    case "scale":
      return [
        LogicCondition.Is,
        LogicCondition.IsNot,
        LogicCondition.GreaterThan,
        LogicCondition.LessThan,
        LogicCondition.GreaterThanOrEqual,
        LogicCondition.LessThanOrEqual,
        LogicCondition.Always,
      ];
    case "date":
    case "time":
    case "datetime":
      return [
        LogicCondition.Is,
        LogicCondition.IsNot,
        LogicCondition.GreaterThan,
        LogicCondition.LessThan,
        LogicCondition.Always,
      ];
    case "select":
    case "radio":
    case "yesno":
      return [LogicCondition.Is, LogicCondition.IsNot, LogicCondition.Always];
    case "multiselect":
      return [
        LogicCondition.Contains,
        LogicCondition.DoesNotContain,
        LogicCondition.Always,
      ];
    case "text":
    case "email":
    case "phone":
    case "textarea":
    default:
      return [
        LogicCondition.Is,
        LogicCondition.IsNot,
        LogicCondition.Contains,
        LogicCondition.DoesNotContain,
        LogicCondition.Always,
      ];
  }
};

const getValueLabel = (category: FieldCategory): string => {
  switch (category) {
    case "number":
      return "Giá trị số";
    case "rating":
      return "Giá trị đánh giá";
    case "scale":
      return "Giá trị thang điểm";
    case "date":
      return "Giá trị ngày";
    case "time":
      return "Giá trị giờ";
    case "datetime":
      return "Giá trị ngày & giờ";
    case "select":
    case "radio":
      return "Lựa chọn đã chọn";
    case "multiselect":
      return "Các lựa chọn đã chọn";
    case "yesno":
      return "Giá trị Có/Không";
    case "email":
      return "Giá trị email";
    case "phone":
      return "Giá trị số điện thoại";
    default:
      return "Giá trị câu trả lời";
  }
};

type WorkflowPageProps = {
  params: Promise<{ id: string }>;
};

const tabs = ["Content", "Workflow", "Share", "Results"];
const tabLabels: Record<string, string> = {
  Content: "Nội dung",
  Workflow: "Luồng",
  Share: "Chia sẻ",
  Results: "Kết quả",
};

const FLOW_NODE_WIDTH = 210;
const FLOW_NODE_HEIGHT = 132;
const FLOW_HORIZONTAL_SPACING = 70;
const FLOW_VERTICAL_SPACING = 100;
const FLOW_TOP_PADDING = 20;
const FLOW_MAX_COLUMNS = 3;

type FlowNode = {
  id: string;
  title: string;
  type?: string | null;
  orderIndex: number;
  x: number;
  y: number;
  tone: "rose" | "violet";
};

type FlowConnection = {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  value?: string;
  isDefault?: boolean;
  condition?: LogicCondition;
  ruleId?: string;
  sourceFieldType?: string;
};

const logicConditionOptions = [
  { value: LogicCondition.Is, label: "Bằng" },
  { value: LogicCondition.IsNot, label: "Không bằng" },
  { value: LogicCondition.Contains, label: "Chứa" },
  { value: LogicCondition.DoesNotContain, label: "Không chứa" },
  { value: LogicCondition.GreaterThan, label: "Lớn hơn" },
  { value: LogicCondition.LessThan, label: "Nhỏ hơn" },
  { value: LogicCondition.GreaterThanOrEqual, label: "Lớn hơn hoặc bằng" },
  { value: LogicCondition.LessThanOrEqual, label: "Nhỏ hơn hoặc bằng" },
  { value: LogicCondition.Always, label: "Luôn luôn" },
];

const conditionCopy: Record<string, { title: string; helper: string }> = {
  [LogicCondition.Is]: { title: "Nếu câu trả lời bằng", helper: "Khớp chính xác" },
  [LogicCondition.IsNot]: {
    title: "Nếu câu trả lời không bằng",
    helper: "Loại trừ giá trị cụ thể",
  },
  [LogicCondition.Contains]: {
    title: "Nếu câu trả lời chứa",
    helper: "Khớp một phần",
  },
  [LogicCondition.DoesNotContain]: {
    title: "Nếu câu trả lời không chứa",
    helper: "Không chứa nội dung",
  },
  [LogicCondition.GreaterThan]: {
    title: "Nếu câu trả lời lớn hơn",
    helper: "So sánh số",
  },
  [LogicCondition.LessThan]: {
    title: "Nếu câu trả lời nhỏ hơn",
    helper: "So sánh số",
  },
  [LogicCondition.GreaterThanOrEqual]: {
    title: "Nếu câu trả lời lớn hơn hoặc bằng",
    helper: "So sánh số",
  },
  [LogicCondition.LessThanOrEqual]: {
    title: "Nếu câu trả lời nhỏ hơn hoặc bằng",
    helper: "So sánh số",
  },
  [LogicCondition.Always]: {
    title: "Luôn chuyển đến",
    helper: "Không cần điều kiện",
  },
};

const getFieldTone = (type?: string | null) => {
  const normalized = type?.toLowerCase() ?? "";
  if (normalized.includes("email") || normalized.includes("phone")) {
    return "rose";
  }
  return "violet";
};

const getFieldInitials = (title?: string | null) => {
  const clean = title?.trim();
  if (!clean) return "?";
  const parts = clean.split(" ").filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

export default function FormWorkflowPage({ params }: WorkflowPageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const messageApi = useNotification();
  const { getFormWithFieldsAndLogic, createOrUpdateLogic, deleteLogic } =
    useFormsStore();
  const [logicForm] = Form.useForm();
  const [editRuleForm] = Form.useForm();
  const [formId, setFormId] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FieldWithLogicResponseEntity[]>(
    [],
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSavingLogic, setIsSavingLogic] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<FlowConnection | null>(null);
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [isWorkflowDrawerOpen, setIsWorkflowDrawerOpen] = useState(false);

  const activeTabIndex = Math.max(0, tabs.indexOf("Workflow"));
  const tabGridTemplate: CSSProperties = {
    gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
  };
  const tabSurface = isDarkMode
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-200 bg-white/90 shadow-sm";
  const tabInactiveClass = isDarkMode
    ? "text-slate-300 hover:bg-slate-800/80"
    : "text-slate-600 hover:bg-slate-100";
  const brandColor = "#f59e0b";

  const orderedFields = useMemo(() => {
    return [...formFields].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }, [formFields]);

  const activeField = useMemo(
    () => orderedFields.find((field) => field.id === activeFieldId) ?? null,
    [orderedFields, activeFieldId],
  );
  const destinationOptions = useMemo(
    () =>
      orderedFields.filter((field) => field.id && field.id !== activeFieldId),
    [orderedFields, activeFieldId],
  );
  const canCreateLogic = Boolean(activeFieldId && destinationOptions.length);

  // Detect field category and get appropriate conditions
  const activeFieldCategory = useMemo(
    () => detectFieldCategory(activeField?.type),
    [activeField?.type],
  );
  const allowedConditions = useMemo(
    () => getConditionsForCategory(activeFieldCategory),
    [activeFieldCategory],
  );
  const filteredConditionOptions = useMemo(
    () =>
      logicConditionOptions.filter((opt) =>
        allowedConditions.includes(opt.value as LogicCondition),
      ),
    [allowedConditions],
  );
  const valueLabel = useMemo(
    () => getValueLabel(activeFieldCategory),
    [activeFieldCategory],
  );

  // Build choice options for select/radio/multiselect
  const choiceOptions = useMemo(() => {
    if (!activeField?.options?.length) return [];
    return activeField.options
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((opt) => ({
        value: opt.value ?? opt.label ?? "",
        label: opt.label ?? opt.value ?? "Lựa chọn",
      }))
      .filter((opt) => opt.value);
  }, [activeField?.options]);

  const yesNoOptions = [
    { value: "yes", label: "Có" },
    { value: "no", label: "Không" },
  ];


  const flowNodes = useMemo<FlowNode[]>(() => {
    return orderedFields
      .map((field, index) => {
        if (!field.id) return null;
        const columnIndex = index % FLOW_MAX_COLUMNS;
        const rowIndex = Math.floor(index / FLOW_MAX_COLUMNS);
        const y =
          FLOW_TOP_PADDING +
          rowIndex * (FLOW_NODE_HEIGHT + FLOW_VERTICAL_SPACING);
        const x = columnIndex * (FLOW_NODE_WIDTH + FLOW_HORIZONTAL_SPACING);
        const tone: "rose" | "violet" =
          getFieldTone(field.type) === "rose" ? "rose" : "violet";
        return {
          id: field.id,
          title: field.title || `Câu hỏi ${index + 1}`,
          type: field.type ?? undefined,
          orderIndex: index + 1,
          x,
          y,
          tone,
        } as FlowNode;
      })
      .filter((node): node is FlowNode => Boolean(node));
  }, [orderedFields]);

  const flowConnections = useMemo<FlowConnection[]>(() => {
    const nodesMap = new Map(flowNodes.map((node) => [node.id, node]));
    const connections: FlowConnection[] = [];
    orderedFields.forEach((field) => {
      if (!field.id) return;
      field.logicRules?.forEach((rule, ruleIndex) => {
        if (!rule.destinationFieldId) return;
        if (!nodesMap.has(rule.destinationFieldId)) return;
        connections.push({
          id: `${field.id}-rule-${rule.id ?? ruleIndex}`,
          sourceId: field.id!,
          targetId: rule.destinationFieldId,
          label:
            rule.value ||
            conditionCopy[rule.condition ?? ""]?.title ||
            "Điều kiện",
          value: rule.value ?? undefined,
          condition: (rule.condition as LogicCondition) ?? undefined,
          ruleId: rule.id ?? undefined,
          sourceFieldType: field.type ?? undefined,
        });
      });
      if (field.defaultNextFieldId && nodesMap.has(field.defaultNextFieldId)) {
        connections.push({
          id: `${field.id}-default`,
          sourceId: field.id,
          targetId: field.defaultNextFieldId,
          label: "Mặc định",
          isDefault: true,
        });
      }
    });
    return connections;
  }, [orderedFields, flowNodes]);

  const loadFormFields = useCallback(async () => {
    if (!formId) return;
    setIsFormLoading(true);
    try {
      const result = await getFormWithFieldsAndLogic(formId);
      setFormFields(result?.fields ?? []);
    } catch (error) {
      console.error("Failed to load form logic:", error);
      setFormFields([]);
    } finally {
      setIsFormLoading(false);
    }
  }, [formId, getFormWithFieldsAndLogic]);

  useEffect(() => {
    let alive = true;
    Promise.resolve(params)
      .then((resolved) => {
        if (alive) setFormId(resolved.id);
      })
      .catch((error) =>
        console.error("Failed to resolve route params:", error),
      );
    return () => {
      alive = false;
    };
  }, [params]);

  useEffect(() => {
    loadFormFields();
  }, [loadFormFields]);

  useEffect(() => {
    if (!orderedFields.length) {
      setActiveFieldId(null);
      return;
    }
    if (
      !activeFieldId ||
      !orderedFields.some((field) => field.id === activeFieldId)
    ) {
      setActiveFieldId(orderedFields[0]?.id ?? null);
    }
  }, [activeFieldId, orderedFields]);

  useEffect(() => {
    if (!activeFieldId) return;
    const defaultDestination = destinationOptions[0]?.id;
    const defaultCondition =
      filteredConditionOptions[0]?.value ?? LogicCondition.Is;
    logicForm.setFieldsValue({
      condition: defaultCondition,
      destinationFieldId: defaultDestination,
      value: undefined,
    });
  }, [activeFieldId, destinationOptions, logicForm, filteredConditionOptions]);

  const handleTabChange = (tab: string) => {
    if (tab === "Workflow" || !formId) return;
    const tabRoutes: Record<string, string> = {
      Content: `/form/${formId}/edit`,
      Workflow: `/form/${formId}/workflow`,
      Share: `/form/${formId}/share`,
      Results: `/form/${formId}/results`,
    };
    const nextRoute = tabRoutes[tab];
    if (nextRoute) router.push(nextRoute);
  };

  // Serialize value based on field type
  const serializeValue = (val: unknown): string => {
    if (val === undefined || val === null) return "";
    if (Array.isArray(val)) return val.join("||");
    if (typeof val === "object" && "format" in val) {
      const dayjs = val as Dayjs;
      if (activeFieldCategory === "date") return dayjs.format("YYYY-MM-DD");
      if (activeFieldCategory === "time") return dayjs.format("HH:mm");
      if (activeFieldCategory === "datetime")
        return dayjs.format("YYYY-MM-DD HH:mm");
    }
    return String(val);
  };

  const handleLogicSubmit = async (values: {
    condition: LogicCondition;
    value?: unknown;
    destinationFieldId?: string;
  }) => {
    if (!formId || !activeFieldId) {
      messageApi.warning("Dữ liệu form chưa sẵn sàng.");
      return;
    }
    if (!values.destinationFieldId) {
      messageApi.warning("Vui lòng chọn câu hỏi đích.");
      return;
    }
    setIsSavingLogic(true);
    try {
      const payload = {
        fieldId: activeFieldId,
        condition: values.condition,
        value: serializeValue(values.value),
        destinationFieldId: values.destinationFieldId,
      };
      const result = await createOrUpdateLogic(payload);
      if (!result) {
        messageApi.error("Không thể lưu logic. Vui lòng thử lại.");
        return;
      }
      messageApi.success("Đã lưu luật logic.");
      logicForm.setFieldsValue({ value: "" });
      await loadFormFields();
    } catch (error) {
      console.error("create logic error", error);
      messageApi.error("Không thể lưu logic. Vui lòng thử lại.");
    } finally {
      setIsSavingLogic(false);
    }
  };

  const defaultNextField = activeField?.defaultNextFieldId
    ? orderedFields.find((field) => field.id === activeField.defaultNextFieldId)
    : null;
  const activeLogicRules = activeField?.logicRules ?? [];

  // Handler for creating connection from flow map (quick connect)
  const handleCreateConnectionFromMap = useCallback(
    async (sourceId: string, targetId: string) => {
      if (!formId) return;
      setIsSavingLogic(true);
      try {
        const payload = {
          fieldId: sourceId,
          condition: LogicCondition.Always,
          value: "",
          destinationFieldId: targetId,
        };
        const result = await createOrUpdateLogic(payload);
        if (result) {
          messageApi.success("Đã tạo kết nối nhanh (Luôn chuyển)");
          await loadFormFields();
        }
      } catch (error) {
        console.error("Quick connect error:", error);
        messageApi.error("Không thể tạo kết nối");
      } finally {
        setIsSavingLogic(false);
      }
    },
    [formId, createOrUpdateLogic, messageApi, loadFormFields],
  );

  // Handler for deleting a logic rule connection
  const handleDeleteConnection = useCallback(
    async (connectionId: string, ruleId?: string) => {
      if (!ruleId) {
        messageApi.warning("Không thể xóa kết nối mặc định");
        return;
      }
      // Find the source field ID from connectionId (format: fieldId-rule-ruleId)
      const sourceFieldId = connectionId.split("-rule-")[0];
      if (!sourceFieldId) {
        messageApi.error("Kết nối không hợp lệ");
        return;
      }
      setIsSavingLogic(true);
      try {
        const success = await deleteLogic(sourceFieldId, ruleId);
        if (success) {
          messageApi.success("Đã xóa luật logic");
          await loadFormFields();
        } else {
          messageApi.error("Không thể xóa luật logic");
        }
      } catch (error) {
        console.error("Delete logic error:", error);
        messageApi.error("Không thể xóa luật logic");
      } finally {
        setIsSavingLogic(false);
      }
    },
    [deleteLogic, messageApi, loadFormFields],
  );

  // Handler for editing node (navigate to edit panel)
  const handleEditNode = useCallback((nodeId: string) => {
    setActiveFieldId(nodeId);
  }, []);

  // Handler for opening edit connection modal
  const handleEditConnection = useCallback(
    (connection: FlowConnection) => {
      setEditingConnection(connection);
      editRuleForm.setFieldsValue({
        condition: connection.condition ?? LogicCondition.Always,
        value: connection.value ?? "",
        destinationFieldId: connection.targetId,
      });
      setIsEditRuleModalOpen(true);
    },
    [editRuleForm],
  );

  // Get field category for editing connection
  const editingFieldCategory = useMemo(() => {
    if (!editingConnection) return "text";
    return detectFieldCategory(editingConnection.sourceFieldType);
  }, [editingConnection]);

  // Get conditions for editing field
  const editingAllowedConditions = useMemo(
    () => getConditionsForCategory(editingFieldCategory),
    [editingFieldCategory],
  );

  const editingConditionOptions = useMemo(
    () =>
      logicConditionOptions.filter((opt) =>
        editingAllowedConditions.includes(opt.value as LogicCondition),
      ),
    [editingAllowedConditions],
  );

  // Get choice options for editing field
  const editingChoiceOptions = useMemo(() => {
    if (!editingConnection) return [];
    const sourceField = orderedFields.find(
      (f) => f.id === editingConnection.sourceId,
    );
    if (!sourceField?.options?.length) return [];
    return sourceField.options
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((opt) => ({
        value: opt.value ?? opt.label ?? "",
        label: opt.label ?? opt.value ?? "Lựa chọn",
      }))
      .filter((opt) => opt.value);
  }, [editingConnection, orderedFields]);

  // Get destination options for editing (exclude source field)
  const editingDestinationOptions = useMemo(() => {
    if (!editingConnection) return [];
    return orderedFields.filter(
      (field) => field.id && field.id !== editingConnection.sourceId,
    );
  }, [editingConnection, orderedFields]);

  // Handle edit rule form submit
  const handleEditRuleSubmit = async (values: {
    condition: LogicCondition;
    value?: unknown;
    destinationFieldId?: string;
  }) => {
    if (!formId || !editingConnection) {
      messageApi.warning("Dữ liệu form chưa sẵn sàng.");
      return;
    }
    if (!values.destinationFieldId) {
      messageApi.warning("Vui lòng chọn câu hỏi đích.");
      return;
    }
    setIsSavingLogic(true);
    try {
      // If editing an existing rule (has ruleId) and condition/value changed,
      // delete old rule first then create new one
      if (editingConnection.ruleId) {
        const conditionChanged =
          values.condition !== editingConnection.condition;
        const valueChanged =
          serializeValueForEdit(values.value) !==
          (editingConnection.value ?? "");

        if (conditionChanged || valueChanged) {
          // Delete old rule first
          const deleted = await deleteLogic(
            editingConnection.sourceId,
            editingConnection.ruleId,
          );
          if (!deleted) {
            messageApi.error(
              "Không thể cập nhật luật. Không xóa được luật cũ.",
            );
            return;
          }
        }
      }

      // Create/update the rule with new values
      const payload = {
        fieldId: editingConnection.sourceId,
        condition: values.condition,
        value: serializeValueForEdit(values.value),
        destinationFieldId: values.destinationFieldId,
      };
      const result = await createOrUpdateLogic(payload);
      if (!result) {
        messageApi.error("Không thể cập nhật luật. Vui lòng thử lại.");
        return;
      }
      messageApi.success("Đã cập nhật luật.");
      setIsEditRuleModalOpen(false);
      setEditingConnection(null);
      editRuleForm.resetFields();
      await loadFormFields();
    } catch (error) {
      console.error("Update rule error:", error);
      messageApi.error("Không thể cập nhật luật. Vui lòng thử lại.");
    } finally {
      setIsSavingLogic(false);
    }
  };

  // Serialize value based on field type (reusing existing function context)
  const serializeValueForEdit = (val: unknown): string => {
    if (val === undefined || val === null) return "";
    if (Array.isArray(val)) return val.join("||");
    if (typeof val === "object" && "format" in val) {
      const dayjs = val as Dayjs;
      if (editingFieldCategory === "date") return dayjs.format("YYYY-MM-DD");
      if (editingFieldCategory === "time") return dayjs.format("HH:mm");
      if (editingFieldCategory === "datetime")
        return dayjs.format("YYYY-MM-DD HH:mm");
    }
    return String(val);
  };

  // Source node title for edit modal
  const editingSourceNode = editingConnection
    ? flowNodes.find((n) => n.id === editingConnection.sourceId)
    : null;

  return (
    <BaseScreenAdmin>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
        <div
          className={`relative inline-grid items-center rounded-full border p-1 ${tabSurface}`}
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
            const isActive = tab === "Workflow";
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
                {tabLabels[tab] ?? tab}
              </button>
            );
          })}
        </div>

        {/* Full-width Flow Builder Card */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <NodeExpandOutlined />
              <span>Sơ đồ luồng</span>
              <Tag
                className="!bg-amber-500/20 !text-amber-300 !border-amber-500/30"
                icon={<BranchesOutlined />}
              >
                Luật + Sơ đồ
              </Tag>
            </div>
          }
          extra={
            <Button
              icon={<ApartmentOutlined />}
              onClick={() => setIsWorkflowDrawerOpen(true)}
              type="primary"
              className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
            >
              Câu hỏi & Luật ({formFields.length})
            </Button>
          }
          className={`rounded-3xl border ${
            isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200"
          }`}
        >
          {!flowNodes.length ? (
            <Empty
              description="Chưa có câu hỏi để hiển thị"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="min-h-[680px]">
              <FlowVisualizer
                nodes={flowNodes}
                connections={flowConnections}
                isDarkMode={isDarkMode}
                activeNodeId={activeFieldId}
                onNodeSelect={setActiveFieldId}
                onCreateConnection={handleCreateConnectionFromMap}
                onDeleteConnection={handleDeleteConnection}
                onEditConnection={handleEditConnection}
                onEditNode={handleEditNode}
                formFields={formFields}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Combined Questions & Logic Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <ApartmentOutlined />
            <span>Câu hỏi & Luật</span>
            <Tag>{formFields.length} bước</Tag>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setIsWorkflowDrawerOpen(false)}
        open={isWorkflowDrawerOpen}
      >
        <div className="flex flex-col gap-4">
          {/* Questions List */}
          <div>
            <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Chọn một câu hỏi
            </p>
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {isFormLoading && (
                <div className="rounded-2xl border border-dashed px-3 py-2 text-sm text-center">
                  Đang tải câu hỏi...
                </div>
              )}
              {!isFormLoading && !formFields.length && (
                <div className="rounded-2xl border border-dashed px-3 py-2 text-sm text-center">
                  Chưa có câu hỏi nào.
                </div>
              )}
              {formFields.map((field, index) => {
                const tone = getFieldTone(field.type);
                const badgeTone =
                  tone === "rose"
                    ? isDarkMode
                      ? "bg-orange-500/20 text-orange-200"
                      : "bg-orange-100 text-orange-700"
                    : isDarkMode
                      ? "bg-amber-500/20 text-amber-200"
                      : "bg-amber-100 text-amber-700";
                const isActive = field.id === activeFieldId;
                return (
                  <button
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "bg-amber-100 border-2 border-amber-400"
                        : "bg-transparent hover:bg-slate-50 border-2 border-transparent"
                    }`}
                    type="button"
                    key={field.id ?? `field-${index}`}
                    onClick={() => setActiveFieldId(field.id ?? null)}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold ${badgeTone}`}
                    >
                      {getFieldInitials(field.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`m-0 text-sm font-medium truncate ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                      >
                        {field.title || `Câu hỏi ${index + 1}`}
                      </p>
                      <p
                        className={`m-0 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {field.type ?? "không rõ"}
                      </p>
                    </div>
                    {isActive && (
                      <Tag className="ml-auto !bg-amber-500 !text-white !border-none">
                        Đang chọn
                      </Tag>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Logic Rules Section */}
          {!activeField ? (
            <div className="rounded-2xl border border-dashed px-3 py-6 text-center text-sm text-slate-500">
              Chọn câu hỏi phía trên để cấu hình luật logic.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200">
                <p className="m-0 text-xs uppercase tracking-wide text-amber-600">
                  Luật cho
                </p>
                <p className="m-0 text-base font-semibold text-amber-900">
                  {activeField?.title ?? "Chọn từ sơ đồ"}
                </p>
                <p className="m-0 text-xs text-amber-600 mt-1">
                  Mặc định → {defaultNextField?.title ?? "Kết thúc biểu mẫu"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Các luật hiện có ({activeLogicRules.length})
                </p>
                {activeLogicRules.length === 0 && (
                  <div className="rounded-2xl border border-dashed px-3 py-2 text-xs text-slate-500">
                    Chưa có luật tùy chỉnh.
                  </div>
                )}
                {activeLogicRules.map((rule) => {
                  const copy = conditionCopy[rule.condition ?? ""] ?? {
                    title: rule.condition ?? "Điều kiện",
                    helper: "",
                  };
                  const destination = rule.destinationFieldId
                    ? formFields.find(
                        (field) => field.id === rule.destinationFieldId,
                      )
                    : null;
                  return (
                    <div
                      key={rule.id}
                      className={`rounded-2xl border px-3 py-2 text-xs ${
                        isDarkMode
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="m-0 font-semibold">{copy.title}</p>
                      <p className="m-0 text-slate-500">
                        {copy.helper}
                        {rule.value ? `: "${rule.value}"` : ""}
                      </p>
                      <span className="text-[11px] font-semibold text-amber-600">
                        Chuyển đến {destination?.title ?? "Kết thúc biểu mẫu"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Form
                form={logicForm}
                layout="vertical"
                initialValues={{ condition: LogicCondition.Is }}
                onFinish={handleLogicSubmit}
              >
                <div className="flex items-center justify-between">
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thêm luật mới
                  </p>
                  {!canCreateLogic && (
                    <Tag color="orange" icon={<InfoCircleOutlined />}>
                      Cần ít nhất 2 câu hỏi
                    </Tag>
                  )}
                </div>
                <Form.Item
                  className="mb-2"
                  name="condition"
                  rules={[{ required: true, message: "Chọn điều kiện" }]}
                >
                  <Select
                    size="small"
                    options={filteredConditionOptions}
                    disabled={!canCreateLogic}
                  />
                </Form.Item>
                <Form.Item
                  className="mb-2"
                  name="value"
                  label={valueLabel}
                  dependencies={["condition"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const condition = getFieldValue("condition");
                        if (condition === LogicCondition.Always)
                          return Promise.resolve();
                        if (
                          value === undefined ||
                          value === null ||
                          value === ""
                        )
                          return Promise.reject(new Error("Vui lòng nhập giá trị"));
                        if (Array.isArray(value) && value.length === 0)
                          return Promise.reject(
                            new Error("Chọn ít nhất một lựa chọn"),
                          );
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  {/* Text, Email, Phone, Textarea */}
                  {["text", "email", "phone", "textarea"].includes(
                    activeFieldCategory,
                  ) && (
                    <Input
                      size="small"
                      placeholder={
                        activeFieldCategory === "email"
                          ? "example@mail.com"
                          : activeFieldCategory === "phone"
                            ? "+84..."
                            : "Nhập nội dung..."
                      }
                      disabled={!canCreateLogic}
                    />
                  )}
                  {/* Number */}
                  {activeFieldCategory === "number" && (
                    <InputNumber
                      size="small"
                      className="w-full"
                      placeholder="Nhập số"
                      disabled={!canCreateLogic}
                    />
                  )}
                  {/* Rating */}
                  {activeFieldCategory === "rating" && (
                    <Rate disabled={!canCreateLogic} allowHalf />
                  )}
                  {/* Scale */}
                  {activeFieldCategory === "scale" && (
                    <Slider
                      min={1}
                      max={10}
                      marks={{ 1: "1", 5: "5", 10: "10" }}
                      disabled={!canCreateLogic}
                    />
                  )}
                  {/* Date */}
                  {activeFieldCategory === "date" && (
                    <DatePicker
                      size="small"
                      className="w-full"
                      format="YYYY-MM-DD"
                      disabled={!canCreateLogic}
                    />
                  )}
                  {/* Time */}
                  {activeFieldCategory === "time" && (
                    <TimePicker
                      size="small"
                      className="w-full"
                      format="HH:mm"
                      disabled={!canCreateLogic}
                    />
                  )}
                  {/* DateTime */}
                  {activeFieldCategory === "datetime" && (
                    <DatePicker
                      size="small"
                      className="w-full"
                      showTime={{ format: "HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      disabled={!canCreateLogic}
                    />
                  )}
                  {/* Select, Radio */}
                  {["select", "radio"].includes(activeFieldCategory) && (
                    <Select
                      size="small"
                      placeholder="Chọn một lựa chọn"
                      options={choiceOptions}
                      disabled={!canCreateLogic || choiceOptions.length === 0}
                      notFoundContent="Chưa cấu hình lựa chọn"
                    />
                  )}
                  {/* MultiSelect */}
                  {["multiselect"].includes(activeFieldCategory) && (
                    <Select
                      size="small"
                      mode="multiple"
                      placeholder="Chọn các lựa chọn"
                      options={choiceOptions}
                      disabled={!canCreateLogic || choiceOptions.length === 0}
                      notFoundContent="Chưa cấu hình lựa chọn"
                    />
                  )}
                  {/* YesNo */}
                  {activeFieldCategory === "yesno" && (
                    <Select
                      size="small"
                      placeholder="Có / Không"
                      options={yesNoOptions}
                      disabled={!canCreateLogic}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  className="mb-3"
                  name="destinationFieldId"
                  rules={[{ required: true, message: "Điểm đến" }]}
                >
                  <Select
                    size="small"
                    placeholder="Chuyển đến câu hỏi"
                    disabled={!canCreateLogic}
                    options={destinationOptions.map((field) => ({
                      value: field.id!,
                      label: field.title || "Chưa đặt tên",
                    }))}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="middle"
                  loading={isSavingLogic}
                  disabled={!canCreateLogic}
                  className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                >
                  Thêm luật
                </Button>
              </Form>
            </div>
          )}
        </div>
      </Drawer>

      {/* Edit Rule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-amber-500" />
            <span>Chỉnh sửa luật logic</span>
          </div>
        }
        open={isEditRuleModalOpen}
        onCancel={() => {
          setIsEditRuleModalOpen(false);
          setEditingConnection(null);
          editRuleForm.resetFields();
        }}
        footer={null}
        width={520}
        destroyOnClose
      >
        {editingConnection && (
          <div className="py-2">
            <div className="mb-4 rounded-2xl bg-amber-50 p-3">
              <p className="m-0 text-xs text-amber-600">
                Chỉnh sửa rule từ câu hỏi:
              </p>
              <p className="m-0 font-semibold text-amber-900">
                {editingSourceNode?.title ?? editingConnection.sourceId}
              </p>
            </div>

            <Form
              form={editRuleForm}
              layout="vertical"
              onFinish={handleEditRuleSubmit}
            >
              <Form.Item
                name="condition"
                label="Điều kiện"
                rules={[{ required: true, message: "Chọn điều kiện" }]}
              >
                <Select
                  options={editingConditionOptions}
                  placeholder="Chọn điều kiện"
                />
              </Form.Item>

              <Form.Item
                name="value"
                label={getValueLabel(editingFieldCategory)}
                dependencies={["condition"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const condition = getFieldValue("condition");
                      if (condition === LogicCondition.Always)
                        return Promise.resolve();
                      if (value === undefined || value === null || value === "")
                        return Promise.reject(new Error("Nhập giá trị"));
                      if (Array.isArray(value) && value.length === 0)
                        return Promise.reject(
                          new Error("Chọn ít nhất một lựa chọn"),
                        );
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                {/* Text, Email, Phone, Textarea */}
                {["text", "email", "phone", "textarea"].includes(
                  editingFieldCategory,
                ) && <Input placeholder="Nhập giá trị..." />}
                {/* Number */}
                {editingFieldCategory === "number" && (
                  <InputNumber className="w-full" placeholder="Nhập số" />
                )}
                {/* Rating */}
                {editingFieldCategory === "rating" && <Rate allowHalf />}
                {/* Scale */}
                {editingFieldCategory === "scale" && (
                  <Slider
                    min={1}
                    max={10}
                    marks={{ 1: "1", 5: "5", 10: "10" }}
                  />
                )}
                {/* Date */}
                {editingFieldCategory === "date" && (
                  <DatePicker className="w-full" format="YYYY-MM-DD" />
                )}
                {/* Time */}
                {editingFieldCategory === "time" && (
                  <TimePicker className="w-full" format="HH:mm" />
                )}
                {/* DateTime */}
                {editingFieldCategory === "datetime" && (
                  <DatePicker
                    className="w-full"
                    showTime={{ format: "HH:mm" }}
                    format="YYYY-MM-DD HH:mm"
                  />
                )}
                {/* Select, Radio */}
                {["select", "radio"].includes(editingFieldCategory) && (
                  <Select
                    placeholder="Chọn lựa chọn"
                    options={editingChoiceOptions}
                    notFoundContent="Chưa có lựa chọn"
                  />
                )}
                {/* MultiSelect */}
                {["multiselect"].includes(editingFieldCategory) && (
                  <Select
                    mode="multiple"
                    placeholder="Chọn các lựa chọn"
                    options={editingChoiceOptions}
                    notFoundContent="Chưa có lựa chọn"
                  />
                )}
                {/* YesNo */}
                {editingFieldCategory === "yesno" && (
                  <Select
                    placeholder="Có / Không"
                    options={[
                      { value: "yes", label: "Có" },
                      { value: "no", label: "Không" },
                    ]}
                  />
                )}
              </Form.Item>

              <Form.Item
                name="destinationFieldId"
                label="Nhảy đến câu hỏi"
                rules={[{ required: true, message: "Chọn đích đến" }]}
              >
                <Select
                  placeholder="Chọn câu hỏi đích"
                  options={editingDestinationOptions.map((field) => ({
                    value: field.id!,
                    label: field.title || "Chưa đặt tên",
                  }))}
                />
              </Form.Item>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  onClick={() => {
                    setIsEditRuleModalOpen(false);
                    setEditingConnection(null);
                    editRuleForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSavingLogic}
                  className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none hover:!from-amber-600 hover:!to-orange-600"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </BaseScreenAdmin>
  );
}

type FlowVisualizerProps = {
  nodes: FlowNode[];
  connections: FlowConnection[];
  isDarkMode: boolean;
  activeNodeId: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  onCreateConnection?: (sourceId: string, targetId: string) => void;
  onDeleteConnection?: (connectionId: string, ruleId?: string) => void;
  onEditConnection?: (connection: FlowConnection) => void;
  onEditNode?: (nodeId: string) => void;
  formFields: FieldWithLogicResponseEntity[];
};

type WorkflowNodeData = {
  title: string;
  fieldType?: string | null;
  orderIndex: number;
  tone: "rose" | "violet";
  isActive: boolean;
  isDarkMode: boolean;
  logicCount?: number;
  onEdit?: () => void;
};

function FlowVisualizer({
  nodes,
  connections,
  isDarkMode,
  activeNodeId,
  onNodeSelect,
  onCreateConnection,
  onDeleteConnection,
  onEditConnection,
  onEditNode,
  formFields,
}: FlowVisualizerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const edgeUpdateSuccessful = useRef(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [renderNodes, setRenderNodes] = useState<Node<WorkflowNodeData>[]>([]);
  const [renderEdges, setRenderEdges] = useState<Edge[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{
    source: string;
    target: string;
  } | null>(null);

  // Build node data with logic rule count
  const nodeLogicCounts = useMemo(() => {
    const counts = new Map<string, number>();
    formFields.forEach((field) => {
      if (field.id) {
        counts.set(field.id, field.logicRules?.length ?? 0);
      }
    });
    return counts;
  }, [formFields]);

  const baseNodes = useMemo<Node<WorkflowNodeData>[]>(() => {
    return nodes.map((node) => ({
      id: node.id,
      position: { x: node.x, y: node.y },
      data: {
        title: node.title,
        fieldType: node.type,
        orderIndex: node.orderIndex,
        tone: node.tone,
        isActive: node.id === activeNodeId,
        isDarkMode,
        logicCount: nodeLogicCounts.get(node.id) ?? 0,
        onEdit: () => onEditNode?.(node.id),
      },
      type: "workflowNode",
      selectable: true,
      draggable: true,
      connectable: true,
    }));
  }, [nodes, activeNodeId, isDarkMode, nodeLogicCounts, onEditNode]);

  useEffect(() => {
    setRenderNodes((prev) => {
      const previousPositions = new Map(
        prev.map((node) => [node.id, node.position]),
      );
      return baseNodes.map((node) => ({
        ...node,
        position: previousPositions.get(node.id) ?? node.position,
      }));
    });
  }, [baseNodes]);

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    requestAnimationFrame(() => instance.fitView({ padding: 0.24 }));
  }, []);

  useEffect(() => {
    const instance = reactFlowInstance.current;
    if (!instance) return;
    instance.fitView({ padding: 0.24, duration: 400 });
  }, [nodes]);

  // Build edges with delete and edit capability
  const reactFlowEdges = useMemo<Edge[]>(() => {
    return connections.map((conn) => {
      const accent = conn.isDefault
        ? isDarkMode
          ? "#475569"
          : "#CBD5F5"
        : isDarkMode
          ? "#FBBF24"
          : "#F59E0B";
      return {
        id: conn.id,
        source: conn.sourceId,
        target: conn.targetId,
        type: "customEdge",
        animated: !conn.isDefault,
        updatable: true,
        data: {
          label: conn.label,
          isDefault: conn.isDefault,
          ruleId: conn.ruleId,
          condition: conn.condition,
          value: conn.value,
          isDarkMode,
          onDelete: () => onDeleteConnection?.(conn.id, conn.ruleId),
          onEdit: () => onEditConnection?.(conn),
        },
        style: {
          stroke: accent,
          strokeWidth: 2.4,
          strokeDasharray: conn.isDefault ? "6 6" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: accent,
        },
      };
    });
  }, [connections, isDarkMode, onDeleteConnection, onEditConnection]);

  // Sync edges when connections change
  useEffect(() => {
    setRenderEdges(reactFlowEdges);
  }, [reactFlowEdges]);

  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setRenderNodes((current) => applyNodeChanges(changes, current));
  }, []);

  // Handle edge changes (selection, removal)
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setRenderEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  // Handle edge update start
  const handleEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  // Handle edge update (when dragging edge endpoint to new node)
  const handleEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeUpdateSuccessful.current = true;
      setRenderEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [],
  );

  // Handle edge update end
  const handleEdgeUpdateEnd = useCallback(() => {
    if (!edgeUpdateSuccessful.current) {
      // Edge was dropped on empty space - could delete or revert
      // For now, we just revert by not doing anything
    }
    edgeUpdateSuccessful.current = true;
  }, []);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect],
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id);
      onEditNode?.(node.id);
      const instance = reactFlowInstance.current;
      if (!instance) return;
      const centerX = node.position.x + FLOW_NODE_WIDTH / 2;
      const centerY = node.position.y + FLOW_NODE_HEIGHT / 2;
      instance.setCenter(centerX, centerY, { duration: 300, zoom: 1.1 });
    },
    [onNodeSelect, onEditNode],
  );

  const handlePaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Handle connection creation from drag
  const handleConnect = useCallback((connection: Connection) => {
    if (
      connection.source &&
      connection.target &&
      connection.source !== connection.target
    ) {
      setPendingConnection({
        source: connection.source,
        target: connection.target,
      });
      setConnectModalOpen(true);
    }
  }, []);

  const handleConnectStart = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const handleConnectEnd = useCallback(() => {
    setIsConnecting(false);
  }, []);

  const confirmConnection = useCallback(() => {
    if (pendingConnection) {
      onCreateConnection?.(pendingConnection.source, pendingConnection.target);
    }
    setConnectModalOpen(false);
    setPendingConnection(null);
  }, [pendingConnection, onCreateConnection]);

  const cancelConnection = useCallback(() => {
    setConnectModalOpen(false);
    setPendingConnection(null);
  }, []);

  const focusActiveNode = useCallback(() => {
    if (!activeNodeId) return;
    const instance = reactFlowInstance.current;
    if (!instance) return;
    const targetNode = renderNodes.find((node) => node.id === activeNodeId);
    if (!targetNode) return;
    const centerX = targetNode.position.x + FLOW_NODE_WIDTH / 2;
    const centerY = targetNode.position.y + FLOW_NODE_HEIGHT / 2;
    instance.setCenter(centerX, centerY, {
      duration: 400,
      zoom: Math.max(zoomLevel, 1),
    });
  }, [activeNodeId, renderNodes, zoomLevel]);

  const changeZoom = useCallback(
    (delta: number) => {
      const instance = reactFlowInstance.current;
      if (!instance) return;
      const current = instance.getZoom?.() ?? zoomLevel;
      const next = Math.min(2.5, Math.max(0.3, current + delta));
      instance.zoomTo(next, { duration: 200 });
    },
    [zoomLevel],
  );

  const resetView = useCallback(() => {
    const instance = reactFlowInstance.current;
    if (!instance) return;
    instance.fitView({ padding: 0.24, duration: 400 });
  }, []);

  const zoomPercent = Math.round(zoomLevel * 100);

  // Get source and target names for modal
  const sourceNode = pendingConnection
    ? nodes.find((n) => n.id === pendingConnection.source)
    : null;
  const targetNode = pendingConnection
    ? nodes.find((n) => n.id === pendingConnection.target)
    : null;

  return (
    <div
      ref={reactFlowWrapper}
      className={`relative h-[680px] w-full overflow-hidden rounded-3xl border ${
        isDarkMode
          ? "border-slate-800 bg-slate-950/50"
          : "border-slate-200 bg-white"
      } ${isConnecting ? "ring-2 ring-amber-400 ring-opacity-50" : ""}`}
    >
      <div className="absolute right-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <Tooltip title="Kéo từ node này đến node khác để tạo kết nối">
          <Tag
            color={isConnecting ? "green" : isDarkMode ? "default" : undefined}
            className={
              !isConnecting ? "!bg-amber-500 !text-white !border-none" : ""
            }
            icon={<LinkOutlined />}
          >
            {isConnecting ? "Đang kết nối..." : "Kéo để nối"}
          </Tag>
        </Tooltip>
        <Button.Group size="small">
          <Button icon={<MinusOutlined />} onClick={() => changeZoom(-0.2)} />
          <Button icon={<PlusOutlined />} onClick={() => changeZoom(0.2)} />
        </Button.Group>
        <Tag className="!bg-amber-500 !text-white !border-none">
          {zoomPercent}%
        </Tag>
        <Button
          icon={<AimOutlined />}
          size="small"
          onClick={focusActiveNode}
          disabled={!activeNodeId}
        >
          Tập trung
        </Button>
        <Button icon={<ReloadOutlined />} size="small" onClick={resetView}>
          Vừa khung
        </Button>
      </div>
      <ReactFlow
        nodes={renderNodes}
        edges={renderEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2.5}
        nodesDraggable
        nodesConnectable
        edgesFocusable
        edgesUpdatable
        onInit={handleInit}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onEdgeUpdate={handleEdgeUpdate}
        onEdgeUpdateStart={handleEdgeUpdateStart}
        onEdgeUpdateEnd={handleEdgeUpdateEnd}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
        panOnDrag
        selectionOnDrag
        zoomOnScroll
        zoomOnPinch
        connectionLineStyle={{ stroke: "#F59E0B", strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          maskColor={isDarkMode ? "#020617cc" : "#eef2ffcc"}
          nodeColor={(node) =>
            node.data?.tone === "rose" ? "#FB923C" : "#F59E0B"
          }
          pannable
          zoomable
        />
        <Controls position="top-right" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={isDarkMode ? "#1E293B" : "#E2E8F0"}
        />
      </ReactFlow>
      <div
        className={`pointer-events-none absolute left-4 bottom-4 z-10 rounded-2xl px-3 py-1 text-xs ${
          isDarkMode
            ? "bg-slate-900/80 text-slate-300"
            : "bg-white/90 text-slate-600"
        }`}
      >
        <strong>Tương tác:</strong> Kéo thả node • Kéo đầu dây để đổi kết nối •
        Nhấp đúp để chỉnh sửa • Cuộn để zoom
      </div>

      {/* Connection confirmation modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <LinkOutlined className="text-amber-500" />
            <span>Tạo kết nối mới</span>
          </div>
        }
        open={connectModalOpen}
        onOk={confirmConnection}
        onCancel={cancelConnection}
        okText="Tạo kết nối (Luôn chuyển)"
        cancelText="Hủy"
        okButtonProps={{
          className:
            "!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none",
        }}
      >
        <div className="py-4">
          <p className="mb-4">
            Bạn muốn tạo kết nối từ <strong>{sourceNode?.title}</strong> đến{" "}
            <strong>{targetNode?.title}</strong>?
          </p>
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
            <div className="flex-1 rounded-xl bg-white p-3 text-center shadow-sm">
              <p className="m-0 text-xs text-amber-600">Từ</p>
              <p className="m-0 font-semibold text-amber-900">
                {sourceNode?.title}
              </p>
            </div>
            <BranchesOutlined className="text-2xl text-amber-500" />
            <div className="flex-1 rounded-xl bg-white p-3 text-center shadow-sm">
              <p className="m-0 text-xs text-amber-600">Đến</p>
              <p className="m-0 font-semibold text-amber-900">
                {targetNode?.title}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Kết nối sẽ được tạo với điều kiện &quot;Luôn chuyển&quot;. Bạn có thể
            chỉnh sửa điều kiện chi tiết hơn trong panel bên phải.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// Custom Edge with delete and edit buttons
type CustomEdgeData = {
  label: string;
  isDefault?: boolean;
  ruleId?: string;
  condition?: LogicCondition;
  value?: string;
  isDarkMode: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
};

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
}: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const conditionLabel = data?.condition
    ? (conditionCopy[data.condition]?.title ?? data.condition)
    : "";
  const displayLabel = data?.value || conditionLabel || data?.label || "";

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd as string}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <Tooltip
            title={
              <div>
                <p className="m-0 font-semibold">{conditionLabel}</p>
                {data?.value && (
                  <p className="m-0 text-xs opacity-80">
                    Giá trị: {data.value}
                  </p>
                )}
                {data?.isDefault && (
                  <p className="m-0 text-xs opacity-80">Kết nối mặc định</p>
                )}
                {!data?.isDefault && (
                  <p className="m-0 text-xs opacity-80 mt-1">
                    Nhấp ✏️ để sửa • Nhấp ✕ để xóa
                  </p>
                )}
              </div>
            }
          >
            <div
              className={`group flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow-sm transition-all hover:scale-105 ${
                data?.isDefault
                  ? data?.isDarkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-200 text-slate-600"
                  : data?.isDarkMode
                    ? "bg-amber-900/80 text-amber-200"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              <span className="max-w-[100px] truncate">{displayLabel}</span>
              {!data?.isDefault && (
                <div className="ml-1 hidden items-center gap-0.5 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                  {data?.onEdit && (
                    <button
                      type="button"
                      className="h-4 w-4 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        data.onEdit?.();
                      }}
                      title="Sửa luật"
                    >
                      <EditOutlined style={{ fontSize: 10 }} />
                    </button>
                  )}
                  {data?.onDelete && (
                    <Popconfirm
                      title="Xóa kết nối này?"
                      description="Hành động này không thể hoàn tác"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        data.onDelete?.();
                      }}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        type="button"
                        className="h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ScissorOutlined style={{ fontSize: 10 }} />
                      </button>
                    </Popconfirm>
                  )}
                </div>
              )}
            </div>
          </Tooltip>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  const badgeTone =
    data.tone === "rose"
      ? data.isDarkMode
        ? "bg-orange-500/20 text-orange-200"
        : "bg-orange-100 text-orange-700"
      : data.isDarkMode
        ? "bg-amber-500/20 text-amber-200"
        : "bg-amber-100 text-amber-700";
  const wrapperTone = data.isActive
    ? data.isDarkMode
      ? "border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/20"
      : "border-amber-400 bg-white shadow-lg shadow-amber-500/20"
    : data.isDarkMode
      ? "border-slate-700 bg-slate-900/70 hover:border-slate-600"
      : "border-slate-200 bg-white hover:border-slate-300";
  const textTone = data.isDarkMode ? "text-slate-100" : "text-slate-900";

  const handleStyle = {
    width: 12,
    height: 12,
    background: data.isDarkMode ? "#F59E0B" : "#FBBF24",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  };

  return (
    <Tooltip
      title={
        <div>
          <p className="m-0 font-semibold">{data.title}</p>
          <p className="m-0 text-xs opacity-80">Loại: {data.fieldType}</p>
          <p className="m-0 text-xs opacity-80">
            Luật logic: {data.logicCount ?? 0}
          </p>
          <p className="m-0 text-xs mt-1 opacity-60">
            Nhấp đúp để chỉnh sửa
          </p>
        </div>
      }
      placement="top"
    >
      <div
        className={`group h-full w-full cursor-pointer rounded-3xl border-2 px-4 py-3 shadow-sm transition-all duration-200 ${wrapperTone}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyle}
          className="!opacity-0 group-hover:!opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyle}
          className="!opacity-0 group-hover:!opacity-100 transition-opacity"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500">
            Bước {data.orderIndex}
          </span>
          <div className="flex items-center gap-1">
            {(data.logicCount ?? 0) > 0 && (
              <Tooltip title={`${data.logicCount} luật logic`}>
                <Tag
                  className="!m-0 !text-[10px] !px-1.5 !py-0 !bg-amber-500 !text-white !border-none"
                  icon={<BranchesOutlined />}
                >
                  {data.logicCount}
                </Tag>
              </Tooltip>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeTone}`}
            >
              {data.fieldType ?? "Trường"}
            </span>
          </div>
        </div>
        <p
          className={`mt-2 text-sm font-semibold line-clamp-2 ${textTone}`}
          title={data.title}
        >
          {data.title}
        </p>
        {data.isActive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
        )}
      </div>
    </Tooltip>
  );
}
