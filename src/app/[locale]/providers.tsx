// This provider file is to be able to use the session information and decode it to provide user info in the client components
'use client'
import { SessionProvider } from "next-auth/react"
import { NextIntlClientProvider } from "next-intl"
import { FavoriteProvider } from "@/contexts/FavoriteContext"

type Props = {
    children?:React.ReactNode
    messages: Record<string, unknown>
    locale: string
}
export const Providers = ({children, messages, locale}:Props) => {
    return (
        <SessionProvider>
            <FavoriteProvider>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    {children}
                </NextIntlClientProvider>
            </FavoriteProvider>
        </SessionProvider>
    )
}
