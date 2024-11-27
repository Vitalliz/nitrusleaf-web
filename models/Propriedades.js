import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Usuarios from "./Usuarios.js";
import '../config/relacionamentos-config.js';  // Importa a configuração dos relacionamentos

const Propriedades = connection.define('propriedades', {
    id_propriedade: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_usuario: {
        type: sequelize.INTEGER,
        references: {
            model: Usuarios,
            key: 'id_usuario'
        }
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    cep: {
        type: sequelize.STRING,
        allowNull: false,
    },
    logradouro: {
        type: sequelize.STRING,
        allowNull: false,
    },
    numero: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    bairro: {
        type: sequelize.STRING,
        allowNull: false,
    },
    cidade: {
        type: sequelize.STRING,
        allowNull: false,
    },
    talhoes_registrados: {
        type: sequelize.INTEGER,
        defaultValue: 0,
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

Propriedades.sync({ force: false });

export default Propriedades;
