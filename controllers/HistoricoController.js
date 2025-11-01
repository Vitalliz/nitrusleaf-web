import express from 'express';
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
import Alqueires from "../models/Alqueires.js";
import Pes from "../models/Pes.js";
import Auth from "../middleware/Auth.js";

const router = express.Router();

// ROTA PARA EXIBIR O HISTÓRICO
router.get("/historico", Auth, async (req, res) => {
    try {
        // Busca propriedades associadas ao usuário
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [['nome', 'ASC']]
        });

        let propriedadeSelecionada = req.session.propriedadeSelecionada || (propriedades.length > 0 ? propriedades[0].id_propriedade.toString() : null);
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }
        if (propriedadeSelecionada) {
            req.session.propriedadeSelecionada = propriedadeSelecionada;
        }

        // Resumo da propriedade
        let resumo = {
            talhoes_registrados: 0,
            total_pes: 0,
            pes_diagnosticados: 0,
            pes_analisados: 0
        };

        if (propriedadeSelecionada) {
            const propriedade = await Propriedades.findByPk(propriedadeSelecionada);
            if (propriedade) {
                resumo.talhoes_registrados = propriedade.talhoes_registrados;
                resumo.total_pes = propriedade.total_pes;
                resumo.pes_diagnosticados = propriedade.pes_diagnosticados;
                resumo.pes_analisados = propriedade.pes_analisados;
            }
        }

        // Busca os alqueires da propriedade selecionada
        let alqueires = [];
        if (propriedadeSelecionada) {
            alqueires = await Alqueires.findAll({
                where: { id_propriedade: propriedadeSelecionada },
                order: [['nome', 'ASC']]
            });
        }

        // Busca os talhoes de cada alqueire
        for (let alqueire of alqueires) {
            const talhoes = await Talhoes.findAll({
                where: { id_alqueire: alqueire.id_alqueire },
                order: [['createdAt', 'DESC']]
            });
            // Adiciona dados agregados para cada talhão
            alqueire.dataValues.talhoes = talhoes.map(talhao => ({
                ...talhao.dataValues,
                total_pes: talhao.total_pes || 0,
                pes_analisados: talhao.pes_analisados || 0,
                createdAt: talhao.createdAt
            }));
            alqueire.dataValues.total_talhoes = talhoes.length;
            alqueire.dataValues.total_pes = talhoes.reduce((acc, t) => acc + (t.total_pes || 0), 0);
            alqueire.dataValues.pes_analisados = talhoes.reduce((acc, t) => acc + (t.pes_analisados || 0), 0);
        }

        res.render('historico', {
            propriedades,
            propriedadeSelecionada,
            resumo,
            alqueires
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        res.status(500).send('Erro ao carregar histórico.');
    }
});

// ROTA PARA EXCLUIR UM REGISTRO DO HISTÓRICO
router.get("/historico/delete/:id", Auth, async (req, res) => {
    const { id } = req.params;

    try {
        await Historico.destroy({
            where: { id },
        });

        res.redirect("/historico");
    } catch (error) {
        console.error("Erro ao excluir registro do histórico:", error);
        res.status(500).send("Erro ao excluir registro.");
    }
});

// ROTA PARA EDITAR UM REGISTRO DO HISTÓRICO
router.get("/historico/edit/:id", Auth, async (req, res) => {
    const { id } = req.params;

    try {
        const historico = await Historico.findByPk(id);

        res.render("historicoEdit", {
            historico,
        });
    } catch (error) {
        console.error("Erro ao buscar registro do histórico:", error);
        res.status(500).send("Erro ao buscar registro.");
    }
});

// ROTA PARA ATUALIZAR UM REGISTRO DO HISTÓRICO
router.post("/historico/update/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const { talhao, descricao } = req.body;

    try {
        await Historico.update(
            {
                talhao,
                descricao,
            },
            { where: { id } }
        );

        res.redirect("/historico");
    } catch (error) {
        console.error("Erro ao atualizar registro do histórico:", error);
        res.status(500).send("Erro ao atualizar registro.");
    }
});

router.post("/historico/selecionar-propriedade", Auth, async (req, res) => {
    const { id_propriedade } = req.body;

    try {
        // Valida se a propriedade pertence ao usuário logado
        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario,
            },
        });

        if (!propriedade) {
            return res.status(403).send("Acesso negado.");
        }

        // Atualiza a propriedade selecionada na sessão
        req.session.propriedadeSelecionada = id_propriedade;

        res.status(200).send("Propriedade selecionada atualizada com sucesso.");
    } catch (error) {
        console.error("Erro ao selecionar propriedade:", error);
        res.status(500).send("Erro ao selecionar propriedade.");
    }
});

export default router;
