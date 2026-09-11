import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    use: { baseURL: 'http://127.0.0.1:5174' },
    projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }],
    webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
});
