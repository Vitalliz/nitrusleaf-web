// ORM - Sequelize
import Sequelize from "sequelize";
//Configuração do Sequelize
import connection from "../config/sequelize-config.js";
//.define cria a tabela no banco
const Historico = connection.define('historico', {
    id_historico: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_talhao: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
// Sync removido - será feito centralmente no index.js após o banco estar pronto
// Historico.sync({ force: false })
export default Historico;




