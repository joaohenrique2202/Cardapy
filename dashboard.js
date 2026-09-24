const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

if (!usuario) {
    window.location.href = "index.html";
}

let produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
let pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
let filtroPedidoAtual = "todos";
let produtoEditandoId = null;

document.addEventListener("DOMContentLoaded", function() {
    carregarUsuario();
    atualizarTudo();
    mostrarSecao("inicio", document.querySelector(".nav"));
});

window.addEventListener("storage", function(event) {
    if (event.key !== "pedidos") return;

    const pedidosAnteriores = pedidos.length;
    pedidos = JSON.parse(event.newValue || "[]");

    renderPedidos();
    atualizarResumo();

    if (pedidos.length > pedidosAnteriores) {
        const pedido = pedidos[pedidos.length - 1];
        alert(`Novo pedido recebido de ${pedido.cliente?.nome || "um cliente"}!`);
        mostrarSecao("pedidos");
    }
});

function carregarUsuario() {
    document.getElementById("restNome").textContent = usuario.estabelecimento;
    document.getElementById("avatar").textContent = usuario.estabelecimento.charAt(0).toUpperCase();

    document.getElementById("cEstabelecimento").textContent = usuario.estabelecimento;
    document.getElementById("cNome").textContent = usuario.nome;
    document.getElementById("cEmail").textContent = usuario.email;
    document.getElementById("cTelefone").textContent = usuario.telefone;

    const e = usuario.endereco;

    document.getElementById("cEndereco").textContent =
        `${e.rua}, ${e.numero} - ${e.bairro}, ${e.cidade} - ${e.estado} | CEP: ${e.cep}` +
        (e.complemento ? ` | ${e.complemento}` : "");
}

function mostrarSecao(id, botao) {
    document.querySelectorAll(".secao").forEach(secao => {
        secao.classList.remove("ativo");
    });

    const secao = document.getElementById(id);

    if (secao) {
        secao.classList.add("ativo");
    }

    document.querySelectorAll(".nav").forEach(item => {
        item.classList.remove("ativo");
    });

    if (botao) {
        botao.classList.add("ativo");
    } else {
        const nav = document.querySelector(`.nav[data-secao="${id}"]`);
        if (nav) nav.classList.add("ativo");
    }

    if (id === "produtos") {
        renderProdutos();
        preencherCategorias();
    }

    if (id === "pedidos") {
        renderPedidos();
    }
}

function atualizarTudo() {
    produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
    pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    renderProdutos();
    preencherCategorias();
    renderPedidos();
    atualizarResumo();
    atualizarLink();
}

function abrirModalProduto() {
    produtoEditandoId = null;
    document.getElementById("tituloModalProduto").textContent = "Adicionar produto";
    document.getElementById("botaoSalvarProduto").textContent = "Salvar produto";
    document.getElementById("modalProduto").classList.add("ativo");
}

function fecharModalProduto() {
    document.getElementById("modalProduto").classList.remove("ativo");
    document.getElementById("formProduto").reset();
    document.getElementById("preview").innerHTML = "";
    produtoEditandoId = null;
}

function editarProduto(id) {
    const produto = produtos.find(item => item.id === id);

    if (!produto) return;

    produtoEditandoId = id;
    document.getElementById("tituloModalProduto").textContent = "Editar produto";
    document.getElementById("botaoSalvarProduto").textContent = "Salvar alterações";
    document.getElementById("pNome").value = produto.nome || "";
    document.getElementById("pDescricao").value = produto.descricao || "";
    document.getElementById("pPreco").value = produto.preco ?? "";
    document.getElementById("pCategoria").value = produto.categoria || "";

    const preview = document.getElementById("preview");
    preview.innerHTML = produto.imagem
        ? `<img src="${produto.imagem}" alt="Imagem atual" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 10px;">`
        : "";

    document.getElementById("modalProduto").classList.add("ativo");
}

document.getElementById("pImagem").addEventListener("change", function() {
    const arquivo = this.files[0];
    const preview = document.getElementById("preview");

    preview.innerHTML = "";

    if (!arquivo) return;

    const imagem = document.createElement("img");
    imagem.src = URL.createObjectURL(arquivo);
    imagem.style.width = "100%";
    imagem.style.maxHeight = "180px";
    imagem.style.objectFit = "cover";
    imagem.style.borderRadius = "10px";

    preview.appendChild(imagem);
});

document.getElementById("formProduto").addEventListener("submit", function(event) {
    event.preventDefault();

    const arquivo = document.getElementById("pImagem").files[0];

    const salvarProduto = function(imagem = "") {
        const produtoAtual = produtos.find(item => item.id === produtoEditandoId);
        const dadosProduto = {
            nome: document.getElementById("pNome").value.trim(),
            descricao: document.getElementById("pDescricao").value.trim(),
            preco: Number(document.getElementById("pPreco").value),
            categoria: document.getElementById("pCategoria").value.trim(),
            imagem: imagem || produtoAtual?.imagem || ""
        };

        if (produtoAtual) {
            produtos = produtos.map(item =>
                item.id === produtoEditandoId ? { ...item, ...dadosProduto } : item
            );
        } else {
            produtos.push({ id: Date.now(), ...dadosProduto });
        }

        localStorage.setItem("produtos", JSON.stringify(produtos));

        alert(produtoAtual ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!");

        fecharModalProduto();
        atualizarTudo();
    };

    if (!arquivo) {
        salvarProduto();
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function() {
        salvarProduto(leitor.result);
    };

    leitor.readAsDataURL(arquivo);
});

function renderProdutos() {
    const container = document.getElementById("listaProdutos");

    if (!container) return;

    const buscaElement = document.getElementById("busca");
    const categoriaElement = document.getElementById("categoria");

    const busca = buscaElement ? buscaElement.value.toLowerCase().trim() : "";
    const categoria = categoriaElement ? categoriaElement.value : "todas";

    const filtrados = produtos.filter(produto => {
        const nome = String(produto.nome || "").toLowerCase();
        const correspondeBusca = nome.includes(busca);
        const correspondeCategoria =
            categoria === "todas" || produto.categoria === categoria;

        return correspondeBusca && correspondeCategoria;
    });

    if (filtrados.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <h3>Nenhum produto encontrado</h3>
                <p>Adicione seu primeiro produto.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtrados.map(produto => `
        <article class="product">
            ${
                produto.imagem
                ? `<img class="product-image" src="${produto.imagem}" alt="${produto.nome}">`
                : `<div class="product-image">🍔</div>`
            }

            <div class="product-content">
                <small>${produto.categoria}</small>
                <h3>${produto.nome}</h3>
                <p>${produto.descricao || "Sem descrição."}</p>
                <strong class="price">${formatarMoeda(produto.preco)}</strong>
                <button class="edit-product" onclick="editarProduto(${produto.id})">Editar produto</button>
                <button class="remove-product" onclick="removerProduto(${produto.id})">Remover produto</button>
            </div>
        </article>
    `).join("");
}

function removerProduto(id) {
    const produto = produtos.find(item => item.id === id);

    if (!produto || !confirm(`Deseja remover o produto "${produto.nome}"?`)) {
        return;
    }

    produtos = produtos.filter(item => item.id !== id);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarTudo();
}

function preencherCategorias() {
    const select = document.getElementById("categoria");

    if (!select) return;

    const valorAtual = select.value;

    const categorias = [...new Set(
        produtos
            .map(produto => produto.categoria)
            .filter(Boolean)
    )];

    select.innerHTML = `<option value="todas">Todas as categorias</option>`;

    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });

    if (categorias.includes(valorAtual)) {
        select.value = valorAtual;
    }
}

function renderPedidos() {
    const container = document.getElementById("listaPedidos");

    if (!container) return;

    pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    let lista = pedidos.slice().reverse();

    if (filtroPedidoAtual !== "todos") {
        lista = lista.filter(pedido => pedido.status === filtroPedidoAtual);
    }

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <h3>Nenhum pedido encontrado</h3>
                <p>Os pedidos dos clientes aparecerão aqui.</p>
            </div>
        `;
        atualizarBadge();
        return;
    }

    container.innerHTML = lista.map(pedido => {
        const cliente = pedido.cliente || {};
        const endereco = cliente.endereco || {};

        const itens = (pedido.itens || []).map(item =>
            `<li>${item.quantidade}x ${item.nome} — ${formatarMoeda(item.preco * item.quantidade)}</li>`
        ).join("");

        return `
            <article class="order">
                <div class="order-head">
                    <div>
                        <strong>Pedido #${pedido.id}</strong>
                        <p>${formatarData(pedido.data)}</p>
                    </div>

                    <span class="status">${nomeStatus(pedido.status)}</span>
                </div>

                <p><strong>Cliente:</strong> ${cliente.nome || "Não informado"}</p>
                <p><strong>WhatsApp:</strong> ${cliente.telefone || "Não informado"}</p>

                <p>
                    <strong>Entrega:</strong>
                    ${endereco.rua || ""}, ${endereco.numero || ""}
                    - ${endereco.bairro || ""}
                    - ${endereco.cidade || ""}/${endereco.estado || ""}
                </p>

                <ul>${itens}</ul>

                ${cliente.observacao ? `<p><strong>Observação:</strong> ${cliente.observacao}</p>` : ""}

                <p><strong>Total:</strong> ${formatarMoeda(pedido.total)}</p>

                <div class="order-actions">
                    ${botoesStatus(pedido)}
                </div>
            </article>
        `;
    }).join("");

    atualizarBadge();
}

function botoesStatus(pedido) {
    const status = pedido.status;

    if (status === "cancelado" || status === "entregue") {
        return `<button onclick="alterarStatus(${pedido.id}, 'novo')">Reabrir pedido</button>`;
    }

    if (status === "aguardando_pagamento") {
        return `
            <button onclick="alterarStatus(${pedido.id}, 'novo')">Confirmar pagamento</button>
            <button onclick="alterarStatus(${pedido.id}, 'cancelado')">Cancelar</button>
        `;
    }

    if (status === "novo") {
        return `
            <button onclick="alterarStatus(${pedido.id}, 'em_preparo')">Iniciar preparo</button>
            <button onclick="alterarStatus(${pedido.id}, 'cancelado')">Cancelar</button>
        `;
    }

    if (status === "em_preparo") {
        return `<button onclick="alterarStatus(${pedido.id}, 'pronto')">Marcar como pronto</button>`;
    }

    if (status === "pronto") {
        return `<button onclick="alterarStatus(${pedido.id}, 'entregue')">Marcar como entregue</button>`;
    }

    return "";
}

function alterarStatus(id, novoStatus) {
    const indice = pedidos.findIndex(pedido => pedido.id === id);

    if (indice === -1) return;

    pedidos[indice].status = novoStatus;

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    renderPedidos();
    atualizarResumo();
}

function filtrar(status, botao) {
    filtroPedidoAtual = status;

    document.querySelectorAll(".order-filters button").forEach(item => {
        item.classList.remove("active");
    });

    if (botao) {
        botao.classList.add("active");
    }

    renderPedidos();
}

function atualizarResumo() {
    const pedidosValidos = pedidos.filter(pedido => pedido.status !== "cancelado");

    const totalVendas = pedidosValidos.reduce(
        (total, pedido) => total + Number(pedido.total || 0),
        0
    );

    const clientes = new Set(
        pedidos.map(pedido => pedido.cliente?.telefone).filter(Boolean)
    );

    document.getElementById("totalPedidos").textContent = pedidos.length;
    document.getElementById("totalVendas").textContent = formatarMoeda(totalVendas);
    document.getElementById("totalProdutos").textContent = produtos.length;
    document.getElementById("totalClientes").textContent = clientes.size;

    const recentes = document.getElementById("recentes");

    if (!recentes) return;

    const ultimos = pedidos.slice().reverse().slice(0, 5);

    if (ultimos.length === 0) {
        recentes.innerHTML = `
            <div class="empty">
                <p>Nenhum pedido recebido ainda.</p>
            </div>
        `;
        return;
    }

    recentes.innerHTML = ultimos.map(pedido => `
        <div class="recent-order">
            <strong>Pedido #${pedido.id}</strong>
            <p>${pedido.cliente?.nome || "Cliente"} — ${formatarMoeda(pedido.total)}</p>
            <small>${nomeStatus(pedido.status)}</small>
        </div>
    `).join("");
}

function atualizarBadge() {
    const badge = document.getElementById("badge");

    if (!badge) return;

    const quantidade = pedidos.filter(pedido =>
        pedido.status !== "entregue" &&
        pedido.status !== "cancelado"
    ).length;

    badge.textContent = quantidade;
}

function atualizarLink() {
    const elemento = document.getElementById("linkCardapio");

    if (elemento) {
        elemento.textContent = window.location.href.replace("dashboard.html", "cardapio.html");
    }
}

function copiarLink() {
    const texto = document.getElementById("linkCardapio").textContent;

    navigator.clipboard.writeText(texto)
        .then(() => alert("Link copiado!"))
        .catch(() => alert("Não foi possível copiar automaticamente."));
}

function nomeStatus(status) {
    const nomes = {
        aguardando_pagamento: "Aguardando pagamento",
        novo: "Novo",
        em_preparo: "Em preparo",
        pronto: "Pronto",
        entregue: "Entregue",
        cancelado: "Cancelado"
    };

    return nomes[status] || status;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR");
}

window.addEventListener("click", function(event) {
    const modal = document.getElementById("modalProduto");

    if (event.target === modal) {
        fecharModalProduto();
    }
});
