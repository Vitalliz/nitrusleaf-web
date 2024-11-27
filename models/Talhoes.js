import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Propriedades from "./Propriedades.js";

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
    }
});

import '../config/relacionamentos-config.js';

Talhoes.sync({ force: false });

export default Talhoes;
