import express from 'express'
const router = express.Router()
import Home from "../models/Home.js"
import Auth from "../middleware/Auth.js"
import Propriedades from "../models/Propriedades.js"
import Talhoes from "../models/Talhoes.js"
import Pes from "../models/Pes.js"
import Relatorios from "../models/Relatorios.js"

router.get("/home", Auth, async (req, res) => {
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
        let totalPesAnalisados = 0;
        let totalOcorrencias = 0;
        let mensagemStatus = propriedades.length === 0 ? "Nenhuma propriedade cadastrada" : "Nenhuma análise feita recentemente";
        let resumoDeficiencias = {
            percentuais: { cobre: 0, manganes: 0, outros: 0 },
            totais: { cobre: 0, manganes: 0, outros: 0 },
            total: 0
        };
        let talhoesComparacao = [];
        let maxTalhaoValor = 0;
        let talhoesMensagem = propriedades.length === 0 ? "Cadastre uma propriedade para visualizar os dados" : "Nenhum talhão cadastrado nesta propriedade";
        let evolucaoAnalises = { datas: [], cobre: [], manganes: [] };
        let evolucaoMensagem = "Nenhum dado feito nos últimos meses";
        if (propriedadeSelecionada) {
            const propriedadeId = Number(propriedadeSelecionada);
            const talhoes = await Talhoes.findAll({
                where: { id_propriedade: propriedadeId },
                order: [["id_talhao", "ASC"]]
            });
            const talhaoIds = talhoes.map(t => t.id_talhao);
            if (talhaoIds.length > 0) {
                const pes = await Pes.findAll({
                    where: { id_talhao: talhaoIds }
                });
                const peIds = pes.map(p => p.id_pe);
                totalPesAnalisados = peIds.length;
                const peTalhaoMap = new Map(pes.map(p => [p.id_pe, p.id_talhao]));
                const ultimosTalhoes = [...talhoes].sort((a, b) => b.id_talhao - a.id_talhao).slice(0, 3).reverse();
                talhoesComparacao = ultimosTalhoes.map(t => ({
                    nome: t.nome,
                    cobre: 0,
                    manganes: 0
                }));
                talhoesMensagem = talhoesComparacao.length === 0 ? "Nenhum talhão cadastrado nesta propriedade" : "Nenhum dado disponível para os talhões selecionados";
                if (peIds.length > 0) {
                    // Busca apenas a última análise de cada pé
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
                    
                    const counts = { cobre: 0, manganes: 0, outros: 0 };
                    ultimosRelatorios.forEach(relatorio => {
                        if (relatorio.deficiencia_cobre) {
                            counts.cobre += 1;
                        }
                        if (relatorio.deficiencia_manganes) {
                            counts.manganes += 1;
                        }
                        if (relatorio.outros) {
                            counts.outros += 1;
                        }
                    });
                    
                    // Atualiza totalPesAnalisados para contar apenas pés com análises
                    totalPesAnalisados = ultimosRelatorios.length;
                    totalOcorrencias = counts.cobre + counts.manganes + counts.outros;
                    resumoDeficiencias = {
                        percentuais: {
                            cobre: totalOcorrencias ? Math.round((counts.cobre * 100) / totalOcorrencias) : 0,
                            manganes: totalOcorrencias ? Math.round((counts.manganes * 100) / totalOcorrencias) : 0,
                            outros: totalOcorrencias ? Math.round((counts.outros * 100) / totalOcorrencias) : 0
                        },
                        totais: counts,
                        total: totalOcorrencias
                    };
                    if (totalOcorrencias > 0) {
                        mensagemStatus = `${totalOcorrencias} ocorrência(s) em ${totalPesAnalisados} pé(s) analisado(s)`;
                    } else if (totalPesAnalisados > 0) {
                        mensagemStatus = "Nenhuma análise feita recentemente";
                    } else {
                        mensagemStatus = "Nenhum pé cadastrado nesta propriedade";
                    }
                    const talhaoStats = new Map();
                    ultimosRelatorios.forEach(relatorio => {
                        const talhaoId = peTalhaoMap.get(relatorio.id_pe);
                        if (!talhaoId) {
                            return;
                        }
                        if (!talhaoStats.has(talhaoId)) {
                            talhaoStats.set(talhaoId, { cobre: 0, manganes: 0 });
                        }
                        const dados = talhaoStats.get(talhaoId);
                        if (relatorio.deficiencia_cobre) {
                            dados.cobre += 1;
                        }
                        if (relatorio.deficiencia_manganes) {
                            dados.manganes += 1;
                        }
                    });
                    talhoesComparacao = ultimosTalhoes.map(t => ({
                        nome: t.nome,
                        cobre: talhaoStats.get(t.id_talhao)?.cobre || 0,
                        manganes: talhaoStats.get(t.id_talhao)?.manganes || 0
                    }));
                    maxTalhaoValor = talhoesComparacao.reduce((acc, item) => {
                        return Math.max(acc, item.cobre, item.manganes);
                    }, 0);
                    if (talhoesComparacao.length > 0 && talhoesComparacao.some(item => item.cobre || item.manganes)) {
                        talhoesMensagem = null;
                    }
                    // Para evolução, usa apenas a última análise de cada pé por data
                    const evolucaoMap = new Map();
                    const peDataMap = new Map(); // Para garantir apenas uma análise por pé por data
                    
                    ultimosRelatorios.forEach(relatorio => {
                        if (!relatorio.data_analise) {
                            return;
                        }
                        const chave = relatorio.data_analise.toISOString().split('T')[0];
                        const peKey = `${relatorio.id_pe}_${chave}`;
                        
                        // Evita contar o mesmo pé múltiplas vezes na mesma data
                        if (!peDataMap.has(peKey)) {
                            peDataMap.set(peKey, true);
                            
                            if (!evolucaoMap.has(chave)) {
                                evolucaoMap.set(chave, { cobre: 0, manganes: 0, total: 0 });
                            }
                            const atual = evolucaoMap.get(chave);
                            atual.total += 1;
                            if (relatorio.deficiencia_cobre) {
                                atual.cobre += 1;
                            }
                            if (relatorio.deficiencia_manganes) {
                                atual.manganes += 1;
                            }
                        }
                    });
                    const evolucaoOrdenada = [...evolucaoMap.entries()].sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 4).reverse();
                    evolucaoAnalises = {
                        datas: evolucaoOrdenada.map(([dia]) => new Intl.DateTimeFormat('pt-BR').format(new Date(dia))),
                        cobre: evolucaoOrdenada.map(([, valor]) => valor.total ? Math.round((valor.cobre * 100) / valor.total) : 0),
                        manganes: evolucaoOrdenada.map(([, valor]) => valor.total ? Math.round((valor.manganes * 100) / valor.total) : 0)
                    };
                    if (evolucaoAnalises.datas.length > 0) {
                        evolucaoMensagem = null;
                    }
                } else {
                    mensagemStatus = "Nenhum pé cadastrado nesta propriedade";
                }
            }
        }
        res.render("home", {
            Propriedades: propriedades,
            propriedadeSelecionada,
            totalPesAnalisados,
            totalOcorrencias,
            mensagemStatus,
            resumoDeficiencias,
            talhoesComparacao,
            talhoesMensagem,
            evolucaoAnalises,
            evolucaoMensagem,
            maxTalhaoValor
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao carregar a página inicial.");
    }
});

router.post('/home', Auth, (req, res) => {
    const { id_propriedade } = req.body;
    if (!id_propriedade) {
        return res.status(400).json({ error: 'ID da propriedade não fornecido.' });
    }
    req.session.propriedadeSelecionada = id_propriedade;
    res.status(200).json({ success: true, message: 'Propriedade selecionada salva na sessão.' });
});

// ROTA PARA SELECIONAR PÉ PARA ANÁLISE
router.get("/home/selecionar-pe", Auth, async (req, res) => {
    try {
        const propriedadeSelecionada = req.session.propriedadeSelecionada;
        if (!propriedadeSelecionada) {
            return res.redirect("/home");
        }

        const talhoes = await Talhoes.findAll({
            where: { id_propriedade: propriedadeSelecionada },
            order: [["nome", "ASC"]]
        });

        const talhaoIds = talhoes.map(t => t.id_talhao);
        const pes = talhaoIds.length > 0 ? await Pes.findAll({
            where: { id_talhao: talhaoIds },
            include: {
                model: Talhoes,
                as: 'talhao'
            },
            order: [["nome", "ASC"]]
        }) : [];

        res.render("selecionarPe", {
            pes,
            talhoes
        });
    } catch (error) {
        console.error("Erro ao carregar seleção de pés:", error);
        res.status(500).send("Erro ao carregar seleção de pés.");
    }
});

router.post("/home/new", Auth,(req, res) =>{
    const nome = req.body.nome
    Home.create({
        nome:nome,
    }).then(() => {
        res.redirect("/home")
    })
})

router.get("/home/delete/:id?", Auth,(req, res) => {

const id = req.params.id

Home.destroy({

    where:{
        id : id
    }
}).then(() => {
    res.redirect("/home/")
}).catch(error => {

    console.log(error)
})

})
//ROTA DE EDIÇÃO DE HOME
router.get("/home/edit/:id", Auth,(req, res) => {
   const id = req.params.id
    Home.findByPk(id).then((home)=> {
        res.render("homeEdit",{
            nome: nome,
        });
    }).catch((error) => {
        console.log(error)
    })
});

//ROTA DE ALTERAÇÃO DE HOME
router.post("/home/update", Auth,(req , res) => {
    const id = req.body.id
    const nome = req.body.nome

    Home.update(
    {
        nome: nome,
    },
    {where: {id : id}}
).then(() => {
    res.redirect("/home")
}).catch((error) => {
    console.log(error)
})
})

export default router;