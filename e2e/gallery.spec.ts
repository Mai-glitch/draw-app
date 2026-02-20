import { test, expect } from '@playwright/test';

test.describe('Gallery Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the gallery page with title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Bienvenue sur DrawApp');
    await expect(page.locator('text=Créez, éditez et sauvegardez vos magnifiques dessins')).toBeVisible();
  });

  test('should have a button to create new drawing', async ({ page }) => {
    await expect(page.locator('button:has-text("Nouveau dessin")')).toBeVisible();
  });

  test('should navigate to editor when clicking new drawing', async ({ page }) => {
    await page.click('button:has-text("Nouveau dessin")');
    await expect(page).toHaveURL(/\/editor/);
  });

  test('should display empty state when no drawings exist', async ({ page }) => {
    await expect(page.locator('text=Aucun dessin pour le moment')).toBeVisible();
    await expect(page.locator('text=Commencez par créer votre premier dessin')).toBeVisible();
  });

  test('should display drawings when they exist', async ({ page }) => {
    // Create a drawing first
    await page.click('button:has-text("Nouveau dessin")');
    await page.fill('input[placeholder="Nom du dessin"]', 'Test Drawing');
    await page.click('button:has-text("Sauvegarder")');
    
    // Go back to gallery
    await page.goto('/');
    
    await expect(page.locator('text=Test Drawing')).toBeVisible();
    await expect(page.locator('text=Vos dessins')).toBeVisible();
  });

  test('should delete all drawings with confirmation', async ({ page }) => {
    // Create a drawing first
    await page.click('button:has-text("Nouveau dessin")');
    await page.click('button:has-text("Sauvegarder")');
    await page.goto('/');
    
    // Click delete all
    await page.click('button:has-text("Tout supprimer")');
    
    // Confirm dialog should appear
    await expect(page.locator('text=Supprimer tous les dessins')).toBeVisible();
    await page.click('button:has-text("Supprimer")');
    
    // Should show empty state
    await expect(page.locator('text=Aucun dessin pour le moment')).toBeVisible();
  });

  test('should switch language', async ({ page }) => {
    await page.click('button[aria-label="Changer de langue"]');
    await expect(page.locator('h1')).toContainText('Welcome to DrawApp');
  });

  test('should switch theme', async ({ page }) => {
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    
    await page.click('button[aria-label="Changer de thème"]');
    
    const newClass = await html.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });
});
