const nextConfig = {
  images: {
    domains: ['utfs.io', 'api.slingacademy.com']
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  },
  experimental: {
    runtime: 'nodejs'
  }
};

module.exports = nextConfig;
