"use client";
import React from "react";
import { Checkbox } from "antd";
import Title from "antd/es/typography/Title";

export type FilterOption = { label: string; value: string };
export type FilterGroup = {
  param: string;
  title: string;
  type?: "multi" | "single";
  options: FilterOption[];
};

interface FilterContentProps {
  groups: FilterGroup[];
  values: Record<string, string[]>;
  onChange: (param: string, values: string[], type: "multi" | "single") => void;
}

export default function FilterContent({
  groups,
  values,
  onChange,
}: FilterContentProps) {
  return (
    <div className="p-4">
      <Title level={4} style={{ marginBottom: 8 }}>
        Lọc khóa học
      </Title>

      {groups.map((group) => {
        const paramName = group.param;
        const type = group.type ?? "multi";
        const selectedValues = values[paramName] ?? [];

        return (
          <div key={paramName} className="mb-6 dark:bg-[#0b1220]">
            <h4 className="mb-2 font-medium">{group.title}</h4>
            <Checkbox.Group
              className="flex flex-col gap-1 text-gray-600"
              options={group.options.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              value={selectedValues}
              onChange={(vals) => {
                const arr = (vals as string[]) ?? [];
                const nextVals = type === "single" ? arr.slice(-1) : arr;
                onChange(paramName, nextVals, type);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
