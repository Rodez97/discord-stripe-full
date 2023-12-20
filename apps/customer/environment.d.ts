declare namespace NodeJS {
  interface ProcessEnv {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    DISCORD_BOT_TOKEN: string;
    NEXT_PUBLIC_STRIPE_WEBHOOK_BASEURL: string;
    NEXT_PUBLIC_DISCORD_PERMISSIONS: string;
    NEXT_PUBLIC_MAIN_URL: string;
  }
}
