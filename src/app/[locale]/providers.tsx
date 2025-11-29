// This provider file is to be able to use the session information and decode it to provide user info in the client components
'use client'
import { SessionProvider } from "next-auth/react"
import { NextIntlClientProvider } from "next-intl"
import { FavoriteProvider } from "@/contexts/FavoriteContext"
import { CartProvider } from "@/contexts/CartContext"

import { CurrencyProvider } from "@/contexts/CurrencyContext"

type Props = {
    children?: React.ReactNode
    messages: Record<string, unknown>
    locale: string
}
export const Providers = ({ children, messages, locale }: Props) => {
    return (
        <SessionProvider>
            <CurrencyProvider>
                <FavoriteProvider>
                    <CartProvider>
                        <NextIntlClientProvider messages={messages} locale={locale}>
                            {children}
                        </NextIntlClientProvider>
                    </CartProvider>
                </FavoriteProvider>
            </CurrencyProvider>
        </SessionProvider>
    )
}
