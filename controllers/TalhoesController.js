import express from 'express';
const router = express.Router();
import Talhoes from "../models/Talhoes.js";

// ROTA PARA LISTAR TODOS OS TALHÕES
router.get("/talhoes", (req, res) => {
    Talhoes.findAll()
        .then(talhoes => {
            res.render("talhoes", {
                talhoes: talhoes
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao listar talhões.");
        });
});

// ROTA PARA CRIAR NOVO TALHÃO
router.post("/talhoes/new", (req, res) => {
    const { nome, especie_fruta, id_propriedade } = req.body;
    
    Talhoes.create({
        nome,
        especie_fruta,
        id_propriedade
    })
    .then(() => {
        res.redirect("/talhoes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar talhão.");
    });
});

// ROTA PARA EXCLUIR TALHÃO
router.get("/talhoes/delete/:id?", (req, res) => {
    const id = req.params.id;

    Talhoes.destroy({
        where: { id_talhao: id }
    })
    .then(() => {
        res.redirect("/talhoes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir talhão.");
    });
});

// ROTA DE EDIÇÃO DE TALHÃO
router.get("/talhoes/edit/:id", (req, res) => {
    const id = req.params.id;

    Talhoes.findByPk(id)
        .then((talhao) => {
            res.render("talhoesEdit", {
                talhao: talhao,
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao buscar talhão.");
        });
});

// ROTA PARA ALTERAÇÃO DE TALHÃO
router.post("/talhoes/update", (req, res) => {
    const { id_talhao, nome, especie_fruta, id_propriedade } = req.body;

    Talhoes.update(
        { nome, especie_fruta, id_propriedade },
        { where: { id_talhao } }
    )
    .then(() => {
        res.redirect("/talhoes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar talhão.");
    });
});

export default router;
