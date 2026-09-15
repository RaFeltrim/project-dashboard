import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test('deve renderizar o dashboard corretamente', async ({ page }) => {
    // Acessar a home
    await page.goto('/');

    // Verificar se o título carregou
    await expect(page.locator('main h1')).toContainText('Visão Geral');

    // Verificar a presença dos filtros globais
    await expect(page.getByText('Este Mês')).toBeVisible();
    await expect(page.getByText('A Pagar (Futuro)')).toBeVisible();

    // Verificar a renderização dos cards principais
    await expect(page.getByText('Despesas do Mês')).toBeVisible();
    await expect(page.getByText('Gasto Diário Recomendado')).toBeVisible();
    await expect(page.getByText('Origem dos Gastos')).toBeVisible();
  });

  test('deve trocar os filtros temporais corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Clica em "Últimos 30 Dias"
    await page.getByText('Últimos 30 Dias').click();
    
    // Verifica que os cards de dados ainda estão visíveis após troca de filtro
    await expect(page.getByText('Despesas do Mês')).toBeVisible();
    await expect(page.getByText('Gasto Diário Recomendado')).toBeVisible();
  });
});
