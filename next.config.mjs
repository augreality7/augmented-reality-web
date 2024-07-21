/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['firebasestorage.googleapis.com'],
    },
    webpack(config, { isServer }) {
        // Add fallback for the 'fs' module
        if (!isServer) {
          config.resolve.fallback = {
            fs: false,
          };
        }
        return config;
      },
};

export default nextConfig;
