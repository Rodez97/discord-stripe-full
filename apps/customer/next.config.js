const path = require("path");
const withTM = require("next-transpile-modules")([
  "@stripe-discord/lib",
  "@stripe-discord/ui",
  "@stripe-discord/types",
  "@stripe-discord/db-lib",
  "@fontsource/roboto",
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
      },
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "src", "styles")],
  },
};

module.exports = withTM(nextConfig);
