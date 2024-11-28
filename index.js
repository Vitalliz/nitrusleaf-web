// Importando os pacotes necessários com ES6 Modules
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';  // Usado para verificar e criar a pasta uploads
import connection from './config/sequelize-config.js';
import session from 'express-session';
import flash from 'express-flash';

// Importando os Controllers
import TalhoesController from './controllers/TalhoesController.js';
import UsuariosController from './controllers/UsuariosController.js';
import FotoController from './controllers/FotoController.js';
import PesController from './controllers/PesController.js';
import RelatoriosController from './controllers/RelatoriosController.js';
import PropriedadesController from './controllers/PropriedadesController.js';
import HomeController from './controllers/HomeController.js';
import HistalController from './controllers/HistalController.js';
import DeficienciaController from './controllers/DeficienciaController.js';
import HistoricoController from './controllers/HistoricoController.js';
import MapaController from './controllers/MapaController.js';

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

// Iniciando o Express
const app = express();

// Função para criar as tabelas no banco de dados
async function createTables() {
    try {
        // Sincroniza todas as tabelas e respeita os relacionamentos definidos
        await connection.sync({ force: false });
        console.log('Tabelas sincronizadas com sucesso!');
    } catch (error) {
        console.error('Erro ao sincronizar as tabelas:', error);
    }
}

import configurarRelacionamentos from './config/relacionamentos-config.js';

// Configure os relacionamentos
configurarRelacionamentos();


// Criando a pasta 'uploads' se não existir
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configuração do Multer para o armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Diretório para onde os arquivos serão enviados
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo com timestamp
    }
});

const upload = multer({ storage: storage });

// Configurações do express-session e express-flash
app.use(session({
    secret: 'nitrusleafsecret',
    cookie: { maxAge: 3600000 }, // Sessão expira em 1 hora
    saveUninitialized: false,
    resave: false
}));

app.use(flash());

// Configuração do express para capturar dados de formulários
app.use(express.urlencoded({ extended: false }));

// Permite capturar dados enviados como JSON
app.use(express.json());

// Conectando ao banco de dados
connection.authenticate().then(() => {
    console.log('Conexão com o banco de dados feita com sucesso!');
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

// Servindo arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint para o upload de arquivos
app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado.' });
    }
    res.status(200).json({ success: true, message: 'Arquivo enviado com sucesso!', file: req.file });
});

// ROTA PRINCIPAL
app.get('/', (req, res) => {
    res.render('index', {
        messages: req.flash() // Passando mensagens de flash para a view
    });
});

// Endpoint principal
app.get('/', (req, res) => {
    // Defina o nome da imagem ou a lógica para pegar a imagem dinamicamente
    const imageUrl = '/uploads/1732670720985.png';  // Aqui você pode colocar a lógica para pegar a imagem desejada
    res.render('home', { imageUrl });
});

// Definindo o motor de templates EJS
app.set('view engine', 'ejs');

// Usando os Controllers
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
app.use("/", MapaController);

// Inicializando o servidor na porta 8080
const port = 8080;
app.listen(port, (erro) => {
    if (erro) {
        console.log('Ocorreu um erro!');
    } else {
        console.log(`Servidor iniciado com sucesso em: http://localhost:${port}`);
    }
});
