import { test, expect } from '@playwright/test';

test.describe('🛡️ QA: Smoke Test - Integridade de UI e Layout', () => {
  test('Garante que o Root Layout não sofra crash de SSR por componentes ausentes', async ({ page }) => {
    // Acessa a página de login
    const response = await page.goto('/login');
    
    // Validamos se não há um Internal Server Error explodindo a rota
    expect(response?.status()).toBeLessThan(500);

    // Assertivas negativas: Garante que os erros de SSR padrão do Next.js não foram impressos
    const serverErrorText = page.locator('text="A server error occurred"');
    const pageLoadError = page.locator('text="This page couldn’t load"');
    
    await expect(serverErrorText).not.toBeVisible();
    await expect(pageLoadError).not.toBeVisible();
  });
});
