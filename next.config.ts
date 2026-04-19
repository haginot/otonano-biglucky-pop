import type { NextConfig } from 'next';

const config: NextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/og.png', destination: '/og' },
    ];
  },
};

export default config;
