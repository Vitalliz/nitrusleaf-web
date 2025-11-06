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
// Sync removido - será feito centralmente no index.js após o banco estar pronto
// Deficiencia.sync({ force: false })
export default Deficiencia;