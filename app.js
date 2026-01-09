const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let itens = [];
let numeroRomaneio = localStorage.getItem("romaneioNumero")
  ? parseInt(localStorage.getItem("romaneioNumero"), 10)
  : 1;

const TAMANHOS = ["P","M","G","GG","XGG","34","36","38","40","42","44","46","48","50","52","54","56"];

function val(id){ return (document.getElementById(id)?.value || "").trim(); }
function num(id){
  const v = (document.getElementById(id)?.value || "").toString().replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function limparGrade(){
  TAMANHOS.forEach(t => { const el = document.getElementById("t"+t); if(el) el.value=""; });
}

function adicionar(){
  const cliente = val("cliente");
  const modelo  = val("modelo");
  const cor     = val("cor");
  const preco   = num("preco");

  if(!cliente || !modelo || !cor || preco <= 0){
    alert("Preencha Cliente, Modelo, Cor e um Preço válido.");
    return;
  }

  const grade = {};
  let totalPecas = 0;

  TAMANHOS.forEach(t => {
    const qtd = Math.max(0, Math.trunc(num("t"+t)));
    if(qtd > 0){ grade[t]=qtd; totalPecas += qtd; }
  });

  if(totalPecas === 0){
    alert("Informe pelo menos 1 quantidade em algum tamanho.");
    return;
  }

  const subtotal = totalPecas * preco;

  itens.push({ modelo, cor, preco, grade, totalPecas, subtotal });

  document.getElementById("modelo").value = "";
  document.getElementById("cor").value = "";
  document.getElementById("preco").value = "";
  limparGrade();

  atualizarLista();
}

function atualizarLista(){
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let totalGeral = 0;
  let pecasGeral = 0;

  itens.forEach((item, idx) => {
    totalGeral += item.subtotal;
    pecasGeral += item.totalPecas;

    const pares = Object.keys(item.grade).map(t => `${t}: ${item.grade[t]}`).join(" | ");

    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;">
        <div>
          <strong>${esc(item.modelo)}</strong><br>
          Cor: ${esc(item.cor)}<br>
          <span class="muted">${pares}</span><br>
          Total do modelo: <strong>${item.totalPecas}</strong> peças<br>
          Preço: ${fmtBRL.format(item.preco)}<br>
          <strong>Subtotal: ${fmtBRL.format(item.subtotal)}</strong>
        </div>
        <div>
          <button class="btn-secondary" style="width:auto;padding:10px 12px;margin-top:0" onclick="remover(${idx})">Remover</button>
        </div>
      </div>
    `;
    lista.appendChild(li);
  });

  document.getElementById("totalPecas").innerText = `Total de peças: ${pecasGeral}`;
  document.getElementById("total").innerText = `Total: ${fmtBRL.format(totalGeral)}`;
}

function remover(idx){ itens.splice(idx,1); atualizarLista(); }

function limparTudo(){
  if(!confirm("Limpar todos os itens deste romaneio?")) return;
  itens = [];
  atualizarLista();
}

function gerarPDF(){
  const cliente = val("cliente");
  if(!cliente){ alert("Informe o cliente antes de gerar o PDF."); return; }
  if(itens.length === 0){ alert("Adicione pelo menos 1 modelo antes de gerar o PDF."); return; }

  const data = new Date().toLocaleDateString("pt-BR");
  const numero = String(numeroRomaneio).padStart(4,"0");

  localStorage.setItem("romaneioNumero", String(numeroRomaneio + 1));
  numeroRomaneio += 1;

  let totalGeral = 0;
  let pecasGeral = 0;

  const blocos = itens.map(item => {
    totalGeral += item.subtotal;
    pecasGeral += item.totalPecas;

    const cols = Object.keys(item.grade);
    const cells = cols.map(t => `<td style="padding:6px 8px;border:1px solid #d0d0d0;text-align:center">${t}</td>`).join("");
    const vals  = cols.map(t => `<td style="padding:6px 8px;border:1px solid #d0d0d0;text-align:center">${item.grade[t]}</td>`).join("");

    return `
      <div style="margin:12px 0 14px;">
        <div style="font-weight:700;font-size:15px;">${esc(item.modelo)}</div>
        <div style="color:#555;margin:4px 0 8px;">Cor: ${esc(item.cor)} • Preço: ${fmtBRL.format(item.preco)}</div>

        <table style="border-collapse:collapse;width:100%;font-size:13px;">
          <tr style="background:#f2f2f2">${cells}</tr>
          <tr>${vals}</tr>
        </table>

        <div style="margin-top:8px;">
          Total do modelo: <strong>${item.totalPecas}</strong> peças •
          Subtotal: <strong>${fmtBRL.format(item.subtotal)}</strong>
        </div>
      </div>
