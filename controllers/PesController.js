import express from 'express';
const router = express.Router();
import Pes from "../models/Pes.js";
import Talhoes from "../models/Talhoes.js"; // Para associar a tabela "talhoes"
import Propriedades from "../models/Propriedades.js"; // Para associar com propriedades
import Auth from "../middleware/Auth.js";

// ROTA PARA LISTAR TODOS OS PES
router.get("/cadastroPes/:id", Auth, (req, res) => {
    req.session.id_talhao = req.params.id; // Salva o ID do talhão na sessão
    res.redirect("/cadastroPes");
});

router.get("/cadastroPes", Auth, validarTalhao,async (req, res) => {
    const id_talhao = req.session.id_talhao;
    const userId = req.session.user.id_usuario;

    if (!id_talhao) {
        return res.status(400).send("Nenhum talhão selecionado.");
    }

    try {
        // Valida que o talhão pertence ao usuário logado
        const talhao = await Talhoes.findOne({
            where: { id_talhao },
            include: {
                model: Propriedades,
                as: 'propriedade',
                where: { id_usuario: userId },
            },
        });

        if (!talhao) {
            return res.status(403).send("Acesso negado.");
        }

        const pes = await Pes.findAll({
            where: { id_talhao },
            include: {
                model: Talhoes,
                as: 'talhao', // Certifique-se de usar o alias correto
            },
        });
        res.render("cadastroPes", { pes, talhao });
    } catch (error) {
        console.error("Erro ao listar pés:", error);
        res.status(500).send("Erro interno no servidor.");
    }
});



// ROTA PARA CRIAR NOVO PES
router.post("/pes/new", Auth, validarTalhao,async (req, res) => {
    const id_talhao = req.session.id_talhao;
    const { nome, situacao, deficiencia_cobre, deficiencia_manganes, outros, observacoes } = req.body;
    const userId = req.session.user.id_usuario;

    try {
        // Verifica se o talhão pertence ao usuário logado
        const talhao = await Talhoes.findOne({
            where: { id_talhao },
            include: {
                model: Propriedades,
                as: 'propriedade',
                where: { id_usuario: userId },
            },
        });

        if (!talhao) {
            return res.status(403).send("Acesso negado.");
        }

        // Cria o pé
        await Pes.create({
            nome,
            id_talhao,
            situacao,
            deficiencia_cobre,
            deficiencia_manganes,
            outros,
            observacoes,
        });

        res.redirect(`/cadastroPes/${id_talhao}`);
    } catch (error) {
        console.error("Erro ao criar pé:", error);
        res.status(500).send("Erro ao criar pé.");
    }
});

// ROTA PARA EXCLUIR PES
router.get("/pes/delete/:id", Auth, validarTalhao,async (req, res) => {
    const id = req.params.id;
    const id_talhao = req.session.id_talhao; // Obtém o talhão atual
    const userId = req.session.user.id_usuario;

    try {
        // Verifica se o pé pertence ao talhão e ao usuário logado
        const pe = await Pes.findOne({
            where: { id_pe: id, id_talhao },
            include: {
                model: Talhoes,
                as: 'talhao',
                include: {
                    model: Propriedades,
                    as: 'propriedade',
                    where: { id_usuario: userId },
                },
            },
        });

        if (!pe) {
            return res.status(403).send("Acesso negado.");
        }

        // Exclui o pé
        await Pes.destroy({ where: { id_pe: id } });
        res.redirect(`/cadastroPes/${id_talhao}`);
    } catch (error) {
        console.error("Erro ao excluir pé:", error);
        res.status(500).send("Erro ao excluir pé.");
    }
});

// ROTA PARA SAIR DO TALHÃO
router.get("/sairTalhao", Auth, (req, res) => {
    delete req.session.id_talhao; // Remove o talhão atual
    res.redirect("/historico"); // Redireciona para outra página
});

async function validarTalhao(req, res, next) {
    const id_talhao = req.params.id || req.session.id_talhao;
    const userId = req.session.user.id_usuario;

    try {
        const talhao = await Talhoes.findOne({
            where: { id_talhao },
            include: {
                model: Propriedades,
                as: 'propriedade',
                where: { id_usuario: userId },
            },
        });

        if (!talhao) {
            return res.status(403).send("Acesso negado.");
        }

        req.talhao = talhao; // Disponibiliza o talhão para a rota
        next();
    } catch (error) {
        console.error("Erro ao validar talhão:", error);
        res.status(500).send("Erro interno no servidor.");
    }
}


export default router;
