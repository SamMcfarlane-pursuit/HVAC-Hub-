import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should display login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('text=Sign in to HVACHub')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'wrong@email.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
    });

    test('should login with valid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@hvachub.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/', { timeout: 5000 });
    });
});
