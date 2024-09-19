'use client'

import { handleTokenSave } from "@/actions/server/auth"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function VerifyTokenPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const urlToken = searchParams.get('token') ?? ''
    const isFirstConfig = searchParams.get('isFirstConfig') ?? 'false'

    const checkUrlToken = async () => {
        if (urlToken) {
            await handleTokenSave({
                token: urlToken,
                isFirstConfig:isFirstConfig
            })
        }
    }

    useEffect(() => {
        checkUrlToken()
    }, [urlToken])

    return <></>
}
