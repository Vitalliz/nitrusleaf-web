// ORM - Sequelize
import Sequelize from "sequelize";
//Configuração do Sequelize
import connection from "../config/sequelize-config.js";
//.define cria a tabela no banco
const Home = connection.define('home', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome:{
        type: Sequelize.INTEGER,
        allowNull: false,

    }
});
//Não força a criação da tabela caso já exista
Home.sync({ force: false })
export default Home;