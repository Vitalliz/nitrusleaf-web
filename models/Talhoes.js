import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Propriedades from "./Propriedades.js";

// Definição do modelo Talhoes
const Talhoes = connection.define('talhoes', {
    id_talhao: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_propriedade: {
        type: sequelize.INTEGER,
        references: {
            model: Propriedades,
            key: 'id_propriedade'
        }
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    especie_fruta: {
        type: sequelize.STRING,
        allowNull: false,
    },
    total_pes: {
        type: sequelize.INTEGER,
        defaultValue: 0,
    },
    pes_analisados: {
        type: sequelize.INTEGER,
        defaultValue: 0,
    },
    pes_diagnosticados: {
        type: sequelize.INTEGER,
        defaultValue: 0,
    }
});

// Sincronização com o banco de dados
Talhoes.sync({ force: false });

// Função para atualizar talhoes_registrados em Propriedades
async function atualizarTalhoesRegistrados(id_propriedade) {
    try {
        // Conta os talhões associados à propriedade
        const totalTalhoes = await Talhoes.count({
            where: { id_propriedade },
        });

        // Atualiza o campo talhoes_registrados na tabela Propriedades
        await Propriedades.update(
            { talhoes_registrados: totalTalhoes },
            { where: { id_propriedade } }
        );

        console.log(`Atualizado talhoes_registrados para ${totalTalhoes} na propriedade ${id_propriedade}.`);
    } catch (error) {
        console.error("Erro ao atualizar talhoes_registrados:", error);
    }
}

// Adicionando hooks ao modelo Talhoes
Talhoes.afterCreate(async (talhao, options) => {
    await atualizarTalhoesRegistrados(talhao.id_propriedade);
});

Talhoes.afterDestroy(async (talhao, options) => {
    await atualizarTalhoesRegistrados(talhao.id_propriedade);
});

export default Talhoes;