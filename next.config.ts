import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
