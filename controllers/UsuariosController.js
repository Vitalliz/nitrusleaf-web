// Importações necessárias
import express from "express";
import bcrypt from "bcrypt";
import Usuarios from "../models/Usuarios.js";
import session from 'express-session';
import flash from 'express-flash';

const router = express.Router();

// Configurando o middleware de sessão no router
router.use(session({
    secret: 'nitrusleafsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hora de duração
}));

// Middleware para mensagens de flash
router.use(flash());

// ROTA DE LOGIN
router.get("/login", (req, res) => {
    res.render("login", {
        loggedOut: true,
        messages: req.flash(),
    });
});

// ROTA DE LOGOUT
router.get("/logout", (req, res) => {
    req.session.user = undefined;
    req.flash("success", "Usuário deslogado com sucesso!");
    res.redirect("/login");
});

// ROTA DE AUTENTICAÇÃO
router.post("/authenticate", async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Verifica se o campo de email foi preenchido
        if (!email || !senha) {
            req.flash("danger", "Preencha todos os campos.");
            return res.redirect("/login");
        }

        // Busca o usuário pelo email
        const usuario = await Usuarios.findOne({ where: { email } });

        // Verifica se o usuário foi encontrado
        if (!usuario) {
            req.flash("danger", "Usuário não encontrado. Verifique o email e tente novamente.");
            return res.redirect("/login");
        }

        // Compara a senha com o hash do banco de dados
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (senhaValida) {
            req.session.user = { id_usuario: usuario.id_usuario, email: usuario.email };
            req.flash("success", "Login efetuado com sucesso!");
            res.redirect("/");
        } else {
            req.flash("danger", "Senha incorreta. Tente novamente.");
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Erro de autenticação:", error);
        req.flash("danger", "Erro ao autenticar. Por favor, tente novamente.");
        res.redirect("/login");
    }
});

// ROTA DE CADASTRO
router.get("/cadastroUsuarios", (req, res) => {
    res.render("cadastroUsuarios", {
        loggedOut: true,
        messages: req.flash(),
    });
});

// ROTA DE CRIAÇÃO DE USUÁRIOS
router.post("/createUsuarios", async (req, res) => {
    const {
        tipo_pessoa,
        nome,
        sobrenome,
        email,
        senha,
        cpf,
        cnpj,
        logradouro,
        numero,
        bairro,
        cidade,
        telefone,
        celular, 
    } = req.body;

    try {
        // Verifica se o e-mail já está cadastrado
        const usuarioExistente = await Usuarios.findOne({ where: { email } });
        if (usuarioExistente) {
            req.flash("danger", "Usuário já cadastrado. Faça o login.");
            return res.redirect("/login");
        }

        // Cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);

        // Cria o usuário
        await Usuarios.create({
            tipo_pessoa,
            nome,
            sobrenome,
            email,
            senha: hash,
            cpf: tipo_pessoa === 'fisica' ? cpf : null,
            cnpj: tipo_pessoa === 'juridica' ? cnpj : null,
            logradouro,
            numero,
            bairro,
            cidade,
            telefone, 
            celular,
        });

        req.flash("success", "Cadastro realizado com sucesso!");
        res.redirect("/login");
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        req.flash("danger", "Erro ao cadastrar usuário. Por favor, tente novamente.");
        res.redirect("/cadastroUsuarios");
    }
});

// Middleware de Autenticação
function Auth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.flash("danger", "Você precisa estar logado para acessar essa área.");
        res.redirect("/login");
    }
}

// ROTA PRINCIPAL DA APLICAÇÃO
router.get("/", (req, res) => {
    res.render("index", {
        messages: req.flash(),
        user: req.session.user,
    });
});

export default router;
