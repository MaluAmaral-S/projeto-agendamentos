// public/planos.js

// Estado da aplicação
let userData = {};

// Função para verificar autenticação e carregar dados
async function checkAuthAndLoadData() {
    try {
        const profileResponse = await fetch('/api/auth/profile');
        if (!profileResponse.ok) {
            window.location.href = '/login';
            return;
        }
        userData = await profileResponse.json();

        // Agora que sabemos que o usuário está logado, carregamos o status da assinatura
        await loadAssinaturaStatus();
        setupEventListeners();

    } catch (error) {
        console.error('Erro de autenticação ou carregamento:', error);
        window.location.href = '/login';
    }
}

// Carrega o status da assinatura do usuário
async function loadAssinaturaStatus() {
    // try {
    //     // Simule ou implemente a chamada real para /api/pagamentos/status
    //     console.log('Carregando status da assinatura...');
    //     // const response = await fetch('/api/pagamentos/status');
    //     // const data = await response.json();
    //     // displayAssinaturaStatus(data);
    //
    //     // Exemplo de como exibir um status de "sem assinatura"
           displayAssinaturaStatus({ ativa: false });
    // } catch (error) {
    //     console.error('Erro ao carregar status da assinatura:', error);
    // }
}

// Exibe o status da assinatura (seu código existente, com pequenas adaptações)
function displayAssinaturaStatus(data) {
     const container = document.getElementById('status-container');
    
    if (data.ativa) {
        // ... (seu código para exibir assinatura ativa)
    } else {
        container.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <i data-lucide="info" class="w-6 h-6 text-blue-600"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-blue-900">Nenhuma Assinatura Ativa</h3>
                        <p class="text-blue-700">Escolha um plano abaixo para começar a usar todas as funcionalidades do AgendaPro.</p>
                    </div>
                </div>
            </div>
        `;
    }
    lucide.createIcons();
}

// Configura ouvintes de evento
function setupEventListeners() {
    // ... (configure os modais e outros botões como no seu código original)
}

// Função para assinar um plano
async function assinarPlano(plano) {
    console.log(`Tentando assinar o plano: ${plano}`);
    // A lógica de assinatura permanece a mesma, pois o cookie será enviado automaticamente
    // try {
    //     const response = await fetch('/api/pagamentos/criar-assinatura', { /* ... */ });
    //     // ...
    // } catch (error) {
    //     // ...
    // }
}


// Ponto de entrada
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadData();
});