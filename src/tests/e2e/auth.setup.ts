import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Garantir que a pasta exista
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.goto('/login');
  await page.fill('input[type="email"]', 'rafael@financehub.local');
  await page.fill('input[type="password"]', 'finance2026');
  await page.click('button[type="submit"]');

  // Aguarda o redirecionamento para o dashboard
  try {
    await expect(page.locator('main h1').first()).toContainText('Visão Geral', { timeout: 10000 });
  } catch (e) {
    const html = await page.content();
    console.error("PAGE HTML ON TIMEOUT:", html);
    throw e;
  }
  
  // Salva o estado do storage (cookies de autenticação)
  await page.context().storageState({ path: authFile });
});
