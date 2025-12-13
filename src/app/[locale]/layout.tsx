// import { use } from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import { getTranslations, getMessages } from "next-intl/server";
import GoogleAnalytics from "@/lib/googleAnalytics";
import ScrollToTop from "@/components/ScrollToTop";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DEMFIRAT® KARVEN | Home Collection",
  description: "Your premium home textiles provider.",
};
export default async function RootLayout(props: LayoutProps<'/[locale]'>) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  // let menuT = useTranslations("Menu");
  const menuT = await getTranslations({ locale, namespace: "Menu" });
  // let headerT = useTranslations("Header");
  const headerT = await getTranslations({ locale, namespace: "Header" });
  // console.log(typeof headerT("ShippingText"));
  // console.log(headerT.raw);

  let menuTArray = [
    menuT("Home"),      // 0 - Ana Sayfa
    menuT("Fabrics"),   // 1 - Kumaşlar
    menuT("Curtains"),  // 2 - Hazır Perdeler
    menuT("AboutUs"),   // 3 - Hakkımızda
    menuT("Contact"),   // 4 - İletişim
  ];
  // const FooterT = useTranslations("FooterPage");
  const footerT = await getTranslations({ locale, namespace: "FooterPage" });
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <GoogleAnalytics />
        {/* Provider component wraps the application and passes the props of session information (from the user) */}
        <Providers messages={messages} locale={locale}>
          <ScrollToTop />
          <Header menuTArray={menuTArray} />
          {children}
          {/* above {children} now changed to ------- */}
          {/* <div className="flex flex-col min-h-screen max-w-4xl mx-auto">
            <h1>Header</h1>
            <div className="flex-grow mt-20">{children}</div>
          </div> */}
          {/* ------ */}
          <Footer
            StayConnected={footerT("StayConnected")}
            OurStory={footerT("OurStory")}
            ContactUs={footerT("ContactUs")}
            AllRightsReserved={footerT("AllRightsReserved")}
            locale={locale}
          ></Footer>
        </Providers>
      </body>
    </html>
  );
}
