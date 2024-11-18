import express from 'express'
const router = express.Router()
import Home from "../models/Home.js"


router.get("/home", function(req,res){
    Home.findAll().then(home => {
        res.render("home", {
            home: home
        })

    })

})

router.post("/home/new", (req, res) =>{
    const nome = req.body.nome
    Home.create({
        nome:nome,
    }).then(() => {
        res.redirect("/home")
    })
})

router.get("/home/delete/:id?", (req, res) => {

const id = req.params.id

Home.destroy({

    where:{
        id : id
    }
}).then(() => {
    res.redirect("/home/")
}).catch(error => {

    console.log(error)
})

})
//ROTA DE EDIÇÃO DE HOME
router.get("/home/edit/:id", (req, res) => {
   const id = req.params.id
    Home.findByPk(id).then((home)=> {
        res.render("homeEdit",{
            nome: nome,
        });
    }).catch((error) => {
        console.log(error)
    })
});

//ROTA DE ALTERAÇÃO DE HOME
router.post("/home/update", (req , res) => {
    const id = req.body.id
    const nome = req.body.nome

    Home.update(
    {
        nome: nome,
    },
    {where: {id : id}}
).then(() => {
    res.redirect("/home")
}).catch((error) => {
    console.log(error)
})
})

export default router;