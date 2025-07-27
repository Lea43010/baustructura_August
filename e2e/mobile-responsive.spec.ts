import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Responsiveness Tests', () => {
  // Test on different mobile devices
  const mobileDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] }
  ]

  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use({ ...device })

      test('should display mobile navigation correctly', async ({ page }) => {
        await page.goto('/')
        
        // Check for mobile navigation elements
        const mobileNav = page.locator('[data-testid="mobile-nav"]')
        await expect(mobileNav).toBeVisible()
        
        // Verify bottom navigation is visible
        await expect(page.locator('text=Dashboard')).toBeVisible()
        await expect(page.locator('text=Projekte')).toBeVisible()
        await expect(page.locator('text=Karten')).toBeVisible()
      })

      test('should handle touch interactions on project cards', async ({ page }) => {
        await page.goto('/projects')
        
        // Test touch interaction on project cards
        const projectCard = page.locator('[data-testid="project-card"]').first()
        if (await projectCard.isVisible()) {
          await projectCard.tap()
          
          // Should navigate to project details
          await expect(page).toHaveURL(/\/projects\/\d+/)
        }
      })

      test('should display forms properly on mobile', async ({ page }) => {
        await page.goto('/projects/new')
        
        // Check form elements are properly sized
        const nameInput = page.locator('[placeholder*="Projektname"]')
        const descInput = page.locator('[placeholder*="Beschreibung"]')
        
        await expect(nameInput).toBeVisible()
        await expect(descInput).toBeVisible()
        
        // Test form input on mobile
        await nameInput.tap()
        await nameInput.fill('Mobile Test Project')
        
        await expect(nameInput).toHaveValue('Mobile Test Project')
      })

      test('should handle camera functionality on mobile', async ({ page, context }) => {
        // Grant camera permissions
        await context.grantPermissions(['camera'])
        
        await page.goto('/camera')
        
        // Check camera interface
        await expect(page.locator('#camera-container')).toBeVisible()
        
        // Test camera controls
        const captureButton = page.locator('[data-testid="capture-button"]')
        if (await captureButton.isVisible()) {
          await captureButton.tap()
        }
      })

      test('should display maps correctly on mobile', async ({ page, context }) => {
        // Grant location permissions
        await context.grantPermissions(['geolocation'])
        
        await page.goto('/maps')
        
        // Check map container
        await expect(page.locator('#map-container')).toBeVisible()
        
        // Test mobile map controls
        const searchInput = page.locator('[placeholder*="Adresse suchen"]')
        await expect(searchInput).toBeVisible()
        
        // Test touch zoom (if implemented)
        const mapContainer = page.locator('#map-container')
        await mapContainer.tap({ position: { x: 100, y: 100 } })
      })

      test('should handle GPS functionality on mobile', async ({ page, context }) => {
        await context.grantPermissions(['geolocation'])
        
        await page.goto('/projects/new')
        
        // Test GPS button
        const gpsButton = page.locator('[data-testid="gps-button"]')
        if (await gpsButton.isVisible()) {
          await gpsButton.tap()
          
          // Should populate location fields
          await expect(page.locator('[placeholder*="Latitude"]')).not.toBeEmpty()
        }
      })
    })
  })

  test.describe('Responsive Design Tests', () => {
    test('should adapt to different screen sizes', async ({ page }) => {
      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/')
      
      let sidebar = page.locator('[data-testid="desktop-sidebar"]')
      await expect(sidebar).toBeVisible()
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      
      // Should still show sidebar or adapted navigation
      await expect(page.locator('nav')).toBeVisible()
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      
      // Should show mobile navigation
      const mobileNav = page.locator('[data-testid="mobile-nav"]')
      await expect(mobileNav).toBeVisible()
    })

    test('should handle orientation changes', async ({ page }) => {
      // Portrait mode
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      await expect(page.locator('nav')).toBeVisible()
      
      // Landscape mode
      await page.setViewportSize({ width: 667, height: 375 })
      await page.reload()
      
      // Navigation should still be accessible
      await expect(page.locator('nav')).toBeVisible()
    })
  })

  test.describe('Touch Gestures Tests', () => {
    test.use({ ...devices['iPhone 12'] })

    test('should support swipe gestures for navigation', async ({ page }) => {
      await page.goto('/projects')
      
      // Test swipe gestures (if implemented)
      const projectList = page.locator('[data-testid="project-list"]')
      
      if (await projectList.isVisible()) {
        // Perform swipe gesture
        await projectList.dragTo(projectList, {
          sourcePosition: { x: 200, y: 200 },
          targetPosition: { x: 50, y: 200 }
        })
      }
    })

    test('should handle pinch zoom on maps', async ({ page, context }) => {
      await context.grantPermissions(['geolocation'])
      await page.goto('/maps')
      
      const mapContainer = page.locator('#map-container')
      await expect(mapContainer).toBeVisible()
      
      // Test pinch zoom gesture (if supported)
      await mapContainer.tap({ position: { x: 100, y: 100 } })
    })
  })
})