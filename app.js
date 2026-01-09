let modelos = [];
let numeroRomaneio = localStorage.getItem("romaneioNumero")
  ? parseInt(localStorage.getItem("romaneioNumero"))
  : 1;

function adicionar() {
  const cliente = document.getElementById("cliente").value;
  const modelo = document.getElementById("modelo").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const quantidade = parseInt(document.getElementById("quantidade").value);

  if (!cliente || !modelo || !preco || !quantidade) {
    alert("Preencha todos os campos");
    return;
  }

  modelos.push({
    modelo,
    preco,
    quantidade,
    subtotal: preco * quantidade
  });

  atualizarLista();
}

function atualizarLista() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let total = 0;

  modelos.forEach((item, index) => {
    total += item.subtotal;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.modelo}</strong><br>
      ${item.quantidade} peças × R$ ${item.preco.toFixed(2)} = 
      <strong>R$ ${item.subtotal.toFixed(2)}</strong>
    `;
    lista.appendChild(li);
  });

  document.getElementById("total").innerText =
    "Total: R$ " + total.toFixed(2);
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
    html += `
      <p>
        <strong>${item.modelo}</strong><br>
        ${item.quantidade} peças × R$ ${item.preco.toFixed(2)}<br>
        <strong>Subtotal: R$ ${item.subtotal.toFixed(2)}</strong>
      </p>
      <hr>
    `;
  });

  html += `
    <h3>TOTAL GERAL: R$ ${totalGeral.toFixed(2)}</h3>
    <br><br>
    <p>WhatsApp: (22) 99866-8375</p>
  `;

  const janela = window.open("", "_blank");
  janela.document.write(`
    <html>
      <head>
        <title>Romaneio Cia do Corte</title>
      </head>
      <body>
        ${html}
        <script>
          window.print();
        </script>
      </body>
    </html>
  `);
}
