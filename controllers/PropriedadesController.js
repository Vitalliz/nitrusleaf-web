import express from 'express';
const router = express.Router();
import Propriedades from "../models/Propriedades.js";

// ROTA PARA LISTAR TODAS AS PROPRIEDADES
router.get("/propriedades", (req, res) => {
    Propriedades.findAll()
        .then(propriedades => {
            res.render("propriedades", {
                propriedades: propriedades
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao listar propriedades.");
        });
});

// ROTA PARA CRIAR NOVA PROPRIEDADE
router.post("/propriedades/new", (req, res) => {
    const { nome, id_usuario, talhoes_registrados, total_pes, pes_analisados, pes_diagnosticados } = req.body;

    Propriedades.create({
        nome,
        id_usuario,
        talhoes_registrados,
        total_pes,
        pes_analisados,
        pes_diagnosticados
    })
    .then(() => {
        res.redirect("/propriedades");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar propriedade.");
    });
});

// ROTA PARA EXCLUIR PROPRIEDADE
router.get("/propriedades/delete/:id?", (req, res) => {
    const id = req.params.id;

    Propriedades.destroy({
        where: { id_propriedade: id }
    })
    .then(() => {
        res.redirect("/propriedades");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir propriedade.");
    });
});

// ROTA DE EDIÇÃO DE PROPRIEDADE
router.get("/propriedades/edit/:id", (req, res) => {
    const id = req.params.id;

    Propriedades.findByPk(id)
        .then((propriedade) => {
            res.render("propriedadesEdit", {
                propriedade: propriedade,
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao buscar propriedade.");
        });
});

// ROTA PARA ALTERAÇÃO DE PROPRIEDADE
router.post("/propriedades/update", (req, res) => {
    const { id_propriedade, nome, id_usuario, talhoes_registrados, total_pes, pes_analisados, pes_diagnosticados } = req.body;

    Propriedades.update(
        { nome, id_usuario, talhoes_registrados, total_pes, pes_analisados, pes_diagnosticados },
        { where: { id_propriedade } }
    )
    .then(() => {
        res.redirect("/propriedades");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar propriedade.");
    });
});

export default router;
