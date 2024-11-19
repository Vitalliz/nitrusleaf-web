// ORM - Sequelize
import sequelize from "sequelize";
//Configuração do Sequelize
import connection from "../config/sequelize-config.js";
import Talhoes from "./Talhoes.js"
//.define cria a tabela no banco
const Histal = connection.define('histal', {
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
        type: sequelize.ENUM('Tratado', 'Não tratado', 'Sem informações'),
        allowNull: false,
    },

    data_criacao: {
        type: sequelize.DATEONLY,
        allowNull: false,
    }
});
//Não força a criação da tabela caso já exista
Histal.sync({ force: false })
export default Histal;