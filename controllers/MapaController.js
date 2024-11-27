import express from 'express'
const router = express.Router()
import Auth from "../middleware/Auth.js"
import Propriedades from "../models/Propriedades.js";

router.get("/mapa", Auth,(req, res) => {
    Propriedades.findAll()
    .then(Propriedades => {
            const NomepOrdenado = Propriedades.sort((a, b) => {
                return a.nome.localeCompare(b.nome);
            });
            
            res.render("mapa", {
                Propriedades : NomepOrdenado,
            });
        })
    .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao listar propriedades.");
        });    
});

router.post("/mapa/new", Auth,(req, res) => {
    const nome = req.body.nome
        res.redirect("/mapa")
});

router.get("/mapa/delete/:id?", Auth,(req, res) => {
    res.redirect("/mapa")
});

export default router;