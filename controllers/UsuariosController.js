import express from "express";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import Usuarios from "../models/Usuarios.js";
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
import Pes from "../models/Pes.js";
import Relatorios from "../models/Relatorios.js";
import Foto from "../models/Foto.js";
import Alqueires from "../models/Alqueires.js";
import session from 'express-session';
import flash from 'express-flash';
const router = express.Router();
router.use(flash());

router.get("/login", (req, res) => {
    res.render("login", {
        loggedOut: true,
    });
});

router.get("/logout", (req, res) => {
    req.flash("success", "Usuário deslogado com sucesso!");
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
            return res.redirect("/home");
        }
        res.redirect("/");
    });
});

router.post("/authenticate", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        req.flash("danger", "Por favor, preencha todos os campos.");
        return res.redirect("/");
    }

    try {
        const usuario = await Usuarios.findOne({ 
            where: { 
                [Op.or]: [
                    { email: email.trim() },
                    { login: email.trim() }
                ]
            } 
        });

        if (!usuario) {
            req.flash("danger", "Usuário não encontrado. Verifique o e-mail ou faça um cadastro.");
            return res.redirect("/");
        }

        if (!usuario.senha) {
            req.flash("danger", "Erro: conta sem senha cadastrada. Entre em contato com o suporte.");
            return res.redirect("/");
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (senhaValida) {
            req.session.user = {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                foto_perfil: usuario.foto_perfil || null
            };
            req.flash("success", "Login efetuado com sucesso! Bem-vindo ao NitrusLeaf!");
            
            // Garantir que a sessão seja salva antes de redirecionar
            return req.session.save((err) => {
                if (err) {
                    console.error("Erro ao salvar sessão:", err);
                    req.flash("danger", "Erro ao iniciar sessão. Tente novamente.");
                    return res.redirect("/");
                }
                res.redirect("/home");
            });
        } else {
            req.flash("danger", "Senha incorreta. Tente novamente.");
            return res.redirect("/");
        }
    } catch (error) {
        console.error("Erro ao autenticar:", error);
        req.flash("danger", "Erro ao autenticar. Tente novamente.");
        res.redirect("/");
    }
});

router.get("/cadastroUsuarios", (req, res) => {
    const messages = {
        success: req.flash('success'),
        danger: req.flash('danger'),
        error: req.flash('error'),
        warning: req.flash('warning'),
        info: req.flash('info')
    };
    res.render("cadastroUsuarios", {
        loggedOut: true,
        messages
    });
});

router.post("/createUsuarios", async (req, res) => {
    const {
        tipo_pessoa,
        nome,
        sobrenome,
        telefone,
        email,
        senha,
        cnpj,
        nome_fantasia,
        bairro,
        numero,
        logradouro,
        cidade
    } = req.body;

    try {
        const usuarioExistente = await Usuarios.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { login: email }
                ]
            }
        });
        if (usuarioExistente) {
            req.flash("danger", "Este email já está cadastrado.");
            return res.redirect("/selecionar-cadastro");
        }

        if (tipo_pessoa === 'fisica') {
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            const novoUsuario = await Usuarios.create({
                tipo_pessoa: 'fisica',
                nome: nome,
                sobrenome: sobrenome,
                telefone: telefone,
                email: email,
                login: email,
                senha: senhaHash,
                cnpj: null,
                nome_fantasia: null,
                bairro: null,
                numero: null,
                logradouro: null,
                cidade: null,
                cep: null,
                celular: null,
                cpf: null
            });

            req.session.user = {
                id_usuario: novoUsuario.id_usuario,
                email: novoUsuario.email,
                foto_perfil: novoUsuario.foto_perfil || null
            };
            req.flash("success", "Cadastro realizado com sucesso! Bem-vindo ao NitrusLeaf!");
            return req.session.save((err) => {
                if (err) {
                    console.error("Erro ao salvar sessão:", err);
                    req.flash("danger", "Erro ao finalizar sessão de usuário.");
                    return res.redirect("/");
                }
                res.redirect("/home");
            });

        } else {
            req.session.dadosCadastro = {
                tipo_pessoa,
                nome,
                sobrenome,
                telefone,
                email,
                cnpj,
                nome_fantasia,
                bairro,
                numero,
                logradouro,
                cidade
            };

            const messages = {
                success: req.flash('success'),
                danger: req.flash('danger'),
                error: req.flash('error'),
                warning: req.flash('warning'),
                info: req.flash('info')
            };
            res.render("cadastroLogin", {
                tipo_pessoa,
                nome,
                sobrenome,
                telefone,
                email,
                cnpj,
                nome_fantasia,
                bairro,
                numero,
                logradouro,
                cidade,
                messages
            });
        }

    } catch (error) {
        console.error("Erro no cadastro:", error);
        req.flash("danger", "Erro interno do servidor.");
        res.redirect("/selecionar-cadastro");
    }
});

router.post("/createLogin", async (req, res) => {
    const { email_acesso, senha, confirmar_senha } = req.body;
    const dadosCadastro = req.session.dadosCadastro;

    try {
        if (!dadosCadastro) {
            req.flash("danger", "Sessão expirada. Por favor, refaça o cadastro.");
            return res.redirect("/selecionar-cadastro");
        }

        const emailFinal = (email_acesso || '').trim() || (dadosCadastro.email || '').trim();

        if (!emailFinal) {
            req.flash("danger", "Informe um e-mail válido.");
            const messages = {
                success: req.flash('success'),
                danger: req.flash('danger'),
                error: req.flash('error'),
                warning: req.flash('warning'),
                info: req.flash('info')
            };
            return res.render("cadastroLogin", {
                tipo_pessoa: dadosCadastro.tipo_pessoa,
                nome: dadosCadastro.nome || '',
                sobrenome: dadosCadastro.sobrenome || '',
                telefone: dadosCadastro.telefone || '',
                email: '',
                cnpj: dadosCadastro.cnpj || '',
                nome_fantasia: dadosCadastro.nome_fantasia || '',
                bairro: dadosCadastro.bairro || '',
                numero: dadosCadastro.numero || '',
                logradouro: dadosCadastro.logradouro || '',
                cidade: dadosCadastro.cidade || '',
                messages
            });
        }

        if (senha !== confirmar_senha) {
            req.flash("danger", "As senhas não coincidem.");
            const messages = {
                success: req.flash('success'),
                danger: req.flash('danger'),
                error: req.flash('error'),
                warning: req.flash('warning'),
                info: req.flash('info')
            };
            return res.render("cadastroLogin", {
                tipo_pessoa: dadosCadastro.tipo_pessoa,
                nome: dadosCadastro.nome || '',
                sobrenome: dadosCadastro.sobrenome || '',
                telefone: dadosCadastro.telefone || '',
                email: emailFinal,
                cnpj: dadosCadastro.cnpj || '',
                nome_fantasia: dadosCadastro.nome_fantasia || '',
                bairro: dadosCadastro.bairro || '',
                numero: dadosCadastro.numero || '',
                logradouro: dadosCadastro.logradouro || '',
                cidade: dadosCadastro.cidade || '',
                messages
            });
        }

        const usuarioExistente = await Usuarios.findOne({
            where: {
                [Op.or]: [
                    { email: emailFinal },
                    { login: emailFinal }
                ]
            }
        });

        if (usuarioExistente) {
            req.flash("danger", "Este e-mail já está em uso.");
            const messages = {
                success: req.flash('success'),
                danger: req.flash('danger'),
                error: req.flash('error'),
                warning: req.flash('warning'),
                info: req.flash('info')
            };
            return res.render("cadastroLogin", {
                tipo_pessoa: dadosCadastro.tipo_pessoa,
                nome: dadosCadastro.nome || '',
                sobrenome: dadosCadastro.sobrenome || '',
                telefone: dadosCadastro.telefone || '',
                email: '',
                cnpj: dadosCadastro.cnpj || '',
                nome_fantasia: dadosCadastro.nome_fantasia || '',
                bairro: dadosCadastro.bairro || '',
                numero: dadosCadastro.numero || '',
                logradouro: dadosCadastro.logradouro || '',
                cidade: dadosCadastro.cidade || '',
                messages
            });
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        const novoUsuario = await Usuarios.create({
            tipo_pessoa: dadosCadastro.tipo_pessoa,
            nome: dadosCadastro.nome,
            sobrenome: dadosCadastro.sobrenome,
            telefone: dadosCadastro.telefone,
            email: emailFinal,
            login: emailFinal,
            senha: senhaHash,
            cnpj: dadosCadastro.cnpj || null,
            nome_fantasia: dadosCadastro.nome_fantasia || null,
            bairro: dadosCadastro.bairro || null,
            numero: dadosCadastro.numero || null,
            logradouro: dadosCadastro.logradouro || null,
            cidade: dadosCadastro.cidade || null,
            cep: null,
            celular: null,
            cpf: null
        });

        console.log("Usuário criado com sucesso:", novoUsuario.id_usuario);
        delete req.session.dadosCadastro;

        req.session.user = {
            id_usuario: novoUsuario.id_usuario,
            email: novoUsuario.email,
            foto_perfil: novoUsuario.foto_perfil || null
        };
        req.flash("success", "Cadastro realizado com sucesso! Bem-vindo ao NitrusLeaf!");
        return req.session.save((err) => {
            if (err) {
                console.error("Erro ao salvar sessão:", err);
                req.flash("danger", "Erro ao finalizar sessão de usuário.");
                return res.redirect("/");
            }
            res.redirect("/home");
        });

    } catch (error) {
        console.error("Erro no cadastro final:", error);
        req.flash("danger", "Erro interno do servidor.");
        const messages = {
            success: req.flash('success'),
            danger: req.flash('danger'),
            error: req.flash('error'),
            warning: req.flash('warning'),
            info: req.flash('info')
        };
        res.render("cadastroLogin", {
            tipo_pessoa: dadosCadastro ? dadosCadastro.tipo_pessoa : '',
            nome: dadosCadastro ? dadosCadastro.nome || '' : '',
            sobrenome: dadosCadastro ? dadosCadastro.sobrenome || '' : '',
            telefone: dadosCadastro ? dadosCadastro.telefone || '' : '',
            email: dadosCadastro ? dadosCadastro.email || '' : '',
            cnpj: dadosCadastro ? dadosCadastro.cnpj || '' : '',
            nome_fantasia: dadosCadastro ? dadosCadastro.nome_fantasia || '' : '',
            bairro: dadosCadastro ? dadosCadastro.bairro || '' : '',
            numero: dadosCadastro ? dadosCadastro.numero || '' : '',
            logradouro: dadosCadastro ? dadosCadastro.logradouro || '' : '',
            cidade: dadosCadastro ? dadosCadastro.cidade || '' : '',
            messages
        });
    }
});

function Auth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.flash("danger", "Você precisa estar logado para acessar esta página.");
        res.redirect("/login");
    }
}

router.get("/usuarios", Auth, async (req, res) => {
    try {
        const usuarios = await Usuarios.findAll({
            include: {
                model: Propriedades,
                as: 'propriedades',
                include: {
                    model: Talhoes,
                    as: 'talhoes',
                    include: {
                        model: Pes,
                        as: 'pes',
                    },
                },
            },
        });

        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

router.get("/usuarios/:id", Auth, async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuarios.findByPk(id, {
            include: {
                model: Propriedades,
                as: 'propriedades',
                include: {
                    model: Talhoes,
                    as: 'talhoes',
                    include: {
                        model: Pes,
                        as: 'pes',
                    },
                },
            },
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }
});

export default router;

// Rota para deletar conta do usuário logado (remove dependências e encerra sessão)
router.post('/usuarios/delete-account', Auth, async (req, res) => {
    const userId = req.session.user && req.session.user.id_usuario;
    if (!userId) {
        req.flash('danger', 'Usuário não autenticado.');
        return res.redirect('/perfil');
    }

    try {
        // Busca propriedades do usuário
        const propriedades = await Propriedades.findAll({ where: { id_usuario: userId } });
        const propriedadeIds = propriedades.map(p => p.id_propriedade);

        // Para cada propriedade, removemos alqueires, talhões, pés, relatórios e fotos relacionados
        if (propriedadeIds.length > 0) {
            // Apaga alqueires
            await Alqueires.destroy({ where: { id_propriedade: propriedadeIds } });

            // Busca talhões dessas propriedades
            const talhoes = await Talhoes.findAll({ where: { id_propriedade: propriedadeIds } });
            const talhaoIds = talhoes.map(t => t.id_talhao);

            if (talhaoIds.length > 0) {
                // Busca pés associados aos talhões
                const pes = await Pes.findAll({ where: { id_talhao: talhaoIds } });
                const peIds = pes.map(p => p.id_pe);

                if (peIds.length > 0) {
                    // Deleta relatórios e fotos ligados aos pés
                    await Relatorios.destroy({ where: { id_pe: peIds } });
                    await Foto.destroy({ where: { id_pe: peIds } });
                }

                // Deleta fotos atreladas aos talhões
                await Foto.destroy({ where: { id_talhao: talhaoIds } });

                // Deleta os pés
                await Pes.destroy({ where: { id_talhao: talhaoIds } });

                // Deleta os talhões
                await Talhoes.destroy({ where: { id_propriedade: propriedadeIds } });
            }

            // Por fim, deleta as propriedades
            await Propriedades.destroy({ where: { id_propriedade: propriedadeIds } });
        }

        // Deleta o usuário
        await Usuarios.destroy({ where: { id_usuario: userId } });

        // Destroi sessão e redireciona para página inicial
        req.session.destroy(err => {
            if (err) console.error('Erro ao destruir sessão após exclusão de conta:', err);
            res.redirect('/');
        });
    } catch (error) {
        console.error('Erro ao deletar conta do usuário:', error);
        req.flash('danger', 'Erro ao deletar conta. Tente novamente mais tarde.');
        res.redirect('/perfil');
    }
});