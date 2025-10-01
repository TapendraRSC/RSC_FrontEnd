import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'RSC Group',
  webDir: 'out',  // Next.js build folder

  // ✅ Server settings (for PWA/navigation)
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'backend.rscgroupdholera.in',  // ✅ Domain without https:// (Capacitor 5+ requirement)
      '*.rscgroupdholera.in',
      'localhost'  // For local testing
    ]
  },

  // ✅ Capacitor HTTP Plugin (for API calls)
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
