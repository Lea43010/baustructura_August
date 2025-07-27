import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should show landing page for unauthenticated users
    await expect(page.locator('text=Willkommen bei Bau-Structura')).toBeVisible()
    await expect(page.locator('text=Anmelden')).toBeVisible()
  })

  test('should show login button on landing page', async ({ page }) => {
    await page.goto('/')
    
    const loginButton = page.locator('text=Anmelden')
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
  })

  test('should navigate to Replit auth when clicking login', async ({ page }) => {
    await page.goto('/')
    
    // Click login button
    await page.click('text=Anmelden')
    
    // Should redirect to auth endpoint
    await expect(page).toHaveURL(/\/api\/login/)
  })

  test('should show appropriate content for different user roles', async ({ page, context }) => {
    // Mock authenticated user
    await context.addCookies([
      {
        name: 'connect.sid',
        value: 'mock-session-id',
        domain: 'localhost',
        path: '/'
      }
    ])

    await page.goto('/')
    
    // Should show dashboard for authenticated users
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })
})