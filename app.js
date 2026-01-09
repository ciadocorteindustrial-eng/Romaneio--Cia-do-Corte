let modelos = [];
let numeroRomaneio = localStorage.getItem("romaneioNumero")
  ? parseInt(localStorage.getItem("romaneioNumero"))
  : 1;

function adicionar() {
  const cliente = document.getElementById("cliente").value;
  const modelo = document.getElementById("modelo").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const cor = document.getElementById("cor").value;

  if (!cliente || !modelo || !preco || !cor) {
    alert("Preencha cliente, modelo, preço e cor");
    return;
  }

  const tamanhos = [
    "P","M","G","GG","XGG",
    "34","36","38","40","42","44",
    "46","48","50","52","54","56"
  ];

  let grade = {};
  let totalPecas = 0;

  tamanhos.forEach(t => {
    const campo = document.getElementById("t" + t);
    const qtd = parseInt(campo.value) || 0;
    if (qtd > 0) {
      grade[t] = qtd;
      totalPecas += qtd;
    }
    campo.value = "";
  });

  if (totalPecas === 0) {
    alert("Informe ao menos um tamanho");
    return;
  }

  modelos.push({
    modelo,
    preco,
    cor,
    grade,
    totalPecas,
    subtotal: totalPecas * preco
  });

  document.getElementById("modelo").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("cor").value = "";

  atualizarLista();
}

function atualizarLista() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  let totalGeral = 0;

  modelos.forEach(item => {
    totalGeral += item.subtotal;

    let gradeTexto = "";
    for (let t in item.grade) {
      gradeTexto += `${t}: ${item.grade[t]} | `;
    }

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.modelo}</strong><br>
      Cor: ${item.cor}<br>
      ${gradeTexto}<br>
      Total: ${item.totalPecas} peças<br>
      <strong>Subtotal: R$ ${item.subtotal.toFixed(2)}</strong>
    `;
    lista.appendChild(li);
  });

  document.getElementById("total").innerText =
    "Total: R$ " + totalGeral.toFixed(2);
}

function gerarPDF() {
  const cliente = document.getElementById("cliente").value;
  const data = new Date().toLocaleDateString("pt-BR");
  const numero = String(numeroRomaneio).padStart(4, "0");

  localStorage.setItem("romaneioNumero", numeroRomaneio + 1);

  let html = `
    <h2>Romaneio Cia do Corte</h2>
    <p><strong>Romaneio nº:</strong> ${numero}</p>
    <p><strong>Data:</strong> ${data}</p>
    <p><strong>Cliente:</strong> ${cliente}</p>
    <hr>
  `;

  let totalGeral = 0;

  modelos.forEach(item => {
    totalGeral += item.subtotal;

    let gradeTexto = "";
    for (let t in item.grade) {
      gradeTexto += `${t}: ${item.grade[t]} | `;
    }

    html += `
      <p>
        <strong>${item.modelo}</strong><br>
        Cor: ${item.cor}<br>
        ${gradeTexto}<br>
        Total do modelo: ${item.totalPecas} peças<br>
        <strong>Subtotal: R$ ${item.subtotal.toFixed(2)}</strong>
      </p>
      <hr>
    `;
  });

  html += `
    <h3>TOTAL GERAL: R$ ${totalGeral.toFixed(2)}</h3>
    <br>
    <p>WhatsApp: (22) 99866-8375</p>
  `;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head><title>Romaneio Cia do Corte</title></head>
      <body>
        ${html}
        <script>window.print();</script>
      </body>
    </html>
  `);
}
