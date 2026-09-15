import { test, expect } from '@playwright/test';

test.describe('Rodadas 1, 2 e 3 - Validação BDD Sofia & QA', () => {

  // -------------------------------------------------------------
  // RODADA 1: Motor 4 - Lançamentos Recorrentes & Alternância
  // -------------------------------------------------------------
  test('Rodada 1 - Motor 4: Adicionar Lançamento Recorrente', async ({ page }) => {
    await page.goto('/motores/cartao-tia');

    await expect(page.locator('main h1')).toContainText('Motor 4: Cartão Tia');
    await expect(page.getByText('Novo Lançamento')).toBeVisible();

    // Preenche formulário de recorrência
    const randomSuffix = Math.floor(Math.random() * 1000);
    const testDesc = `Assinatura Teste QA ${randomSuffix}`;

    await page.getByPlaceholder('Ex: Compra Sofá ou Fone de Ouvido').fill(testDesc);
    await page.getByPlaceholder('120.00').fill('49.90');
    await page.locator('input[type="number"]').last().fill('20'); // Dia do vencimento

    // Submete
    await page.getByRole('button', { name: 'Salvar Lançamento' }).click();

    // Valida se apareceu na lista de lançamentos ativos
    await expect(page.getByText(testDesc)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('R$ 49.90')).toBeVisible();
  });

  // -------------------------------------------------------------
  // RODADA 2: Gestão de Caixinhas - Criação & Aporte de Fundos
  // -------------------------------------------------------------
  test('Rodada 2 - Gestão de Caixinhas: Criar Caixinha e Aportar', async ({ page }) => {
    // Configura handler de alert para fechar automaticamente
    page.on('dialog', dialog => dialog.accept());

    await page.goto('/gestao/caixinhas');
    await expect(page.locator('main h1')).toContainText('Gestão de Caixinhas');

    // Abre formulário de nova caixinha
    await page.getByRole('button', { name: '+ Nova Caixinha' }).click();
    await expect(page.getByText('Criar Nova Caixinha')).toBeVisible();

    const randomSuffix = Math.floor(Math.random() * 1000);
    const vaultName = `Cofre QA ${randomSuffix}`;

    await page.locator('input[type="text"]').fill(vaultName);
    await page.locator('input[type="number"]').fill('5000');
    await page.getByRole('button', { name: 'Salvar Caixinha' }).click();

    // Verifica se a caixinha foi renderizada
    const vaultCard = page.locator('div.bg-slate-900').filter({ hasText: vaultName });
    await expect(vaultCard).toBeVisible({ timeout: 10000 });
    await expect(vaultCard.getByText('R$ 0.00')).toBeVisible();

    // Realiza aporte
    await vaultCard.getByRole('button', { name: 'Guardar Dinheiro' }).click();
    await vaultCard.locator('input[type="number"]').fill('150');
    await vaultCard.getByRole('button', { name: 'OK' }).click();

    // Valida atualização do saldo
    await expect(vaultCard.getByText('R$ 150.00')).toBeVisible({ timeout: 10000 });
  });

  // -------------------------------------------------------------
  // RODADA 3: Gestão de Transações - Consumo de Payload & Filtro
  // -------------------------------------------------------------
  test('Rodada 3 - Gestão de Transações: Listagem e Filtro por Motor', async ({ page }) => {
    await page.goto('/transacoes');
    await expect(page.locator('main h1')).toContainText('Gestão de Transações');

    // Verifica que a tabela foi renderizada
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Filtra por Santander
    const selectMotor = page.locator('select');
    await selectMotor.selectOption('SANTANDER');

    // Verifica se não há erro visual na página
    await expect(page.locator('text=Error')).toHaveCount(0);
  });

});
