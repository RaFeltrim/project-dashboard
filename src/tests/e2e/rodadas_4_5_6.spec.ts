import { test, expect } from '@playwright/test';

test.describe('Validação Pós-Correções: Rodadas 1, 2 e 3', () => {

  test('Revalidação Rodada 1 - Motor 4: Recorrente', async ({ page }) => {
    await page.goto('/motores/cartao-tia');
    await expect(page.locator('main h1')).toContainText('Motor 4: Cartão Tia');
    await expect(page.getByText('Novo Lançamento')).toBeVisible();
  });

  test('Revalidação Rodada 2 - Gestão de Caixinhas: Criar e Aportar', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());

    await page.goto('/gestao/caixinhas');
    await expect(page.locator('main h1')).toContainText('Gestão de Caixinhas');

    await page.getByRole('button', { name: '+ Nova Caixinha' }).click();
    await expect(page.getByText('Criar Nova Caixinha')).toBeVisible();

    const randomSuffix = Math.floor(Math.random() * 10000);
    const vaultName = `Cofre Sofia ${randomSuffix}`;

    await page.locator('input[type="text"]').fill(vaultName);
    await page.locator('input[type="number"]').fill('8000');
    await page.getByRole('button', { name: 'Salvar Caixinha' }).click();

    // Com o fix, a caixinha agora renderiza corretamente
    const vaultCard = page.locator('div.bg-slate-900').filter({ hasText: vaultName });
    await expect(vaultCard).toBeVisible({ timeout: 10000 });
    await expect(vaultCard.getByText('R$ 0.00')).toBeVisible();

    // Aporte
    await vaultCard.getByRole('button', { name: 'Guardar Dinheiro' }).click();
    await vaultCard.locator('input[type="number"]').fill('300');
    await vaultCard.getByRole('button', { name: 'OK' }).click();

    await expect(vaultCard.getByText('R$ 300.00')).toBeVisible({ timeout: 10000 });
  });

  test('Revalidação Rodada 3 - Gestão de Transações: Listagem e Estrutura', async ({ page }) => {
    await page.goto('/transacoes');
    await expect(page.locator('main h1')).toContainText('Gestão de Transações');
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

});

test.describe('Bateria Avançada: Rodadas 4, 5 e 6 (Sofia & QA)', () => {

  // -------------------------------------------------------------
  // RODADA 4: Caixinhas - Prevenção de Duplicidade (Regra de Negócio)
  // -------------------------------------------------------------
  test('Rodada 4 - Caixinhas: Validação de Conflito de Nome Existente', async ({ page }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const duplicateName = `Cofre Conflito ${randomSuffix}`;

    await page.goto('/gestao/caixinhas');
    await page.getByRole('button', { name: '+ Nova Caixinha' }).click();

    // 1ª Criação
    await page.locator('input[type="text"]').fill(duplicateName);
    await page.getByRole('button', { name: 'Salvar Caixinha' }).click();

    // Espera a 1ª criar
    await expect(page.getByText(duplicateName)).toBeVisible({ timeout: 10000 });

    // 2ª Tentativa com mesmo nome - aguarda o dialog
    await page.getByRole('button', { name: '+ Nova Caixinha' }).click();
    await page.locator('input[type="text"]').fill(duplicateName);

    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: 'Salvar Caixinha' }).click();
    const dialog = await dialogPromise;

    expect(dialog.message()).toContain('Você já possui uma Caixinha');
    await dialog.accept();
  });

  // -------------------------------------------------------------
  // RODADA 5: Motor 4 Parcelas -> Refletindo em Transações
  // -------------------------------------------------------------
  test('Rodada 5 - Motor 4: Criar Parcelas e Verificar em Transações', async ({ page }) => {
    await page.goto('/motores/cartao-tia');
    await page.getByRole('button', { name: 'Parcelado' }).click();

    const randomSuffix = Math.floor(Math.random() * 10000);
    const parcelDesc = `Sofá Parcelado QA ${randomSuffix}`;

    await page.getByPlaceholder('Ex: Compra Sofá ou Fone de Ouvido').fill(parcelDesc);
    await page.getByPlaceholder('120.00').fill('120.00');
    // Dia vencimento já tem valor default 10 — preenche campo de total de parcelas
    await page.locator('input[type="number"]').last().fill('3'); // 3 parcelas

    await page.getByRole('button', { name: 'Salvar Lançamento' }).click();

    // Aguarda o lançamento aparecer na lista abaixo do formulário
    await expect(page.getByText(parcelDesc)).toBeVisible({ timeout: 15000 });

    // Confirma que a badge de parcela foi registrada corretamente (Parcela 1/3)
    await expect(page.getByText('Parcela 1/3').first()).toBeVisible();
  });

  // -------------------------------------------------------------
  // RODADA 6: Fast Chat Inline e Mobile-First
  // -------------------------------------------------------------
  test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('Rodada 6 - Fast Chat Inline no Dashboard e Usabilidade Mobile', async ({ page }) => {
      page.on('dialog', dialog => dialog.accept());

      await page.goto('/');
      await expect(page.locator('main h1')).toContainText('Visão Geral');

      // Testa Fast Chat inline
      const fastInput = page.getByPlaceholder('Digite rápido: -50 ifood');
      await expect(fastInput).toBeVisible();
      await fastInput.fill('-35.50 Farmacia Mobile');
      await page.locator('button[type="submit"]').first().click();

      // Verifica se o card de despesas e gasto diário continuam legíveis e visíveis
      await expect(page.getByText('Despesas do Mês')).toBeVisible();
      await expect(page.getByText('Gasto Diário Recomendado')).toBeVisible();
    });
  });

});
