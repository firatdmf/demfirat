// import { use } from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
// import HelpWidget from "@/components/HelpWidget";
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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-T3VG89L5');
          `}
        </Script>
        {/* End Google Tag Manager */}

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '3893578660935588');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=3893578660935588&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T3VG89L5"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

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
          <MobileBottomNav />
          {/* <HelpWidget /> */}
        </Providers>
      </body>
    </html>
  );
}
