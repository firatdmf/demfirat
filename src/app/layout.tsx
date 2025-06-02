// "use client";
// import { SessionProvider } from "next-auth/react";
// We created this mock layout.tsx so we can have a parent for the internationalization purposes inside the [locale] folder
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // <SessionProvider>
    children
    // </SessionProvider>
  );
}
