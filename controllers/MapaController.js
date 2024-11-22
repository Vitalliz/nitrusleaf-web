import express from 'express'
const router = express.Router()



router.get("/mapa", function(req,res){
        res.render("mapa")
});

router.post("/mapa/new", (req, res) =>{
    const nome = req.body.nome
        res.redirect("/mapa")
});

router.get("/mapa/delete/:id?", (req, res) => {
    res.redirect("/mapa")
});

export default router;