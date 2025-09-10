import type { NextConfig } from "next";

let optimizeCss = false;

try {
  require.resolve("critters");
  optimizeCss = true;
} catch (e) {
  console.warn(
    "⚠️  Critters not found. CSS optimization is disabled. Run `npm install critters` to enable it."
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss,
  },
};

export default nextConfig;
