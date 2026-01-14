export const dynamic = "force-dynamic";

import { Metadata } from "next";
import LoginPage from "./Client";
export const metadata: Metadata = {
  title: "Uniwrap – Đăng nhập",
  description:
    "Đăng nhập vào Uniwrap để tạo và quản lý các form khảo sát chuyên nghiệp.",
  openGraph: {
    title: "Uniwrap",
    description: "Nền tảng tạo form khảo sát chuyên nghiệp",
    url: "https://EduSmart-frontend.vercel.app/Login",
    images: [
      {
        url: "https://EduSmart-frontend.vercel.app/emo.png",
        width: 1200,
        height: 630,
        alt: "Uniwrap logo",
      },
    ],
    siteName: "Uniwrap",
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/emo.png",
        href: "/emo.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/emo.png",
        href: "/emo.png",
      },
    ],
  },
};
export default function Page() {
  return <LoginPage />;
}
