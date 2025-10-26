import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Propriedades from "./Propriedades.js";

const Alqueires = connection.define("alqueires", {
    id_alqueire: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_propriedade: {
        type: sequelize.INTEGER,
        references: {
            model: "propriedades",
            key: "id_propriedade"
        },
        allowNull: false
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false
    },
    area_total: {
        type: sequelize.DECIMAL(10, 2),
        allowNull: true
    }
});

Alqueires.sync({ alter: true });

export default Alqueires;
