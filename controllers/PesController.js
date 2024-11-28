import express from 'express';
const router = express.Router();
import Pes from "../models/Pes.js";
import Talhoes from "../models/Talhoes.js"; // Para associar a tabela "talhoes"
import Auth from "../middleware/Auth.js"
// ROTA PARA LISTAR TODOS OS PES
router.get("/cadastroPes", Auth, (req, res) => {
    // Usando Promise.all para buscar talhões e propriedades
    Promise.all([
        Pes.findAll({
            include: {
                model: Talhoes,
                as: 'talhao', // Alias definido no relacionamento
            }
        }),
        Talhoes.findAll()  // Buscando todas as propriedades para ordená-las
    ])
    .then(([pes, talhoes]) => {

        // Renderiza a página com os talhões e propriedades ordenadas
        res.render("cadastroPes", {
            pes: pes,
            talhoes: talhoes,
        });
    })
    .catch((error) => {
        console.error("Erro ao listar talhões e propriedades:", error);
        res.status(500).send("Erro ao listar talhões.");
    });
});

// ROTA PARA CRIAR NOVO PES
router.post("/pes/new/:id", Auth,(req, res) => {
    const { nome, id_talhao, situacao, deficiencia_cobre, deficiencia_manganes, outros, observacoes } = req.body;

    Pes.create({
        nome,
        id_talhao,
        situacao,
        deficiencia_cobre,
        deficiencia_manganes,
        outros,
        observacoes,
    })
    .then(() => {
        res.redirect("/cadastroPes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar pes.");
    });
});

// ROTA PARA EXCLUIR PES
router.get("/pes/delete/:id?", Auth,(req, res) => {
    const id = req.params.id;

    Pes.destroy({
        where: { id_pe: id }
    })
    .then(() => {
        res.redirect("/pes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir pes.");
    });
});

// ROTA DE EDIÇÃO DE PES
router.get("/pes/edit/:id", Auth,(req, res) => {
    const id = req.params.id;

    Pes.findByPk(id, {
        include: [
            { model: Talhoes, as: 'talhao' } // Incluir informações de 'Talhoes'
        ]
    })
    .then((pes) => {
        res.render("pesEdit", {
            pes: pes,
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao buscar pes.");
    });
});

// ROTA PARA ALTERAÇÃO DE PES
router.post("/pes/update", Auth,(req, res) => {
    const { id_pe, nome, id_talhao, situacao } = req.body;

    Pes.update(
        { nome, id_talhao, situacao },
        { where: { id_pe } }
    )
    .then(() => {
        res.redirect("/pes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar pes.");
    });
});

export default router;
