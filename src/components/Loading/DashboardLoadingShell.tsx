"use client";
import React from "react";
import { Skeleton } from "antd";

export default function DashboardLoadingShell() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero search */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-sky-50 to-indigo-50 px-8 py-8 shadow-sm">
          <div className="space-y-3 max-w-xl">
            <div className="h-6 w-64 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <Skeleton.Input active style={{ width: "100%", height: 44 }} />
            <Skeleton.Input active style={{ width: 200, height: 44 }} />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filter */}
          <div className="hidden lg:block w-72">
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-5">
              <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-32 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-28 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course grid */}
          <div className="flex-1">
            <div className="h-6 w-40 bg-gray-200 rounded-full mb-6 animate-pulse" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Image placeholder */}
                  <div className="h-40 bg-gray-100 animate-pulse" />

                  {/* Content placeholder */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-5/6 bg-gray-200 rounded-full animate-pulse" />

                    <div className="flex items-center justify-between pt-2">
                      <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                      <Skeleton.Button
                        active
                        style={{ width: 90, height: 34, borderRadius: 999 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
