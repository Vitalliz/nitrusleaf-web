---
description: Repository Information Overview
alwaysApply: true
---

# NitrusLeaf Web Application Information

## Summary
NitrusLeaf is a web application developed with Node.js, Express, and Sequelize, integrated with MySQL and supporting image uploads. It's designed for managing agricultural properties, plots, and diagnostics, with automatic database creation and table synchronization.

## Structure
- **config/**: Sequelize configuration and relationship definitions
- **controllers/**: Business logic and route handlers
- **middleware/**: Authentication and validation middleware
- **models/**: Sequelize models for database tables
- **public/**: Static assets (CSS, JavaScript, images)
- **uploads/**: Storage for uploaded images
- **views/**: EJS templates for rendering pages

## Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: ES Modules (type: "module")
**Build System**: npm
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- express: ^4.21.2 - Web framework
- sequelize: ^6.37.3 - ORM for database operations
- mysql2: ^3.15.2 - MySQL client
- ejs: ^3.1.9 - Template engine
- bcrypt: ^5.1.1 - Password hashing
- multer: ^1.4.5-lts.1 - File upload handling
- express-session: ^1.18.1 - Session management
- express-flash: ^0.0.2 - Flash messages

**Development Dependencies**:
- nodemon: ^3.0.1 - Development server with auto-reload

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Database Configuration
**Type**: MySQL
**Name**: nitrusleaf_pi
**Host**: localhost
**User**: root
**Password**: (empty)
**Connection**: Sequelize ORM

## Main Files
**Entry Point**: index.js
**Models**: models/*.js (Usuarios.js, Propriedades.js, Talhoes.js, etc.)
**Controllers**: controllers/*.js (UsuariosController.js, PropriedadesController.js, etc.)
**Views**: views/*.ejs (home.ejs, login.ejs, cadastro.ejs, etc.)

## Features
- User authentication and session management
- Property and plot management
- Plant tracking and diagnostics
- Image upload and processing
- Historical data and reporting
- Map visualization
- Automatic database creation and table synchronization

## API Endpoints
- **GET /** - Home page
- **POST /uploads** - Image upload
- **GET/POST /usuarios** - User management
- **GET/POST /propriedades** - Property management
- **GET/POST /talhoes** - Plot management
- **GET /relatorios** - Reports
- **GET /historico** - Diagnostic history
- **GET /mapa** - Property maps

## Server Configuration
**Port**: 8080
**Static Files**: /public directory
**Uploads**: /uploads directory
**Session Secret**: nitrusleafsecret
**Session Timeout**: 3600000ms (1 hour)