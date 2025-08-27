// import { use } from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
// This is how you get 3rd party scripts in your application: We will use it for google analytics
import Script from "next/script";
import GoogleAnalytics from "@/lib/googleAnalytics";
import Menu from "@/components/Menu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DEMFIRAT KARVEN | Home Collection",
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
    menuT("Home"),
    menuT("Products"),
    menuT("AboutUs"),
    menuT("Contact"),
    menuT("SideText"),
  ];
  // const FooterT = useTranslations("FooterPage");
  const footerT = await getTranslations({ locale, namespace: "FooterPage" });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <GoogleAnalytics />
        {/* Provider component wraps the application and passes the props of session information (from the user) */}
        <Providers>
          <Header ShippingText={headerT("ShippingText")}></Header>
          <Menu menuTArray={menuTArray} locale={locale} />
          {/* shipping={menuT('Shipping')} Home={menuT('Home')} Products={menuT('Products')} AboutUs={menuT('AboutUs')} Contact={menuT('Contact')} SideText = {menuT('SideText')}  */}
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
          ></Footer>
        </Providers>
      </body>
    </html>
  );
}
