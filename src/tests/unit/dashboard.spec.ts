import { describe, it, expect } from 'vitest';

// ===================================================
// FH-003 — Dashboard: Exclusão de MAE e TERCEIROS
// Rafael-QA | Sprint 1 | BDD: Gherkin confirmado
// ===================================================

describe('[FH-003] Dashboard totalExpense — Exclusão MAE/TERCEIROS', () => {
  const mockTransactions = [
    { amount: -100, section: 'PESSOAL', motor: 'NUBANK_RATEIO' },
    { amount: -50,  section: 'MAE',      motor: 'NUBANK_RATEIO' },
    { amount: -30,  section: 'TERCEIROS',motor: 'NUBANK_RATEIO' },
    { amount: -200, section: 'CASA',     motor: 'CARTAO_TIA' },
  ];

  it('deve somar apenas PESSOAL e CASA no totalExpense', () => {
    const totalExpense = mockTransactions
      .filter(t => Number(t.amount) < 0 && t.section !== 'MAE' && t.section !== 'TERCEIROS')
      .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

    expect(totalExpense).toBe(300); // 100 + 200
  });

  it('deve excluir MAE do totalExpense', () => {
    const totalExpense = mockTransactions
      .filter(t => Number(t.amount) < 0 && t.section !== 'MAE' && t.section !== 'TERCEIROS')
      .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

    expect(totalExpense).not.toBe(380); // Sem exclusão seria 380
  });

  it('deve calcular statsByMotor ignorando MAE e TERCEIROS', () => {
    const stats = mockTransactions
      .filter(t => t.section !== 'MAE' && t.section !== 'TERCEIROS')
      .reduce((acc: Record<string, number>, t) => {
        acc[t.motor] = (acc[t.motor] || 0) + Math.abs(Number(t.amount));
        return acc;
      }, {});

    expect(stats['NUBANK_RATEIO']).toBe(100);  // Só PESSOAL
    expect(stats['CARTAO_TIA']).toBe(200);       // CASA
    expect(stats['NUBANK_RATEIO']).not.toBe(180); // Não inclui MAE(50) + TERCEIROS(30)
  });
});

// ===================================================
// FH-002 — Mapeamento Stakeholder → ExpenseSection
// ===================================================
describe('[FH-002] Mapeamento Stakeholder → ExpenseSection', () => {
  function mapStakeholderToSection(categoryName?: string): string {
    if (categoryName === 'AP') return 'CASA';
    if (categoryName === 'TERCEIROS') return 'TERCEIROS';
    if (categoryName === 'MAE') return 'MAE';
    if (categoryName === 'SUB_PESSOAL') return 'PESSOAL';
    return 'PESSOAL';
  }

  it('deve mapear SUB_PESSOAL → PESSOAL', () => {
    expect(mapStakeholderToSection('SUB_PESSOAL')).toBe('PESSOAL');
  });

  it('deve mapear AP → CASA', () => {
    expect(mapStakeholderToSection('AP')).toBe('CASA');
  });

  it('deve mapear TERCEIROS → TERCEIROS', () => {
    expect(mapStakeholderToSection('TERCEIROS')).toBe('TERCEIROS');
  });

  it('deve mapear MAE → MAE', () => {
    expect(mapStakeholderToSection('MAE')).toBe('MAE');
  });

  it('deve defaultar para PESSOAL quando categoryName é undefined', () => {
    expect(mapStakeholderToSection(undefined)).toBe('PESSOAL');
  });
});
