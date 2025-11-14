import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Auth from "../middleware/Auth.js";
const router = express.Router();
import Foto from "../models/Foto.js";
import Pes from "../models/Pes.js";
import Talhoes from "../models/Talhoes.js";
import Relatorios from "../models/Relatorios.js";
import Propriedades from "../models/Propriedades.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ROTA PARA LISTAR TODAS AS FOTOS
router.get("/fotos", (req, res) => {
    Foto.findAll({
        include: [
            { model: Pes, as: 'pe' },  // Incluir informações de 'Pes'
            { model: Talhoes, as: 'talhao' }  // Incluir informações de 'Talhoes'
        ]
    })
    .then(fotos => {
        res.render("fotos", {
            fotos: fotos
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao listar fotos.");
    });
});

// ROTA PARA CRIAR NOVA FOTO COM ANÁLISE
router.post("/fotos/new", Auth, upload.single('imagem'), async (req, res) => {
    try {
        const { id_pe, id_talhao, situacao, deficiencia_cobre, deficiencia_manganes, outros, observacoes } = req.body;
        const userId = req.session.user.id_usuario;

        if (!id_pe) {
            return res.status(400).send("ID do pé não fornecido.");
        }

        // Verifica se o pé pertence ao usuário
        const pe = await Pes.findOne({
            where: { id_pe },
            include: {
                model: Talhoes,
                as: 'talhao',
                include: {
                    model: Propriedades,
                    as: 'propriedade',
                    where: { id_usuario: userId }
                }
            }
        });

        if (!pe) {
            return res.status(403).send("Acesso negado.");
        }

        let urlFoto = null;
        if (req.file) {
            urlFoto = `/uploads/${req.file.filename}`;
        }

        // Atualiza o pé com as informações
        await Pes.update(
            {
                situacao: situacao || pe.situacao,
                deficiencia_cobre: deficiencia_cobre === 'true' || deficiencia_cobre === true,
                deficiencia_manganes: deficiencia_manganes === 'true' || deficiencia_manganes === true,
                outros: outros === 'true' || outros === true
            },
            { where: { id_pe } }
        );

        // Cria a foto se foi enviada
        if (urlFoto) {
            await Foto.create({
                id_pe,
                id_talhao: id_talhao || pe.id_talhao,
                url: urlFoto,
                data_tiragem: new Date(),
                resultado_analise: observacoes || null
            });
        }

        // Cria relatório da análise
        await Relatorios.create({
            id_pe,
            data_analise: new Date(),
            deficiencia_cobre: deficiencia_cobre === 'true' || deficiencia_cobre === true,
            deficiencia_manganes: deficiencia_manganes === 'true' || deficiencia_manganes === true,
            outros: outros === 'true' || outros === true,
            observacoes: observacoes || null
        });

        res.redirect(`/pes/${id_pe}`);
    } catch (error) {
        console.error("Erro ao criar foto e análise:", error);
        res.status(500).send("Erro ao criar foto e análise.");
    }
});

// ROTA PARA EXCLUIR FOTO
router.get("/fotos/delete/:id?", (req, res) => {
    const id = req.params.id;

    Foto.destroy({
        where: { id_foto: id }
    })
    .then(() => {
        res.redirect("/fotos");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao excluir foto.");
    });
});

// ROTA DE EDIÇÃO DE FOTO
router.get("/fotos/edit/:id", (req, res) => {
    const id = req.params.id;

    Foto.findByPk(id, {
        include: [
            { model: Pes, as: 'pe' },
            { model: Talhoes, as: 'talhao' }
        ]
    })
    .then((foto) => {
        res.render("fotosEdit", {
            foto: foto,
        });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao buscar foto.");
    });
});

// ROTA PARA ALTERAÇÃO DE FOTO
router.post("/fotos/update", (req, res) => {
    const { id_foto, id_pe, id_talhao, url, data_tiragem, resultado_analise } = req.body;

    Foto.update(
        { id_pe, id_talhao, url, data_tiragem, resultado_analise },
        { where: { id_foto } }
    )
    .then(() => {
        res.redirect("/fotos");
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send("Erro ao atualizar foto.");
    });
});

export default router;
