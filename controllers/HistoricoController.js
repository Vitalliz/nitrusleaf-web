import express from 'express';
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
import Auth from "../middleware/Auth.js";

const router = express.Router();

// ROTA PARA EXIBIR O HISTÓRICO
router.get("/historico", Auth, async (req, res) => {
    const propriedadeSelecionada = req.session.propriedadeSelecionada || null;

    try {
        // Busca propriedades associadas ao usuário
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
        });

        let propriedade = null;
        let talhoes = [];
        if (propriedadeSelecionada) {
            // Busca a propriedade selecionada
            propriedade = await Propriedades.findOne({
                where: { id_propriedade: propriedadeSelecionada },
            });

            if (propriedade) {
                // Calcula os talhões registrados e total de pés
                propriedade.talhoes_registrados = await Talhoes.count({
                    where: { id_propriedade: propriedadeSelecionada },
                });

                propriedade.total_pes = await Talhoes.sum("total_pes", {
                    where: { id_propriedade: propriedadeSelecionada },
                }) || 0;

                // Busca os talhões da propriedade
                talhoes = await Talhoes.findAll({
                    where: { id_propriedade: propriedadeSelecionada },
                });
            }
        }

        // Ordena as propriedades pelo nome
        const NomepOrdenado = propriedades.sort((a, b) => a.nome.localeCompare(b.nome));

        // Renderiza a página com os dados recuperados
        res.render("historico", {
            talhoes,
            propriedade: propriedade || { talhoes_registrados: 0, total_pes: 0 },
            propriedades: NomepOrdenado,
            propriedadeSelecionada,
        });
    } catch (error) {
        console.error("Erro ao listar talhões e propriedades:", error);
        res.status(500).send("Erro ao listar talhões.");
    }
});


// ROTA PARA BUSCAR TALHÕES DE UMA PROPRIEDADE ESPECÍFICA
router.get("/historico/talhoes/:id_propriedade", Auth, async (req, res) => {
    const { id_propriedade } = req.params;

    try {
        const talhoes = await Talhoes.findAll({
            where: { id_propriedade },
        });

        res.json(talhoes); // Retorna os talhões em formato JSON
    } catch (error) {
        console.error("Erro ao buscar talhões:", error);
        res.status(500).json({ error: "Erro ao buscar talhões." });
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
