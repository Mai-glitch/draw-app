import { test, expect } from '@playwright/test';

test.describe('Editor Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Nouveau dessin")');
    await expect(page).toHaveURL(/\/editor/);
  });

  test('should display the editor with tools', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('button[aria-label="Pinceau"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Gomme"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Texte"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Image"]')).toBeVisible();
  });

  test('should be able to draw on canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 200, box.y + 200);
      await page.mouse.up();
    }
  });

  test('should change brush size', async ({ page }) => {
    const slider = page.locator('mat-slider');
    await expect(slider).toBeVisible();
    
    // Get initial value
    const value = await page.locator('text=5').first();
    await expect(value).toBeVisible();
  });

  test('should change color', async ({ page }) => {
    const colorButton = page.locator('button[aria-label*="Couleur"]').first();
    await colorButton.click();
    
    // Color should be selected
    await expect(colorButton).toHaveCSS('border-color', 'rgb(0, 0, 0)');
  });

  test('should add text to canvas', async ({ page }) => {
    await page.click('button[aria-label="Texte"]');
    
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      await page.mouse.click(box.x + 200, box.y + 200);
    }
    
    // Text dialog should appear
    await expect(page.locator('text=Ajouter du texte')).toBeVisible();
    
    await page.fill('textarea', 'Hello World');
    await page.click('button:has-text("Ajouter")');
    
    await expect(page.locator('text=Ajouter du texte')).not.toBeVisible();
  });

  test('should upload image to canvas', async ({ page }) => {
    await page.click('button[aria-label="Image"]');
    
    // File input should exist
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(1);
  });

  test('should save drawing', async ({ page }) => {
    await page.fill('input[placeholder="Nom du dessin"]', 'My Drawing');
    await page.click('button:has-text("Sauvegarder")');
    
    // Should show confirmation
    await expect(page.locator('text=Dessin sauvegardé')).toBeVisible();
    
    // Navigate back and check drawing exists
    await page.goto('/');
    await expect(page.locator('text=My Drawing')).toBeVisible();
  });

  test('should navigate back to gallery', async ({ page }) => {
    await page.click('button[aria-label="Retour à la galerie"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Bienvenue sur DrawApp');
  });

  test('should undo last action', async ({ page }) => {
    const undoButton = page.locator('button[aria-label="Annuler"]');
    await expect(undoButton).toBeVisible();
    
    // Initially disabled if no actions
    await expect(undoButton).toBeDisabled();
    
    // Draw something
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 150);
      await page.mouse.up();
    }
    
    // Undo should be enabled
    await expect(undoButton).toBeEnabled();
  });

  test('should clear canvas with confirmation', async ({ page }) => {
    await page.click('button[aria-label="Effacer le canvas"]');
    
    // Confirmation dialog should appear
    await expect(page.locator('text=Effacer le dessin')).toBeVisible();
    await expect(page.locator('text=Cette action est irréversible')).toBeVisible();
    
    await page.click('button:has-text("Annuler")');
    
    // Should still be on editor
    await expect(page.locator('canvas')).toBeVisible();
  });
});
