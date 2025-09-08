import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // helps catch issues in dev
  swcMinify: true,       // re-enable faster SWC minifier (recommended)
  images: {
    domains: ["res.cloudinary.com"], // allow Cloudinary images
    formats: ["image/avif", "image/webp"], // modern formats for performance
  },
  experimental: {
    optimizeCss: true, // better CSS optimization
  },
};

export default nextConfig;
