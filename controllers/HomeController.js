import express from 'express'
const router = express.Router()
import Home from "../models/Home.js"
import Auth from "../middleware/Auth.js"
import Propriedades from "../models/Propriedades.js"
router.get("/home", Auth,(req,res) => {
    const propriedadeSelecionada = req.session.propriedadeSelecionada || null;
    Propriedades.findAll({where: { id_usuario: req.session.user.id_usuario }})
    .then(Propriedades => {
            const NomepOrdenado = Propriedades.sort((a, b) => {
                return a.nome.localeCompare(b.nome);
            });
            
            res.render("home", {
                Propriedades : NomepOrdenado,
                propriedadeSelecionada
            });
        })
    .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao listar propriedades.");
        }); 
});

router.post('/home', Auth, (req, res) => {
    const { id_propriedade } = req.body;

    if (!id_propriedade) {
        return res.status(400).json({ error: 'ID da propriedade não fornecido.' });
    }

    // Salvar na sessão para manter a propriedade selecionada
    req.session.propriedadeSelecionada = id_propriedade;

    res.status(200).json({ success: true, message: 'Propriedade selecionada salva na sessão.' });
});


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