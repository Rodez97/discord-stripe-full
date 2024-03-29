const withTM = require("next-transpile-modules")([
  "@stripe-discord/lib",
  "@stripe-discord/ui",
  "@stripe-discord/types",
  "@stripe-discord/db-lib",
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
