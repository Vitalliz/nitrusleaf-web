// Importando os pacotes necessários com ES6 Modules
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise'; // usado para criar o banco automaticamente
import session from 'express-session';
import flash from 'express-flash';
import connection from './config/sequelize-config.js'; // Sequelize configurado

// Importando os Controllers
import TalhoesController from './controllers/TalhoesController.js';
import UsuariosController from './controllers/UsuariosController.js';
import FotoController from './controllers/FotoController.js';
import PesController from './controllers/PesController.js';
import RelatoriosController from './controllers/RelatoriosController.js';
import PropriedadesController from './controllers/PropriedadesController.js';
import HomeController from './controllers/HomeController.js';
import HistalController from './controllers/HistalController.js';
import ResultadoController from './controllers/ResultadoController.js';
import HistoricoController from './controllers/HistoricoController.js';
import MapaController from './controllers/MapaController.js';
import ConfiguracoesController from './controllers/ConfiguracoesController.js';

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
import configurarRelacionamentos from './config/relacionamentos-config.js';

// Configuração do servidor Express
const app = express();
const port = 8080;

// Garantir que o banco existe antes de conectar com Sequelize
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'nitrusleaf_pi'; // Nome fixo em minúsculo

async function ensureDatabaseExists() {
    try {
        const conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD
        });

        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );

        await conn.end();
        console.log(`Banco de dados '${DB_NAME}' verificado/criado com sucesso.`);
    } catch (err) {
        console.error('Erro ao garantir a existência do banco de dados:', err);
        process.exit(1);
    }
}

// Criação das tabelas com Sequelize
async function createTables() {
    try {
        await connection.sync({ force: false }); // Cria tabelas se não existirem
        console.log('sTabelas sincronizadas com sucesso!');
    } catch (error) {
        console.error('Erro ao sincronizar as tabelas:', error);
    }
}

// Configuração do Multer para upload de arquivos
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Configurações Express e Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'nitrusleafsecret',
    cookie: { maxAge: 3600000 },
    saveUninitialized: false,
    resave: false
}));
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Endpoint para upload
app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado.' });
    }
    res.status(200).json({ success: true, message: 'Arquivo enviado com sucesso!', file: req.file });
});

// Rotas principais
app.get('/', (req, res) => {
    res.render('index', { messages: req.flash() });
});

// Redirecionar /login para / (página inicial)
app.get('/login', (req, res) => {
    res.redirect('/');
});

// Rota para página de drone
app.get('/drone', (req, res) => {
    res.render('drone');
});

// Rota para seleção de tipo de cadastro
app.get('/selecionar-cadastro', (req, res) => {
    res.render('selecionar-cadastro');
});

// Rota para segunda etapa do cadastro (login/senha)
app.get('/cadastroLogin', (req, res) => {
    res.render('cadastroLogin');
});

// Usando os Controllers
app.use('/', TalhoesController);
app.use('/', UsuariosController);
app.use('/', FotoController);
app.use('/', PesController);
app.use('/', RelatoriosController);
app.use('/', PropriedadesController);
app.use('/', HomeController);
app.use('/', HistalController);
app.use('/', ResultadoController);
app.use('/', HistoricoController);
app.use('/', MapaController);
app.use('/', ConfiguracoesController);

// Inicialização do servidor
(async () => {
    await ensureDatabaseExists();       
    configurarRelacionamentos();        
    await connection.authenticate();    
    console.log('Conexão com o banco estabelecida com sucesso!');
    await createTables();               

    app.listen(port, (erro) => {
        if (erro) {
            console.error('Ocorreu um erro ao iniciar o servidor:', erro);
        } else {
            console.log(`Servidor iniciado com sucesso em: http://localhost:${port}`);
        }
    });
})();
