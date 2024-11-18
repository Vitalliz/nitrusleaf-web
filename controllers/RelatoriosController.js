import express from 'express';
const router = express.Router();
import Relatorios from "../models/Relatorios.js";
import Pes from "../models/Pes.js"; // Para associar a tabela "pes"
import Foto from "../models/Foto.js"; // Para associar a tabela "foto"

// ROTA PARA LISTAR TODOS OS RELATÓRIOS
router.get("/relatorios", (req, res) => {
    Relatorios.findAll({
        include: [
            { model: Pes, as: 'pe' },  // Incluir informações de 'Pes'
            { model: Foto, as: 'foto' }  // Incluir informações de 'Foto'
        ]
    })
        .then(relatorios => {
            res.render("relatorios", {
                relatorios: relatorios
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao listar relatórios.");
        });
});

// ROTA PARA CRIAR NOVO RELATÓRIO
router.post("/relatorios/new", (req, res) => {
    const { id_pe, id_foto, deficiencia_cobre, deficiencia_manganes, outros, observacoes, data_analise } = req.body;

    Relatorios.create({
        id_pe,
        id_foto,
        deficiencia_cobre,
        deficiencia_manganes,
        outros,
        observacoes,
        data_analise
    })
        .then(() => {
            res.redirect("/relatorios");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao criar relatório.");
        });
});

// ROTA PARA EXCLUIR RELATÓRIO
router.get("/relatorios/delete/:id?", (req, res) => {
    const id = req.params.id;

    Relatorios.destroy({
        where: { id_relatorio: id }
    })
        .then(() => {
            res.redirect("/relatorios");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao excluir relatório.");
        });
});

// ROTA DE EDIÇÃO DE RELATÓRIO
router.get("/relatorios/edit/:id", (req, res) => {
    const id = req.params.id;

    Relatorios.findByPk(id, {
        include: [
            { model: Pes, as: 'pe' },
            { model: Foto, as: 'foto' }
        ]
    })
        .then((relatorio) => {
            res.render("relatoriosEdit", {
                relatorio: relatorio,
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao buscar relatório.");
        });
});

// ROTA PARA ALTERAÇÃO DE RELATÓRIO
router.post("/relatorios/update", (req, res) => {
    const { id_relatorio, id_pe, id_foto, deficiencia_cobre, deficiencia_manganes, outros, observacoes, data_analise } = req.body;

    Relatorios.update(
        { id_pe, id_foto, deficiencia_cobre, deficiencia_manganes, outros, observacoes, data_analise },
        { where: { id_relatorio } }
    )
        .then(() => {
            res.redirect("/relatorios");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao atualizar relatório.");
        });
});

export default router;
