// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const sequelize = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const { protect } = require('./src/controllers/authController'); // Importa a função de proteção

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(express.json()); // Para interpretar o corpo de requisições como JSON
app.use(express.urlencoded({ extended: true })); // Para interpretar dados de formulários
app.use(cookieParser()); // Para interpretar os cookies enviados pelo navegador

// Servir arquivos estáticos (HTML, CSS, JS do cliente) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API de autenticação (/api/auth/login, /api/auth/register, etc.)
app.use('/api/auth', authRoutes);
// No futuro, outras rotas de API (serviços, agendamentos) podem ser adicionadas aqui


// --- ROTAS PARA SERVIR AS PÁGINAS (VIEWS) ---

// Rotas Públicas (acessíveis por qualquer um)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Rotas Protegidas (exigem que o usuário esteja logado)
// O middleware 'protect' é executado antes de servir o arquivo.
// Se o usuário não tiver um token válido, ele será redirecionado para /login.
app.get('/painel', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

app.get('/planos', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'planos.html'));
});


// --- INICIALIZAÇÃO DO SERVIDOR ---

// Sincroniza os modelos do Sequelize com o banco de dados e inicia o servidor
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log('Conexão com o banco de dados estabelecida com sucesso.');
        });
    })
    .catch(err => {
        console.error('Não foi possível conectar ao banco de dados:', err);
    });