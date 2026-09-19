// Client simples para a API do Mercado Pago
// No MVP, vamos usar a API REST direta via fetch()

const API_BASE_URL = "https://api.mercadopago.com/v1";

interface MercadoPagoPaymentItem {
  id: string | number;
  date_created: string;
  description?: string;
  transaction_amount: number;
  operation_type?: string;
  status?: string;
}

export async function getBalance(_accessToken: string) {
  // Nota: MercadoPago não tem endpoint simples e público genérico de /balance fácil
  // Muitas vezes precisa do User ID, mas podemos tentar buscar métricas ou 
  // no MVP, assumiremos 0 se não der certo.
  // Vamos simular ou buscar transações
  return 0; // Simplificação para MVP, na real API real exige mais complexidade de Meli accounts
}

export async function fetchRecentTransactions(accessToken: string, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const beginDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  // Endpoint de busca de pagamentos
  const url = `${API_BASE_URL}/payments/search?range=date_created&begin_date=${beginDateStr}&end_date=${endDateStr}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao acessar Mercado Pago: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Transformar os dados do MP no nosso formato de transação
  return ((data.results || []) as MercadoPagoPaymentItem[]).map((item) => ({
    id: item.id,
    date: new Date(item.date_created),
    description: item.description || "Transação Mercado Pago",
    amount: item.transaction_amount,
    type: item.operation_type, // ex: regular_payment
    status: item.status, // ex: approved
  }));
}
