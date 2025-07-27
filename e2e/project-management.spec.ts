import { test, expect } from '@playwright/test'

test.describe('Project Management Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated session
    await context.addCookies([
      {
        name: 'connect.sid',
        value: 'mock-session-id',
        domain: 'localhost',
        path: '/'
      }
    ])
  })

  test('should create a new project successfully', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to projects
    await page.click('text=Projekte')
    
    // Click new project button
    await page.click('text=Neues Projekt')
    
    // Fill project form
    await page.fill('[placeholder*="Projektname"]', 'Test Automation Project')
    await page.fill('[placeholder*="Beschreibung"]', 'Automated test project description')
    
    // Fill address
    await page.fill('[placeholder*="Straße"]', 'Teststraße')
    await page.fill('[placeholder*="Hausnummer"]', '123')
    await page.fill('[placeholder*="PLZ"]', '12345')
    await page.fill('[placeholder*="Stadt"]', 'Teststadt')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('text=Test Automation Project')).toBeVisible()
  })

  test('should display project list', async ({ page }) => {
    await page.goto('/projects')
    
    // Should show projects table
    await expect(page.locator('text=Projektname')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
    await expect(page.locator('text=Kunde')).toBeVisible()
  })

  test('should navigate to project details', async ({ page }) => {
    await page.goto('/projects')
    
    // Click on first project (if exists)
    const firstProject = page.locator('[data-testid="project-row"]').first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      
      // Should navigate to project details
      await expect(page).toHaveURL(/\/projects\/\d+/)
      await expect(page.locator('text=Projektdetails')).toBeVisible()
    }
  })

  test('should open map from project details', async ({ page }) => {
    await page.goto('/projects')
    
    // Navigate to first project
    const firstProject = page.locator('[data-testid="project-row"]').first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      
      // Click map button
      const mapButton = page.locator('text=Karte öffnen')
      if (await mapButton.isVisible()) {
        await mapButton.click()
        
        // Should navigate to maps with project data
        await expect(page).toHaveURL(/\/maps/)
        await expect(page.locator('#map-container')).toBeVisible()
      }
    }
  })
})