import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Talhoes from "./Talhoes.js";

const Pes = connection.define('pes', {
    id_pe: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_talhao: {
        type: sequelize.INTEGER,
        references: {
            model: Talhoes,
            key: 'id_talhao'
        }
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    situacao: {
        type: sequelize.ENUM('tratado', 'nao tratado', 'sem informacoes'),
        defaultValue: 'sem informacoes',
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
        allowNull: true
    },
});

Pes.sync({ force: false });

export default Pes;
