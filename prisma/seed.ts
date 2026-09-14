import { PrismaClient, ExpenseSection, FundingSourceType, MotorType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Finance Hub...");

  // ==========================================
  // 1. USUÁRIO ADMIN
  // ==========================================
  const passwordHash = await hash("finance2026", 12);

  const user = await prisma.user.upsert({
    where: { email: "rafael@financehub.local" },
    update: {},
    create: {
      email: "rafael@financehub.local",
      name: "Rafael Feltrim",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`  ✅ Usuário: ${user.email}`);

  // ==========================================
  // 2. FONTES DE PAGAMENTO (6 contas)
  // ==========================================
  const fundingSources = [
    {
      name: "Santander",
      type: FundingSourceType.BANK_ACCOUNT,
      provider: "Santander",
      purpose: "CC / Salário",
      color: "#EC0000",
      icon: "🏦",
    },
    {
      name: "Mercado Pago",
      type: FundingSourceType.DIGITAL_WALLET,
      provider: "Mercado Pago",
      purpose: "Reserva em caixinhas",
      color: "#009EE3",
      icon: "💰",
    },
    {
      name: "Inter",
      type: FundingSourceType.BANK_ACCOUNT,
      provider: "Banco Inter",
      purpose: "Pagamentos automáticos",
      color: "#FF7A00",
      icon: "🏧",
    },
    {
      name: "Ifood Benefícios",
      type: FundingSourceType.BENEFITS_CARD,
      provider: "Ifood",
      purpose: "VR/VA no crédito",
      color: "#EA1D2C",
      icon: "🍔",
    },
    {
      name: "99PAY",
      type: FundingSourceType.DIGITAL_WALLET,
      provider: "99",
      purpose: "Transporte",
      color: "#FFDD00",
      icon: "🚗",
    },
    {
      name: "BB",
      type: FundingSourceType.BANK_ACCOUNT,
      provider: "Banco do Brasil",
      purpose: "Recebimento de PIX",
      color: "#FEDF00",
      icon: "🏛️",
    },
  ];

  for (const fs of fundingSources) {
    await prisma.fundingSource.upsert({
      where: { userId_name: { userId: user.id, name: fs.name } },
      update: {},
      create: { userId: user.id, ...fs },
    });
  }

  console.log(`  ✅ ${fundingSources.length} fontes de pagamento`);

  // ==========================================
  // 3. STAKEHOLDERS (Mãe e Tia)
  // ==========================================
  const stakeholders = [
    { name: "Mãe", color: "#A855F7", notes: "Paga fatura Nubank — Motor 3" },
    { name: "Tia", color: "#EAB308", notes: "Cartão de celular — Motor 4" },
  ];

  for (const sh of stakeholders) {
    await prisma.stakeholder.upsert({
      where: { userId_name: { userId: user.id, name: sh.name } },
      update: {},
      create: { userId: user.id, ...sh },
    });
  }

  console.log(`  ✅ ${stakeholders.length} stakeholders`);

  // ==========================================
  // 4. CATEGORIAS DINÂMICAS (por seção)
  // ==========================================
  const categories: Array<{ name: string; section: ExpenseSection; icon: string; color: string }> = [
    // PESSOAL
    { name: "Alimentação", section: "PESSOAL", icon: "🍽️", color: "#F97316" },
    { name: "Transporte", section: "PESSOAL", icon: "🚌", color: "#3B82F6" },
    { name: "Lazer", section: "PESSOAL", icon: "🎮", color: "#8B5CF6" },
    { name: "Saúde", section: "PESSOAL", icon: "💊", color: "#10B981" },
    { name: "Roupas", section: "PESSOAL", icon: "👕", color: "#EC4899" },
    { name: "Assinaturas", section: "PESSOAL", icon: "📱", color: "#6366F1" },
    { name: "Educação", section: "PESSOAL", icon: "📚", color: "#14B8A6" },
    { name: "Outros (Pessoal)", section: "PESSOAL", icon: "📦", color: "#64748B" },

    // CASA
    { name: "Aluguel", section: "CASA", icon: "🏠", color: "#059669" },
    { name: "Energia", section: "CASA", icon: "⚡", color: "#EAB308" },
    { name: "Água", section: "CASA", icon: "💧", color: "#0EA5E9" },
    { name: "Condomínio", section: "CASA", icon: "🏢", color: "#8B5CF6" },
    { name: "Internet", section: "CASA", icon: "🌐", color: "#6366F1" },
    { name: "Gás", section: "CASA", icon: "🔥", color: "#F97316" },
    { name: "Outros (Casa)", section: "CASA", icon: "🏡", color: "#64748B" },

    // PROFISSIONAL
    { name: "Cursos", section: "PROFISSIONAL", icon: "🎓", color: "#F59E0B" },
    { name: "Viagem", section: "PROFISSIONAL", icon: "✈️", color: "#3B82F6" },
    { name: "Passagem", section: "PROFISSIONAL", icon: "🎫", color: "#6366F1" },
    { name: "Hospedagem", section: "PROFISSIONAL", icon: "🏨", color: "#8B5CF6" },
    { name: "Ingresso", section: "PROFISSIONAL", icon: "🎟️", color: "#EC4899" },
    { name: "Workstation", section: "PROFISSIONAL", icon: "💻", color: "#10B981" },
    { name: "Certificação", section: "PROFISSIONAL", icon: "📜", color: "#14B8A6" },
    { name: "Outros (Profissional)", section: "PROFISSIONAL", icon: "💼", color: "#64748B" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: cat.name } },
      update: {},
      create: { userId: user.id, isDefault: true, ...cat },
    });
  }

  console.log(`  ✅ ${categories.length} categorias (${[...new Set(categories.map(c => c.section))].join(", ")})`);

  console.log("\n🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
