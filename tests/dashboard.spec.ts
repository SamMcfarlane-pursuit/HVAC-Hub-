import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@hvachub.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('should display Quick Actions section', async ({ page }) => {
        await expect(page.locator('text=Quick Actions')).toBeVisible();
    });

    test('should display Live Feed', async ({ page }) => {
        await expect(page.locator('text=Live Feed')).toBeVisible();
    });

    test('should navigate to Triage via Quick Action', async ({ page }) => {
        await page.click('text=Start Triage');
        await expect(page).toHaveURL('/triage');
    });

    test('should navigate to Dispatch via Quick Action', async ({ page }) => {
        await page.click('text=Dispatch');
        await expect(page).toHaveURL('/routing');
    });
});
