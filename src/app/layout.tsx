// We created this mock layout.tsx so we can have a parent for the internationalization purposes inside the [locale] folder
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
