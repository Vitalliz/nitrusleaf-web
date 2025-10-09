
#  🌿NitrusLeaf — Aplicação Web 
O **NitrusLeaf** é uma aplicação web desenvolvida em **Node.js + Express + Sequelize**, com integração a **MySQL** e suporte a **upload de imagens**, destinada ao gerenciamento de propriedades, talhões e diagnósticos agrícolas.
A aplicação garante automaticamente a criação do banco de dados, sincroniza as tabelas e organiza rotas modulares por controladores.

---

## ⚙️ Tecnologias Utilizadas

* **Node.js** — servidor e execução JavaScript no back-end
* **Express.js** — framework para criação das rotas e middlewares
* **Sequelize ORM** — mapeamento objeto-relacional (MySQL)
* **MySQL** — banco de dados relacional
* **Multer** — upload de imagens
* **EJS** — motor de templates para renderização de páginas
* **express-session** e **express-flash** — controle de sessão e mensagens temporárias
* **fs / path** — manipulação de arquivos e diretórios

---

##  Estrutura do Projeto

```
NITRUSLEAF/
│
├── config/               # Configuração do Sequelize e relacionamentos
├── controllers/          # Controladores com regras de negócio e rotas
├── middleware/           # Middlewares (validação, autenticação, etc.)
├── models/               # Modelos Sequelize das tabelas
├── public/               # Arquivos públicos e estáticos
├── uploads/              # Armazenamento de imagens enviadas
├── index.js              # Arquivo principal da aplicação
├── createTables.js       # Script auxiliar para sincronização manual
└── package.json
```

---

##  Funcionalidades Principais

* Criação automática do banco de dados se não existir.
* Sincronização automática das tabelas Sequelize.
* Upload de imagens via **Multer**.
* Gerenciamento de:

  * Usuários
  * Propriedades
  * Talhões
  * Pés (plantas individuais)
  * Fotos e relatórios
  * Histórico e resultados
  * Mapas de propriedades

---

## Inicialização do Servidor

### 🔧 Pré-requisitos

* Node.js instalado
* MySQL rodando localmente

### 📦 Instalação

```bash
# Clonar o repositório
git clone https://github.com/ORG/nitrusleaf.git

# Entrar na pasta
cd nitrusleaf

# Instalar dependências
npm install
```


### ▶️ Execução

```bash
npm start
```

Servidor disponível em:
 **[http://localhost:8080](http://localhost:8080)**

---

##  Criação Automática do Banco de Dados

Durante a inicialização (`index.js`):

* O sistema cria automaticamente o banco (`ensureDatabaseExists()`).
* Sincroniza tabelas com Sequelize (`createTables()`).
* Exibe logs confirmando cada criação no terminal.

---

##  Upload de Imagens

A rota de upload usa o **Multer** e armazena os arquivos localmente na pasta `/uploads`.

**Endpoint:**

```
POST /uploads
```

**Corpo da requisição:**

* `file`: arquivo da imagem a ser enviada.

**Resposta:**

```json
{
  "success": true,
  "message": "Arquivo enviado com sucesso!",
  "file": {
    "filename": "1696804123001.jpg"
  }
}
```

---

## 🌐 Rotas Principais

| Método | Rota            | Descrição                        |
| :----: | :-------------- | :------------------------------- |
|  `GET` | `/`             | Página inicial                   |
| `POST` | `/uploads`      | Upload de imagem                 |
|  `GET` | `/usuarios`     | Listar usuários                  |
| `POST` | `/usuarios`     | Criar usuário                    |
|  `GET` | `/propriedades` | Listar propriedades              |
| `POST` | `/propriedades` | Cadastrar nova propriedade       |
|  `GET` | `/talhoes`      | Listar talhões                   |
| `POST` | `/talhoes`      | Criar talhão                     |
|  `GET` | `/relatorios`   | Visualizar relatórios            |
|  `GET` | `/historico`    | Exibir histórico de diagnósticos |
|  `GET` | `/mapa`         | Exibir mapa de propriedades      |

> ⚠️ As rotas são carregadas dinamicamente através dos controladores definidos em `controllers/`.

---



## 📂 Uploads

Os arquivos enviados são armazenados localmente na pasta `/uploads`.
O nome é gerado com `Date.now()` + extensão do arquivo original.

---
