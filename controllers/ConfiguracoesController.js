import express from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import Usuarios from "../models/Usuarios.js";
import Propriedades from "../models/Propriedades.js";
import Talhoes from "../models/Talhoes.js";
import Pes from "../models/Pes.js";
import Relatorios from "../models/Relatorios.js";
import Foto from "../models/Foto.js";
import Histal from "../models/Histal.js";
import Historico from "../models/Historico.js";
import Auth from "../middleware/Auth.js";

const router = express.Router();

const perfilUploadsDir = path.resolve('uploads', 'perfis');
if (!fs.existsSync(perfilUploadsDir)) {
    fs.mkdirSync(perfilUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, perfilUploadsDir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.get("/configuracoes", Auth, async (req, res) => {
    try {
        const userId = req.session.user.id_usuario;
        const usuario = await Usuarios.findByPk(userId);
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado.');
            return res.redirect('/logout');
        }
        const propriedade = await Propriedades.findOne({
            where: { id_usuario: userId },
            order: [["id_propriedade", "ASC"]]
        });
        res.render("configuracoes", {
            usuario,
            propriedade
        });
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        req.flash('error', 'Não foi possível carregar as configurações.');
        res.redirect('/home');
    }
});

router.post("/configuracoes/update", Auth, upload.single('foto_perfil'), async (req, res) => {
    try {
        const userId = req.session.user.id_usuario;
        const usuario = await Usuarios.findByPk(userId);
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado.');
            return res.redirect('/configuracoes');
        }
        const {
            nome,
            sobrenome,
            email,
            telefone,
            celular,
            tipo_pessoa,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            cpf,
            cnpj,
            nome_fantasia
        } = req.body;

        const updates = {
            nome,
            sobrenome,
            email,
            telefone,
            celular,
            tipo_pessoa,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            cpf,
            cnpj,
            nome_fantasia
        };

        if (req.file) {
            updates.foto_perfil = `/uploads/perfis/${req.file.filename}`;
        }

        await usuario.update(updates);
        req.session.user.email = email;
        if (updates.foto_perfil) {
            req.session.user.foto_perfil = updates.foto_perfil;
        }
        req.flash('success', 'Dados atualizados com sucesso!');
        res.redirect('/configuracoes');
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        req.flash('error', 'Erro ao atualizar dados. Tente novamente.');
        res.redirect('/configuracoes');
    }
});

router.post('/configuracoes/propriedade', Auth, async (req, res) => {
    try {
        const userId = req.session.user.id_usuario;
        const {
            id_propriedade,
            nome,
            cep,
            logradouro,
            numero,
            bairro,
            cidade
        } = req.body;

        if (id_propriedade) {
            await Propriedades.update(
                { nome, cep, logradouro, numero, bairro, cidade },
                { where: { id_propriedade, id_usuario: userId } }
            );
            req.flash('success', 'Propriedade atualizada com sucesso!');
        } else {
            await Propriedades.create({
                nome,
                cep,
                logradouro,
                numero,
                bairro,
                cidade,
                id_usuario: userId
            });
            req.flash('success', 'Propriedade cadastrada com sucesso!');
        }
        res.redirect('/configuracoes');
    } catch (error) {
        console.error('Erro ao salvar propriedade:', error);
        req.flash('error', 'Não foi possível salvar os dados da propriedade.');
        res.redirect('/configuracoes');
    }
});

router.post("/configuracoes/change-password", Auth, async (req, res) => {
    try {
        const userId = req.session.user.id_usuario;
        const { senha_atual, nova_senha, confirmar_senha } = req.body;

        if (nova_senha !== confirmar_senha) {
            req.flash('warning', 'Nova senha e confirmação não coincidem.');
            return res.redirect('/configuracoes');
        }

        const usuario = await Usuarios.findByPk(userId);
        if (!usuario) {
            req.flash('error', 'Usuário não encontrado.');
            return res.redirect('/configuracoes');
        }

        const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
        if (!senhaValida) {
            req.flash('warning', 'Senha atual incorreta.');
            return res.redirect('/configuracoes');
        }

        const novaSenhaHash = await bcrypt.hash(nova_senha, 10);
        await usuario.update({ senha: novaSenhaHash });
        req.flash('success', 'Senha alterada com sucesso!');
        res.redirect('/configuracoes');
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        req.flash('error', 'Erro ao alterar senha. Tente novamente.');
        res.redirect('/configuracoes');
    }
});

router.post('/configuracoes/delete-account', Auth, async (req, res) => {
    const transaction = await Usuarios.sequelize.transaction();
    try {
        const userId = req.session.user.id_usuario;
        const { senha_confirmacao } = req.body;
        const usuario = await Usuarios.findByPk(userId, { transaction });
        if (!usuario) {
            await transaction.rollback();
            req.flash('error', 'Usuário não encontrado.');
            return res.redirect('/configuracoes');
        }
        const senhaValida = await bcrypt.compare(senha_confirmacao, usuario.senha);
        if (!senhaValida) {
            await transaction.rollback();
            req.flash('warning', 'Senha incorreta.');
            return res.redirect('/configuracoes');
        }

        const propriedades = await Propriedades.findAll({
            where: { id_usuario: userId },
            attributes: ['id_propriedade'],
            transaction
        });
        const propriedadeIds = propriedades.map(p => p.id_propriedade);

        if (propriedadeIds.length > 0) {
            const talhoes = await Talhoes.findAll({
                where: { id_propriedade: propriedadeIds },
                attributes: ['id_talhao'],
                transaction
            });
            const talhaoIds = talhoes.map(t => t.id_talhao);

            if (talhaoIds.length > 0) {
                const pes = await Pes.findAll({
                    where: { id_talhao: talhaoIds },
                    attributes: ['id_pe'],
                    transaction
                });
                const peIds = pes.map(pe => pe.id_pe);

                if (peIds.length > 0) {
                    await Relatorios.destroy({ where: { id_pe: peIds }, transaction });
                    await Foto.destroy({
                        where: {
                            [Op.or]: [
                                { id_pe: peIds },
                                { id_talhao: talhaoIds }
                            ]
                        },
                        transaction
                    });
                    await Pes.destroy({ where: { id_pe: peIds }, transaction });
                }

                await Histal.destroy({ where: { id_talhao: talhaoIds }, transaction });
                await Historico.destroy({ where: { id_talhao: talhaoIds }, transaction });
                await Talhoes.destroy({ where: { id_talhao: talhaoIds }, transaction });
            }

            await Propriedades.destroy({ where: { id_propriedade: propriedadeIds }, transaction });
        }

        await Usuarios.destroy({ where: { id_usuario: userId }, transaction });
        await transaction.commit();
        req.session.destroy(() => {
            req.flash('success', 'Conta excluída com sucesso.');
            res.redirect('/');
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao excluir conta:', error);
        req.flash('error', 'Não foi possível excluir a conta. Remova dados vinculados e tente novamente.');
        res.redirect('/configuracoes');
    }
});

export default router;