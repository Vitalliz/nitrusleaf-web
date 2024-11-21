// import express from 'express'
// import Configuracoes from "../models/Configuracoes.js"

// const router = express.Router()

// router.get("/configuracoes", function (req, res) {
//     // Configuracoes.findAll().then(configuracoes => {
//     //     res.render("configuracoes", { configuracoes: configuracoes })
//     // })
//     res.render("configuracoes");
// })

// // ROTA CONFIGURAÇÕES
// router.post("/configuracoes/new", function (req, res) {
//     try {
//         const configuracoesDados = req.body;
//         const configuracoes = configuracoes.create({ nome: configuracoesDados.nome, telefone: configuracoesDados.telefone, email: configuracoesDados.email, senha:configuracoesDados.senha, nomePropriedade:configuracoesDados.nomePropriedade, cep: configuracoesDados.cep, logradouro:configuracoesDados.logradouro, numero:configuracoesDados.numero, bairro:configuracoesDados.bairro, cidade:configuracoesDados.cidade})
//         res.status(201).send("Cadastrado")
//     } catch (e) {
//         console.error("erro", e);
//         res.status(400);
//     }
// })

// // ROTA APAGAR DADOS PAG CONFIGURAÇÕES
// router.get("/configuracoes/delete/:id", (req, res) => {
//     const id = req.params.id
//     Configuracoes.destroy({
//         where: {
//             id: id
//         }
//     }).then(() => {
//         res.redirect("/configuracoes")
//     })
// })

// // ROTA ALTERAR DADOS PAG CONFIGURAÇÕES
// router.get("/configuracoes/edit/:id", (req, res) => {
//     const id = req.params.id
//     Configuracoes.findByPk(id).then(function (configuracoes) {
//         res.render("configurscoesEdit", {
//             configuracoes: configuracoes
//         })
//     })
// })

// // ROTA UPDATE ALTERAÇÕES DADOS PAG. CONFIGURAÇÕES
// router.post("/configuracoes/update/:id", (req, res) => {
//     const id = req.params.id
//     const nome = req.params.nome
//     const email = req.params.email
//     const senha = req.params.senha
//     const nomePropriedade = req.params.nomePropriedade
//     const cpf = req.params.cpf
//     const logradouro = req.params.logradouro
//     const numero = req.params.numero
//     const bairro = req.params.bairro
//     const cidade = req.params.cidade

//     Configuracoes.update(
//         {
//             nome: nome,
//             email: email,
//             senha: senha,
//             nomePropriedade: nomePropriedade,
//             cpf: cpf,
//             logradouro: logradouro,
//             numero:numero,
//             bairro: bairro,
//             cidade: cidade            
//         },
//         { where: { id: id } }
//     ).then(() => {
//         res.redirect("/configuracoes")
//     })
// })

// export default router;