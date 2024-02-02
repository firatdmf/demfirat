import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
// This is how you get 3rd party scripts in your application: We will use it for google analytics
import Script from "next/script";
import GoogleAnalytics from "@/lib/googleAnalytics";

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
        <GoogleAnalytics/>
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
