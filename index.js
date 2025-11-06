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
import AlqueiresController from './controllers/AlqueiresController.js';

// Importando os modelos
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

// Configuração do servidor Express
const app = express();
const port = 8080;

// Garantir que o banco existe antes de conectar com Sequelize
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'NitrusLeaf_PI'; // Nome do banco (case-sensitive no MySQL)

// Função auxiliar para aguardar com retry
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para testar conexão com retry
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
            
            // Testar se o MySQL está realmente pronto (não apenas aceitando conexões)
            await conn.ping();
            
            // Tentar uma query simples para garantir que está totalmente funcional
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
            // Aumentar delay progressivamente (backoff exponencial), mas não mais que 10s
            delay = Math.min(delay * 1.2, 10000);
        }
    }
}

async function ensureDatabaseExists() {
    try {
        // Aguardar banco estar disponível
        await waitForDatabase();
        
        // Aguardar um pouco mais para garantir que o MySQL está totalmente inicializado
        console.log('  Aguardando mais 2 segundos para garantir inicialização completa...');
        await sleep(2000);
        
        // Criar conexão e banco de dados
        const conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            connectTimeout: 10000
        });

        // Criar o banco de dados se não existir
        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
        
        // Verificar se o banco foi criado corretamente
        const [databases] = await conn.query('SHOW DATABASES LIKE ?', [DB_NAME]);
        if (databases.length === 0) {
            throw new Error(`Banco de dados '${DB_NAME}' não foi criado corretamente.`);
        }

        await conn.end();
        console.log(`✓ Banco de dados '${DB_NAME}' verificado/criado com sucesso.`);
        
        // Aguardar mais um pouco para garantir que o MySQL processou a criação
        await sleep(1000);
        console.log('');
    } catch (err) {
        console.error('\n✗ Erro ao garantir a existência do banco de dados:', err.message);
        console.error('Detalhes:', err);
        process.exit(1);
    }
}

// Autenticar conexão com Sequelize com retry
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

// Criação das tabelas com Sequelize na ordem correta
async function createTables() {
    try {
        console.log('⏳ Sincronizando tabelas do banco de dados...');
        
        // Criar tabelas na ordem correta respeitando as dependências de foreign keys
        // Ordem: tabelas sem dependências primeiro, depois as que dependem delas
        console.log('  Criando tabelas na ordem correta...');
        
        // 1. Usuarios (sem dependências)
        await Usuarios.sync({ force: false });
        console.log('  ✓ Tabela Usuarios criada');
        
        // 2. Propriedades (depende de Usuarios)
        await Propriedades.sync({ force: false });
        console.log('  ✓ Tabela Propriedades criada');
        
        // 3. Alqueires (depende de Propriedades)
        await Alqueires.sync({ alter: true });
        console.log('  ✓ Tabela Alqueires criada');
        
        // 4. Talhoes (depende de Propriedades e Alqueires)
        await Talhoes.sync({ alter: true });
        console.log('  ✓ Tabela Talhoes criada');
        
        // 5. Pes (depende de Talhoes)
        await Pes.sync({ force: false });
        console.log('  ✓ Tabela Pes criada');
        
        // 6. Foto (depende de Pes e Talhoes)
        await Foto.sync({ force: false });
        console.log('  ✓ Tabela Foto criada');
        
        // 7. Relatorios (depende de Pes e Foto)
        await Relatorios.sync({ force: false });
        console.log('  ✓ Tabela Relatorios criada');
        
        // Sincronizar outros modelos se existirem (sem dependências críticas)
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

// Endpoint para upload
app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado.' });
    }
    res.status(200).json({ success: true, message: 'Arquivo enviado com sucesso!', file: req.file });
});

// Rotas principais
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

// Redirecionar /login para / (página inicial) com mensagens flash
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
app.use('/', AlqueiresController);

// Inicialização do servidor
(async () => {
    try {
        console.log('🚀 Iniciando aplicação NitrusLeaf...\n');
        
        // Passo 1: Aguardar e garantir que o banco existe
        await ensureDatabaseExists();
        
        // Passo 2: Configurar relacionamentos dos modelos
        configurarRelacionamentos();
        
        // Passo 3: Autenticar conexão com Sequelize (com retry)
        await authenticateDatabase();
        
        // Passo 4: Sincronizar/criar tabelas
        await createTables();
        
        // Passo 5: Iniciar servidor Express
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
