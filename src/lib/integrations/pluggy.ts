import { PluggyClient } from 'pluggy-sdk';

const clientId = process.env.PLUGGY_CLIENT_ID;
const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("PLUGGY_CLIENT_ID or PLUGGY_CLIENT_SECRET is missing in .env");
}

export const pluggyClient = new PluggyClient({
  clientId,
  clientSecret,
});

/**
 * Cria um Token de Conexão para o Widget frontend
 */
export async function createConnectToken(itemId?: string) {
  try {
    const data = await pluggyClient.createConnectToken(itemId);
    return data.accessToken;
  } catch (error) {
    console.error("Erro ao gerar Connect Token do Pluggy:", error);
    throw error;
  }
}

/**
 * Busca os Itens conectados (Bancos)
 */
export async function getItems() {
  const items = await pluggyClient.fetchItems();
  return items;
}

/**
 * Busca as contas de um Item
 */
export async function getAccounts(itemId: string) {
  const accounts = await pluggyClient.fetchAccounts(itemId);
  return accounts;
}

/**
 * Busca as transações de uma conta
 */
export async function getTransactions(accountId: string) {
  const transactions = await pluggyClient.fetchTransactions(accountId);
  return transactions;
}

/**
 * Busca investimentos (Ex: Caixinhas) de um Item
 */
export async function getInvestments(itemId: string) {
  const investments = await pluggyClient.fetchInvestments(itemId);
  return investments;
}
