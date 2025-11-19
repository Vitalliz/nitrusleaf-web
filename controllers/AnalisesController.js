import express from 'express';
const router = express.Router();
import Auth from "../middleware/Auth.js";
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
import Pes from "../models/Pes.js";
import Relatorios from "../models/Relatorios.js";
import { Op } from "sequelize";

// PÁGINA 1: OCORRÊNCIAS TOTAIS
router.get("/analises/ocorrencias", Auth, async (req, res) => {
    try {
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [["nome", "ASC"]]
        });

        let propriedadeSelecionada = req.query.propriedade || req.session.propriedadeSelecionada || null;
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }
        if (propriedadeSelecionada) {
            req.session.propriedadeSelecionada = propriedadeSelecionada;
        }

        let talhoes = [];
        let analises = [];
        let resumoDeficiencias = {
            percentuais: { cobre: 0, manganes: 0, outros: 0 },
            totais: { cobre: 0, manganes: 0, outros: 0 },
            total: 0
        };
        let talhaoFiltro = req.query.talhao || null;

        if (propriedadeSelecionada) {
            const propriedadeId = Number(propriedadeSelecionada);
            talhoes = await Talhoes.findAll({
                where: { id_propriedade: propriedadeId },
                order: [["nome", "ASC"]]
            });

            const talhaoIds = talhoes.map(t => t.id_talhao);
            let talhoesFiltrados = talhaoIds;
            
            if (talhaoFiltro) {
                talhoesFiltrados = [Number(talhaoFiltro)];
            }

            if (talhoesFiltrados.length > 0) {
                const pes = await Pes.findAll({
                    where: { id_talhao: { [Op.in]: talhoesFiltrados } },
                    include: {
                        model: Talhoes,
                        as: 'talhao'
                    }
                });

                const peIds = pes.map(p => p.id_pe);
                
                // Busca última análise de cada pé
                const ultimosRelatorios = [];
                for (const peId of peIds) {
                    const ultimoRelatorio = await Relatorios.findOne({
                        where: { id_pe: peId },
                        order: [["data_analise", "DESC"]]
                    });
                    if (ultimoRelatorio) {
                        const pe = await Pes.findByPk(peId, {
                            include: {
                                model: Talhoes,
                                as: 'talhao'
                            }
                        });
                        if (pe) {
                            ultimosRelatorios.push({
                                ...ultimoRelatorio.toJSON(),
                                pe: pe.toJSON()
                            });
                        }
                    }
                }

                analises = ultimosRelatorios.sort((a, b) => new Date(b.data_analise) - new Date(a.data_analise));

                const counts = { cobre: 0, manganes: 0, outros: 0 };
                ultimosRelatorios.forEach(relatorio => {
                    if (relatorio.deficiencia_cobre) counts.cobre += 1;
                    if (relatorio.deficiencia_manganes) counts.manganes += 1;
                    if (relatorio.outros) counts.outros += 1;
                });

                const totalOcorrencias = counts.cobre + counts.manganes + counts.outros;
                resumoDeficiencias = {
                    percentuais: {
                        cobre: totalOcorrencias ? Math.round((counts.cobre * 100) / totalOcorrencias) : 0,
                        manganes: totalOcorrencias ? Math.round((counts.manganes * 100) / totalOcorrencias) : 0,
                        outros: totalOcorrencias ? Math.round((counts.outros * 100) / totalOcorrencias) : 0
                    },
                    totais: counts,
                    total: totalOcorrencias
                };
            }
        }

        res.render("analises/ocorrencias", {
            propriedades,
            propriedadeSelecionada,
            talhoes,
            analises,
            resumoDeficiencias,
            talhaoFiltro
        });
    } catch (error) {
        console.error('Erro ao carregar ocorrências:', error);
        res.status(500).send('Erro ao carregar ocorrências.');
    }
});

// PÁGINA 2: DEFICIÊNCIA POR TALHÃO
router.get("/analises/deficiencia-talhao", Auth, async (req, res) => {
    try {
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [["nome", "ASC"]]
        });

        let propriedadeSelecionada = req.query.propriedade || req.session.propriedadeSelecionada || null;
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }
        if (propriedadeSelecionada) {
            req.session.propriedadeSelecionada = propriedadeSelecionada;
        }

        let talhoes = [];
        let talhoesComparacao = [];
        let maxTalhaoValor = 0;
        let talhaoFiltro = req.query.talhao || null;
        let pesComDeficiencia = [];

        if (propriedadeSelecionada) {
            const propriedadeId = Number(propriedadeSelecionada);
            talhoes = await Talhoes.findAll({
                where: { id_propriedade: propriedadeId },
                order: [["nome", "ASC"]]
            });

            const talhaoIds = talhoes.map(t => t.id_talhao);
            let talhoesFiltrados = talhaoIds;
            
            if (talhaoFiltro) {
                talhoesFiltrados = [Number(talhaoFiltro)];
            }

            if (talhoesFiltrados.length > 0) {
                const pes = await Pes.findAll({
                    where: { id_talhao: { [Op.in]: talhoesFiltrados } },
                    include: {
                        model: Talhoes,
                        as: 'talhao'
                    }
                });

                const peIds = pes.map(p => p.id_pe);
                const peTalhaoMap = new Map(pes.map(p => [p.id_pe, p.id_talhao]));

                // Busca última análise de cada pé
                const ultimosRelatorios = [];
                for (const peId of peIds) {
                    const ultimoRelatorio = await Relatorios.findOne({
                        where: { id_pe: peId },
                        order: [["data_analise", "DESC"]]
                    });
                    if (ultimoRelatorio) {
                        ultimosRelatorios.push(ultimoRelatorio);
                    }
                }

                const talhaoStats = new Map();
                ultimosRelatorios.forEach(relatorio => {
                    const talhaoId = peTalhaoMap.get(relatorio.id_pe);
                    if (!talhaoId) return;
                    
                    if (!talhaoStats.has(talhaoId)) {
                        talhaoStats.set(talhaoId, { cobre: 0, manganes: 0 });
                    }
                    const dados = talhaoStats.get(talhaoId);
                    if (relatorio.deficiencia_cobre) dados.cobre += 1;
                    if (relatorio.deficiencia_manganes) dados.manganes += 1;
                });

                talhoesComparacao = talhoes
                    .filter(t => talhoesFiltrados.includes(t.id_talhao))
                    .map(t => ({
                        nome: t.nome,
                        cobre: talhaoStats.get(t.id_talhao)?.cobre || 0,
                        manganes: talhaoStats.get(t.id_talhao)?.manganes || 0
                    }));

                maxTalhaoValor = talhoesComparacao.reduce((acc, item) => {
                    return Math.max(acc, item.cobre, item.manganes);
                }, 0);

                // Busca pés com deficiências
                const pesComDef = await Pes.findAll({
                    where: {
                        id_talhao: { [Op.in]: talhoesFiltrados },
                        [Op.or]: [
                            { deficiencia_cobre: true },
                            { deficiencia_manganes: true },
                            { outros: true }
                        ]
                    },
                    include: {
                        model: Talhoes,
                        as: 'talhao'
                    },
                    order: [["nome", "ASC"]]
                });

                pesComDeficiencia = pesComDef.map(pe => ({
                    id_pe: pe.id_pe,
                    nome: pe.nome,
                    talhao: pe.talhao.nome,
                    deficiencia_cobre: pe.deficiencia_cobre,
                    deficiencia_manganes: pe.deficiencia_manganes,
                    outros: pe.outros
                }));
            }
        }

        res.render("analises/deficiencia-talhao", {
            propriedades,
            propriedadeSelecionada,
            talhoes,
            talhoesComparacao,
            maxTalhaoValor,
            talhaoFiltro,
            pesComDeficiencia
        });
    } catch (error) {
        console.error('Erro ao carregar deficiência por talhão:', error);
        res.status(500).send('Erro ao carregar deficiência por talhão.');
    }
});

// PÁGINA 3: EVOLUÇÃO DAS DEFICIÊNCIAS
router.get("/analises/evolucao", Auth, async (req, res) => {
    try {
        const propriedades = await Propriedades.findAll({
            where: { id_usuario: req.session.user.id_usuario },
            order: [["nome", "ASC"]]
        });

        let propriedadeSelecionada = req.query.propriedade || req.session.propriedadeSelecionada || null;
        if (!propriedadeSelecionada && propriedades.length > 0) {
            propriedadeSelecionada = propriedades[0].id_propriedade.toString();
        }
        if (propriedadeSelecionada) {
            req.session.propriedadeSelecionada = propriedadeSelecionada;
        }

        let historicoAnalises = [];

        if (propriedadeSelecionada) {
            const propriedadeId = Number(propriedadeSelecionada);
            const talhoes = await Talhoes.findAll({
                where: { id_propriedade: propriedadeId }
            });

            const talhaoIds = talhoes.map(t => t.id_talhao);
            if (talhaoIds.length > 0) {
                const pes = await Pes.findAll({
                    where: { id_talhao: { [Op.in]: talhaoIds } }
                });

                const peIds = pes.map(p => p.id_pe);
                if (peIds.length > 0) {
                    const relatorios = await Relatorios.findAll({
                        where: { id_pe: { [Op.in]: peIds } },
                        order: [["data_analise", "DESC"]]
                    });

                    // Busca informações dos pés e talhões
                    const historicoCompleto = [];
                    for (const rel of relatorios) {
                        const pe = await Pes.findByPk(rel.id_pe, {
                            include: {
                                model: Talhoes,
                                as: 'talhao'
                            }
                        });
                        if (pe) {
                            historicoCompleto.push({
                                id_relatorio: rel.id_relatorio,
                                data_analise: rel.data_analise,
                                pe_nome: pe.nome,
                                talhao_nome: pe.talhao ? pe.talhao.nome : 'N/A',
                                deficiencia_cobre: rel.deficiencia_cobre,
                                deficiencia_manganes: rel.deficiencia_manganes,
                                outros: rel.outros,
                                observacoes: rel.observacoes
                            });
                        }
                    }
                    historicoAnalises = historicoCompleto;
                }
            }
        }

        res.render("analises/evolucao", {
            propriedades,
            propriedadeSelecionada,
            historicoAnalises
        });
    } catch (error) {
        console.error('Erro ao carregar evolução:', error);
        res.status(500).send('Erro ao carregar evolução.');
    }
});

export default router;

