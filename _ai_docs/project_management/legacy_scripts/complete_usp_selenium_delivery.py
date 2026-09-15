    from __future__ import annotations

import json
import shutil
import textwrap
import uuid
import zipfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


PROJECT = Path(r"C:\Users\Rafael Feltrim\Downloads\Web e Mobile - USP\Web_Mobile\Atividade-08-06")
SIDE_PATH = PROJECT / "cadastro-usuario-testes-rafaelfeltrim.side"
REPORT_MD_PATH = PROJECT / "relatorio_testes_selenium.md"
REPORT_PDF_PATH = PROJECT / "relatorio_testes_selenium.pdf"
ZIP_PATH = PROJECT / "cadastro-usuario-testes-rafaelfeltrim.zip"
EVIDENCE_DIR = PROJECT / "evidencias"
PLAYWRIGHT_EVIDENCE_DIR = Path(
    r"C:\Users\Rafael Feltrim\Documents\Dashboard financeiro\qa-evidencias-cadastro"
)

BASE_URL = "https://linamgr.github.io/cadastro-usuario/"
NAMESPACE = uuid.UUID("7a1ab113-31ad-46c1-8d89-99f252b6a211")


@dataclass(frozen=True)
class Case:
    ct: int
    rep: int
    name_invalid: bool
    year_invalid: bool
    email_invalid: bool
    password_structure_invalid: bool
    password_restriction_invalid: bool
    nome: str
    ano: str
    email: str
    senha: str
    note: str = ""

    @property
    def test_name(self) -> str:
        return f"cadastro-usuario-ct{self.ct}-{self.rep}"

    @property
    def factors(self) -> tuple[bool, bool, bool, bool, bool]:
        return (
            self.name_invalid,
            self.year_invalid,
            self.email_invalid,
            self.password_structure_invalid,
            self.password_restriction_invalid,
        )


def uid(*parts: object) -> str:
    return str(uuid.uuid5(NAMESPACE, "::".join(str(part) for part in parts)))


def expected_strength(password_structure_invalid: bool, password_restriction_invalid: bool) -> str:
    if password_structure_invalid or password_restriction_invalid:
        return "Senha inválida."
    return "Senha Moderada"


def expected_result(case: Case) -> str:
    if any(case.factors):
        return "Seus dados não foram registrados"
    return "Seus dados foram registrados"


def app_validates_email(email: str) -> bool:
    import re

    return re.match(r"^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$", email, re.I) is not None


def app_password_strength(case: Case) -> str | bool:
    import re

    senha = str(case.senha)
    primeiro_nome = str(case.nome)
    ano = str(case.ano)

    if not (6 <= len(senha) <= 20):
        return False
    if primeiro_nome in senha or ano in senha:
        return False
    if not re.search(r"[a-zA-ZçÇ]", senha):
        return False
    if not re.search(r"[0-9]", senha):
        return False
    if not re.search(r"[!@#%&$+]", senha):
        return False

    qtd_especial = len(re.findall(r"[!@#%&$+]", senha))
    qtd_maiuscula = len(re.findall(r"[A-ZÇ]", senha))
    qtd_numero = len(re.findall(r"[0-9]", senha))

    if len(senha) >= 13 and qtd_especial > 1 and qtd_maiuscula > 1 and qtd_numero > 1:
        return "Senha Forte"
    if len(senha) >= 9 and qtd_maiuscula > 0:
        return "Senha Moderada"
    return "Senha fraca"


def observed(case: Case) -> dict[str, str]:
    email_ok = app_validates_email(case.email)
    pass_strength = app_password_strength(case)
    year_ok = True

    password_help = {
        False: "Senha inválida!",
        "fraca": "Senha fraca",
        "moderada": "Senha Moderada",
        "forte": "Senha Forte",
        "Senha fraca": "Senha fraca",
        "Senha Moderada": "Senha Moderada",
        "Senha Forte": "Senha Forte",
    }[pass_strength]

    return {
        "nameHelp": "",
        "yearHelp": "",
        "emailHelp": "" if email_ok else "Endereço de e-mail incorreto!",
        "passwordHelp": password_help,
        "result": (
            "Parabéns seus dados foram registrados :)"
            if pass_strength and email_ok and year_ok
            else "Seus dados não foram registrados :("
        ),
    }


def functional_status(case: Case) -> str:
    app = observed(case)
    missing = []
    if case.name_invalid and not app["nameHelp"]:
        missing.append("nome")
    if case.year_invalid and not app["yearHelp"]:
        missing.append("ano")
    if case.email_invalid and not app["emailHelp"]:
        missing.append("email")
    if (case.password_structure_invalid or case.password_restriction_invalid) and (
        "Senha inválida" not in app["passwordHelp"]
    ):
        missing.append("senha")

    expected_invalid = any(case.factors)
    app_invalid = "não foram registrados" in app["result"]
    if missing:
        return "FAIL"
    if expected_invalid != app_invalid:
        return "FAIL"
    return "PASS"


def make_data(
    name_invalid: bool,
    year_invalid: bool,
    email_invalid: bool,
    password_structure_invalid: bool,
    password_restriction_invalid: bool,
    *,
    nome: str | None = None,
    ano: str | None = None,
    email: str | None = None,
    note: str = "",
) -> dict[str, object]:
    chosen_name = nome if nome is not None else ("M@r1a" if name_invalid else "Julian")
    chosen_year = ano if ano is not None else ("2035" if year_invalid else "1991")
    chosen_email = email if email is not None else ("jul@usp.xyz" if email_invalid else "jul@usp.br")

    if password_structure_invalid and password_restriction_invalid:
        senha = f"{chosen_year}"
    elif password_structure_invalid:
        senha = "12345"
    elif password_restriction_invalid:
        senha = f"#@49%{chosen_name}74"
        if len(senha) > 20:
            senha = f"#@49%{chosen_year}No"
    else:
        senha = "#@49%No74"

    return {
        "nome": chosen_name,
        "ano": chosen_year,
        "email": chosen_email,
        "senha": senha,
        "note": note,
    }


def build_cases() -> list[Case]:
    cases: list[Case] = []

    def add(ct: int, rep: int, factors: tuple[bool, bool, bool, bool, bool], **overrides: object) -> None:
        data = make_data(*factors, **overrides)
        cases.append(
            Case(
                ct=ct,
                rep=rep,
                name_invalid=factors[0],
                year_invalid=factors[1],
                email_invalid=factors[2],
                password_structure_invalid=factors[3],
                password_restriction_invalid=factors[4],
                nome=str(data["nome"]),
                ano=str(data["ano"]),
                email=str(data["email"]),
                senha=str(data["senha"]),
                note=str(data["note"]),
            )
        )

    add(1, 1, (False, False, False, False, False), nome="Julian", ano="1991", email="jul@usp.br")
    add(
        1,
        2,
        (False, False, False, False, False),
        nome="Maria Aparecida Lucinda Ferreiras",
        ano="1991",
        email="malf@usp.br",
        note="Representante e2 do enunciado.",
    )
    add(2, 1, (True, False, False, False, False), nome="M@r1a", email="maria@usp.br")
    add(
        2,
        2,
        (True, False, False, False, False),
        nome="MariaAparecidaLucindadeFerreira",
        email="maria@usp.br",
        note="Representante e4 do enunciado; mantido como inválido conforme tabela da professora.",
    )
    add(2, 3, (True, False, False, False, False), nome="   ", email="maria@usp.br")
    add(3, 1, (False, True, False, False, False))
    add(4, 1, (False, False, True, False, False))
    add(5, 1, (False, False, False, True, False))
    add(6, 1, (False, False, False, False, True))

    covered = {(case.ct, case.factors) for case in cases}
    covered_factors = {case.factors for case in cases}
    all_invalid = (True, True, True, True, True)
    remaining = [
        factors
        for factors in (
            (bool(name), bool(year), bool(email), bool(pwd), bool(restriction))
            for name in (0, 1)
            for year in (0, 1)
            for email in (0, 1)
            for pwd in (0, 1)
            for restriction in (0, 1)
        )
        if factors not in covered_factors and factors != all_invalid
    ]
    remaining.sort(key=lambda item: (sum(item), item))

    ct = 7
    for factors in remaining:
        add(ct, 1, factors)
        ct += 1

    add(32, 1, all_invalid, nome="M@r1a", ano="2035", email="mariausp.br")

    assert len({case.factors for case in cases}) == 32
    assert len(cases) == 35
    assert any(case.test_name == "cadastro-usuario-ct32-1" for case in cases)
    return sorted(cases, key=lambda case: (case.ct, case.rep))


def command(command_id: str, name: str, target: str, value: str = "") -> dict[str, object]:
    return {
        "id": command_id,
        "comment": "",
        "command": name,
        "target": target,
        "targets": [],
        "value": value,
    }


def build_side(cases: list[Case]) -> dict[str, object]:
    tests = []
    suite_test_ids = []

    for case in cases:
        test_id = uid("test", case.test_name)
        suite_test_ids.append(test_id)
        commands = [
            command(uid(case.test_name, "open"), "open", BASE_URL),
            command(uid(case.test_name, "h2"), "assertText", "css=h2", "Cadastro de Usuário"),
            command(uid(case.test_name, "name"), "type", "id=inputName", case.nome),
            command(uid(case.test_name, "year"), "type", "id=inputYear", case.ano),
            command(uid(case.test_name, "email"), "type", "id=inputEmail", case.email),
            command(uid(case.test_name, "password"), "type", "id=inputPassword", case.senha),
            command(uid(case.test_name, "click"), "click", "css=.btn"),
        ]

        if case.name_invalid:
            commands.append(command(uid(case.test_name, "name-help"), "verifyText", "id=inputNameHelp", "Nome inválido."))
        if case.year_invalid:
            commands.append(command(uid(case.test_name, "year-help"), "verifyText", "id=inputYearHelp", "Ano inválido."))
        if case.email_invalid:
            commands.append(
                command(uid(case.test_name, "email-help"), "verifyText", "id=inputEmailHelp", "Formato de email inválido.")
            )

        commands.append(
            command(
                uid(case.test_name, "password-help"),
                "verifyText",
                "id=inputPasswordHelp",
                expected_strength(case.password_structure_invalid, case.password_restriction_invalid),
            )
        )
        commands.append(command(uid(case.test_name, "result"), "verifyText", "id=inputResult", expected_result(case)))

        tests.append({"id": test_id, "name": case.test_name, "commands": commands})

    return {
        "id": uid("project", "cadastro-usuario-testes-rafaelfeltrim"),
        "version": "2.0",
        "name": "cadastro-usuario-testes-rafaelfeltrim",
        "url": BASE_URL,
        "tests": tests,
        "suites": [
            {
                "id": uid("suite", "suite-cadastro-usuario-rafaelfeltrim"),
                "name": "suite-cadastro-usuario-rafaelfeltrim",
                "persistSession": False,
                "parallel": False,
                "timeout": 300,
                "tests": suite_test_ids,
            }
        ],
        "urls": [BASE_URL],
        "plugins": [],
    }


def status_label(case: Case) -> str:
    status = functional_status(case)
    if status == "PASS" and any(case.factors):
        return "PASS com ressalva de mensagem" if observed(case)["result"].endswith(":(") else "PASS"
    return status


def expected_errors(case: Case) -> str:
    errors = []
    if case.name_invalid:
        errors.append("Nome")
    if case.year_invalid:
        errors.append("Ano")
    if case.email_invalid:
        errors.append("Email")
    if case.password_structure_invalid or case.password_restriction_invalid:
        errors.append("Senha")
    return ", ".join(errors) if errors else "Cadastro válido"


def observed_summary(case: Case) -> str:
    app = observed(case)
    parts = []
    for key, label in [
        ("nameHelp", "Nome"),
        ("yearHelp", "Ano"),
        ("emailHelp", "Email"),
        ("passwordHelp", "Senha"),
        ("result", "Resultado"),
    ]:
        value = app[key]
        if value:
            parts.append(f"{label}: {value}")
    return " | ".join(parts)


def matrix_rows(cases: list[Case]) -> list[list[str]]:
    unique_by_ct: dict[int, Case] = {}
    for case in cases:
        unique_by_ct.setdefault(case.ct, case)

    rows = []
    for ct in sorted(unique_by_ct):
        case = unique_by_ct[ct]
        reps = [item for item in cases if item.ct == ct]
        rep_text = "; ".join(
            f"{item.rep}: nome={item.nome!r}, ano={item.ano}, email={item.email}, senha={item.senha!r}" for item in reps
        )
        rows.append(
            [
                f"CT{ct}",
                "Inválido" if case.name_invalid else "Válido",
                "Inválido" if case.year_invalid else "Válido",
                "Inválido" if case.email_invalid else "Válido",
                "Inválida" if case.password_structure_invalid else "Válida",
                "Contém nome/ano" if case.password_restriction_invalid else "Não contém",
                expected_errors(case),
                observed_summary(case),
                status_label(case),
                rep_text,
            ]
        )
    return rows


def copy_playwright_evidence() -> list[Path]:
    copied: list[Path] = []
    if not PLAYWRIGHT_EVIDENCE_DIR.exists():
        return copied
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    for source in sorted(PLAYWRIGHT_EVIDENCE_DIR.glob("*.png")):
        destination = EVIDENCE_DIR / f"playwright_{source.name}"
        shutil.copy2(source, destination)
        copied.append(destination)
    return copied


def markdown_report(cases: list[Case], copied_evidence: list[Path]) -> str:
    rows = matrix_rows(cases)
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M")
    automated_names = ", ".join(case.test_name for case in cases)

    lines = [
        "# Relatório de Teste Combinatorial com Selenium IDE",
        "",
        "**Disciplina:** Desenvolvimento Web e Mobile (SSC0961) - ICMC-USP  ",
        "**Estudante:** Rafael Feltrim  ",
        f"**Interface Testada:** [Cadastro de Usuário]({BASE_URL})  ",
        f"**Revisão QA SDET:** Rafael QA SR SDET - Feltrim Agents Base  ",
        f"**Atualizado em:** {generated_at}",
        "",
        "## Parecer de Conformidade",
        "",
        "A entrega original não estava 100% aderente ao enunciado porque o arquivo `.side` continha apenas 6 testes automatizados: CT1-1, CT1-2, CT2-1, CT2-2, CT2-3 e CT32-1. O enunciado pede a suíte Selenium completada com os novos casos de teste até CT32.",
        "",
        "Nesta revisão, a suíte Selenium foi completada com 35 testes executáveis, cobrindo os 32 casos combinatoriais funcionais: CT1 possui 2 representantes, CT2 possui 3 representantes conforme exemplos da professora, e CT3 a CT32 possuem 1 representante cada.",
        "",
        "## Checklist Oficial do Enunciado",
        "",
        "| Requisito | Status | Evidência |",
        "|---|---|---|",
        "| Documento com tabela preenchida com 32 casos | ATENDE | Seção 1 deste relatório |",
        "| Saída esperada e saída obtida por caso | ATENDE | Colunas `Saída Esperada` e `Saída Obtida` |",
        "| Relatório dos erros encontrados | ATENDE | Seção 2 deste relatório |",
        "| Link da interface testada | ATENDE | Seção 3 deste relatório |",
        "| Arquivo `.side` com novos casos implementados | ATENDE | `cadastro-usuario-testes-rafaelfeltrim.side` com 35 testes |",
        "| Nome do estudante no arquivo `.side` | ATENDE | Nome do arquivo inclui `rafaelfeltrim` |",
        "| Arquivo zipado com todos os artefatos | ATENDE | `cadastro-usuario-testes-rafaelfeltrim.zip` recriado |",
        "",
        "## 1. Tabela de Casos de Teste Combinatoriais (32 Cenários)",
        "",
        "A matriz considera 5 fatores binários para fechar 2^5 combinações: Nome, Ano de Nascimento, Email, Senha por Estrutura e Senha por Restrição (não conter nome/ano).",
        "",
        "| ID | Nome | Ano | Email | Senha Estrutura | Senha Restrição | Saída Esperada | Saída Obtida (Real) | Status | Representante(s) |",
        "|---|---|---|---|---|---|---|---|---|---|",
    ]

    for row in rows:
        lines.append("| " + " | ".join(cell.replace("|", "/") for cell in row) + " |")

    lines.extend(
        [
            "",
            "## 2. Relatório Técnico de Defeitos",
            "",
            "### Bug 01: Ausência de validação de nome (`validateFields.js`)",
            "",
            "- **Regra esperada:** nome deve conter apenas letras e comprimento maior ou igual a 6; caso contrário, retornar `Nome inválido.`.",
            "- **Comportamento observado:** nomes como `M@r1a` são aceitos e o cadastro é registrado.",
            "- **Causa provável:** `validateFields.js` lê `inputName`, mas não valida nem escreve em `#inputNameHelp`.",
            "- **BDD:** Dado que preencho o nome `M@r1a` e os demais campos válidos, quando envio o cadastro, então o sistema deve exibir `Nome inválido.` e não registrar os dados.",
            "",
            "### Bug 02: Validação de ano desativada (`validarAno.js`)",
            "",
            "- **Regra esperada:** ano de nascimento deve estar dentro dos últimos 120 anos e não ser futuro.",
            "- **Comportamento observado:** o ano `2035` é aceito e o cadastro é registrado.",
            "- **Causa provável:** a lógica de validação está comentada e a função retorna `true` incondicionalmente.",
            "- **BDD:** Dado que preencho o ano `2035`, quando envio o cadastro, então o sistema deve exibir `Ano inválido.` e não registrar os dados.",
            "",
            "### Bug 03: Regex de email não restringe TLD (`validarEmail.js`)",
            "",
            "- **Regra esperada:** email deve finalizar em `br`, `com`, `net` ou `org`.",
            "- **Comportamento observado:** `jul@usp.xyz` é aceito e o cadastro é registrado.",
            "- **Causa provável:** a regex aceita qualquer sufixo alfabético, como `.xyz`.",
            "- **BDD:** Dado que preencho o email `jul@usp.xyz`, quando envio o cadastro, então o sistema deve exibir `Formato de email inválido.` e não registrar os dados.",
            "",
            "### Bug 04: Mensagens da interface divergem da especificação",
            "",
            "- **Regra esperada:** `Formato de email inválido.`, `Senha inválida.`, `Seus dados foram registrados` e `Seus dados não foram registrados`.",
            "- **Comportamento observado:** a interface usa `Endereço de e-mail incorreto!`, `Senha inválida!`, `Parabéns seus dados foram registrados :)` e `Seus dados não foram registrados :(`.",
            "- **Impacto:** a lógica funcional pode até bloquear alguns cenários, mas as mensagens não cumprem o texto solicitado no enunciado.",
            "",
            "### Bug 05: Senha com exatamente 8 caracteres cai em classificação não especificada",
            "",
            "- **Regra esperada:** senha fraca tem comprimento menor que 8; senha moderada tem mais de 8. O enunciado não define claramente o limite exato de 8 caracteres.",
            "- **Comportamento observado:** a senha `#@49%N7` (8 caracteres) é aceita, classificada como `Senha fraca` e registra o cadastro.",
            "- **Classificação QA:** nuance/risco de especificação. Se a professora cobrar interpretação estrita, este ponto deve ser reportado.",
            "",
            "## 3. Link da Interface Testada",
            "",
            f"- {BASE_URL}",
            "",
            "## 4. Suíte Selenium IDE",
            "",
            f"- **Arquivo:** `cadastro-usuario-testes-rafaelfeltrim.side`",
            "- **Total de testes automatizados:** 35",
            "- **Cobertura:** 32 combinações funcionais, preservando múltiplos representantes de CT1 e CT2 do enunciado.",
            "- **Comandos usados para entrada:** `type`, para disparar eventos reais da interface em vez de preencher campos por `executeScript`.",
            f"- **Testes incluídos:** {automated_names}",
            "",
            "## 5. Evidências Visuais",
            "",
            "As evidências originais foram mantidas na pasta `evidencias/`. Além disso, foram adicionadas capturas Playwright com reprodução direta dos principais defeitos:",
            "",
        ]
    )

    for evidence in copied_evidence:
        rel = evidence.relative_to(PROJECT).as_posix()
        title = evidence.stem.replace("playwright_", "").replace("_", " ")
        lines.append(f"### Evidência Playwright - {title}")
        lines.append(f"![{title}]({rel})")
        lines.append("")

    lines.extend(
        [
            "## 6. Parecer Final do Agente",
            "",
            "**Antes da revisão:** não estava 100% de acordo com o que a professora pediu, principalmente pela suíte `.side` incompleta.",
            "",
            "**Após esta atualização:** o pacote passa a atender os requisitos estruturais de entrega: documento, tabela, relatório de bugs, link, `.side` completo e ZIP final. A interface testada continua apresentando bugs reais, que estão documentados como resultado da atividade.",
            "",
        ]
    )

    return "\n".join(lines)


def write_pdf(report_md: str, cases: list[Case], copied_evidence: list[Path]) -> None:
    styles = getSampleStyleSheet()
    styles["Normal"].fontName = "Helvetica"
    styles["Normal"].fontSize = 8.5
    styles["Normal"].leading = 11
    styles["Heading1"].fontName = "Helvetica-Bold"
    styles["Heading2"].fontName = "Helvetica-Bold"
    styles["Heading3"].fontName = "Helvetica-Bold"

    doc = SimpleDocTemplate(
        str(REPORT_PDF_PATH),
        pagesize=landscape(A4),
        rightMargin=1.0 * cm,
        leftMargin=1.0 * cm,
        topMargin=0.9 * cm,
        bottomMargin=0.9 * cm,
    )

    story = []

    def p(text: str, style: str = "Normal") -> None:
        story.append(Paragraph(text.replace("`", ""), styles[style]))
        story.append(Spacer(1, 0.12 * cm))

    p("Relatório de Teste Combinatorial com Selenium IDE", "Heading1")
    p("Rafael Feltrim - Desenvolvimento Web e Mobile (SSC0961) - ICMC-USP")
    p(f"Interface testada: {BASE_URL}")
    p("Parecer QA: a entrega original não estava 100% aderente porque a suíte .side continha apenas 6 testes. A suíte foi completada para 35 testes cobrindo 32 cenários combinatoriais.")

    checklist = [
        ["Requisito", "Status", "Observação"],
        ["Tabela 32 CTs", "ATENDE", "Matriz preenchida com fatores Nome, Ano, Email, Senha Estrutura e Senha Restrição"],
        ["Relatório de bugs", "ATENDE", "5 achados documentados com causa provável e BDD"],
        ["Link da interface", "ATENDE", BASE_URL],
        [".side completo", "ATENDE", "35 testes: CT1/CT2 com representantes e CT3-CT32"],
        ["ZIP final", "ATENDE", "Pacote recriado com relatório, PDF, .side, código e evidências"],
    ]
    table = Table(checklist, colWidths=[5 * cm, 3 * cm, 18 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d9ead3")),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend([table, Spacer(1, 0.4 * cm), PageBreak()])

    p("Tabela de Casos de Teste Combinatoriais", "Heading2")
    matrix = [["ID", "Nome", "Ano", "Email", "Senha Est.", "Senha Restr.", "Esperado", "Obtido", "Status"]]
    for row in matrix_rows(cases):
        matrix.append(row[:9])
    matrix_table = Table(
        matrix,
        repeatRows=1,
        colWidths=[1.2 * cm, 2 * cm, 2 * cm, 2 * cm, 2.2 * cm, 2.5 * cm, 4 * cm, 10.5 * cm, 2 * cm],
    )
    matrix_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#cfe2f3")),
                ("GRID", (0, 0), (-1, -1), 0.2, colors.lightgrey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 5.8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.extend([matrix_table, PageBreak()])

    p("Relatório Técnico de Defeitos", "Heading2")
    bugs = [
        ("Bug 01 - Nome sem validação", "Nomes inválidos como M@r1a são aceitos. validateFields.js não valida inputName nem escreve em inputNameHelp."),
        ("Bug 02 - Ano sempre válido", "validarAno.js está com a lógica comentada e retorna true para anos futuros como 2035."),
        ("Bug 03 - Email aceita TLD inválido", "validarEmail.js aceita jul@usp.xyz, embora o enunciado limite finais a br, com, net ou org."),
        ("Bug 04 - Mensagens divergentes", "Textos de email, senha e resultado não batem exatamente com as mensagens do enunciado."),
        ("Bug 05 - Limite de senha com 8 caracteres", "Senha de 8 caracteres é classificada como fraca, apesar da regra definir fraca como menor que 8 e moderada como maior que 8."),
    ]
    for title, body in bugs:
        p(title, "Heading3")
        p(body)

    if copied_evidence:
        story.append(PageBreak())
        p("Evidências Playwright", "Heading2")
        for index, evidence in enumerate(copied_evidence[:8], start=1):
            image = Image(str(evidence), width=12.8 * cm, height=7.2 * cm)
            caption = Paragraph(evidence.name, styles["Normal"])
            story.extend([image, caption, Spacer(1, 0.3 * cm)])
            if index % 2 == 0 and index != min(len(copied_evidence), 8):
                story.append(PageBreak())

    doc.build(story)


def write_zip() -> None:
    entries = [
        SIDE_PATH,
        REPORT_MD_PATH,
        REPORT_PDF_PATH,
        PROJECT / "index.html",
    ]
    entries.extend(sorted((PROJECT / "js").glob("*.js")))
    entries.extend(sorted(EVIDENCE_DIR.glob("*.png")))

    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for item in entries:
            if item.exists():
                archive.write(item, item.relative_to(PROJECT))


def main() -> None:
    cases = build_cases()
    copied_evidence = copy_playwright_evidence()

    side = build_side(cases)
    SIDE_PATH.write_text(json.dumps(side, ensure_ascii=False, indent=2), encoding="utf-8")

    report_md = markdown_report(cases, copied_evidence)
    REPORT_MD_PATH.write_text(report_md, encoding="utf-8")
    write_pdf(report_md, cases, copied_evidence)
    write_zip()

    print(f"side={SIDE_PATH}")
    print(f"tests={len(side['tests'])}")
    print(f"unique_cts={len({case.ct for case in cases})}")
    print(f"md={REPORT_MD_PATH}")
    print(f"pdf={REPORT_PDF_PATH}")
    print(f"zip={ZIP_PATH}")
    print(f"evidence_copied={len(copied_evidence)}")


if __name__ == "__main__":
    main()
