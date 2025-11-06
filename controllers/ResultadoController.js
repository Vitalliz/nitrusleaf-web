import express from 'express'
import Talhoes from "../models/Talhoes.js"
import Pes from "../models/Pes.js"
import Auth from "../middleware/Auth.js"
import Relatorios from "../models/Relatorios.js"
import Foto from "../models/Foto.js"

const router = express.Router()

// Se acessarem /resultados sem id, redireciona para a home
router.get('/resultados', Auth, (req, res) => {
    return res.redirect('/home');
});

// Página de resultados para um pé específico
router.get('/resultados/:id_pe', Auth, async (req, res) => {
    const { id_pe } = req.params;

    try {
        // Busca o pé e o talhão relacionado
        const pe = await Pes.findByPk(id_pe);
        if (!pe) {
            return res.status(404).send('Pé não encontrado.');
        }

        const talhao = await Talhoes.findByPk(pe.id_talhao);

        // Busca relatórios e fotos associadas ao pé
        const [relatorios, fotos] = await Promise.all([
            Relatorios.findAll({ where: { id_pe }, order: [['data_analise', 'DESC']] }),
            Foto.findAll({ where: { id_pe } })
        ]);

        // Calcula um resumo simples de ocorrências
        const counts = { cobre: 0, manganes: 0, outros: 0 };
        relatorios.forEach(r => {
            if (r.deficiencia_cobre) counts.cobre += 1;
            if (r.deficiencia_manganes) counts.manganes += 1;
            if (r.outros) counts.outros += 1;
        });

        res.render('resultados', {
            talhao: talhao ? talhao.get({ plain: true }) : null,
            pe: pe.get({ plain: true }),
            relatorios: relatorios.map(r => r.get({ plain: true })),
            fotos: fotos.map(f => f.get({ plain: true })),
            counts
        });
    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        res.status(500).send('Erro ao carregar resultados.');
    }
});

// Rotas POST/PUT/DELETE podem ser implementadas conforme necessário

export default router;