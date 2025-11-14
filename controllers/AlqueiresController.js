import express from 'express';
import Auth from '../middleware/Auth.js';
import Propriedades from '../models/Propriedades.js';
import Alqueires from '../models/Alqueires.js';
import Talhoes from '../models/Talhoes.js';

const router = express.Router();

router.get('/alqueires', Auth, async (req, res) => {
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

        let propriedadeResumo = {
            totalAlqueires: 0,
            totalTalhoes: 0,
            totalPes: 0,
            totalPesDiagnosticados: 0,
            totalPesAnalisados: 0
        };
        let alqueiresDetalhados = [];

        if (propriedadeSelecionada) {
            const alqueires = await Alqueires.findAll({
                where: { id_propriedade: propriedadeSelecionada },
                order: [['createdAt', 'DESC']]
            });

            const talhoes = await Talhoes.findAll({
                where: { id_propriedade: propriedadeSelecionada }
            });

            const talhoesPorAlqueire = new Map();
            talhoes.forEach(talhao => {
                const chave = talhao.id_alqueire || 'sem-alqueire';
                if (!talhoesPorAlqueire.has(chave)) {
                    talhoesPorAlqueire.set(chave, []);
                }
                talhoesPorAlqueire.get(chave).push(talhao);
            });

            propriedadeResumo = {
                totalAlqueires: alqueires.length,
                totalTalhoes: talhoes.length,
                totalPes: talhoes.reduce((acc, item) => acc + (item.total_pes || 0), 0),
                totalPesDiagnosticados: talhoes.reduce((acc, item) => acc + (item.pes_diagnosticados || 0), 0),
                totalPesAnalisados: talhoes.reduce((acc, item) => acc + (item.pes_analisados || 0), 0)
            };

            alqueiresDetalhados = alqueires.map(alqueire => {
                const talhoesLista = talhoesPorAlqueire.get(alqueire.id_alqueire) || [];
                return {
                    id_alqueire: alqueire.id_alqueire,
                    nome: alqueire.nome,
                    area_total: alqueire.area_total,
                    createdAt: alqueire.createdAt,
                    totalTalhoes: talhoesLista.length,
                    totalPes: talhoesLista.reduce((acc, item) => acc + (item.total_pes || 0), 0),
                    totalPesAnalisados: talhoesLista.reduce((acc, item) => acc + (item.pes_analisados || 0), 0)
                };
            });
        }

        res.render('alqueires', {
            propriedades,
            propriedadeSelecionada,
            resumo: propriedadeResumo,
            alqueires: alqueiresDetalhados
        });
    } catch (error) {
        console.error('Erro ao carregar alqueires:', error);
        req.flash('error', 'Não foi possível carregar os alqueires.');
        res.redirect('/home');
    }
});

router.get('/alqueires/cadastrar', Auth, async (req, res) => {
    try {
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [['nome', 'ASC']]
        });

        let propriedadeSelecionada = req.query.propriedade || req.session.propriedadeSelecionada || null;
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }

        let propriedade = null;
        let alqueires = [];
        if (propriedadeSelecionada) {
            propriedade = await Propriedades.findByPk(propriedadeSelecionada);
            alqueires = await Alqueires.findAll({
                where: { id_propriedade: propriedadeSelecionada },
                order: [['nome', 'ASC']]
            });
        }

        res.render('cadastrar-alqueire', {
            propriedades,
            propriedadeSelecionada,
            propriedade,
            alqueires,
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
        });
    } catch (error) {
        console.error('Erro ao carregar formulário de cadastro:', error);
        req.flash('error', 'Erro ao carregar formulário.');
        res.redirect('/historico');
    }
});

router.post('/alqueires/new', Auth, async (req, res) => {
    try {
        const { nome, area_total, id_propriedade, latitude, longitude, coordenadas_poligono } = req.body;
        if (!id_propriedade) {
            req.flash('warning', 'Selecione uma propriedade.');
            return res.redirect('/alqueires/cadastrar');
        }
        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario
            }
        });
        if (!propriedade) {
            req.flash('warning', 'Propriedade inválida.');
            return res.redirect('/alqueires/cadastrar');
        }
        await Alqueires.create({
            nome,
            area_total: area_total || null,
            id_propriedade,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            coordenadas_poligono: coordenadas_poligono || null
        });
        req.flash('success', 'Alqueire criado com sucesso!');
        res.redirect('/historico');
    } catch (error) {
        console.error('Erro ao criar alqueire:', error);
        req.flash('error', 'Não foi possível criar o alqueire.');
        res.redirect('/alqueires/cadastrar');
    }
});

router.post('/alqueires/selecionar-propriedade', Auth, async (req, res) => {
    try {
        const { id_propriedade } = req.body;
        const propriedade = await Propriedades.findOne({
            where: {
                id_propriedade,
                id_usuario: req.session.user.id_usuario
            }
        });
        if (!propriedade) {
            return res.status(403).send('Acesso negado.');
        }
        req.session.propriedadeSelecionada = id_propriedade;
        res.status(200).send('Propriedade atualizada.');
    } catch (error) {
        console.error('Erro ao atualizar propriedade selecionada:', error);
        res.status(500).send('Erro interno ao selecionar propriedade.');
    }
});

export default router;
