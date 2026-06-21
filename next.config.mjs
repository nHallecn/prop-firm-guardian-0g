// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfill or ignore Node.js core modules that are sometimes required by Web3/ethers dependencies
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    // Optimizes package imports for large component libraries and the 0G Foundation SDK
    optimizePackageImports: ['@0gfoundation/0g-storage-ts-sdk', 'lucide-react', 'recharts'],
  },
};

export default nextConfig;