"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, Tooltip } from "antd";
import Image from "next/image";
import { useSpring, animated, easings } from "@react-spring/web";
import { ThemeSwitch } from "EduSmart/components/Themes/Theme";
import bgQuestion from "EduSmart/assets/modern-business-buildings-financial-district.jpg";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { isAxiosError } from "axios";
import BubbleBackground from "EduSmart/components/Bubble/BubbleBackground";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import Loading from "EduSmart/components/Loading/Loading";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";
import { Lobster, Outfit } from "next/font/google";
import "./styles/login.styles.css";
import { FiArrowLeft } from "react-icons/fi";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
});

const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

type GoogleIdTokenPayload = {
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  sub?: string;
};

function decodeJwtPayload(token: string): GoogleIdTokenPayload {
  const parts = token.split(".");
  if (parts.length < 2) return {};

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  try {
    const json = atob(padded);
    return JSON.parse(json) as GoogleIdTokenPayload;
  } catch {
    return {};
  }
}

export default function LoginPage() {
  const messageApi = useNotification();
  const loginGoogle = useAuthStore((state) => state.loginGoogle);
  const isOtherSystem = useAuthStore((state) => state.isOtherSystem);
  const router = useRouter();
  const [showForm, setShowForm] = useState<boolean>(false);
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

  const onGoogleSuccess = async (resp: CredentialResponse) => {
    try {
      const idToken = resp.credential ?? "";
      if (!idToken) return;

      useLoadingStore.getState().showLoading();
      const payload = decodeJwtPayload(idToken);

      if (!payload.sub || !payload.email) {
        messageApi.error("Không thể lấy thông tin từ Google");
        useLoadingStore.getState().hideLoading();
        return;
      }

      const isOK = await loginGoogle(
        payload.sub,
        payload.email,
        payload.name || "",
        payload.picture || "",
      );

      if (useAuthStore.getState().isOtherSystem) {
        useLoadingStore.getState().hideLoading();
        return;
      }

      const target = redirect || "/";
      if (isOK) {
        messageApi.success("Đăng nhập thành công!");
        router.push(target);
        useLoadingStore.getState().hideLoading();
        return;
      }

      messageApi.error("Đăng nhập thất bại, vui lòng thử lại");
      useLoadingStore.getState().hideLoading();
    } catch (error: unknown) {
      useLoadingStore.getState().hideLoading();
      let errorMessage = "Đăng nhập thất bại, vui lòng thử lại.";
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

  const FormCard = (
    <animated.div
      style={mountSprings}
      className="relative w-full max-w-md isolate"
    >
      <BubbleBackground />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-200/60 dark:border-amber-700/60 p-10 sm:p-12 overflow-hidden">
        {/* Decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Title with Lobster font */}
        <div className="relative mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
          </div>
          <h1
            className={`${lobster.className} text-3xl sm:text-4xl text-slate-900 dark:text-white text-center mb-3`}
          >
            Đăng nhập Uniwrap
          </h1>
          {/* Trust badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 text-xs font-medium text-amber-700 dark:text-amber-300">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Bảo mật cao
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <div className="relative flex justify-center mb-10">
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => messageApi.error("Google login lỗi")}
              useOneTap={false}
            />
          </div>
        </div>

        {/* Dashboard Preview Section */}
        <div className="dashboard-preview-container relative rounded-2xl bg-gradient-to-br from-amber-50/95 via-yellow-50/95 to-orange-50/95 dark:from-slate-800/95 dark:via-slate-700/95 dark:to-slate-800/95 border border-amber-200/70 dark:border-amber-600/40 shadow-xl p-7 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-30 dashboard-preview-gradient bg-gradient-to-br from-amber-200/20 via-yellow-200/20 to-orange-200/20 dark:from-amber-900/10 dark:via-yellow-900/10 dark:to-orange-900/10" />

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/10 via-yellow-400/5 to-transparent rounded-bl-3xl" />

          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {/* Header with icon */}
          <div className="dashboard-preview-header relative mb-5">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 transition-transform duration-300 hover:scale-110">
                <svg
                  className="w-4 h-4 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                TRẢI NGHIỆM DASHBOARD
              </h2>
            </div>
            {/* Description */}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
              Tạo form theo ý của bạn
            </p>
          </div>

          {/* Placeholder Elements */}
          <div className="relative space-y-3.5">
            {/* Title placeholder */}
            <div className="dashboard-preview-title-bar h-3 bg-gradient-to-r from-slate-300/70 via-slate-400/70 to-slate-300/70 dark:from-slate-600/50 dark:via-slate-500/50 dark:to-slate-600/50 rounded-full w-2/3 mx-auto dashboard-preview-placeholder" />

            {/* Form fields with icons */}
            <div className="space-y-3">
              <div className="dashboard-preview-field-1 dashboard-preview-field relative h-12 bg-white/98 dark:bg-slate-700/98 rounded-xl border border-slate-200/80 dark:border-slate-600/80 shadow-md backdrop-blur-sm flex items-center px-4 gap-3 transition-all duration-200 hover:shadow-lg hover:border-amber-300/50 dark:hover:border-amber-500/30">
                <div className="w-4 h-4 rounded bg-slate-200/60 dark:bg-slate-600/60 dashboard-preview-placeholder" />
                <div className="flex-1 h-3 bg-slate-100/80 dark:bg-slate-600/40 rounded dashboard-preview-placeholder" />
              </div>
              <div className="dashboard-preview-field-2 dashboard-preview-field relative h-12 bg-white/98 dark:bg-slate-700/98 rounded-xl border border-slate-200/80 dark:border-slate-600/80 shadow-md backdrop-blur-sm flex items-center px-4 gap-3 transition-all duration-200 hover:shadow-lg hover:border-amber-300/50 dark:hover:border-amber-500/30">
                <div className="w-4 h-4 rounded bg-slate-200/60 dark:bg-slate-600/60 dashboard-preview-placeholder" />
                <div className="flex-1 h-3 bg-slate-100/80 dark:bg-slate-600/40 rounded dashboard-preview-placeholder" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="dashboard-preview-buttons flex gap-3 pt-1">
              <div className="dashboard-preview-gradient flex-1 h-10 bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-orange-400/90 dark:from-amber-600/70 dark:via-yellow-600/70 dark:to-orange-600/70 rounded-lg shadow-md border border-amber-300/40 dark:border-amber-600/30 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <div className="h-2.5 w-16 bg-white/40 dark:bg-white/20 rounded-full dashboard-preview-placeholder" />
              </div>
              <div className="w-24 h-10 bg-white/90 dark:bg-slate-700/90 rounded-lg border border-slate-200/70 dark:border-slate-600/70 shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <div className="h-2 w-12 bg-slate-300/60 dark:bg-slate-500/60 rounded-full dashboard-preview-placeholder" />
              </div>
            </div>
          </div>
        </div>
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
          <div className="relative h-dvh w-full overflow-hidden rounded-b-[80px] shadow-[0_20px_60px_rgba(251,191,36,.35)]">
            {/* Gradient động */}
            <div
              className="absolute inset-0 bg-[length:300%_300%] animate-gradient-flow 
                          bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400"
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
    router.push("/form");
  };

  if (isOtherSystem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 px-4">
        <animated.div style={statusSpring} className="relative max-w-md w-full">
          {/* Viền gradient + glow nhẹ */}
          <div
            className="
            absolute -inset-[1px] rounded-3xl 
            bg-gradient-to-br from-amber-400/35 via-yellow-400/25 to-orange-400/35 
            opacity-80 blur-md
            dark:from-amber-400/60 dark:via-yellow-400/40 dark:to-orange-400/60
          "
          />

          <div
            className="
            relative rounded-3xl p-8 text-center
            bg-white/90 border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.18)]
            dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-[0_18px_60px_rgba(15,23,42,0.85)]
          "
          >
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-amber-600 dark:text-amber-300 mb-3">
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/35 dark:bg-amber-400/40" />
                  <span className="relative inline-flex rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent animate-spin" />
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
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 transition-all duration-500"
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
        className="fixed inset-0 z-[70] bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 pointer-events-none"
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
              "before:absolute before:inset-0 before:rounded-full",
              "before:bg-gradient-to-r before:from-amber-400/20 before:via-yellow-400/20 before:to-orange-400/20",
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
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-400 opacity-50 dark:opacity-40" />
          <div
            className={`${outfit.variable} absolute bottom-8 left-6 md:bottom-12 md:left-12 z-10 font-[family-name:var(--font-outfit)]`}
          >
            <p
              className={`hidden xs:block text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.02em] !m-2 lg:m-4 bg-gradient-to-r from-white via-amber-100 to-yellow-100 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.3),0_4px_16px_rgba(251,191,36,0.2)]`}
            >
              Uniwrap
            </p>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl font-semibold text-white/98 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3),0_2px_8px_rgba(251,191,36,0.15)] tracking-[0.01em]">
              Nền tảng tạo form khảo sát chuyên nghiệp{" "}
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
             bg-gradient-to-br from-amber-50 to-yellow-50
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
