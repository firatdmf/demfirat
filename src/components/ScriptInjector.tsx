"use client";

import { useEffect, useRef } from "react";

interface ScriptInjectorProps {
    html: string;
}

export default function ScriptInjector({ html }: ScriptInjectorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!html || !containerRef.current) return;

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Find all script tags
        const scripts = tempDiv.querySelectorAll("script");

        // Array to hold the cleanup functions (removing scripts on unmount if needed)
        const cleanupScripts: HTMLScriptElement[] = [];

        scripts.forEach((script) => {
            const newScript = document.createElement("script");

            // Copy all attributes
            Array.from(script.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // Copy content and wrap in IIFE to prevent global scope pollution
            // This avoids "Identifier 'xxx' has already been declared" errors
            if (script.textContent) {
                newScript.textContent = `(function() {
                    try {
                        ${script.textContent}
                    } catch (e) {
                        console.error('Error in injected script:', e);
                    }
                })();`;
            }

            // Append to document body (or head) to execute
            document.body.appendChild(newScript);
            cleanupScripts.push(newScript);
        });

        // Cleanup function
        return () => {
            cleanupScripts.forEach((script) => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
        };
    }, [html]);

    // We don't render anything visible, just use this to trigger the effect
    // Or we could render the non-script parts if needed, but for Footer JS, usually it's just scripts.
    // If the footer content contains visible HTML (divs etc), we should render it.

    return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
