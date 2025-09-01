// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para registrar um novo usuário
exports.register = async (req, res) => {
  const { name, business, businessType, email, password } = req.body;

  try {
    // Verifica se o email já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }

    // Cria o usuário (a senha será criptografada pelo hook no modelo)
    const user = await User.create({
      name,
      businessName: business,
      businessType,
      email,
      password,
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
};

// Função para fazer login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Procura o usuário pelo e-mail
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Compara a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Se as senhas baterem, gera um token JWT
    const token = jwt.sign(
        { id: user.id, name: user.name, business: user.businessName },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expira em 1 hora
    );

    // Envia o token em um cookie HttpOnly para segurança
    res.cookie('token', token, {
      httpOnly: true, // Impede acesso via JavaScript no cliente
      secure: process.env.NODE_ENV === 'production', // Use https em produção
      maxAge: 3600000, // 1 hora
    });

    res.status(200).json({ message: 'Login bem-sucedido!' });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  // Pega o token do cookie
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // Se o pedido for para a página, redireciona. Se for para a API, envia erro.
    if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'Não autorizado. Faça o login.' });
    }
    return res.redirect('/login');
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Encontra o usuário pelo ID do token e anexa à requisição
    req.user = await User.findByPk(decoded.id);
    
    next(); // Continua para a próxima função/rota
  } catch (error) {
     if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
    return res.redirect('/login');
  }
};

// NOVA FUNÇÃO: Buscar perfil do usuário logado
exports.getProfile = async (req, res) => {
    // O middleware 'protect' já colocou os dados do usuário em req.user
    if (req.user) {
        res.status(200).json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            businessName: req.user.businessName,
        });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado.' });
    }
};


// NOVA FUNÇÃO: Logout
exports.logout = (req, res) => {
  // Limpa o cookie que armazena o token
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expira em 10 segundos
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
