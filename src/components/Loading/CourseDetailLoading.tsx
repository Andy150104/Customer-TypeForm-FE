"use client";

import React from "react";
import { Skeleton } from "antd";
import BaseScreenWhiteNav from "EduSmart/layout/BaseScreenWhiteNav";
import { FadeTransition } from "EduSmart/components/Animation/FadeTransition";

export default function CourseDetailLoading() {
  return (
    <BaseScreenWhiteNav>
      <FadeTransition show={true}>
        {/* Breadcrumb skeleton */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6"
        >
          <div className="sticky top-20 sm:top-24 z-30">
            <div className="rounded-xl px-3 py-2 bg-white/75 dark:bg-[#0b1220]/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-40 rounded-full bg-gray-200 animate-pulse hidden sm:block" />
              </div>
            </div>
          </div>
        </nav>

        {/* Hero image skeleton */}
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="h-[400px] w-full rounded-2xl bg-gray-200/80 dark:bg-zinc-800/80 animate-pulse shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60" />
        </div>

        {/* Content skeleton */}
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* SIDEBAR skeleton */}
            <aside className="order-1 lg:order-2 lg:col-span-1 lg:-mt-36 lg:mr-10">
              <div className="rounded-2xl shadow-xl ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 bg-white/95 dark:bg-zinc-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur p-4 space-y-4">
                {/* Thumbnail */}
                <div className="overflow-hidden rounded-xl">
                  <div className="aspect-[16/9] w-full bg-gray-200/80 dark:bg-zinc-800/80 animate-pulse" />
                </div>

                {/* Title + rating */}
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex gap-2 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded bg-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-16 rounded-full bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>

                <div className="h-px bg-zinc-200/70 dark:bg-zinc-800/70 my-3" />

                {/* Info list */}
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-3 w-40 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                  ))}
                </div>

                <div className="h-px bg-zinc-200/70 dark:bg-zinc-800/70 my-3" />

                {/* Price + buttons */}
                <div className="space-y-3">
                  <div>
                    <div className="h-3 w-10 bg-gray-200 rounded-full animate-pulse mb-2" />
                    <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Skeleton.Button
                      active
                      style={{ width: "100%", height: 40, borderRadius: 999 }}
                    />
                    <Skeleton.Button
                      active
                      style={{ width: "100%", height: 40, borderRadius: 999 }}
                    />
                  </div>
                </div>

                <div className="h-px bg-zinc-200/70 dark:bg-zinc-800/70 my-3" />

                {/* Share icons */}
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT skeleton */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
              {/* Tabs bar */}
              <div className="rounded-2xl p-3 sm:p-4 bg-white/95 dark:bg-zinc-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="flex gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Content block */}
              <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/90 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 p-4 sm:p-6 space-y-4">
                <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 3 }} />
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>

              {/* Curriculum block skeleton */}
              <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/90 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 p-4 sm:p-6 space-y-3">
                <div className="h-5 w-40 bg-gray-200 rounded-full animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-3 sm:p-4 space-y-2"
                  >
                    <div className="h-4 w-1/2 bg-gray-200 rounded-full animate-pulse" />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </FadeTransition>
    </BaseScreenWhiteNav>
  );
}
