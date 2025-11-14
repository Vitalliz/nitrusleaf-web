import express from 'express';
const router = express.Router();
import Talhoes from "../models/Talhoes.js";
import Auth from "../middleware/Auth.js";
import Propriedades from "../models/Propriedades.js";
import Alqueires from "../models/Alqueires.js";
import Pes from "../models/Pes.js";

// ROTA PARA LISTAR TALHÕES
router.get("/talhoes", Auth, async (req, res) => {
    try {
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [['nome', 'ASC']]
        });

        let propriedadeSelecionada = req.query.propriedade || req.session.propriedadeSelecionada || null;
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }
        if (propriedadeSelecionada) {
            req.session.propriedadeSelecionada = propriedadeSelecionada;
        }

        const alqueireSelecionado = req.query.alqueire || null;
        const whereTalhao = {};
        if (propriedadeSelecionada) {
            whereTalhao.id_propriedade = propriedadeSelecionada;
        }
        if (alqueireSelecionado) {
            whereTalhao.id_alqueire = alqueireSelecionado;
        }

        const talhoes = propriedadeSelecionada ? await Talhoes.findAll({
            include: [
                {
                    model: Propriedades,
                    as: 'propriedade'
                },
                {
                    model: Alqueires,
                    as: 'alqueire'
                }
            ],
            where: whereTalhao,
            order: [['createdAt', 'DESC']]
        }) : [];

        const alqueires = propriedadeSelecionada ? await Alqueires.findAll({
            where: { id_propriedade: propriedadeSelecionada },
            order: [['nome', 'ASC']]
        }) : [];

        res.render("talhoes", {
            talhoes,
            propriedades,
            propriedadeSelecionada,
            alqueires,
            alqueireSelecionado
        });
    } catch (error) {
        console.error("Erro ao listar talhões e propriedades:", error);
        res.status(500).send("Erro ao listar talhões.");
    }
});

// ROTA PARA FORMULÁRIO DE NOVO TALHÃO
router.get("/talhoes/new", Auth, async (req, res) => {
    try {
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [['nome', 'ASC']]
        });

        let propriedadeSelecionada = req.query.propriedade || req.session.propriedadeSelecionada || null;
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }

        const alqueires = propriedadeSelecionada ? await Alqueires.findAll({
            where: { id_propriedade: propriedadeSelecionada },
            order: [['nome', 'ASC']]
        }) : [];

        res.render("talhoesNew", {
            propriedades,
            propriedadeSelecionada,
            alqueires
        });
    } catch (error) {
        console.error("Erro ao carregar formulário de novo talhão:", error);
        res.status(500).send("Erro ao carregar formulário.");
    }
});

router.post("/talhoes/new", Auth, async (req, res) => {
    const { nome, especie_fruta, id_propriedade, id_alqueire } = req.body;

    try {
        if (!id_propriedade) {
            req.flash('warning', 'Selecione uma propriedade.');
            return res.redirect('/talhoes');
        }

        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario
            }
        });

        if (!propriedade) {
            req.flash('warning', 'Propriedade inválida.');
            return res.redirect('/talhoes');
        }

        let alqueireAssociado = null;
        if (id_alqueire) {
            alqueireAssociado = await Alqueires.findOne({
                where: {
                    id_alqueire,
                    id_propriedade
                }
            });
            if (!alqueireAssociado) {
                req.flash('warning', 'Alqueire inválido para a propriedade selecionada.');
                return res.redirect('/talhoes');
            }
        }

        await Talhoes.create({
            nome,
            especie_fruta,
            id_propriedade,
            id_alqueire: alqueireAssociado ? alqueireAssociado.id_alqueire : null,
            latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
            longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
            coordenadas_poligono: req.body.coordenadas_poligono || null
        });

        await atualizarTalhoesRegistrados(id_propriedade);

        res.redirect("/talhoes");
    } catch (error) {
        console.error("Erro ao criar talhão:", error);
        res.status(500).send("Erro ao criar talhão.");
    }
});


// ROTA PARA EXCLUIR TALHÃO
router.get("/talhoes/delete/:id?", Auth, async (req, res) => {
    const id = req.params.id;
    
    try {
        // Primeiro, encontre o talhão para obter o id_propriedade
        const talhao = await Talhoes.findByPk(id);
        
        if (!talhao) {
            return res.status(404).send("Talhão não encontrado.");
        }
        
        const id_propriedade = talhao.id_propriedade;
        
        // Exclui o talhão
        await Talhoes.destroy({
            where: { id_talhao: id }
        });
        
        // Atualiza o contador de talhões registrados
        await atualizarTalhoesRegistrados(id_propriedade);
        
        res.redirect("/talhoes");
    } catch (error) {
        console.error("Erro ao excluir talhão:", error);
        res.status(500).send("Erro ao excluir talhão.");
    }
});

// ROTA DE EDIÇÃO DE TALHÃO
router.get("/talhoes/edit/:id", Auth, async (req, res) => {
    try {
        const id = req.params.id;
        const talhao = await Talhoes.findByPk(id, {
            include: [
                {
                    model: Propriedades,
                    as: 'propriedade'
                },
                {
                    model: Alqueires,
                    as: 'alqueire'
                }
            ]
        });
        res.render("talhoesEdit", {
            talhao
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao buscar talhão.");
    }
});

// ROTA PARA ALTERAÇÃO DE TALHÃO
router.post("/talhoes/update", Auth, async (req, res) => {
    const { id_talhao, nome, especie_fruta, id_propriedade, id_alqueire } = req.body;

    try {
        let alqueireAssociado = null;
        if (id_alqueire) {
            alqueireAssociado = await Alqueires.findOne({
                where: {
                    id_alqueire,
                    id_propriedade
                }
            });
            if (!alqueireAssociado) {
                req.flash('warning', 'Alqueire inválido para a propriedade selecionada.');
                return res.redirect('/talhoes');
            }
        }

        await Talhoes.update(
            {
                nome,
                especie_fruta,
                id_alqueire: alqueireAssociado ? alqueireAssociado.id_alqueire : null
            },
            { where: { id_talhao } }
        );

        res.redirect("/talhoes");
    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao atualizar talhão.");
    }
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

// ROTA PARA PÁGINA ESPECÍFICA DO TALHÃO
router.get("/talhao/:id_talhao", Auth, async (req, res) => {
    const id_talhao = req.params.id_talhao;
    const userId = req.session.user.id_usuario;

    try {
        // Verifica se o talhão pertence ao usuário logado
        const talhao = await Talhoes.findOne({
            where: { id_talhao },
            include: [
                {
                    model: Propriedades,
                    as: 'propriedade',
                    where: { id_usuario: userId },
                },
                {
                    model: Alqueires,
                    as: 'alqueire'
                }
            ]
        });

        if (!talhao) {
            return res.status(403).send("Acesso negado ou talhão não encontrado.");
        }

        // Busca os pés associados ao talhão
        const pes = await Pes.findAll({
            where: { id_talhao },
            order: [['nome', 'ASC']]
        });

        res.render("talhao", {
            talhao,
            pes
        });
    } catch (error) {
        console.error("Erro ao carregar página do talhão:", error);
        res.status(500).send("Erro ao carregar página do talhão.");
    }
});

// ROTA PARA SELECIONAR PROPRIEDADE
router.post("/talhoes/selecionar-propriedade", Auth, async (req, res) => {
    try {
        const { id_propriedade } = req.body;
        
        if (!id_propriedade) {
            return res.status(400).json({ error: "ID da propriedade não fornecido" });
        }

        // Verifica se a propriedade pertence ao usuário
        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario
            }
        });

        if (!propriedade) {
            return res.status(403).json({ error: "Propriedade não encontrada ou não pertence ao usuário" });
        }

        // Salva a propriedade selecionada na sessão
        req.session.propriedadeSelecionada = id_propriedade;
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erro ao selecionar propriedade:", error);
        res.status(500).json({ error: "Erro ao selecionar propriedade" });
    }
});

export default router;
