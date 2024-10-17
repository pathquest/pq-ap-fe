'use client'

import { handleTokenSave } from "@/actions/server/auth"
import { decryptToken } from "@/utils/auth"
import jwt from 'jsonwebtoken'
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function VerifyTokenPage() {
    const searchParams = useSearchParams()
    const urlToken = searchParams.get('token') ?? ''
    const refreshToken = searchParams.get('refreshToken') ?? ''
    const isFirstConfig = searchParams.get('isFirstConfig') ?? 'false'

    const checkUrlToken = async () => {
        if (urlToken) {
            const urlDecodedToken = decryptToken(decryptToken(urlToken))

            const decodedToken: any = jwt.decode(urlDecodedToken);
            const expirationDate = new Date(decodedToken.exp * 1000);

            const decodedRefreshToken: any = decodeURIComponent(refreshToken);

            // Convert to ISO 8601 format
            const isoFormatDate = expirationDate.toISOString();
            await handleTokenSave({
                token: urlDecodedToken,
                expires_at: isoFormatDate,
                refresh_token: decodedRefreshToken,
                isFirstConfig: isFirstConfig
            })
        }
    }

    useEffect(() => {
        checkUrlToken()
    }, [urlToken])

    return <></>
}
