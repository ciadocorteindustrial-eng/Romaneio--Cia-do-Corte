// ===== Romaneio Cia do Corte (v3) =====

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let itens = [];
let numeroRomaneio = localStorage.getItem("romaneioNumero")
  ? parseInt(localStorage.getItem("romaneioNumero"), 10)
  : 1;

const TAMANHOS = ["P","M","G","GG","XGG","34","36","38","40","42","44","46","48","50","52","54","56"];

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function getNum(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const n = Number(String(el.value).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function limparGrade() {
  TAMANHOS.forEach(t => {
    const el = document.getElementById("t" + t);
    if (el) el.value = "";
  });
}

function adicionar() {
  const cliente = getVal("cliente");
  const modelo = getVal("modelo");
  const cor = getVal("cor");
  const preco = getNum("preco");

  if (!cliente || !modelo || !cor || preco <= 0) {
    alert("Preencha Cliente, Modelo, Cor e um Preço válido.");
    return;
  }

  // Monta grade
  const grade = {};
  let totalPecas = 0;

  TAMANHOS.forEach(t => {
    const qtd = Math.max(0, Math.trunc(getNum("t" + t)));
    if (qtd > 0) {
      grade[t] = qtd;
      totalPecas += qtd;
    }
  });

  if (totalPecas === 0) {
    alert("Informe pelo menos 1 quantidade em algum tamanho.");
    return;
  }

  const subtotal = totalPecas * preco;

  itens.push({
    modelo,
    cor,
    preco,
    grade,
    totalPecas,
    subtotal
  });

  // limpa campos (mantém cliente pra agilizar)
  document.getElementById("modelo").value = "";
  document.getElementById("cor").value = "";
  document.getElementById("preco").value = "";
  limparGrade();

  atualizarLista();
}

function atualizarLista() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let totalGeral = 0;
  let pecasGeral = 0;

  itens.forEach((item, idx) => {
    totalGeral += item.subtotal;
    pecasGeral += item.totalPecas;

    // grade em texto (só tamanhos usados)
    const pares = Object.keys(item.grade)
      .map(t => `${t}: ${item.grade[t]}`)
      .join(" | ");

    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;">
        <div>
          <strong>${escapeHtml(item.modelo)}</strong><br>
          Cor: ${escapeHtml(item.cor)}<br>
          <span class="muted">${pares}</span><br>
          Total do modelo: <strong>${item.totalPecas}</strong> peças<br>
          Preço: ${fmtBRL.format(item.preco)}<br>
          <strong>Subtotal: ${fmtBRL.format(item.subtotal)}</strong>
        </div>
        <div>
          <button class="btn-secondary" style="width:auto;padding:10px 12px;margin-top:0"
            onclick="remover(${idx})">Remover</button>
        </div>
      </div>
    `;
    lista.appendChild(li);
  });

  document.getElementById("totalPecas").innerText = `Total de peças: ${pecasGeral}`;
  document.getElementById("total").innerText = `Total: ${fmtBRL.format(totalGeral)}`;
}

function remover(idx) {
  itens.splice(idx, 1);
  atualizarLista();
}

function limparTudo() {
  if (!confirm("Limpar todos os itens deste romaneio?")) return;
  itens = [];
  atualizarLista();
}

function gerarPDF() {
  const cliente = getVal("cliente");
  if (!cliente) {
    alert("Informe o cliente antes de gerar o PDF.");
    return;
  }
  if (itens.length === 0) {
    alert("Adicione pelo menos 1 modelo antes de gerar o PDF.");
    return;
  }

  const data = new Date().toLocaleDateString("pt-BR");
  const numero = String(numeroRomaneio).padStart(4, "0");

  // incrementa e salva sequência
  localStorage.setItem("romaneioNumero", String(numeroRomaneio + 1));
  numeroRomaneio += 1;

  let totalGeral = 0;
  let pecasGeral = 0;

  const linhasItens = itens.map(item => {
    totalGeral += item.subtotal;
    pecasGeral += item.totalPecas;

    // tabela grade
    const cols = Object.keys(item.grade);
    const cells = cols.map(t => `<td style="padding:6px 8px;border:1px solid #d0d0d0;text-align:center">${t}</td>`).join("");
    const vals  = cols.map(t => `<td style="padding:6px 8px;border:1px solid #d0d0d0;text-align:center">${item.grade[t]}</td>`).join("");

    return `
      <div style="margin:12px 0 14px;">
        <div style="font-weight:700;font-size:15px;">${escapeHtml(item.modelo)}</div>
        <div style="color:#555;margin:4px 0 8px;">Cor: ${escapeHtml(item.cor)} • Preço: ${fmtBRL.format(item.preco)}</div>

        <table style="border-collapse:collapse;width:100%;font-size:13px;">
          <tr style="background:#f2f2f2">${cells}</tr>
          <tr>${vals}</tr>
        </table>

        <div style="margin-top:8px;">
          Total do modelo: <strong>${item.totalPecas}</strong> peças •
          Subtotal: <strong>${fmtBRL.format(item.subtotal)}</strong>
        </div>
      </div>
      <hr style="border:none;border-top:1px solid #ddd;margin:10px 0;">
    `;
  }).join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;">
      <div style="text-align:center;border-bottom:2px solid #ccc;padding-bottom:10px;margin-bottom:14px;">
        <div style="font-size:20px;font-weight:800;">Romaneio Cia do Corte</div>
      </div>

      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div><strong>Romaneio nº:</strong> ${numero}</div>
        <div><strong>Data:</strong> ${data}</div>
      </div>
      <div style="margin-top:6px;"><strong>Cliente:</strong> ${escapeHtml(cliente)}</div>

      <hr style="border:none;border-top:2px solid #ccc;margin:12px 0;">

      ${linhasItens}

      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px;">
        <div><strong>Total de peças:</strong> ${pecasGeral}</div>
        <div style="font-size:16px;"><strong>TOTAL GERAL:</strong> ${fmtBRL.format(totalGeral)}</div>
      </div>

      <div style="margin-top:18px;color:#444;border-top:1px solid #ddd;padding-top:10px;">
        WhatsApp: <strong>(22) 99866-8375</strong>
      </div>
    </div>
  `;

  const win = window.open("", "_blank");
  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>Romaneio Cia do Corte</title>
        <meta charset="UTF-8" />
      </head>
      <body>
        ${html}
        <script>
          setTimeout(() => window.print(), 300);
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

function enviarWhatsApp() {
  const cliente = getVal("cliente") || "Cliente";
  const totalTxt = document.getElementById("total").innerText || "Total: R$ 0,00";
  const msg =
`Romaneio Cia do Corte
Cliente: ${cliente}
${totalTxt}

Vou enviar o PDF do romaneio em seguida.`;

  const url = "https://wa.me/55" + "22" + "998668375" + "?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}

// evita injeção no HTML do resumo/PDF
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
