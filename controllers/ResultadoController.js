import express from 'express'
import Talhoes from "../models/Talhoes.js"
import Pes from "../models/Pes.js"
import Auth from "../middleware/Auth.js"

const router = express.Router()

// ROTA HISTAL
router.get("/resultados", Auth,(req, res) =>{
    const propriedadeSelecionada = req.session.propriedadeSelecionada || null;
    Promise.all([
        Talhoes.findAll({where: id_propriedade = propriedadeSelecionada}),
        Pes.findAll({where: pe.id_talhao = talhao.id_talhao})
    ])
        res.render("resultados", {talhao,pe})
})

router.post("/resultados/new", Auth,(req, res) => {

})

router.get("/resultados/delete/:id", (req, res) => {

})

router.get("/resultados/edit/:id", (req, res) => {

})

router.post("/resultados/update/:id", (req, res) => {

})

export default router;