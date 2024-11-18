import express from 'express';
const router = express.Router();
import Foto from "../models/Foto.js";
import Pes from "../models/Pes.js"; // Para associar a tabela "pes"
import Talhoes from "../models/Talhoes.js"; // Para associar a tabela "talhoes"

// ROTA PARA LISTAR TODAS AS FOTOS
router.get("/fotos", (req, res) => {
    Foto.findAll({
        include: [
            { model: Pes, as: 'pe' },  // Incluir informações de 'Pes'
            { model: Talhoes, as: 'talhao' }  // Incluir informações de 'Talhoes'
        ]
    })
    .then(fotos => {
        res.render("fotos", {
            fotos: fotos
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao listar fotos.");
    });
});

// ROTA PARA CRIAR NOVA FOTO
router.post("/fotos/new", (req, res) => {
    const { id_pe, id_talhao, url, data_tiragem, resultado_analise } = req.body;

    Foto.create({
        id_pe,
        id_talhao,
        url,
        data_tiragem,
        resultado_analise
    })
    .then(() => {
        res.redirect("/fotos");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar foto.");
    });
});

// ROTA PARA EXCLUIR FOTO
router.get("/fotos/delete/:id?", (req, res) => {
    const id = req.params.id;

    Foto.destroy({
        where: { id_foto: id }
    })
    .then(() => {
        res.redirect("/fotos");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir foto.");
    });
});

// ROTA DE EDIÇÃO DE FOTO
router.get("/fotos/edit/:id", (req, res) => {
    const id = req.params.id;

    Foto.findByPk(id, {
        include: [
            { model: Pes, as: 'pe' },
            { model: Talhoes, as: 'talhao' }
        ]
    })
    .then((foto) => {
        res.render("fotosEdit", {
            foto: foto,
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao buscar foto.");
    });
});

// ROTA PARA ALTERAÇÃO DE FOTO
router.post("/fotos/update", (req, res) => {
    const { id_foto, id_pe, id_talhao, url, data_tiragem, resultado_analise } = req.body;

    Foto.update(
        { id_pe, id_talhao, url, data_tiragem, resultado_analise },
        { where: { id_foto } }
    )
    .then(() => {
        res.redirect("/fotos");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar foto.");
    });
});

export default router;
