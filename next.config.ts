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
  // В Next.js 16 используется serverExternalPackages вместо experimental.serverComponentsExternalPackages
  serverExternalPackages: ['lunisolar', 'moment-timezone'],
  
  // Turbopack конфигурация (пустая, так как используем стандартные настройки)
  turbopack: {},
};

export default nextConfig;

