import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demfirat Karven",
  description: "Sheer fabric manufacturer in Turkiye",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Provider component wraps the application and passes the props of session information (from the user) */}
        <Providers>
          <Header></Header>
          {children}
          <Footer></Footer>
        </Providers>
      </body>
    </html>
  );
}
