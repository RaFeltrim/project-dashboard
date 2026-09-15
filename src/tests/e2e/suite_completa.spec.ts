import { test, expect } from '@playwright/test';

test.describe('Validação E2E Sofia - Telas e Fluxos Críticos', () => {
  test('01 - Dashboard Home & Filtros', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main h1')).toContainText('Visão Geral');
    await expect(page.getByText('Despesas do Mês')).toBeVisible();
    await expect(page.getByText('Gasto Diário Recomendado')).toBeVisible();
    await expect(page.getByText('Origem dos Gastos')).toBeVisible();

    // Filtros temporais
    await page.getByText('Últimos 30 Dias').click();
    await expect(page.locator('main p.text-slate-400').first()).toContainText('Resumo dos últimos 30 dias');
  });

  test('02 - Motor 1 Mercado Pago', async ({ page }) => {
    await page.goto('/motores/mercado-pago');
    await expect(page.locator('main h1')).toContainText('Motor 1: Mercado Pago');
    await expect(page.getByText('Configuração de Acesso')).toBeVisible();
    await expect(page.getByText('Buscar Transações Agora')).toBeVisible();
  });

  test('03 - Motor 2 Santander', async ({ page }) => {
    await page.goto('/motores/santander');
    await expect(page.locator('main h1')).toContainText('Motor 2: Santander');
    await expect(page.getByText('Importar Fatura (CSV ou PDF)')).toBeVisible();
  });

  test('04 - Motor 3 Nubank Rateio', async ({ page }) => {
    await page.goto('/motores/nubank-rateio');
    await expect(page.locator('main h1')).toContainText('Motor 3: Nubank Mãe');
    await expect(page.getByText('Importar Fatura (PDF + Suas Parcelas)')).toBeVisible();
  });

  test('05 - Motor 4 Cartão Tia', async ({ page }) => {
    await page.goto('/motores/cartao-tia');
    await expect(page.locator('main h1')).toContainText('Motor 4: Cartão Tia');
    await expect(page.getByText('Novo Lançamento')).toBeVisible();
  });

  test('06 - Gestão de Caixinhas', async ({ page }) => {
    await page.goto('/gestao/caixinhas');
    await expect(page.locator('main h1')).toContainText('Gestão de Caixinhas');
    await expect(page.getByText('+ Nova Caixinha')).toBeVisible();
  });

  test('07 - Gestão de Transações', async ({ page }) => {
    await page.goto('/transacoes');
    await expect(page.locator('main h1')).toContainText('Gestão de Transações');
    await expect(page.getByPlaceholder('Buscar por descrição...')).toBeVisible();
  });

  test('08 - Gestão de Categorias', async ({ page }) => {
    await page.goto('/categorias');
    await expect(page.locator('main h1')).toContainText('Gestão de Categorias');
    await expect(page.getByText('Nova Categoria')).toBeVisible();
  });
});

test.describe('Validação Mobile-First & Responsividade (Split-Screen)', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // Viewport Mobile Padrão

  test('09 - Renderização Mobile no Dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main h1')).toContainText('Visão Geral');
    await expect(page.getByText('Despesas do Mês')).toBeVisible();
  });
});
