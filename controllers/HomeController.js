import express from 'express'
const router = express.Router()
import Home from "../models/Home.js"
import Auth from "../middleware/Auth.js"
import Propriedades from "../models/Propriedades.js"
import Talhoes from "../models/Talhoes.js"
import Pes from "../models/Pes.js"
import Relatorios from "../models/Relatorios.js"

router.get("/home", Auth,(req,res) => {
    const propriedadeSelecionada = req.session.propriedadeSelecionada || null;
    
    Promise.all([
        Propriedades.findAll({where: { id_usuario: req.session.user.id_usuario }}),
        propriedadeSelecionada ? Talhoes.findAll({where: { id_propriedade: propriedadeSelecionada }}) : Promise.resolve([]),
        propriedadeSelecionada ? Pes.findAll({where: { id_talhao: { [require('sequelize').Op.in]: [] }}}) : Promise.resolve([]),
        propriedadeSelecionada ? Relatorios.findAll() : Promise.resolve([])
    ])
    .then(([propriedades, talhoes, pes, relatorios]) => {
        const NomepOrdenado = propriedades.sort((a, b) => {
            return a.nome.localeCompare(b.nome);
        });
        
        // Calcular estatísticas baseadas nos dados reais
        let totalPesAnalisados = 0;
        let totalOcorrencias = 0;
        let mensagemStatus = "Nenhuma propriedade selecionada";
        
        if (propriedadeSelecionada && talhoes.length > 0) {
            // Buscar pés dos talhões da propriedade selecionada
            const talhaoIds = talhoes.map(t => t.id_talhao);
            
            return Pes.findAll({where: { id_talhao: { [require('sequelize').Op.in]: talhaoIds }}})
                .then(pesPropriedade => {
                    totalPesAnalisados = pesPropriedade.length;
                    
                    // Buscar relatórios dos pés analisados
                    const peIds = pesPropriedade.map(p => p.id_pe);
                    
                    return Relatorios.findAll({where: { id_pe: { [require('sequelize').Op.in]: peIds }}})
                        .then(relatoriosPropriedade => {
                            totalOcorrencias = relatoriosPropriedade.length;
                            
                            if (totalPesAnalisados === 0) {
                                mensagemStatus = "Nenhum pé analisado nesta propriedade";
                            } else if (totalOcorrencias === 0) {
                                mensagemStatus = "Nenhuma ocorrência recente";
                            } else {
                                mensagemStatus = `${totalOcorrencias} ocorrência(s) encontrada(s) em ${totalPesAnalisados} pé(s) analisado(s)`;
                            }
                            
                            res.render("home", {
                                Propriedades: NomepOrdenado,
                                propriedadeSelecionada,
                                totalPesAnalisados,
                                totalOcorrencias,
                                mensagemStatus
                            });
                        });
                });
        } else if (propriedades.length === 0) {
            mensagemStatus = "Nenhuma propriedade cadastrada";
        }
        
        res.render("home", {
            Propriedades: NomepOrdenado,
            propriedadeSelecionada,
            totalPesAnalisados,
            totalOcorrencias,
            mensagemStatus
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