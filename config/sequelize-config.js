//Importando o Sequelize
import Sequelize from "sequelize";
//Criando os dados de conexão com o banco de dados
const connection = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'NitrusLeaf_PI',
    timezone: '-03:00'
})

export default connection;