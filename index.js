import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import session from 'express-session';
import flash from 'express-flash';
import connection from './config/sequelize-config.js';

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
import AlqueiresController from './controllers/AlqueiresController.js';

import Usuarios from './models/Usuarios.js';
import Propriedades from './models/Propriedades.js';
import Alqueires from './models/Alqueires.js';
import Talhoes from './models/Talhoes.js';
import Pes from './models/Pes.js';
import Foto from './models/Foto.js';
import Relatorios from './models/Relatorios.js';
import Home from './models/Home.js';
import Deficiencia from './models/Deficiencia.js';
import Historico from './models/Historico.js';
import configurarRelacionamentos from './config/relacionamentos-config.js';

const app = express();
const port = 8080;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'NitrusLeaf_PI';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDatabase(maxRetries = 30, delay = 2000) {
    console.log(`⏳ Aguardando banco de dados MySQL em ${DB_HOST}:${DB_PORT}...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const conn = await mysql.createConnection({
                host: DB_HOST,
                port: DB_PORT,
                user: DB_USER,
                password: DB_PASSWORD,
                connectTimeout: 5000
            });
            
            await conn.ping();
            await conn.query('SELECT 1');
            
            await conn.end();
            console.log(`✓ Banco de dados MySQL está disponível e funcional!`);
            return true;
        } catch (err) {
            if (attempt === maxRetries) {
                console.error(`\n✗ Falha ao conectar ao banco de dados após ${maxRetries} tentativas.`);
                console.error(`Erro: ${err.message}`);
                throw err;
            }
            const waitTime = Math.floor(delay / 1000);
            console.log(`  Tentativa ${attempt}/${maxRetries} falhou. Aguardando ${waitTime}s...`);
            await sleep(delay);
            delay = Math.min(delay * 1.2, 10000);
        }
    }
}

async function ensureDatabaseExists() {
    try {
        await waitForDatabase();
        console.log('  Aguardando mais 2 segundos para garantir inicialização completa...');
        await sleep(2000);
        const conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            connectTimeout: 10000
        });

        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
        
        const [databases] = await conn.query('SHOW DATABASES LIKE ?', [DB_NAME]);
        if (databases.length === 0) {
            throw new Error(`Banco de dados '${DB_NAME}' não foi criado corretamente.`);
        }

        await conn.end();
        console.log(`✓ Banco de dados '${DB_NAME}' verificado/criado com sucesso.`);
        await sleep(1000);
        console.log('');
    } catch (err) {
        console.error('\n✗ Erro ao garantir a existência do banco de dados:', err.message);
        console.error('Detalhes:', err);
        process.exit(1);
    }
}

async function authenticateDatabase(maxRetries = 10, delay = 2000) {
    console.log('⏳ Autenticando conexão com Sequelize...');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await connection.authenticate();
            console.log('✓ Conexão com o banco estabelecida com sucesso!\n');
            return true;
        } catch (error) {
            if (attempt === maxRetries) {
                console.error(`\n✗ Falha ao autenticar no banco após ${maxRetries} tentativas.`);
                console.error(`Erro: ${error.message}`);
                throw error;
            }
            const waitTime = Math.floor(delay / 1000);
            console.log(`  Tentativa de autenticação ${attempt}/${maxRetries} falhou. Aguardando ${waitTime}s...`);
            await sleep(delay);
            delay = Math.min(delay * 1.2, 10000);
        }
    }
}

async function createTables() {
    try {
        console.log('⏳ Sincronizando tabelas do banco de dados...');
        
        console.log('  Criando tabelas na ordem correta...');
        await Usuarios.sync({ force: false });
        console.log('  ✓ Tabela Usuarios criada');
        
        await Propriedades.sync({ force: false });
        console.log('  ✓ Tabela Propriedades criada');
        
        await Alqueires.sync({ alter: true });
        console.log('  ✓ Tabela Alqueires criada');
        
        await Talhoes.sync({ alter: true });
        console.log('  ✓ Tabela Talhoes criada');
        
        await Pes.sync({ force: false });
        console.log('  ✓ Tabela Pes criada');
        
        await Foto.sync({ force: false });
        console.log('  ✓ Tabela Foto criada');
        
        await Relatorios.sync({ force: false });
        console.log('  ✓ Tabela Relatorios criada');
        try {
            await Home.sync({ force: false });
            console.log('  ✓ Tabela Home criada');
        } catch (e) { 
            console.log('  ⚠ Tabela Home não criada (pode não existir)');
        }
        
        try {
            await Historico.sync({ force: false });
            console.log('  ✓ Tabela Historico criada');
        } catch (e) { 
            console.log('  ⚠ Tabela Historico não criada (pode não existir)');
        }
        
        try {
            await Deficiencia.sync({ force: false });
            console.log('  ✓ Tabela Deficiencia criada');
        } catch (e) { 
            console.log('  ⚠ Tabela Deficiencia não criada (pode não existir)');
        }
        
        try {
            await Histal.sync({ force: false });
            console.log('  ✓ Tabela Histal criada');
        } catch (e) { 
            console.log('  ⚠ Tabela Histal não criada (pode não existir)');
        }
        
        console.log('✓ Todas as tabelas sincronizadas com sucesso!\n');
    } catch (error) {
        console.error('\n✗ Erro ao sincronizar as tabelas:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'nitrusleafsecret',
    cookie: { maxAge: 3600000 },
    saveUninitialized: false,
    resave: false
}));
app.use(flash());
app.use((req, res, next) => {
    let cachedMessages;
    res.locals.getFlashMessages = () => {
        if (!cachedMessages) {
            cachedMessages = req.flash();
        }
        return cachedMessages;
    };
    next();
});
app.use(async (req, res, next) => {
    try {
        if (req.session.user && req.session.user.id_usuario) {
            const usuarioLogado = await Usuarios.findByPk(req.session.user.id_usuario);
            res.locals.usuarioLogado = usuarioLogado ? usuarioLogado.get({ plain: true }) : null;
            if (res.locals.usuarioLogado) {
                req.session.user.foto_perfil = res.locals.usuarioLogado.foto_perfil || null;
            }
        } else {
            res.locals.usuarioLogado = null;
        }
        next();
    } catch (error) {
        next(error);
    }
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado.' });
    }
    res.status(200).json({ success: true, message: 'Arquivo enviado com sucesso!', file: req.file });
});

app.get('/', (req, res) => {
    const messages = {
        success: req.flash('success'),
        danger: req.flash('danger'),
        error: req.flash('error'),
        warning: req.flash('warning'),
        info: req.flash('info')
    };
    res.render('index', { messages });
});

app.get('/login', (req, res) => {
    const messages = {
        success: req.flash('success'),
        danger: req.flash('danger'),
        error: req.flash('error'),
        warning: req.flash('warning'),
        info: req.flash('info')
    };
    res.render('index', { messages });
});

app.get('/drone', (req, res) => {
    res.render('drone');
});

app.get('/selecionar-cadastro', (req, res) => {
    res.render('selecionar-cadastro');
});

app.get('/cadastroLogin', (req, res) => {
    res.render('cadastroLogin');
});

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
app.use('/', AlqueiresController);

(async () => {
    try {
        console.log('🚀 Iniciando aplicação NitrusLeaf...\n');
        
        await ensureDatabaseExists();
        configurarRelacionamentos();
        await authenticateDatabase();
        await createTables();
        app.listen(port, (erro) => {
            if (erro) {
                console.error('✗ Ocorreu um erro ao iniciar o servidor:', erro);
                process.exit(1);
            } else {
                console.log(`\n✅ Servidor iniciado com sucesso!`);
                console.log(`📍 Acesse: http://localhost:${port}\n`);
            }
        });
    } catch (error) {
        console.error('\n✗ Erro fatal durante inicialização:', error);
        process.exit(1);
    }
})();
