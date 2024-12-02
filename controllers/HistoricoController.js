import express from 'express';
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
const router = express.Router()
import Auth from "../middleware/Auth.js"
// ROTA PEDIDOS
router.get("/historico", Auth,(req, res) => {
    const propriedadeSelecionada = req.session.propriedadeSelecionada || null;
    Promise.all([
        Talhoes.findAll({
            include: {
                model: Propriedades,
                as: 'propriedade', // Alias definido no relacionamento
            },
            where:{
            id_propriedade: propriedadeSelecionada
            }
        }),
        Propriedades.findAll({where: { id_usuario: req.session.user.id_usuario }})  // Buscando todas as propriedades para ordená-las
    ])
    .then(([talhoes, propriedades]) => {
        // Ordena as propriedades pelo nome
        const NomepOrdenado = propriedades.sort((a, b) => {
            return a.nome.localeCompare(b.nome);
        });

        router.get("/historico/talhoes/:id_propriedade", Auth, async (req, res) => {
            const { id_propriedade } = req.params;
        
            try {
                const talhoes = await Talhoes.findAll({
                    where: { id_propriedade },
                });
                res.json(talhoes); // Retorna os talhões em formato JSON
            } catch (error) {
                console.error("Erro ao buscar talhões:", error);
                res.status(500).json({ error: "Erro ao buscar talhões." });
            }
        });
        

        // Renderiza a página com os talhões e propriedades ordenadas
        res.render("historico", {
            talhoes: talhoes,
            propriedades: NomepOrdenado,
            propriedadeSelecionada,
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