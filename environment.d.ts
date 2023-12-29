declare namespace NodeJS {
  interface ProcessEnv {
    DISCORD_BOT_TOKEN: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    NEXTAUTH_SECRET: string;
    NEXT_PUBLIC_DISCORD_CLIENT_ID: string;
    NEXT_PUBLIC_DISCORD_PERMISSIONS: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_SECRET_KEY: string;
    NEXT_PUBLIC_SITE_NAME: string;
    NEXT_PUBLIC_STRIPE_PRICE_ID: string;
    NEXT_PUBLIC_STRIPE_WEBHOOK_BASEURL: string;

    FIREBASE_ADMIN_TYPE: string;
    FIREBASE_ADMIN_PROJECT_ID: string;
    FIREBASE_ADMIN_PRIVATE_KEY_ID: string;
    FIREBASE_ADMIN_PRIVATE_KEY: string;
    FIREBASE_ADMIN_CLIENT_EMAIL: string;
    FIREBASE_ADMIN_CLIENT_ID: string;
    FIREBASE_ADMIN_AUTH_URI: string;
    FIREBASE_ADMIN_TOKEN_URI: string;
    FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL: string;
    FIREBASE_ADMIN_CLIENT_X509_CERT_URL: string;
    FIREBASE_ADMIN_UNIVERSE_DOMAIN: string;

    NEXT_PUBLIC_MODE: string;
    NEXTAUTH_URL: string;
    NEXT_PUBLIC_MAIN_URL: string;
    STRIPE_WEBHOOK_SECRET: string;
  }
}