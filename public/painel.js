// public/painel.js

// Estado da aplicação
let userData = {};

// Função para verificar se o usuário está logado e buscar seus dados
async function checkAuthAndLoadData() {
    try {
        const response = await fetch('/api/auth/profile');

        if (!response.ok) {
            // Se a resposta não for OK (ex: 401), o token é inválido ou expirou
            window.location.href = '/login'; // Redireciona para o login
            return;
        }

        userData = await response.json();

        // Se chegou aqui, o usuário está autenticado. Carregamos o resto.
        populateUserInfo();
        setupEventListeners();
        // Adicione aqui chamadas para carregar outros dados do painel
        // ex: loadDashboardStats();
        // ex: loadServicos();

    } catch (error) {
        console.error('Erro de autenticação:', error);
        window.location.href = '/login'; // Em caso de erro de rede, etc.
    }
}

// Preenche as informações do usuário na interface
function populateUserInfo() {
    document.getElementById('nome-usuario').textContent = userData.name || 'Usuário';
    document.getElementById('nome-empresa').textContent = userData.businessName || 'Empresa';
    // Configure o link público se necessário
    // const linkPublico = `${window.location.origin}/agendamento.html?empresa=${userData.sublink}`;
    // document.getElementById('link-publico').value = linkPublico;
}

// Configura os ouvintes de evento (logout, etc.)
function setupEventListeners() {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    // Adicione outros listeners aqui
}

// Função de Logout
async function handleLogout() {
    try {
        await fetch('/api/auth/logout');
        // Após o logout bem-sucedido, redireciona para a página de login
        window.location.href = '/login';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Não foi possível sair. Tente novamente.');
    }
}

// Ponto de entrada: Executa quando o HTML é carregado
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadData();
});