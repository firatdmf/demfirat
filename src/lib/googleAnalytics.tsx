import Script from "next/script";

// const globalForGoogleAnalytics = global as unknown as {prisma: PrismaClient}

function GoogleAnalytics() {
  return (
    <>
      {/* We do not want loading of analytics script to block loading of our page so we do strategy. So this script loads after the everything else's loading is finished*/}
      <Script
        strategy="afterInteractive"
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-0X4NTX7FCM"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-0X4NTX7FCM');`}
      </Script>
    </>
  );
}

export default GoogleAnalytics;