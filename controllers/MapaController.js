import express from 'express'
const router = express.Router()
import Auth from "../middleware/Auth.js"
import Propriedades from "../models/Propriedades.js";
import Alqueires from "../models/Alqueires.js";
import Talhoes from "../models/Talhoes.js";
import Pes from "../models/Pes.js";

router.get("/mapa", Auth, async (req, res) => {
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

        let propriedade = null;
        let alqueires = [];
        let talhoes = [];
        let pes = [];

        if (propriedadeSelecionada) {
            propriedade = await Propriedades.findByPk(propriedadeSelecionada);
            
            if (propriedade) {
                alqueires = await Alqueires.findAll({
                    where: { id_propriedade: propriedadeSelecionada }
                });

                talhoes = await Talhoes.findAll({
                    where: { id_propriedade: propriedadeSelecionada }
                });

                const talhoesIds = talhoes.map(t => t.id_talhao);
                if (talhoesIds.length > 0) {
                    pes = await Pes.findAll({
                        where: { id_talhao: talhoesIds }
                    });
                }
            }
        }

        res.render("mapa", {
            Propriedades: propriedades,
            propriedadeSelecionada,
            propriedade,
            alqueires: JSON.stringify(alqueires),
            talhoes: JSON.stringify(talhoes),
            pes: JSON.stringify(pes),
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao listar propriedades.");
    }
});

router.post("/mapa/salvar-localizacao", Auth, async (req, res) => {
    try {
        const { id_propriedade, latitude, longitude, regiao } = req.body;

        // Verificar se a propriedade pertence ao usuário
        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario
            }
        });

        if (!propriedade) {
            return res.status(403).json({ error: 'Propriedade não encontrada ou acesso negado.' });
        }

        await Propriedades.update(
            {
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                regiao: regiao || null
            },
            { where: { id_propriedade } }
        );

        res.json({ success: true, message: 'Localização salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar localização:', error);
        res.status(500).json({ error: 'Erro ao salvar localização.' });
    }
});

router.post("/mapa/selecionar-propriedade", Auth, async (req, res) => {
    try {
        const { id_propriedade } = req.body;

        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario
            }
        });

        if (!propriedade) {
            return res.status(403).json({ error: 'Acesso negado.' });
        }

        req.session.propriedadeSelecionada = id_propriedade;
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao selecionar propriedade:', error);
        res.status(500).json({ error: 'Erro ao selecionar propriedade.' });
    }
});

router.get("/mapa/dados-propriedade/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;

        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade: id,
                id_usuario: req.session.user.id_usuario
            }
        });

        if (!propriedade) {
            return res.status(403).json({ error: 'Acesso negado.' });
        }

        const alqueires = await Alqueires.findAll({
            where: { id_propriedade: id }
        });

        const talhoes = await Talhoes.findAll({
            where: { id_propriedade: id }
        });

        const talhoesIds = talhoes.map(t => t.id_talhao);
        let pes = [];
        if (talhoesIds.length > 0) {
            pes = await Pes.findAll({
                where: { id_talhao: talhoesIds }
            });
        }

        res.json({
            propriedade: propriedade.toJSON(),
            alqueires: alqueires.map(a => a.toJSON()),
            talhoes: talhoes.map(t => t.toJSON()),
            pes: pes.map(p => p.toJSON())
        });
    } catch (error) {
        console.error('Erro ao buscar dados da propriedade:', error);
        res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
});

export default router;