import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    id: string;
    access_token: string;
    refresh_token: string;
    expires_at: string;
    CompanyName: string;
    CompanyId: number;
    AccountingTool: number;
    org_id: number;
    user_id: number;
    is_admin: boolean;
    is_organization_admin: boolean;
    role_id: number;
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}
