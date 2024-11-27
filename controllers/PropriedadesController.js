import express from 'express';
const router = express.Router();
import Propriedades from "../models/Propriedades.js";
import Auth from "../middleware/Auth.js"

// ROTA PARA LISTAR TODAS AS PROPRIEDADES
router.get("/cadastroPropriedade", Auth,(req, res) => {
    Propriedades.findAll()
    .then(Propriedades => {
            const NomepOrdenado = Propriedades.sort((a, b) => {
                return a.nome.localeCompare(b.nome);
            });
            
            res.render("cadastroPropriedade", {
                Propriedades : NomepOrdenado,
                id_usuario: req.session.user.id_usuario 
            });
        })
    .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao listar propriedades.");
        });
});



// ROTA PARA CRIAR NOVA PROPRIEDADE
router.post("/propriedades/new", Auth,(req, res) => {
    const { nome, cep, logradouro, numero, bairro, cidade, talhoes_registrados, total_pes, pes_analisados, pes_diagnosticados } = req.body;
    const id_usuario = req.session.user.id_usuario; // Garante que o ID seja da sessão
    Propriedades.create({
        nome,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        id_usuario,
        talhoes_registrados,
        total_pes,
        pes_analisados,
        pes_diagnosticados
    })
    .then(() => {
        res.redirect("/cadastroPropriedade");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar propriedade.");
    });
});

// ROTA PARA EXCLUIR PROPRIEDADE
router.get("/propriedades/delete/:id?", Auth,(req, res) => {
    const id = req.params.id;

    Propriedades.destroy({
        where: { id_propriedade: id }
    })
    .then(() => {
        res.redirect("/cadastroPropriedade");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir propriedade.");
    });
});

// ROTA DE EDIÇÃO DE PROPRIEDADE
router.get("/propriedades/edit/:id", Auth,(req, res) => {
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
router.post("/propriedades/update", Auth,(req, res) => {
    const {id_propriedade, nome, cep, logradouro, numero, bairro, cidade, talhoes_registrados, total_pes, pes_analisados, pes_diagnosticados} = req.body;

    Propriedades.update(
        { nome, cep, logradouro, numero, bairro, cidade, talhoes_registrados, total_pes, pes_analisados, pes_diagnosticados },
        { where: { id_propriedade } }
    )
    .then(() => {
        res.redirect("/cadastroPropriedade");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar propriedade.");
    });
});

export default router;
