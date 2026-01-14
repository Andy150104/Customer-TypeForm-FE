"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Form, Segmented, Tooltip } from "antd";
import Image from "next/image";
import { useSpring, useTrail, animated, easings } from "@react-spring/web";
import { gsap } from "gsap";
import BaseControlTextField from "EduSmart/components/BaseControl/BasecontrolTextField";
import { ThemeSwitch } from "EduSmart/components/Themes/Theme";
import bgQuestion from "EduSmart/assets/FPT_Logo_Background.jpg";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { isAxiosError } from "axios";
import BubbleBackground from "EduSmart/components/Bubble/BubbleBackground";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import Loading from "EduSmart/components/Loading/Loading";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";
import { Lobster } from "next/font/google";
import "./styles/login.styles.css";
import { FiArrowLeft } from "react-icons/fi";

const xmlColumns = {
  email: { id: "email", name: "Email", rules: "required" },
  password: { id: "password", name: "Mật khẩu", rules: "required" },
} as const;

type LoginFormValues = { email: string; password: string };

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
});

export default function LoginPage() {
  const messageApi = useNotification();
  const [form] = Form.useForm<LoginFormValues>();
  const login = useAuthStore((state) => state.login);
  const isOtherSystem = useAuthStore((state) => state.isOtherSystem);
  const router = useRouter();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<"login" | "register">("login");
  const [skipMountAnim, setSkipMountAnim] = useState(false);
  const [showFormBySwipeRun, setShowFormBySwipeRun] = useState<boolean>(true);
  const [showWipe, setShowWipe] = useState(false);
  const [wipeStyles, wipeApi] = useSpring<{ y: number }>(() => ({ y: 100 }));
  const didRunRef = useRef(false);
  const transitionLayerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";
  const redirect =
    rawRedirect && rawRedirect.startsWith("/")
      ? decodeURIComponent(rawRedirect)
      : "";
  const [waitingSeconds, setWaitingSeconds] = useState(0);

  useEffect(() => {
    const SetForm = async () => {
      const seen =
        typeof window !== "undefined" &&
        sessionStorage.getItem("authMountOnce") === "1";
      if (seen) {
        setShowFormBySwipeRun(false);
      }
      await setShowForm(true);
    };
    SetForm();
  }, []);

  useEffect(() => {
    if (!isOtherSystem) {
      setWaitingSeconds(0);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      setWaitingSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOtherSystem]);

  useEffect(() => {
    router.prefetch("/Register"); // tải sẵn chunk của trang Register
  }, [router]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (e.persisted || nav?.type === "reload") {
        sessionStorage.removeItem("authMountOnce");
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    const seen =
      typeof window !== "undefined" &&
      sessionStorage.getItem("authMountOnce") === "1";

    setSkipMountAnim(seen);
    if (!seen || didRunRef.current) return;
    didRunRef.current = true;

    setShowWipe(true);

    requestAnimationFrame(() => {
      // Dừng animation đang chạy (nếu có) rồi set tức thời vị trí start
      wipeApi.stop();
      wipeApi.set({ y: -100 }); // <-- KHÔNG có immediate ở đây

      requestAnimationFrame(() => {
        wipeApi.start({
          to: [
            { y: 0, config: { duration: 700, easing: easings.easeOutCubic } },
            { y: 100, config: { duration: 550, easing: easings.easeInCubic } },
          ],
          onRest: () => setShowWipe(false),
        });
      });
    });
    setTimeout(() => {
      setShowFormBySwipeRun(true);
    }, 500);
  }, [wipeApi]);

  const navigateWithTransition = useCallback(
    (target: string, sessionFlag?: string) => {
      if (sessionFlag && typeof window !== "undefined") {
        sessionStorage.setItem("routeTransition", sessionFlag);
      }
      const layer = transitionLayerRef.current;
      if (!layer) {
        router.push(target);
        return;
      }
      gsap.killTweensOf(layer);
      gsap.set(layer, {
        pointerEvents: "auto",
        transformOrigin: "top",
      });
      gsap
        .timeline({
          onComplete: () => {
            router.push(target);
          },
        })
        .fromTo(
          layer,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1, opacity: 1, duration: 0.45, ease: "power2.out" },
        );
    },
    [router],
  );

  const onFinish = async (values: LoginFormValues) => {
    try {
      useLoadingStore.getState().showLoading();
      const isOK = await login(values.email, values.password);
      if (useAuthStore.getState().isOtherSystem) {
        useLoadingStore.getState().hideLoading();
        return;
      }
      const target = redirect || "/";
      console.log("Redirecting to:", target);
      if (isOK) {
        messageApi.success("Đăng nhập thành công!");
        router.push(target);
        useLoadingStore.getState().hideLoading();
        return;
      }
      messageApi.error(
        "Đăng nhập thất bại, vui lòng kiểm tra lại email/mật khẩu",
      );
      useLoadingStore.getState().hideLoading();
    } catch (error: unknown) {
      useLoadingStore.getState().hideLoading();
      let errorMessage =
        "Đăng nhập thất bại, vui lòng kiểm tra lại email/mật khẩu.";
      if (isAxiosError(error)) {
        const serverMsg =
          error.response?.data?.errors || error.response?.data?.error;
        if (typeof serverMsg === "string") errorMessage = serverMsg;
      }
      messageApi.error(errorMessage);
    }
  };

  // 1) Mount animation: chỉ 1 useSpring
  const mountSprings = useSpring({
    opacity: showForm ? 1 : 0,
    transform: showForm ? "scale(1)" : "scale(0.8)",
    immediate: skipMountAnim,
    config: { mass: 1, tension: 280, friction: 60 },
    delay: 300,
  });
  const statusSpring = useSpring({
    opacity: isOtherSystem ? 1 : 0,
    transform: isOtherSystem
      ? "translateY(0px) scale(1)"
      : "translateY(16px) scale(0.96)",
    config: { mass: 1, tension: 240, friction: 22 },
  });

  // 2) Trail cho các input field
  const fieldKeys = ["email", "password"] as const;
  const trail = useTrail(showForm ? fieldKeys.length : 0, {
    from: { opacity: 0, transform: "translate3d(0,20px,0)" },
    to: { opacity: 1, transform: "translate3d(0,0,0)" },
    config: { mass: 1, tension: 200, friction: 20 },
    delay: 600,
  });

  const FormCard = (
    <animated.div
      style={mountSprings}
      className="relative w-full max-w-md isolate"
    >
      <BubbleBackground />
      <div className="relative z-10 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* <h2
          className={`${knewave.className} text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-center px-4 text-[#4a2580]`}
        >
          Welcome to EduSmart
        </h2> */}
        <div className="mx-auto mt-2 w-full">
          <Segmented
            block
            value={activeKey}
            onChange={(val) => {
              const v = val as "login" | "register";
              if (v !== activeKey) {
                setActiveKey(v);
                sessionStorage.setItem("authMountOnce", "1");
                setTimeout(() => {
                  const target = v === "login" ? "/Login" : "/Register";
                  router.push(target, { scroll: false });
                }, 220);
              }
            }}
            options={[
              {
                label: (
                  <span className="text-slate-900 dark:text-white">
                    Đăng Nhập
                  </span>
                ),
                value: "login",
              },
              {
                label: (
                  <span className="text-slate-700 dark:text-slate-300">
                    Đăng kí
                  </span>
                ),
                value: "register",
              },
            ]}
            className="auth-segmented"
          />
          <div className="mt-2 flex justify-center"></div>
        </div>

        {/* Heading thay đổi theo tab */}
        <div
          className={`${lobster.className} flex justify-center items-center h-full
              text-black text-2xl md:text-3xl font-semibold my-6 dark:text-white`}
        >
          Đăng Nhập ngay
        </div>
        <Form<LoginFormValues>
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          {trail.map((style, idx) => {
            const key = fieldKeys[idx];
            return (
              <animated.div key={key} style={style} className="mb-4">
                <BaseControlTextField
                  xmlColumn={xmlColumns[key]}
                  maxlength={50}
                  placeholder={key === "email" ? "Nhập email" : "Nhập mật khẩu"}
                  type={key === "password" ? "password" : undefined}
                />
                {key === "password" && (
                  <div className="mt-2 flex items-center justify-end gap-2 text-right text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Quên mật khẩu?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigateWithTransition(
                          "/forgot-password",
                          "login-to-forgot",
                        )
                      }
                      className="text-sm font-semibold text-teal-600 hover:text-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 transition-colors underline-offset-2 hover:underline cursor-pointer"
                    >
                      Đặt lại ngay
                    </button>
                  </div>
                )}
              </animated.div>
            );
          })}
          <div className="mt-6 sm:mt-8">
            {/* Đổi hover scale sang CSS */}
            <button
              type="submit"
              className="w-full py-4 font-semibold text-white rounded-full bg-gradient-to-r from-teal-400 to-blue-500 
                         hover:scale-[1.05] transition-transform duration-200"
            >
              Đăng nhập
            </button>
          </div>
        </Form>
      </div>
    </animated.div>
  );

  const ShowSwipeEffect = (
    <animated.div
      style={mountSprings}
      className="fixed inset-0 z-[2147483647] pointer-events-none"
    >
      {showWipe && (
        <animated.div
          className="fixed inset-0 z-[2147483647] pointer-events-none"
          style={{
            transform: wipeStyles.y.to((v) => `translate3d(0, ${v}%, 0)`),
            opacity: wipeStyles.y.to([100, 0, -100], [0, 1, 0]), // fade in/out
          }}
        >
          <div className="relative h-dvh w-full overflow-hidden rounded-b-[80px] shadow-[0_20px_60px_rgba(16,185,129,.35)]">
            {/* Gradient động */}
            <div
              className="absolute inset-0 bg-[length:300%_300%] animate-gradient-flow 
                          bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500"
            />

            {/* Overlay cinematic */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />

            {/* Lưới chấm parallax */}
            <div
              className="absolute inset-0 opacity-25 animate-slow-move"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Shine nhiều lớp */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-y-0 -left-1/3 w-1/2 rotate-6 bg-white/10 blur-2xl animate-wipe-shine" />
              <div className="absolute inset-y-0 left-1/4 w-1/3 rotate-12 bg-white/5 blur-3xl animate-wipe-shine delay-200" />
            </div>

            {/* Wave động */}
            <svg
              className="absolute -bottom-10 left-0 w-full h-24 text-white/40 animate-wave"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill="currentColor"
                d="M0,0L120,32C240,64,480,128,720,149.3C960,171,1200,149,1320,138.7L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
              />
            </svg>
          </div>
        </animated.div>
      )}
    </animated.div>
  );

  const backButton = () => {
    sessionStorage.removeItem("authMountOnce");
    router.push("/home");
  };

  if (isOtherSystem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 px-4">
        <animated.div style={statusSpring} className="relative max-w-md w-full">
          {/* Viền gradient + glow nhẹ */}
          <div
            className="
            absolute -inset-[1px] rounded-3xl 
            bg-gradient-to-br from-teal-400/35 via-cyan-400/25 to-blue-500/35 
            opacity-80 blur-md
            dark:from-teal-400/60 dark:via-cyan-400/40 dark:to-blue-500/60
          "
          />

          <div
            className="
            relative rounded-3xl p-8 text-center
            bg-white/90 border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.18)]
            dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_60px_rgba(15,23,42,0.85)]
          "
          >
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-teal-600 dark:text-teal-300 mb-3">
              Đang chuyển hướng
            </p>

            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
              Đang kết nối tới hệ thống xác thực khác
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Vui lòng giữ nguyên tab này. Hệ thống sẽ tự động chuyển khi kết
              nối hoàn tất.
            </p>

            {/* Khu vực timer + loading */}
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-3">
                {/* Vòng tròn loading + ping */}
                <span className="relative flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400/35 dark:bg-teal-400/40" />
                  <span className="relative inline-flex rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent animate-spin" />
                </span>

                <div className="text-left">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Thời gian chờ
                  </div>
                  <div className="mt-0.5 text-2xl font-mono text-slate-900 dark:text-slate-100">
                    {waitingSeconds} <span className="text-sm">giây</span>
                  </div>
                </div>
              </div>

              {/* Thanh progress giả để đỡ trống */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (waitingSeconds % 10) * 10)}%`,
                  }}
                />
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              Nếu chờ quá lâu, hãy thử tải lại trang hoặc kiểm tra lại đường dẫn
              đăng nhập.
            </p>
          </div>
        </animated.div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={transitionLayerRef}
        className="fixed inset-0 z-[70] bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 pointer-events-none"
        style={{ transform: "scaleY(0)", transformOrigin: "top", opacity: 0 }}
      />
      {/* Back floating button */}
      <div
        className="fixed left-3 top-3 md:left-6 md:top-6 z-50"
        style={{
          left: "calc(env(safe-area-inset-left, 0px) + 12px)",
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
        }}
      >
        <Tooltip title="Esc để quay lại" placement="right">
          <Button
            onClick={backButton}
            shape="round"
            size="large"
            aria-label="Quay lại"
            className={[
              "group !inline-flex !items-center gap-2 !px-3 sm:!px-4 !h-10 md:!h-11",
              "relative rounded-full overflow-hidden",
              "bg-white/70 dark:bg-slate-900/60 backdrop-blur-md",
              "ring-1 ring-black/5 dark:ring-white/10 shadow-lg hover:shadow-xl",
              "transition-all duration-200 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60",
              "before:absolute before:inset-0 before:rounded-full",
              "before:bg-gradient-to-r before:from-teal-400/20 before:via-cyan-400/20 before:to-blue-400/20",
              "before:opacity-0 hover:before:opacity-100 before:transition-opacity",
            ].join(" ")}
            icon={
              <FiArrowLeft
                className="h-[18px] w-[18px] md:h-5 md:w-5 text-slate-700 dark:text-slate-200
                     transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5"
              />
            }
          >
            {/* Ẩn label ở mobile để gọn gàng, hiện từ sm trở lên */}
            <span className="hidden sm:inline text-[13px] md:text-sm font-medium text-slate-700 dark:text-slate-200">
              Quay lại Trang Chủ
            </span>
          </Button>
        </Tooltip>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen">
        {showWipe && ShowSwipeEffect}
        <Loading />
        {/* Left: background + mobile form */}
        <div className="relative flex-1 h-screen md:h-auto overflow-hidden">
          <Image
            src={bgQuestion}
            alt="Hero"
            fill
            priority
            placeholder="blur"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-right brightness-90 dark:brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 via-cyan-300 to-blue-300 opacity-50 dark:opacity-40" />
          <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 text-white z-10">
            <p
              className={`hidden xs:block text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-2xl !m-2 lg:m-4`}
            >
              EduSmart
            </p>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl drop-shadow-lg">
              Nền tảng học tập cho sinh viên FPT{" "}
              <span className="pl-4">
                {" "}
                <ThemeSwitch />
              </span>
            </p>
          </div>
          {/* Mobile */}
          <div className="absolute inset-0 md:hidden">
            <div className="relative w-full h-screen">
              <BubbleBackground />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {showFormBySwipeRun && FormCard}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div
          className="hidden md:flex flex-1 items-center justify-center
             bg-gradient-to-br from-blue-50 to-indigo-50
             dark:from-gray-900 dark:to-gray-800"
        >
          <div className="relative w-full h-full">
            {" "}
            {/* <-- đảm bảo cao bằng màn hình */}
            <BubbleBackground /> {/* <-- chạy full vùng này */}
            <div className="absolute inset-0 flex items-center justify-center">
              {showFormBySwipeRun && FormCard}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
