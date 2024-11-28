import express from 'express';
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
const router = express.Router()
import Auth from "../middleware/Auth.js"
// ROTA PEDIDOS
router.get("/historico", Auth,(req, res) => {
    Promise.all([
        Talhoes.findAll({
            include: {
                model: Propriedades,
                as: 'propriedade', // Alias definido no relacionamento
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
        res.render("historico", {
            talhoes: talhoes,
            propriedades: NomepOrdenado,
        });
    })
    .catch((error) => {
        console.error("Erro ao listar talhões e propriedades:", error);
        res.status(500).send("Erro ao listar talhões.");
    });
});

router.get("/historico/delete/:id", Auth,(req, res) => {
    const id = req.params.id
    Historico.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/historico")
    })
})

router.get("/historico/edit/:id", Auth,(req, res) => {
    const id = req.params.id
    Historico.findByPk(id).then(function (historico) {
        res.render("historicoEdit", {
            historico: historico
        })
    })
})

router.post("/historico/update/:id", Auth,(req, res) => {
    const id = req.params.id
    const talhao = req.body.talhao
    const descricao = req.body.descricao
        Historico.update(
        {
            talhao : talhao,
            descricao: descricao
        },
        { where: { id: id } }
    ).then(() => {
        res.redirect("/historico")
    })
})

export default router;