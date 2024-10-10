'use client'

import { handleTokenSave } from "@/actions/server/auth"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import jwt from 'jsonwebtoken'

export default function VerifyTokenPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const urlToken = searchParams.get('token') ?? ''
    const urlRefreshToken = searchParams.get('refreshToken') ?? ''
    const isFirstConfig = searchParams.get('isFirstConfig') ?? 'false'

    const checkUrlToken = async () => {
        if (urlToken) {
            const decodedToken: any = jwt.decode(urlToken);

            const expirationDate = new Date(decodedToken.exp * 1000);

            // Convert to ISO 8601 format
            const isoFormatDate = expirationDate.toISOString();
            await handleTokenSave({
                token: urlToken,
                expires_at:isoFormatDate,
                refresh_token:urlRefreshToken,
                isFirstConfig: isFirstConfig
            })
        }
    }

    useEffect(() => {
        checkUrlToken()
    }, [urlToken])

    return <></>
}
