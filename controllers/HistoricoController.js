import express from 'express';
import Historico from "../models/Historico.js"
const router = express.Router()

// ROTA PEDIDOS
router.get("/historico", function (req, res) {
    Historico.findAll().then(historico => {
        res.render("historico", { historico })
    })

})

router.post("/historico/new", function (req, res) {
    try {
        const historicoDados = req.body;
        const historico = Historico.create({ talhao: historicoDados.talhao, descricao: pedidoDados.descricao  })
        res.status(201).send("Cadastrado")
    } catch (e) {
        console.error("erro", e);
        res.status(400);
    }
})
router.get("/historico/delete/:id", (req, res) => {
    const id = req.params.id
    Historico.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/historico")
    })
})

router.get("/historico/edit/:id", (req, res) => {
    const id = req.params.id
    Historico.findByPk(id).then(function (historico) {
        res.render("historicoEdit", {
            historico: historico
        })
    })
})

router.post("/historico/update/:id", (req, res) => {
    const id = req.params.id
    const talhao = req.body.talhao
    const descricao = req.body.descricao
        Historico.update(
        {
            talhao : talhao,
            descricao: descricao
        },
        { where: { id: id } }
    ).then(() => {
        res.redirect("/historico")
    })
})

export default router;