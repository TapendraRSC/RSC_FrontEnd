// import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import LayoutClient from "./LayoutClient";
// import { NotificationProvider } from './components/NotificationProvider';

// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// // newly add
// export const viewport: Viewport = {
//   themeColor: "#000000",
// };

// export const metadata: Metadata = {
//   title: "RSC Group",
//   description: "Next.js PWA Application",
//   manifest: "/manifest.json",
//   // old code
//   // themeColor: "#000000",
//   icons: {
//     icon: "/icons/icon-192x192.png",
//     apple: "/icons/icon-192x192.png",
//   },
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         {/* ✅ Client-only providers/components moved */}
//         <NotificationProvider>
//           <LayoutClient>{children}</LayoutClient>
//         </NotificationProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import LayoutClient from "./LayoutClient";
import { NotificationProvider } from "./components/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // ✅ hydration safe
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // ✅ hydration safe
});

// newly add
export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "RSC Group",
  description: "Next.js PWA Application",
  manifest: "/manifest.json",
  // old code
  // themeColor: "#000000",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Client-only providers */}
        <NotificationProvider>
          <LayoutClient>{children}</LayoutClient>
        </NotificationProvider>
      </body>
    </html>
  );
}
