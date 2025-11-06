//Importando o Sequelize
import Sequelize from "sequelize";

//Criando os dados de conexão com o banco de dados
// Nota: O Sequelize não conecta automaticamente ao criar a instância
// A conexão só acontece quando authenticate() ou uma query é executada
const connection = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'NitrusLeaf_PI',
    timezone: '-03:00',
    logging: false, // Desabilitar logs de SQL por padrão
    define: {
        freezeTableName: true, // Não pluralizar nomes de tabelas - mantém exatamente como definido
        timestamps: true, // Usar createdAt e updatedAt automaticamente
        underscored: false, // Não usar snake_case
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000, // Tempo máximo para adquirir conexão (30s)
        idle: 10000, // Tempo máximo que uma conexão pode ficar idle (10s)
        evict: 1000 // Intervalo para verificar conexões idle
    },
    retry: {
        max: 3 // Máximo de 3 tentativas em caso de erro
    },
    dialectOptions: {
        connectTimeout: 30000 // Timeout de conexão de 30 segundos
    }
})

export default connection;