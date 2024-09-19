/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    GOOGLE_ACCOUNT_OAUTH_URL: process.env.GOOGLE_ACCOUNT_OAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID,
    QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET,
    QUICKBOOKS_REDIRECT_URI: process.env.QUICKBOOKS_REDIRECT_URI,
    OPEN_AI: process.env.OPEN_AI,
    AUTH_SECRET: process.env.AUTH_SECRET,

    STRAPI_URL: process.env.STRAPI_URL,
    REALTIME_NOTIFICATION: process.env.REALTIME_NOTIFICATION,

    API_SSO: process.env.API_SSO,
    API_PROFILE: process.env.API_PROFILE,
    API_MANAGE: process.env.API_MANAGE,
    API_MASTER: process.env.API_MASTER,
    API_FILEUPLOAD: process.env.API_FILEUPLOAD,
    API_BILLSTOPAY: process.env.API_BILLSTOPAY,
    API_BILLS: process.env.API_BILLS,
    API_ACTIVITY: process.env.API_ACTIVITY,
    API_NOTIFICATION: process.env.API_NOTIFICATION,
    API_GLOBAL: process.env.API_GLOBAL,
    API_REPORTS: process.env.API_REPORTS,
    API_DASHBOARD: process.env.API_DASHBOARD,
    API_CLOUD: process.env.API_CLOUD,

    HOST_URL: process.env.HOST_URL,

    KYC_FORM_URL: process.env.KYC_FORM_URL,

    STORAGE_ACCOUNT: process.env.STORAGE_ACCOUNT,
    CONTAINER_NAME: process.env.CONTAINER_NAME,
    SASS_TOKEN: process.env.SASS_TOKEN,
    
    AP_REDIRECT_URL: process.env.AP_REDIRECT_URL,
    BI_REDIRECT_URL: process.env.BI_REDIRECT_URL,
  },
  images: {
    domains: ['nextpqap.azurewebsites.net'],
  },
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  future: { webpack5: true },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
}

module.exports = nextConfig
