const modalCadastro = document.getElementById("modalCadastro");
const modalLogin = document.getElementById("modalLogin");

function abrirCadastro() {
    modalCadastro.classList.add("ativo");
}

function fecharCadastro() {
    modalCadastro.classList.remove("ativo");
}

function abrirLogin() {
    modalLogin.classList.add("ativo");
}

function fecharLogin() {
    modalLogin.classList.remove("ativo");
}

window.addEventListener("click", function(event) {
    if (event.target === modalCadastro) fecharCadastro();
    if (event.target === modalLogin) fecharLogin();
});

document.getElementById("formCadastro").addEventListener("submit", function(event) {
    event.preventDefault();

    const usuario = {
        estabelecimento: document.getElementById("estabelecimento").value.trim(),
        nome: document.getElementById("nome").value.trim(),
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        senha: document.getElementById("senha").value,
        endereco: {
            cep: document.getElementById("cep").value.trim(),
            rua: document.getElementById("rua").value.trim(),
            numero: document.getElementById("numero").value.trim(),
            bairro: document.getElementById("bairro").value.trim(),
            cidade: document.getElementById("cidade").value.trim(),
            estado: document.getElementById("estado").value.trim().toUpperCase(),
            complemento: document.getElementById("complemento").value.trim()
        }
    };

    localStorage.setItem("usuario", JSON.stringify(usuario));

    if (!localStorage.getItem("produtos")) {
        localStorage.setItem("produtos", "[]");
    }

    if (!localStorage.getItem("pedidos")) {
        localStorage.setItem("pedidos", "[]");
    }

    alert("Conta criada com sucesso!");
    fecharCadastro();
    document.getElementById("formCadastro").reset();
    abrirLogin();
});

document.getElementById("formLogin").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!usuarioSalvo) {
        alert("Nenhuma conta cadastrada.");
        return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    if (email === usuario.email && senha === usuario.senha) {
        window.location.href = "dashboard.html";
    } else {
        alert("E-mail ou senha incorretos.");
    }
});
