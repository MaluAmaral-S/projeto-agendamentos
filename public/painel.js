// public/painel.js

// Estado da aplicação
let userData = {};

// --- FUNÇÕES DE INICIALIZAÇÃO E AUTENTICAÇÃO ---

async function checkAuthAndLoadData() {
    try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }
        userData = await response.json();
        
        populateUserInfo();
        setupEventListeners();
        loadServicos();

    } catch (error) {
        console.error('Erro de autenticação:', error);
        window.location.href = '/login';
    }
}

function populateUserInfo() {
    document.getElementById('nome-usuario').textContent = userData.name || 'Usuário';
    document.getElementById('nome-empresa').textContent = userData.businessName || 'Empresa';
}

function setupEventListeners() {
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    setupTabs();

    const formServico = document.getElementById('form-servico');
    if (formServico) {
        formServico.addEventListener('submit', handleCreateService);
    }

    // --- NOVO: Listener para a máscara de input de duração ---
    const duracaoInput = document.getElementById('servico-duracao');
    if (duracaoInput) {
        duracaoInput.addEventListener('input', formatarInputDuracao);
    }
}

// --- LÓGICA DAS ABAS ---

function setupTabs() {
    const tabButtons = document.querySelectorAll('nav button[id^="tab-"]');
    const contentPanels = document.querySelectorAll('main div[id^="content-"]');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetContentId = button.id.replace('tab-', 'content-');
            tabButtons.forEach(btn => {
                btn.classList.remove('border-[#704abf]', 'text-[#704abf]');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            button.classList.add('border-[#704abf]', 'text-[#704abf]');
            button.classList.remove('border-transparent', 'text-gray-500');

            contentPanels.forEach(panel => {
                panel.id === targetContentId ? panel.classList.remove('hidden') : panel.classList.add('hidden');
            });
        });
    });
}

// --- LÓGICA DE SERVIÇOS (CRUD) ---

async function handleCreateService(e) {
    e.preventDefault();
    const form = e.target;
    const nome = document.getElementById('servico-nome').value;
    const descricao = document.getElementById('servico-descricao').value;
    const preco = document.getElementById('servico-preco').value;
    
    const duracaoFormatada = document.getElementById('servico-duracao').value;
    const duracao_minutos = parseDuracaoParaMinutos(duracaoFormatada); // Converte '01h:30min' para 90

    if (duracao_minutos <= 0) {
        showToast('error', 'Erro de Validação', 'A duração do serviço é obrigatória.');
        return;
    }

    try {
        const response = await fetch('/api/servicos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, descricao, duracao_minutos, preco }),
        });

        const newService = await response.json();
        if (!response.ok) throw new Error(newService.message || 'Erro ao criar serviço.');

        showToast('success', 'Sucesso!', 'Serviço adicionado com sucesso.');
        form.reset();
        loadServicos();

    } catch (error) {
        showToast('error', 'Erro!', error.message);
    }
}

async function loadServicos() {
    try {
        const response = await fetch('/api/servicos');
        if (!response.ok) throw new Error('Falha ao buscar serviços.');

        const servicos = await response.json();
        const listaContainer = document.getElementById('lista-servicos');

        if (servicos.length === 0) {
            listaContainer.innerHTML = `<div class="text-center py-8 text-gray-500"><i data-lucide="scissors" class="w-12 h-12 mx-auto mb-3 text-gray-300"></i><p>Nenhum serviço cadastrado ainda.</p></div>`;
        } else {
            listaContainer.innerHTML = servicos.map(servico => `
                <div class="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div>
                        <p class="font-semibold text-gray-800">${servico.nome}</p>
                        <p class="text-sm text-gray-500">${formatarMinutosParaDuracao(servico.duracao_minutos)} - R$ ${parseFloat(servico.preco || 0).toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="p-2 text-gray-400 hover:text-blue-500"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="confirmDeleteService(${servico.id})" class="p-2 text-gray-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>`).join('');
        }
        lucide.createIcons();
    } catch (error) {
        showToast('error', 'Erro!', error.message);
    }
}

function confirmDeleteService(serviceId) {
    showModal('Tem certeza?', 'Você realmente deseja excluir este serviço? Esta ação não pode ser desfeita.', async () => {
        try {
            const response = await fetch(`/api/servicos/${serviceId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Não foi possível excluir o serviço.');
            showToast('success', 'Excluído!', 'O serviço foi removido.');
            loadServicos();
        } catch (error) {
            showToast('error', 'Erro!', error.message);
        }
    });
}

// --- FUNÇÕES DE FORMATAÇÃO E PARSE DA DURAÇÃO ---

function formatarInputDuracao(event) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for dígito

    if (valor.length > 4) valor = valor.slice(0, 4);

    if (valor.length > 2) {
        input.value = `${valor.slice(0, 2)}h:${valor.slice(2, 4)}min`;
    } else if (valor.length > 0) {
        input.value = `${valor.slice(0, 2)}h`;
    } else {
        input.value = '';
    }
}

function parseDuracaoParaMinutos(str) {
    if (!str) return 0;
    const apenasDigitos = str.replace(/\D/g, '');
    if (apenasDigitos.length === 0) return 0;

    let horas = 0, minutos = 0;
    if (apenasDigitos.length <= 2) {
        horas = parseInt(apenasDigitos, 10);
    } else {
        horas = parseInt(apenasDigitos.slice(0, 2), 10);
        minutos = parseInt(apenasDigitos.slice(2, 4), 10);
    }
    return (horas * 60) + (minutos || 0);
}

function formatarMinutosParaDuracao(totalMinutos) {
    if (!totalMinutos || totalMinutos < 1) return '0min';
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    let resultado = '';
    if (horas > 0) resultado += `${String(horas).padStart(2, '0')}h`;
    if (minutos > 0) resultado += `:${String(minutos).padStart(2, '0')}min`;

    // Se começar com ':', remove (caso de durações menores que 1 hora)
    return resultado.startsWith(':') ? resultado.slice(1) : resultado;
}


// --- FUNÇÕES DE UI (MODAL, TOAST, LOGOUT) ---

async function handleLogout() { /* ...código existente... */ }
function showToast(type, title, message) { /* ...código existente... */ }
function showModal(title, message, onConfirm) { /* ...código existente... */ }

// Ponto de entrada
document.addEventListener('DOMContentLoaded', checkAuthAndLoadData);