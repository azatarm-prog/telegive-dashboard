import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('dashboard loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Login
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('giveaway form responds quickly to user input', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();

    // Navigate to create giveaway
    await page.getByTestId('create-giveaway-button').click();

    const startTime = Date.now();
    
    // Fill in form fields
    await page.getByTestId('title-input').fill('Performance Test Giveaway');
    await page.getByTestId('main-body-input').fill('Testing form performance with a longer message that includes multiple sentences and various characters to simulate real user input.');
    await page.getByTestId('winner-count-input').fill('5');
    
    // Wait for preview to appear
    await expect(page.getByText('Preview')).toBeVisible();
    
    const responseTime = Date.now() - startTime;
    
    // Form should respond within 1 second
    expect(responseTime).toBeLessThan(1000);
  });

  test('participant list handles large datasets efficiently', async ({ page }) => {
    // Mock a large participant list
    await page.route('**/api/participants/**', async route => {
      const participants = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        user_id: 100000 + i,
        first_name: `User${i}`,
        last_name: `Test${i}`,
        username: `@user${i}`,
        captcha_completed: i % 2 === 0,
        is_winner: i < 10,
        participated_at: new Date().toISOString(),
      }));
      
      await route.fulfill({
        json: {
          participants,
          stats: {
            total: 1000,
            captcha_completed: 500,
            captcha_pending: 500,
            winners: 10,
          },
        },
      });
    });

    // Login and navigate to dashboard
    await page.goto('/');
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();

    const startTime = Date.now();
    
    // Expand participant list (if it exists)
    const participantSection = page.getByText('Participants');
    if (await participantSection.isVisible()) {
      await participantSection.click();
      
      // Wait for participant list to load
      await expect(page.getByTestId('participant-list')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Large participant list should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    }
  });

  test('image upload handles large files efficiently', async ({ page }) => {
    // Login and navigate to create giveaway
    await page.goto('/');
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    await page.getByTestId('create-giveaway-button').click();

    const startTime = Date.now();
    
    // Create a large test file (5MB)
    const largeFileBuffer = Buffer.alloc(5 * 1024 * 1024, 'test-data');
    
    const fileInput = page.getByTestId('media-upload').locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: largeFileBuffer,
    });
    
    // Wait for file to be processed
    await expect(page.getByTestId('uploaded-file')).toBeVisible();
    
    const uploadTime = Date.now() - startTime;
    
    // Large file upload should complete within 5 seconds
    expect(uploadTime).toBeLessThan(5000);
  });

  test('navigation between pages is smooth', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();

    const navigationTimes: number[] = [];

    // Test navigation to create giveaway
    let startTime = Date.now();
    await page.getByTestId('create-giveaway-button').click();
    await expect(page.getByText('Create Giveaway')).toBeVisible();
    navigationTimes.push(Date.now() - startTime);

    // Test navigation to history
    startTime = Date.now();
    await page.getByText('History').click();
    await expect(page.getByText('Giveaway History')).toBeVisible();
    navigationTimes.push(Date.now() - startTime);

    // Test navigation back to dashboard
    startTime = Date.now();
    await page.getByText('Dashboard').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    navigationTimes.push(Date.now() - startTime);

    // All navigation should be under 500ms
    navigationTimes.forEach(time => {
      expect(time).toBeLessThan(500);
    });
  });

  test('memory usage remains stable during extended use', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();

    // Simulate extended use by navigating between pages multiple times
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('create-giveaway-button').click();
      await expect(page.getByText('Create Giveaway')).toBeVisible();
      
      await page.getByText('Dashboard').click();
      await expect(page.getByTestId('dashboard')).toBeVisible();
      
      await page.getByText('History').click();
      await expect(page.getByText('Giveaway History')).toBeVisible();
      
      await page.getByText('Dashboard').click();
      await expect(page.getByTestId('dashboard')).toBeVisible();
    }

    // Check that the page is still responsive
    const startTime = Date.now();
    await page.getByTestId('create-giveaway-button').click();
    await expect(page.getByText('Create Giveaway')).toBeVisible();
    const responseTime = Date.now() - startTime;

    // Should still respond quickly after extended use
    expect(responseTime).toBeLessThan(1000);
  });

  test('concurrent user simulation', async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 5 }, () => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    const startTime = Date.now();

    // Simulate 5 concurrent users logging in
    await Promise.all(
      pages.map(async (page) => {
        await page.goto('/');
        await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('dashboard')).toBeVisible();
      })
    );

    const totalTime = Date.now() - startTime;

    // All users should be able to login within 10 seconds
    expect(totalTime).toBeLessThan(10000);

    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });
});

