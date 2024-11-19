// ORM - Sequelize
import Sequelize from "sequelize";
//Configuração do Sequelize
import connection from "../config/sequelize-config.js";
//.define cria a tabela no banco
const Deficiencia = connection.define('deficiencia', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    p: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    s: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});
//Não força a criação da tabela caso já exista
Deficiencia.sync({ force: false })
export default Deficiencia;