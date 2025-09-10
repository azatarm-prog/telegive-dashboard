import { test, expect } from '@playwright/test';

test.describe('Complete Giveaway Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('complete giveaway creation and management flow', async ({ page }) => {
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Telegive Dashboard')).toBeVisible();

    // Login with bot token
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard')).toBeVisible();

    // Navigate to create giveaway page
    await page.getByTestId('create-giveaway-button').click();
    await expect(page).toHaveURL('/create-giveaway');

    // Fill in giveaway form
    await page.getByTestId('title-input').fill('Test E2E Giveaway');
    await page.getByTestId('main-body-input').fill('Win amazing prizes in our test giveaway!');
    await page.getByTestId('winner-count-input').fill('2');

    // Upload a test image
    const fileInput = page.getByTestId('media-upload').locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    // Verify preview appears
    await expect(page.getByText('Preview')).toBeVisible();
    await expect(page.getByText('Win amazing prizes in our test giveaway!')).toBeVisible();

    // Submit the giveaway
    await page.getByTestId('publish-button').click();

    // Should redirect back to dashboard with active giveaway
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('active-giveaway')).toBeVisible();

    // Verify giveaway details are displayed
    await expect(page.getByText('Test E2E Giveaway')).toBeVisible();
    await expect(page.getByText('Win amazing prizes in our test giveaway!')).toBeVisible();
    await expect(page.getByTestId('participant-count')).toBeVisible();

    // Configure finish messages
    await page.getByTestId('conclusion-message-input').fill('Thank you all for participating! Winners have been selected.');
    await page.getByTestId('winner-message-input').fill('Congratulations! You won our giveaway!');
    await page.getByTestId('loser-message-input').fill('Thank you for participating. Better luck next time!');

    // Save finish messages
    await page.getByRole('button', { name: /save messages/i }).click();

    // Finish the giveaway (if participants exist)
    const finishButton = page.getByTestId('finish-button');
    if (await finishButton.isEnabled()) {
      await finishButton.click();
      
      // Confirm in dialog
      await expect(page.getByTestId('finish-confirmation')).toBeVisible();
      await page.getByTestId('confirm-finish').click();
    }

    // Navigate to history page
    await page.getByTestId('history-tab').click();
    await expect(page).toHaveURL('/history');

    // Verify giveaway appears in history
    await expect(page.getByTestId('history-item')).toBeVisible();
    await expect(page.getByText('Test E2E Giveaway')).toBeVisible();

    // Expand history item to see details
    await page.getByTestId('history-item').click();
    await expect(page.getByText('Giveaway Details')).toBeVisible();
    await expect(page.getByText('Statistics')).toBeVisible();

    // Test participant list expansion
    await page.getByTestId('expand-participants-button').click();
    await expect(page.getByText('Participants')).toBeVisible();
  });

  test('authentication guard prevents unauthorized access', async ({ page }) => {
    // Try to access protected routes directly
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');

    await page.goto('/create-giveaway');
    await expect(page).toHaveURL('/login');

    await page.goto('/history');
    await expect(page).toHaveURL('/login');
  });

  test('form validation works correctly', async ({ page }) => {
    // Login first
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/dashboard');

    // Navigate to create giveaway
    await page.getByTestId('create-giveaway-button').click();

    // Try to submit empty form
    await page.getByTestId('publish-button').click();

    // Should show validation errors
    await expect(page.getByText(/title must be at least/i)).toBeVisible();
    await expect(page.getByText(/main body must be at least/i)).toBeVisible();

    // Test invalid winner count
    await page.getByTestId('winner-count-input').fill('0');
    await page.getByTestId('publish-button').click();
    await expect(page.getByText(/winner count must be at least 1/i)).toBeVisible();

    await page.getByTestId('winner-count-input').fill('101');
    await page.getByTestId('publish-button').click();
    await expect(page.getByText(/winner count cannot exceed 100/i)).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();

    // Verify dashboard is responsive
    await expect(page.getByTestId('dashboard')).toBeVisible();

    // Test navigation on mobile
    await page.getByTestId('create-giveaway-button').click();
    await expect(page.getByText('Create Giveaway')).toBeVisible();

    // Verify form is usable on mobile
    await page.getByTestId('title-input').fill('Mobile Test');
    await page.getByTestId('main-body-input').fill('Testing mobile interface');
    await expect(page.getByText('Preview')).toBeVisible();
  });

  test('error handling works correctly', async ({ page }) => {
    // Test login with invalid token format
    await page.getByTestId('bot-token-input').fill('invalid-token');
    await page.getByTestId('login-button').click();
    await expect(page.getByText(/invalid bot token format/i)).toBeVisible();

    // Test with empty token
    await page.getByTestId('bot-token-input').clear();
    await page.getByTestId('login-button').click();
    await expect(page.getByText(/bot token is required/i)).toBeVisible();
  });

  test('navigation and routing work correctly', async ({ page }) => {
    // Login
    await page.getByTestId('bot-token-input').fill('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    await page.getByTestId('login-button').click();

    // Test navigation between pages
    await expect(page).toHaveURL('/dashboard');

    // Navigate to create giveaway
    await page.getByTestId('create-giveaway-button').click();
    await expect(page).toHaveURL('/create-giveaway');

    // Use back button
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/dashboard');

    // Navigate to history
    await page.getByText('History').click();
    await expect(page).toHaveURL('/history');

    // Use back button
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});

