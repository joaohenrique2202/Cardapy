const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
let produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
let carrinho = [];
let categoriaAtual = "todos";

document.addEventListener("DOMContentLoaded", function() {
    if (!usuario) {
        document.getElementById("cardapio").innerHTML = `
            <div class="empty">
                <h2>Nenhum restaurante cadastrado.</h2>
                <p>Crie uma conta primeiro.</p>
            </div>
        `;
        return;
    }

    document.getElementById("nomeRestaurante").textContent = usuario.estabelecimento;
    document.getElementById("avatar").textContent =
        usuario.estabelecimento.charAt(0).toUpperCase();

    renderCategorias();
    render();
    atualizarCarrinho();
});

function renderCategorias() {
    const container = document.getElementById("categorias");

    const categorias = [...new Set(
        produtos.map(produto => produto.categoria).filter(Boolean)
    )];

    container.innerHTML = `
        <button class="active" onclick="filtrarCategoria('todos')">Todos</button>
        ${categorias.map(categoria => `
            <button onclick="filtrarCategoria(${JSON.stringify(categoria)})">
                ${categoria}
            </button>
        `).join("")}
    `;
}

function filtrarCategoria(categoria) {
    categoriaAtual = categoria;

    document.querySelectorAll(".categories button").forEach(button => {
        button.classList.remove("active");
    });

    const botoes = document.querySelectorAll(".categories button");

    botoes.forEach(button => {
        if (button.textContent.trim() === (categoria === "todos" ? "Todos" : categoria)) {
            button.classList.add("active");
        }
    });

    render();
}

function render() {
    produtos = JSON.parse(localStorage.getItem("produtos") || "[]");

    const container = document.getElementById("cardapio");
    const busca = document.getElementById("busca").value.toLowerCase().trim();

    const filtrados = produtos.filter(produto => {
        const nome = String(produto.nome || "").toLowerCase();
        const descricao = String(produto.descricao || "").toLowerCase();

        return (
            (nome.includes(busca) || descricao.includes(busca)) &&
            (categoriaAtual === "todos" || produto.categoria === categoriaAtual)
        );
    });

    if (filtrados.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <h2>Nenhum produto encontrado</h2>
                <p>Este cardápio ainda não possui produtos.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtrados.map(produto => `
        <article class="menu-item">
            ${
                produto.imagem
                ? `<img src="${produto.imagem}" alt="${produto.nome}">`
                : `<div class="item-image">🍔</div>`
            }

            <div class="item-content">
                <span class="category">${produto.categoria}</span>
                <h2>${produto.nome}</h2>
                <p>${produto.descricao || ""}</p>

                <div class="item-bottom">
                    <strong>${formatarMoeda(produto.preco)}</strong>
                    <button onclick="adicionarCarrinho(${produto.id})">
                        + Adicionar
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function adicionarCarrinho(id) {
    const produto = produtos.find(item => item.id === id);

    if (!produto) return;

    const existente = carrinho.find(item => item.id === id);

    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }

    atualizarCarrinho();
}

function removerCarrinho(id) {
    const item = carrinho.find(item => item.id === id);

    if (!item) return;

    item.quantidade--;

    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(item => item.id !== id);
    }

    atualizarCarrinho();
}

function adicionarQuantidade(id) {
    const item = carrinho.find(item => item.id === id);

    if (!item) return;

    item.quantidade++;

    atualizarCarrinho();
}

function atualizarCarrinho() {
    const quantidade = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    document.getElementById("qtdCarrinho").textContent = quantidade;

    const container = document.getElementById("itensCarrinho");

    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p>Seu carrinho está vazio.</p>
            </div>
        `;

        document.getElementById("totalCarrinho").textContent = "R$ 0,00";
        return;
    }

    container.innerHTML = carrinho.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.nome}</strong>
                <small>${formatarMoeda(item.preco)}</small>
            </div>

            <div class="quantity">
                <button onclick="removerCarrinho(${item.id})">−</button>
                <span>${item.quantidade}</span>
                <button onclick="adicionarQuantidade(${item.id})">+</button>
            </div>
        </div>
    `).join("");

    document.getElementById("totalCarrinho").textContent =
        formatarMoeda(calcularTotal());
}

function calcularTotal() {
    return carrinho.reduce(
        (total, item) => total + Number(item.preco) * item.quantidade,
        0
    );
}

function abrirCarrinho() {
    document.getElementById("modalCarrinho").classList.add("ativo");
}

function fecharCarrinho() {
    document.getElementById("modalCarrinho").classList.remove("ativo");
}

function abrirFinalizar() {
    if (carrinho.length === 0) {
        alert("Adicione algum produto ao carrinho.");
        return;
    }

    fecharCarrinho();

    document.getElementById("checkoutTotal").textContent =
        formatarMoeda(calcularTotal());

    document.getElementById("modalFinalizar").classList.add("ativo");
}

function fecharFinalizar() {
    document.getElementById("modalFinalizar").classList.remove("ativo");
}

document.getElementById("checkout").addEventListener("submit", function(event) {
    event.preventDefault();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const pedido = {
        id: Date.now(),

        restaurante: usuario.estabelecimento,

        cliente: {
            nome: document.getElementById("clienteNome").value.trim(),
            telefone: document.getElementById("clienteTelefone").value.trim(),

            endereco: {
                cep: document.getElementById("clienteCep").value.trim(),
                rua: document.getElementById("clienteRua").value.trim(),
                numero: document.getElementById("clienteNumero").value.trim(),
                bairro: document.getElementById("clienteBairro").value.trim(),
                cidade: document.getElementById("clienteCidade").value.trim(),
                estado: document.getElementById("clienteEstado").value.trim().toUpperCase(),
                complemento: document.getElementById("clienteComplemento").value.trim()
            },

            observacao: document.getElementById("clienteObservacao").value.trim()
        },

        itens: carrinho,
        total: calcularTotal(),
        data: new Date().toISOString(),
        status: "novo"
    };

    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    pedidos.push(pedido);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    alert("Pedido enviado com sucesso!");

    carrinho = [];

    document.getElementById("checkout").reset();

    fecharFinalizar();

    atualizarCarrinho();
});

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

window.addEventListener("click", function(event) {
    const carrinhoModal = document.getElementById("modalCarrinho");
    const finalizarModal = document.getElementById("modalFinalizar");

    if (event.target === carrinhoModal) {
        fecharCarrinho();
    }

    if (event.target === finalizarModal) {
        fecharFinalizar();
    }
});
