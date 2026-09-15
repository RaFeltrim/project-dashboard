# 🔬 DEEP DIVE: Relatório de Análise do Database (Supabase)

**Sessão:** 04/03/2026
**Mesa-Redonda:** D.E (Supabase SR), TL, QA, PO, PM

## 📝 Pontos Discutidos
- **Supabase Data Eng SR (Novo Integrante):** "Minha primeira análise: Tem tabelas operando sem Row Level Security (RLS) habilitado 100%. Isso é vulnerabilidade Crítica. Tem que virar RLS para `authenticated` Users Only imediatamente nas tabelas recém geradas como `scrape_results` e nas colunas novas. Outro ponto: O JSONB de recomendações de Oportunidades do *Gap Intelligence* não possui índices (GIN), então se eu for filtrar por Loja, vou dar Table Scan Full. Isso mata processamento na nuvem!"
- **Supabase Data Eng SR (Sprint 7.5):** "A tabela `store_credentials` foi criada com `CREATE TABLE IF NOT EXISTS` incluindo `user_id uuid NOT NULL REFERENCES auth.users(id)`, RLS habilitado e 4 policies granulares (SELECT/INSERT/UPDATE/DELETE) todas validando `user_id = auth.uid()`. Script: `supabase_rls_fix_store_credentials.sql`. Também o `supabase.js` agora faz fail-fast — se as env vars estiverem ausentes, o app lança Error em vez de criar client com placeholder."
- **TL:** "Bem notado engenheiro. Na V2 a gente não tinha o luxo do JSONB. Mas as colunas novas como `content` (adicionadas na SP. 4.5) já são JSONB."
- **Dev QA:** "Preciso do script isolado de RLS pra testar se o Edge bloqueia um `fetch()` sem eu mandar o access token (mock hacker)."
- **PM/PO:** "Sem segurança total, não entra cliente verdadeiro. As observações do Engenheiro nos poupam constrangimento com Titulares."

## 📌 Conclusões (Status de Ação Back-BD)
1. **[CRÍTICO]** RLS precisa de validação dupla nas Policies de Select/Insert/Update. 
2. Criar GIN Indexes no Supabase nas próximas Migrations p/ campos `JSONB` permitindo buscas instantâneas pelas Lojas nos *insights* textuais da Nova Sprint 7.
