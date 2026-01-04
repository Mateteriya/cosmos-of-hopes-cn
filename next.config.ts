import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Убеждаемся, что Service Worker правильно обслуживается
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  
  // Настройки для поддержки динамических импортов ES модулей
  experimental: {
    serverComponentsExternalPackages: ['lunisolar', 'moment-timezone'],
  },
  
  // Разрешаем импорт из папки БаЦЗЫ
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Для серверной стороны разрешаем внешние модули
      config.externals = config.externals || [];
    }
    return config;
  },
};

export default nextConfig;

