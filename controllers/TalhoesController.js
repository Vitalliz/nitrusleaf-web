import express from 'express';
const router = express.Router();
import Talhoes from "../models/Talhoes.js";
import Auth from "../middleware/Auth.js";
import Propriedades from "../models/Propriedades.js";


// ROTA PARA LISTAR TALHÕES
router.get("/talhoes", Auth, (req, res) => {
    // Usando Promise.all para buscar talhões e propriedades
    const propriedadeSelecionada = req.session.propriedadeSelecionada || null;
    Promise.all([
        Talhoes.findAll({
            include: {
                model: Propriedades,
                as: 'propriedade', // Alias definido no relacionamento
            },
            where:{
                id_propriedade: propriedadeSelecionada,
            }   
        }),
        Propriedades.findAll({where: { id_usuario: req.session.user.id_usuario}})  // Buscando todas as propriedades do usuário
    ])
    .then(([talhoes, propriedades]) => {
        // Ordena as propriedades pelo nome
        const NomepOrdenado = propriedades.sort((a, b) => {
            return a.nome.localeCompare(b.nome);
        });

        // Renderiza a página com os talhões e propriedades ordenadas
        res.render("talhoes", {
            talhoes: talhoes,
            propriedades: NomepOrdenado,
            propriedadeSelecionada
        });
    })
    .catch((error) => {
        console.error("Erro ao listar talhões e propriedades:", error);
        res.status(500).send("Erro ao listar talhões.");
    });
});

router.post("/talhoes/new", async (req, res) => {
    const { nome, total_pes,especie_fruta ,id_propriedade } = req.body;

    try {
        // Cria um novo talhão
        await Talhoes.create({ nome, total_pes, especie_fruta,id_propriedade });

        // Atualiza a contagem de talhões registrados na propriedade
        await atualizarTalhoesRegistrados(id_propriedade);

        res.redirect("/talhoes");
    } catch (error) {
        console.error("Erro ao criar talhão:", error);
        res.status(500).send("Erro ao criar talhão.");
    }
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
    Talhoes.findByPk(id, {
            include: {
                model: Propriedades,
                as: 'propriedade', // Alias definido no relacionamento
            }
    })
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
        { nome, especie_fruta },
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

async function atualizarTalhoesRegistrados(id_propriedade) {
    try {
        // Conta o total de talhões para a propriedade
        const totalTalhoes = await Talhoes.count({
            where: { id_propriedade },
        });

        // Atualiza o atributo `talhoes_registrados` na propriedade
        await Propriedades.update(
            { talhoes_registrados: totalTalhoes },
            { where: { id_propriedade } }
        );

        console.log(`Propriedade ${id_propriedade} atualizada com ${totalTalhoes} talhões registrados.`);
    } catch (error) {
        console.error("Erro ao atualizar talhões registrados:", error);
    }
}

export default router;
