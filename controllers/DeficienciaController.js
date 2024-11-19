import express from 'express'
import Deficiencia from "../models/Deficiencia.js"

const router = express.Router()

// ROTA HISTAL
router.get("/deficiencia", function (req, res) {
    Deficiencia.findAll().then(deficiencia => {
        res.render("deficiencia", { deficiencia: deficiencia })
    })

})
router.post("/deficiencia/new", function (req, res) {
    try {
        const dDados = req.body;
        const deficiencia = deficiencia.create({ p: dDados.p, s: dDados.s})
        res.s(201).send("Cadastrado")
    } catch (e) {
        console.error("erro", e);
        res.s(400);
    }
})

router.get("/deficiencia/delete/:id", (req, res) => {
    const id = req.params.id
    Deficiencia.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/deficiencia")
    })
})

router.get("/deficiencia/edit/:id", (req, res) => {
    const id = req.params.id
    Deficiencia.findByPk(id).then(function (deficiencia) {
        res.render("deficienciaEdit", {
            deficiencia: deficiencia
        })
    })
})

router.post("/deficiencia/update/:id", (req, res) => {
    const id = req.params.id
    const p = req.body.p
    const s = req.body.s
    Deficiencia.update(
        {
            p: p,
            s: s,
            
        },
        { where: { id: id } }
    ).then(() => {
        res.redirect("/deficiencia")
    })
})

export default router;