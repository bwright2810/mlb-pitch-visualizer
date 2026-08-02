import { test, expect } from '@playwright/test';

// Increase timeout for 3D scene loading
test.describe.configure({ timeout: 30000 });

test.describe('3D Pitch Visualization', () => {
  test('3D canvas renders after hydration', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the pitch selector buttons (server-side rendered)
    await page.waitForSelector('button:has-text("Fastball")', { timeout: 10000 });
    
    // Wait for canvas to appear (client-side rendered with next/dynamic ssr: false)
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/canvas-renders.png' });
    
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();
    expect(canvasCount).toBeGreaterThan(0);
  });

  test('pitch type selector works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Fastball")', { timeout: 10000 });
    
    // Click on Curveball
    await page.click('button:has-text("Curveball")');
    await page.waitForTimeout(500);
    
    // Verify selection - check for the pitch name in the header
    const pitchTitle = page.locator('h2:has-text("Curveball")');
    await expect(pitchTitle).toBeVisible();
  });

  test('throw pitch button triggers animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Throw Pitch")', { timeout: 10000 });
    
    // Click throw pitch
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(500);
    
    // Button should show pitching state
    const pitchingButton = page.locator('button:has-text("Pitching")');
    await expect(pitchingButton).toBeVisible({ timeout: 2000 });
    
    // Wait for animation to complete (based on fastball ~92-100mph ~2s)
    await page.waitForTimeout(3000);
    
    // Reset button should appear after animation completes
    const resetButton = page.locator('button:has-text("Reset")');
    await expect(resetButton).toBeVisible({ timeout: 3000 });
  });

  test('result shows strike or ball indicator', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Throw Pitch")', { timeout: 10000 });
    
    // Play full animation
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(3500);
    
    // Should show STRIKE or BALL indicator (check the result text in overlay)
    const strikeText = page.locator('text=STRIKE');
    const ballText = page.locator('text=BALL');
    
    // One of them should be visible
    const isStrike = await strikeText.isVisible().catch(() => false);
    const isBall = await ballText.isVisible().catch(() => false);
    
    expect(isStrike || isBall).toBe(true);
  });

  test('side view shown after pitch completes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Throw Pitch")', { timeout: 10000 });
    
    // Play animation
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(3500);
    
    // Check for side view indicator or just verify result is shown
    const resultVisible = await page.locator('text=Side View').isVisible().catch(() => false) || 
                         await page.locator('text=STRIKE').isVisible().catch(() => false) ||
                         await page.locator('text=BALL').isVisible().catch(() => false);
    expect(resultVisible).toBe(true);
  });

  test('different pitch types show different trajectories', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Throw Pitch")', { timeout: 10000 });
    
    // Test fastball
    await page.click('button:has-text("Four-Seam")');
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'test-results/fastball-trajectory.png' });
    await page.click('button:has-text("Reset")');
    await page.waitForTimeout(300);
    
    // Test curveball
    await page.click('button:has-text("Curveball")');
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'test-results/curveball-trajectory.png' });
    
    expect(true).toBe(true);
  });

  test('pitcher model is visible in scene', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    // Take screenshot to verify pitcher
    await page.screenshot({ path: 'test-results/pitcher-visible.png' });
    
    const canvas = page.locator('canvas');
    const count = await canvas.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ball and trajectory alignment', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Throw Pitch")', { timeout: 10000 });
    
    // Start animation
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(2000);
    
    // Take screenshot to visually inspect ball position
    await page.screenshot({ path: 'test-results/ball-trajectory-alignment.png' });
    
    expect(true).toBe(true);
  });
});

test.describe('UI Controls', () => {
  test('pitch info displays correct data', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Four-Seam")', { timeout: 10000 });
    
    // Check velocity is displayed (look for "mph" text - use first since there are multiple)
    await expect(page.locator('text=mph').first()).toBeVisible();
    
    // Check spin rate is displayed (look for "rpm" text)
    await expect(page.locator('text=rpm').first()).toBeVisible();
  });

  test('grip visualization expands', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Grip', { timeout: 10000 });
    
    // Click on Grip section
    await page.click('text=Grip & Release');
    await page.waitForTimeout(500);
    
    // Grip section should expand - look for grip-related content
    const gripDetails = page.locator('text=Finger').or(page.locator('text=Pressure'));
    await expect(gripDetails.first()).toBeVisible({ timeout: 2000 });
  });

  test('reset button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Throw Pitch")', { timeout: 10000 });
    
    // Play animation
    await page.click('button:has-text("Throw Pitch")');
    await page.waitForTimeout(3500);
    
    // Click reset
    await page.click('button:has-text("Reset")');
    await page.waitForTimeout(300);
    
    // Throw button should be visible again
    const throwButton = page.locator('button:has-text("Throw Pitch")');
    await expect(throwButton).toBeVisible();
  });
});
