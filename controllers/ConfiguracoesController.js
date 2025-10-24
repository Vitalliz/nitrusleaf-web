import express from 'express';
import Usuarios from "../models/Usuarios.js";

const router = express.Router();

// ROTA CONFIGURAÇÕES - Mostrar dados do usuário
router.get("/configuracoes", function (req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    Usuarios.findByPk(req.session.user.id_usuario).then(usuario => {
        res.render("configuracoes", { usuario: usuario });
    }).catch(error => {
        console.error('Erro ao buscar usuário:', error);
        res.redirect('/login');
    });
});

// ROTA UPDATE ALTERAÇÕES DADOS PAG. CONFIGURAÇÕES
router.post("/configuracoes/update", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id_usuario;
    const {
        nome,
        sobrenome,
        email,
        telefone,
        celular,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        cpf,
        cnpj,
        nome_fantasia
    } = req.body;

    Usuarios.update(
        {
            nome: nome,
            sobrenome: sobrenome,
            email: email,
            telefone: telefone,
            celular: celular,
            cep: cep,
            logradouro: logradouro,
            numero: numero,
            bairro: bairro,
            cidade: cidade,
            cpf: cpf,
            cnpj: cnpj,
            nome_fantasia: nome_fantasia
        },
        { where: { id_usuario: userId } }
    ).then(() => {
        req.flash('success', 'Dados atualizados com sucesso!');
        res.redirect("/configuracoes");
    }).catch(error => {
        console.error('Erro ao atualizar usuário:', error);
        req.flash('error', 'Erro ao atualizar dados. Tente novamente.');
        res.redirect("/configuracoes");
    });
});

// ROTA PARA ALTERAR SENHA
router.post("/configuracoes/change-password", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id_usuario;
    const { senha_atual, nova_senha, confirmar_senha } = req.body;

    if (nova_senha !== confirmar_senha) {
        req.flash('error', 'Nova senha e confirmação não coincidem.');
        return res.redirect("/configuracoes");
    }

    Usuarios.findByPk(userId).then(usuario => {
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado.');
            return res.redirect("/configuracoes");
        }

        // Aqui você pode adicionar verificação da senha atual se necessário
        return Usuarios.update(
            { senha: nova_senha },
            { where: { id_usuario: userId } }
        );
    }).then(() => {
        req.flash('success', 'Senha alterada com sucesso!');
        res.redirect("/configuracoes");
    }).catch(error => {
        console.error('Erro ao alterar senha:', error);
        req.flash('error', 'Erro ao alterar senha. Tente novamente.');
        res.redirect("/configuracoes");
    });
});

export default router;