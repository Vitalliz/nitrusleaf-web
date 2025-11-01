import express from 'express';
import HisTal from "../models/Histal.js"; 
import Auth from "../middleware/Auth.js";
import Pes from "../models/Pes.js";
import Talhoes from "../models/Talhoes.js";
import Propriedades from "../models/Propriedades.js";

const router = express.Router();

// Redireciona para a rota principal após salvar o talhão na sessão
router.get("/histal/:id", Auth, (req, res) => {
    req.session.id_talhao = req.params.id; // Salva o ID do talhão na sessão
    res.redirect("/histal");
});

// ROTA HISTAL
router.get("/histal", Auth, async (req, res) => {
    const id_talhao = req.session.id_talhao; // Recupera o ID do talhão da sessão
    const userId = req.session.user.id_usuario; // ID do usuário logado

    if (!id_talhao) {
        return res.status(400).send("Nenhum talhão selecionado.");
    }

    try {
        // Verifica se o talhão pertence ao usuário logado
        const talhao = await Talhoes.findOne({
            where: { id_talhao },
            include: {
                model: Propriedades,
                as: 'propriedade', // Alias correto da associação
                where: { id_usuario: userId }, // Garante que pertence ao usuário logado
            },
        });

        if (!talhao) {
            return res.status(403).send("Acesso negado."); // Retorna erro se o talhão não pertencer ao usuário
        }

        // Busca os pés e o histórico associados ao talhão
        const [histal, pes] = await Promise.all([
            HisTal.findAll({
                where: { id_talhao },
                order: [['createdAt', 'DESC']], // Ordena os históricos por data
            }),
            Pes.findAll({
                where: { id_talhao },
            }),
        ]);

        res.render("histal", { histal, pes, talhao });
    } catch (error) {
        console.error("Erro ao listar histórico:", error);
        res.status(500).send("Erro ao listar histórico.");
    }
});


// Função para criar novo registro
router.post("/histal/new", Auth, async (req, res) => {
    const { id_talhao, planta, status } = req.body;
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

        // Cria o registro no histórico
        await HisTal.create({
            id_talhao,
            planta,
            status,
        });

        res.redirect(`/histal/${id_talhao}`);
    } catch (error) {
        console.error("Erro ao criar histórico:", error);
        res.status(500).send("Erro ao criar histórico.");
    }
});

// Outras rotas mantêm a mesma lógica de validação
router.get("/histal/delete/:id", Auth, async (req, res) => {
    const id = req.params.id;

    try {
        const historico = await HisTal.findByPk(id, {
            include: {
                model: Talhoes,
                as: 'talhao',
                include: {
                    model: Propriedades,
                    as: 'propriedade',
                    where: { id_usuario: req.session.user.id_usuario },
                },
            },
        });

        if (!historico) {
            return res.status(403).send("Acesso negado.");
        }

        await HisTal.destroy({ where: { id } });
        res.redirect(`/histal/${historico.id_talhao}`);
    } catch (error) {
        console.error("Erro ao excluir histórico:", error);
        res.status(500).send("Erro ao excluir histórico.");
    }
});

export default router;
