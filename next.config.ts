import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'natural', 'mammoth'],
};

export default nextConfig;
