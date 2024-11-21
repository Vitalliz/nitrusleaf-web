// Importando o Express com ES6 Modules
import express from 'express';
// Iniciando o Express na variável app
const app = express();
// Importando o ORM sequelize com os dados de conexão
import connection from './config/sequelize-config.js';
// Importando os Controllers (onde estão as rotas)
import TalhoesController from './controllers/TalhoesController.js';
import UsuariosController from './controllers/UsuariosController.js';
import FotoController from './controllers/FotoController.js';
import PesController from './controllers/PesController.js';
import RelatoriosController from './controllers/RelatoriosController.js';
import PropriedadesController from './controllers/PropriedadesController.js';
import HomeController from './controllers/HomeController.js'
import HistalController from './controllers/HistalController.js'
import DeficienciaController from './controllers/DeficienciaController.js';
import HistoricoController from './controllers/HistoricoController.js';
// import ConfiguracoesController from './controllers/ConfiguracoesController.js'
// Importando o gerador de sessões do express
import session from 'express-session';
// Importando o middleware Auth
import Auth from './middleware/Auth.js';
// Importando o express-flash
import flash from 'express-flash';
// Importando os modelos
import Usuarios from './models/Usuarios.js';
import Propriedades from './models/Propriedades.js';
import Talhoes from './models/Talhoes.js';
import Pes from './models/Pes.js';
import Foto from './models/Foto.js';
import Relatorios from './models/Relatorios.js';
import Home from './models/Home.js';
import Deficiencia from './models/Deficiencia.js';
import Historico from './models/Historico.js';

// Função para criar as tabelas
async function createTables() {
    try {
        await Usuarios.sync({ force: false });
        console.log('Tabela "Usuarios" criada.');
        
        await Propriedades.sync({ force: false });
        console.log('Tabela "Propriedades" criada.');
        
        await Talhoes.sync({ force: false });
        console.log('Tabela "Talhoes" criada.');
        
        await Pes.sync({ force: false });
        console.log('Tabela "Pes" criada.');
        
        await Foto.sync({ force: false });
        console.log('Tabela "Foto" criada.');
        
        await Relatorios.sync({ force: false });
        console.log('Tabela "Relatorios" criada.');
    } catch (error) {
        console.error('Erro ao criar as tabelas:', error);
    }
}

// Iniciando a configuração do Express-flash
app.use(flash());

// Configurando o express-session
app.use(session({
    secret: 'nitrusleafsecret',
    cookie: { maxAge: 3600000 }, // Sessão expira em 1 hora
    saveUninitialized: false,
    resave: false
}));

// Permite capturar dados vindo de formulários
app.use(express.urlencoded({ extended: false }));

// Realizando a conexão com o banco de dados
connection.authenticate().then(() => {
    console.log('Conexão com o banco de dados feita com sucesso!');
    // Criando as tabelas após a conexão
    createTables();
}).catch((error) => {
    console.log(error);
});

// Criando o banco de dados se ele não existir
connection.query('CREATE DATABASE IF NOT EXISTS NitrusLeaf_PI;').then(() => {
    console.log('O banco de dados está criado.');
}).catch((error) => {
    console.log(error);
});

// Define o EJS como renderizador de páginas
app.set('view engine', 'ejs');
// Define o uso da pasta "public" para uso de arquivos estáticos
app.use(express.static('public'));

// Definindo o uso das rotas dos Controllers
app.use('/', TalhoesController);
app.use('/', UsuariosController);
app.use('/', FotoController);
app.use('/', PesController);
app.use('/', RelatoriosController);
app.use('/', PropriedadesController);
app.use('/', HomeController);
app.use('/', HistalController);
app.use('/', DeficienciaController);
app.use('/', HistoricoController);
// app.use('/', ConfiguracoesController);

// ROTA PRINCIPAL
app.get('/', (req, res) => {
    res.render('index', {
        messages: req.flash() // Passando as mensagens de flash para a view
    });
});

// INICIA O SERVIDOR NA PORTA 8080
const port = '8080';
app.listen(port, (erro) => {
    if (erro) {
        console.log('Ocorreu um erro!');
    } else {
        console.log(`Servidor iniciado com sucesso em: http://localhost:${port}`);
    }
});
