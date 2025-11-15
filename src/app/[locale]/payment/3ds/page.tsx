'use client';

import { useEffect, useState } from 'react';

export default function ThreeDSPage() {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    // Get HTML content from localStorage (set by checkout page)
    const content = localStorage.getItem('threeDSHtmlContent');
    if (content) {
      setHtmlContent(content);
      // Clear after reading
      localStorage.removeItem('threeDSHtmlContent');
      
      // Auto-submit any forms in the content
      setTimeout(() => {
        const forms = document.getElementsByTagName('form');
        if (forms.length > 0) {
          console.log('Auto-submitting 3DS form...');
          forms[0].submit();
        }
      }, 100);
    }
  }, []);

  if (!htmlContent) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#faf8f3'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0dcd2',
            borderTopColor: '#c9a961',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Yükleniy or...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render 3D Secure HTML directly
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0
      }}
    />
  );
}
