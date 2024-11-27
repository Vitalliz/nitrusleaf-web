import express from 'express';
const router = express.Router();
import Talhoes from "../models/Talhoes.js";
import Auth from "../middleware/Auth.js";
import Propriedades from "../models/Propriedades.js";

// ROTA PARA LISTAR TALHÕES
router.get("/talhoes", Auth, (req, res) => {
    // Usando Promise.all para buscar talhões e propriedades
    Promise.all([
        Talhoes.findAll({
            include: {
                model: Propriedades,
                attributes: ['nome'], // Apenas o nome da propriedade
            }
        }),
        Propriedades.findAll()  // Buscando todas as propriedades para ordená-las
    ])
    .then(([talhoes, propriedades]) => {
        // Ordena as propriedades pelo nome
        const NomepOrdenado = propriedades.sort((a, b) => {
            return a.nome.localeCompare(b.nome);
        });

        // Renderiza a página com os talhões e propriedades ordenadas
        res.render("talhoes", {
            Talhoes: talhoes,
            Propriedades: NomepOrdenado,
        });
    })
    .catch((error) => {
        console.error("Erro ao listar talhões e propriedades:", error);
        res.status(500).send("Erro ao listar talhões.");
    });
});

// ROTA PARA CRIAR NOVO TALHÃO
router.post("/talhoes/new", Auth, (req, res) => {
    const { nome, especie_fruta, id_propriedade } = req.body;
    
    Talhoes.create({
        nome,
        especie_fruta,
        id_propriedade
    })
    .then(() => {
        res.redirect("/talhoes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao criar talhão.");
    });
});

// ROTA PARA EXCLUIR TALHÃO
router.get("/talhoes/delete/:id?", Auth, (req, res) => {
    const id = req.params.id;

    Talhoes.destroy({
        where: { id_talhao: id }
    })
    .then(() => {
        res.redirect("/talhoes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir talhão.");
    });
});

// ROTA DE EDIÇÃO DE TALHÃO
router.get("/talhoes/edit/:id", Auth, (req, res) => {
    const id = req.params.id;

    Talhoes.findByPk(id)
        .then((talhao) => {
            res.render("talhoesEdit", {
                talhao: talhao,
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Erro ao buscar talhão.");
        });
});

// ROTA PARA ALTERAÇÃO DE TALHÃO
router.post("/talhoes/update", Auth, (req, res) => {
    const { id_talhao, nome, especie_fruta, id_propriedade } = req.body;

    Talhoes.update(
        { nome, especie_fruta, id_propriedade },
        { where: { id_talhao } }
    )
    .then(() => {
        res.redirect("/talhoes");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar talhão.");
    });
});

export default router;
