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
        allowNull: false,
    }
});

Pes.sync({ force: false });

export default Pes;
