// This provider file is to be able to use the session information and decode it to provide user info in the client components
'use client'
import { SessionProvider } from "next-auth/react"

// below is to get data insights
type Props = {
    children?:React.ReactNode
}
export const Providers = ({children}:Props) => {
    return <SessionProvider>{children}</SessionProvider>
}