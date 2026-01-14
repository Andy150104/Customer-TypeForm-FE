// File: src/components/Footer.jsx
import React from "react";
import Image from "next/image";
import logoImg from "EduSmart/assets/Flearning.png";

const quickLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Khóa học", href: "/course" },
  { label: "Lộ trình học tập", href: "/dashboard" },
  { label: "Cộng đồng", href: "/community" },
];

const supportLinks = [
  { label: "Câu hỏi thường gặp", href: "/faq" },
  { label: "Chính sách bảo mật", href: "/privacy" },
  { label: "Điều khoản sử dụng", href: "/terms" },
  { label: "Liên hệ hỗ trợ", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#030616] text-slate-200">
      {/* subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-75">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(79,70,229,0.25),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-0">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Image
                src={logoImg}
                alt="EduSmart logo"
                width={48}
                height={48}
                className="rounded-xl"
                priority
              />
              <div>
                <p className="text-base font-semibold text-white">
                  EduSmart Learning
                </p>
                <p className="text-sm text-slate-400">
                  Nền tảng học tập thông minh dành cho sinh viên FPT.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Khám phá hàng trăm khóa học chất lượng, lộ trình học tập cá nhân
              hóa và báo cáo tiến độ trực quan để nâng cấp kỹ năng của bạn mỗi
              ngày.
            </p>
            <div className="text-sm text-slate-400">
              <p>Hotline: <span className="text-white font-medium">1900 636 987</span></p>
              <p>Email: <a className="text-emerald-300 hover:underline" href="mailto:support@edusmart.vn">support@edusmart.vn</a></p>
              <p>Địa chỉ: Khu CNC Hòa Lạc, Thạch Thất, Hà Nội</p>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                Khám phá nhanh
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                Hỗ trợ &amp; chính sách
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-inner shadow-black/10 backdrop-blur">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Nhận bản tin
            </h4>
            <p className="mt-4 text-sm text-slate-400">
              Cập nhật sớm các khóa học mới, ưu đãi độc quyền và mẹo học tập mỗi
              tuần.
            </p>
            <form className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                suppressHydrationWarning
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-emerald-400"
              />
              <button
                suppressHydrationWarning
                type="submit"
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-400/30 transition hover:opacity-95"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EduSmart. Tất cả quyền được bảo lưu.</p>
          <p className="mt-3 sm:mt-0">
            Made with ❤️ bởi đội ngũ FE Deploy – FPT Edu.
          </p>
        </div>
      </div>
    </footer>
  );
}
