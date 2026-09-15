# 💻 V3.0 e Legacy: Monolito Local

**Data Média:** Início de 2025
**Autor:** Tech Lead

## Arquitetura Anterior (V3.0 Backend)
Tudo girava sem banco de dados na nuvem.
- **Frontend State:** `localStorage` do Navegador. O que eu editava, meu colega na MIV não via. 
- **Lógica Suja:** Arquivos pesados tentando ser espertos no lado do cliente (React Hooks imensos para lidar com estado).
- **Sem Motor de Inteligência:** Fomentavamos via Prompts Manuais fora do ecossistema. Tempo perdido no ctrl+c / ctrl+v para a plataforma da IA.

*Decisão Técnica:* Morte ao local storage, vamos evoluir para a V4 com integração da Qwen na própria interface React.
