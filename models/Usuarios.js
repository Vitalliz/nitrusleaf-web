import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";

const Usuarios = connection.define('usuarios', {
    id_usuario: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    foto_perfil: {
        type: sequelize.STRING,
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    sobrenome: {
        type: sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize.STRING,
        allowNull: false,
    },
    senha: {
        type: sequelize.STRING,
        allowNull: false,
    },
    telefone: {
        type: sequelize.STRING,
    },
    celular: {
        type: sequelize.STRING,
    },
    tipo_pessoa: {
        type: sequelize.ENUM('fisica', 'juridica'),
        allowNull: false,
        defaultValue: 'fisica',
    },
    cpf: {
        type: sequelize.STRING,
    },
    cep: {
        type: sequelize.STRING,
    },
    cnpj: {
        type: sequelize.STRING,
    },
    nome_fantasia: {
        type: sequelize.STRING,
    },
    logradouro: {
        type: sequelize.STRING,
    },
    numero: {
        type: sequelize.STRING,
    },
    bairro: {
        type: sequelize.STRING,
    },
    cidade: {
        type: sequelize.STRING,
    }
});

Usuarios.sync({ force: false });

export default Usuarios;
