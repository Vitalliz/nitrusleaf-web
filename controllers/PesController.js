import express from 'express';
const router = express.Router();
import Pes from "../models/Pes.js";
import Talhoes from "../models/Talhoes.js"; // Para associar a tabela "talhoes"
import Auth from "../middleware/Auth.js"
// ROTA PARA LISTAR TODOS OS PES
router.get("/pes", Auth,(req, res) => {
    Pes.findAll({
        include: [
            { model: Talhoes, as: 'talhao' } // Incluir informações de 'Talhoes'
        ]
    })
    .then(pes => {
        res.render("pes", {
            pes: pes
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao listar pes.");
    });
});

// ROTA PARA CRIAR NOVO PES
router.post("/pes/new", Auth,(req, res) => {
    const { nome, id_talhao, situacao } = req.body;

    Pes.create({
        nome,
        id_talhao,
        situacao
    })
    .then(() => {
        res.redirect("/pes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar pes.");
    });
});

// ROTA PARA EXCLUIR PES
router.get("/pes/delete/:id?", Auth,(req, res) => {
    const id = req.params.id;

    Pes.destroy({
        where: { id_pe: id }
    })
    .then(() => {
        res.redirect("/pes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir pes.");
    });
});

// ROTA DE EDIÇÃO DE PES
router.get("/pes/edit/:id", Auth,(req, res) => {
    const id = req.params.id;

    Pes.findByPk(id, {
        include: [
            { model: Talhoes, as: 'talhao' } // Incluir informações de 'Talhoes'
        ]
    })
    .then((pes) => {
        res.render("pesEdit", {
            pes: pes,
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao buscar pes.");
    });
});

// ROTA PARA ALTERAÇÃO DE PES
router.post("/pes/update", Auth,(req, res) => {
    const { id_pe, nome, id_talhao, situacao } = req.body;

    Pes.update(
        { nome, id_talhao, situacao },
        { where: { id_pe } }
    )
    .then(() => {
        res.redirect("/pes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar pes.");
    });
});

export default router;
