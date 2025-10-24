import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Talhoes from "./Talhoes.js";

const Pes = connection.define("pes", {
    id_pe: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_talhao: {
        type: sequelize.INTEGER,
        references: {
            model: 'talhoes',
            key: "id_talhao",
        },
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    situacao: {
        type: sequelize.ENUM("Tratado", "Não-Tratado", "Sem-informações"),
        defaultValue: "Sem-informações",
    },
    deficiencia_cobre: {
        type: sequelize.BOOLEAN,
        defaultValue: false,
    },
    deficiencia_manganes: {
        type: sequelize.BOOLEAN,
        defaultValue: false,
    },
    outros: {
        type: sequelize.BOOLEAN,
        defaultValue: false,
    },
    observacoes: {
        type: sequelize.STRING,
        allowNull: true,
    },
});

// Função para atualizar o campo `total_pes` no modelo Talhoes
async function atualizarTotalPes(id_talhao) {
    try {
        // Conta o total de pés associados ao talhão
        const totalPes = await Pes.count({
            where: { id_talhao },
        });

        // Atualiza o campo `total_pes` no talhão correspondente
        await Talhoes.update(
            { total_pes: totalPes },
            { where: { id_talhao } }
        );

        console.log(`Atualizado total_pes para ${totalPes} no talhão ${id_talhao}.`);
    } catch (error) {
        console.error("Erro ao atualizar total_pes:", error);
    }
}

// Adicionando hooks ao modelo `Pes`
Pes.afterCreate(async (pe, options) => {
    await atualizarTotalPes(pe.id_talhao);
});

Pes.afterDestroy(async (pe, options) => {
    await atualizarTotalPes(pe.id_talhao);
});

// Sincronização do modelo
Pes.sync({ force: false });

export default Pes;
