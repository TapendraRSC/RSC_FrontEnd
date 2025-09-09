import type { NextConfig } from "next";

let optimizeCss = false;

// ✅ Try to enable Critters safely
try {
  require.resolve("critters");
  optimizeCss = true;
} catch (e) {
  console.warn(
    "⚠️  Critters not found. CSS optimization is disabled. Run `npm install critters` to enable it."
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true, // helps catch issues in dev
  swcMinify: true,       // faster minifier
  images: {
    domains: ["res.cloudinary.com"], // allow Cloudinary images
    formats: ["image/avif", "image/webp"], // modern formats
  },
  experimental: {
    optimizeCss, // auto true if critters installed, else false
  },
};

export default nextConfig;
