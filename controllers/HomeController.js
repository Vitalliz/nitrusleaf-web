import express from 'express'
const router = express.Router()
import Home from "../models/Home.js"
import Auth from "../middleware/Auth.js"

router.get("/home", Auth,(req,res) => {
    Home.findAll().then(home => {
        res.render("home", {
            home: home,
            messages: req.flash(),
        })

    })

})

router.post("/home/new", Auth,(req, res) =>{
    const nome = req.body.nome
    Home.create({
        nome:nome,
    }).then(() => {
        res.redirect("/home")
    })
})

router.get("/home/delete/:id?", Auth,(req, res) => {

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
router.get("/home/edit/:id", Auth,(req, res) => {
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
router.post("/home/update", Auth,(req , res) => {
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