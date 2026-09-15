import { test, expect } from '@playwright/test';

test.describe('Validação E2E Looker-Style: Dashboard Consolidado com Faturas Reais', () => {

  test('Deve carregar o Dashboard com estrutura Looker e todos os filtros', async ({ page }) => {
    // 1. Acessar o Dashboard
    await page.goto('/');

    // 2. Aguarda carregamento
    await expect(page.locator('main h1')).toContainText('Visão Geral');

    // 3. Verifica filtros de período
    const allTimeBtn = page.getByRole('button', { name: 'Todo Período' });
    await expect(allTimeBtn).toBeVisible();
    await allTimeBtn.click();

    // 4. Verifica cards consolidados (Looker Style)
    await expect(page.getByText('Despesas do Mês')).toBeVisible();
    await expect(page.getByText('Gasto Diário Recomendado')).toBeVisible();
    await expect(page.getByText('Origem dos Gastos')).toBeVisible();

    // 5. Verifica os atalhos dos motores dentro da área principal
    await expect(page.getByRole('link', { name: 'M1 Mercado Pago' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'M2 Santander' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'M3 Nubank Mãe' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'M4 Cartão Tia' })).toBeVisible();

    // 6. Verifica gráficos de agrupamento temporal
    await expect(page.getByText('Histórico por Mês')).toBeVisible();
    await expect(page.getByText('Gastos por Dia (Top Recentes)')).toBeVisible();
  });

  test('Deve filtrar por motor na tela de Transações sem erros visuais', async ({ page }) => {
    // Navega para Gestão de Transações
    await page.goto('/transacoes');
    await expect(page.locator('main h1')).toContainText('Gestão de Transações');

    // Verifica que a tabela existe
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Filtra por Santander — valida que o filtro funciona sem erro visual
    const selectMotor = page.locator('select');
    await selectMotor.selectOption('SANTANDER');
    await expect(page.locator('text=Error')).toHaveCount(0);

    // Filtra por Nubank
    await selectMotor.selectOption('NUBANK_RATEIO');
    await expect(page.locator('text=Error')).toHaveCount(0);

    // Limpa filtro
    await selectMotor.selectOption('ALL');
    await expect(table).toBeVisible();
  });

});

