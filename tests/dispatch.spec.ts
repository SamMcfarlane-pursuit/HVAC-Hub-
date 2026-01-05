import { test, expect } from '@playwright/test';

test.describe('Dispatch Map', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@hvachub.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.goto('/routing');
    });

    test('should display the tactical map', async ({ page }) => {
        await expect(page.locator('text=Tactical Command')).toBeVisible();
    });

    test('should display technician markers', async ({ page }) => {
        // Look for technician HUD cards
        await expect(page.locator('[data-testid="tech-marker"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('should display Active Ops sidebar', async ({ page }) => {
        await expect(page.locator('text=Active Ops')).toBeVisible();
    });

    test('should display Optimize button', async ({ page }) => {
        await expect(page.locator('text=Optimize')).toBeVisible();
    });
});
