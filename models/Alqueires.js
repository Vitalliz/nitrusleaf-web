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
    },
    latitude: {
        type: sequelize.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: sequelize.DECIMAL(11, 8),
        allowNull: true,
    },
    coordenadas_poligono: {
        type: sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array de coordenadas para desenhar o polígono do alqueire'
    }
});

// Sync removido - será feito centralmente no index.js após o banco estar pronto
// Alqueires.sync({ alter: true });

export default Alqueires;
