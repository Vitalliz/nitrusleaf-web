import express from 'express';
import HisTal from "../models/HisTal.js"; // Certifique-se de que o nome do modelo está correto

const router = express.Router();

// ROTA HISTAL
router.get("/histal", function (req, res) {
    HisTal.findAll().then(histal => {
        // Ordena os dados pela data mais recente (aplica o quickSort)
        const sortedHistal = quickSort(histal, 'data_criacao');
        res.render("histal", { histal: sortedHistal });
    })
})

// Função Quick Sort para ordenar pela data
function quickSort(data, key) {
    if (data.length <= 1) {
        return data;
    }

    const pivot = data[data.length - 1];
    const left = [];
    const right = [];
    const pivotDate = new Date(pivot[key]); // Converte a data do pivô para objeto Date

    for (let i = 0; i < data.length - 1; i++) {
        const currentDate = new Date(data[i][key]); // Converte a data para objeto Date
        if (currentDate > pivotDate) {
            left.push(data[i]);
        } else {
            right.push(data[i]);
        }
    }

    return [...quickSort(left, key), pivot, ...quickSort(right, key)];
}

// Função para criar novo registro
router.post("/histal/new", function (req, res) {
    try {
        const histalDados = req.body;
        HisTal.create({ planta: histalDados.planta, status: histalDados.status })
        res.status(201).send("Cadastrado")
    } catch (e) {
        console.error("erro", e);
        res.status(400).send("Erro ao cadastrar");
    }
});

// Função para excluir registro
router.get("/histal/delete/:id", (req, res) => {
    const id = req.params.id;
    HisTal.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/histal");
    })
});

// Função para editar registro
router.get("/histal/edit/:id", (req, res) => {
    const id = req.params.id;
    HisTal.findByPk(id).then(function (histal) {
        res.render("histalEdit", {
            histal: histal
        })
    })
});

// Função para atualizar registro
router.post("/histal/update/:id", (req, res) => {
    const id = req.params.id;
    const planta = req.body.planta;
    const status = req.body.status;
    HisTal.update(
        {
            planta: planta,
            status: status,
        },
        { where: { id: id } }
    ).then(() => {
        res.redirect("/histal");
    })
});

export default router;
