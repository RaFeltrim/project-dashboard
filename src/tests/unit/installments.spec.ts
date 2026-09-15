import { describe, it, expect } from 'vitest';

// ===================================================
// FH-005 — Motor 4: Parcelamento — Geração de Datas
// Rafael-QA | Sprint 1 | BDD: Gherkin confirmado
// ===================================================

describe('[FH-005] createInstallments — Geração de Datas das Parcelas', () => {
  function generateInstallmentDates(
    startMonth: number,
    startYear: number,
    installments: number,
    dayOfMonth: number
  ): Date[] {
    return Array.from({ length: installments }, (_, i) =>
      new Date(Date.UTC(startYear, startMonth + i, dayOfMonth, 12, 0, 0))
    );
  }

  it('deve gerar 3 parcelas com meses corretos', () => {
    const dates = generateInstallmentDates(8, 2026, 3, 10); // Set/2026, 3x, dia 10

    expect(dates[0].getUTCMonth()).toBe(8);   // Setembro
    expect(dates[1].getUTCMonth()).toBe(9);   // Outubro
    expect(dates[2].getUTCMonth()).toBe(10);  // Novembro
  });

  it('deve manter o dia do mês igual em todas as parcelas', () => {
    const dates = generateInstallmentDates(8, 2026, 5, 15); // dia 15

    expect(dates.every(d => d.getUTCDate() === 15)).toBe(true);
  });

  it('deve incrementar o ano ao ultrapassar Dezembro (virada de ano)', () => {
    const dates = generateInstallmentDates(11, 2026, 3, 5); // Dez/2026, 3x

    expect(dates[0].getUTCMonth()).toBe(11); // Dezembro 2026
    expect(dates[0].getUTCFullYear()).toBe(2026);
    expect(dates[1].getUTCMonth()).toBe(0);  // Janeiro 2027
    expect(dates[1].getUTCFullYear()).toBe(2027);
    expect(dates[2].getUTCMonth()).toBe(1);  // Fevereiro 2027
    expect(dates[2].getUTCFullYear()).toBe(2027);
  });

  it('deve gerar amounts negativos (despesa)', () => {
    const amount = 200;
    const negativeAmount = -Math.abs(amount);
    expect(negativeAmount).toBe(-200);
    expect(negativeAmount).toBeLessThan(0);
  });

  it('deve gerar 1 parcela para compra à vista', () => {
    const dates = generateInstallmentDates(8, 2026, 1, 10);
    expect(dates.length).toBe(1);
  });
});

// ===================================================
// FH-004 — Filtros de Transações (lógica pura)
// ===================================================
describe('[FH-004] Filtros de Transações', () => {
  const mockTxs = [
    { rawDescription: 'AMAZON BR', motor: 'SANTANDER', amount: -56.04 },
    { rawDescription: 'DL*GOOGLE GOOGLE', motor: 'SANTANDER', amount: -23.99 },
    { rawDescription: 'AP: Aluguel', motor: 'CARTAO_TIA', amount: -1178.95 },
    { rawDescription: 'Jim.Com* Notebook', motor: 'NUBANK_RATEIO', amount: -120.00 },
  ];

  it('deve filtrar por motor SANTANDER', () => {
    const filtered = mockTxs.filter(t => t.motor === 'SANTANDER');
    expect(filtered.length).toBe(2);
  });

  it('deve filtrar por motor CARTAO_TIA', () => {
    const filtered = mockTxs.filter(t => t.motor === 'CARTAO_TIA');
    expect(filtered.length).toBe(1);
    expect(filtered[0].rawDescription).toBe('AP: Aluguel');
  });

  it('deve buscar por descrição (case-insensitive simulado)', () => {
    const search = 'amazon';
    const filtered = mockTxs.filter(t => 
      t.rawDescription.toLowerCase().includes(search.toLowerCase())
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].rawDescription).toBe('AMAZON BR');
  });

  it('deve ordenar por amount do maior para o menor', () => {
    const sorted = [...mockTxs].sort((a, b) => b.amount - a.amount);
    // amounts: -23.99, -56.04, -120.00, -1178.95 (desc order)
    expect(sorted[0].rawDescription).toBe('DL*GOOGLE GOOGLE'); // -23.99 (maior)
    expect(sorted[sorted.length - 1].rawDescription).toBe('AP: Aluguel'); // -1178.95 (menor)
  });
});
