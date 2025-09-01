// Variáveis globais
let empresaData = {};
let servicosData = [];
let selectedServico = null;
let selectedData = null;
let selectedHorario = null;
let currentStep = 1;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Obter parâmetro da empresa da URL
    const urlParams = new URLSearchParams(window.location.search);
    const empresaSublink = urlParams.get('empresa');
    
    if (!empresaSublink) {
        showError('Link inválido. Parâmetro da empresa não encontrado.');
        return;
    }
    
    // Carregar dados da empresa
    await loadEmpresaData(empresaSublink);
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar calendário
    initCalendar();
});

// Carregar dados da empresa
async function loadEmpresaData(sublink) {
    try {
        const response = await fetch(`/api/public/empresa/${sublink}`);
        
        if (!response.ok) {
            throw new Error('Empresa não encontrada ou inativa');
        }
        
        const data = await response.json();
        empresaData = data.empresa;
        servicosData = data.servicos;
        
        // Atualizar interface
        document.getElementById('empresa-nome').textContent = empresaData.nome_fantasia;
        
        // Esconder loading e mostrar primeiro step
        hideLoading();
        showStep(1);
        loadServicos();
        
    } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        showError(error.message);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegação
    document.getElementById('btn-voltar').addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });
    
    document.getElementById('btn-continuar').addEventListener('click', () => {
        if (validateCurrentStep()) {
            showStep(currentStep + 1);
        }
    });
    
    // Calendário
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Formulário
    document.getElementById('form-agendamento').addEventListener('submit', handleSubmitAgendamento);
}

// Mostrar step específico
function showStep(step) {
    currentStep = step;
    
    // Esconder todos os steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    
    // Atualizar indicadores de progresso
    updateProgressIndicators();
    
    // Mostrar step atual
    switch (step) {
        case 1:
            document.getElementById('step-servico').classList.remove('hidden');
            break;
        case 2:
            document.getElementById('step-data').classList.remove('hidden');
            renderCalendar();
            break;
        case 3:
            document.getElementById('step-horario').classList.remove('hidden');
            loadHorarios();
            break;
        case 4:
            document.getElementById('step-dados').classList.remove('hidden');
            updateResumo();
            break;
    }
    
    // Mostrar/esconder botões de navegação
    const navButtons = document.getElementById('navigation-buttons');
    if (step >= 1 && step <= 4) {
        navButtons.classList.remove('hidden');
        
        // Configurar botão voltar
        const btnVoltar = document.getElementById('btn-voltar');
        btnVoltar.style.visibility = step === 1 ? 'hidden' : 'visible';
        
        // Configurar botão continuar
        const btnContinuar = document.getElementById('btn-continuar');
        btnContinuar.style.display = step === 4 ? 'none' : 'flex';
    } else {
        navButtons.classList.add('hidden');
    }
}

// Atualizar indicadores de progresso
function updateProgressIndicators() {
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        
        if (i < currentStep) {
            stepEl.className = 'step-completed w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm';
        } else if (i === currentStep) {
            stepEl.className = 'step-active w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm';
        } else {
            stepEl.className = 'step-inactive w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm';
        }
    }
    
    // Atualizar barras de progresso
    for (let i = 1; i <= 3; i++) {
        const progressEl = document.getElementById(`progress-${i}-${i + 1}`);
        if (currentStep > i) {
            progressEl.className = 'h-full bg-[#704abf] transition-all duration-300';
        } else {
            progressEl.className = 'h-full bg-gray-200 transition-all duration-300';
        }
    }
}

// Carregar serviços
function loadServicos() {
    const container = document.getElementById('servicos-container');
    
    if (servicosData.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="scissors" class="w-6 h-6 text-gray-400"></i>
                </div>
                <p class="text-gray-600">Nenhum serviço disponível no momento</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = servicosData.map(servico => `
        <div class="service-card border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedServico?.id === servico.id ? 'border-[#704abf] bg-[#704abf]/5' : 'hover:border-gray-300'}" 
             onclick="selectServico(${servico.id})">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-[#704abf]/10 rounded-lg flex items-center justify-center">
                        <i data-lucide="scissors" class="w-6 h-6 text-[#704abf]"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${servico.nome}</h3>
                        <p class="text-sm text-gray-600">${servico.descricao || 'Sem descrição'}</p>
                        <div class="flex items-center space-x-4 mt-1">
                            <span class="text-sm text-gray-500">
                                <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i>
                                ${servico.duracao_minutos} min
                            </span>
                            <span class="text-sm font-medium text-[#704abf]">
                                R$ ${parseFloat(servico.preco || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="w-6 h-6 rounded-full border-2 ${selectedServico?.id === servico.id ? 'border-[#704abf] bg-[#704abf]' : 'border-gray-300'} flex items-center justify-center">
                    ${selectedServico?.id === servico.id ? '<i data-lucide="check" class="w-4 h-4 text-white"></i>' : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Selecionar serviço
function selectServico(servicoId) {
    selectedServico = servicosData.find(s => s.id === servicoId);
    loadServicos(); // Re-render para mostrar seleção
}

// Inicializar calendário
function initCalendar() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
}

// Renderizar calendário
function renderCalendar() {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const today = new Date();
    
    const container = document.getElementById('calendar-days');
    container.innerHTML = '';
    
    // Dias vazios no início
    for (let i = 0; i < firstDay.getDay(); i++) {
        container.innerHTML += '<div></div>';
    }
    
    // Dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        const isSelected = selectedData && selectedData.toDateString() === date.toDateString();
        
        let classes = 'calendar-day w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200';
        
        if (isPast) {
            classes += ' disabled';
        } else if (isSelected) {
            classes += ' selected';
        } else if (isToday) {
            classes += ' bg-blue-50 text-blue-600 border border-blue-200';
        } else {
            classes += ' hover:bg-gray-100';
        }
        
        container.innerHTML += `
            <div class="${classes}" onclick="${isPast ? '' : `selectData(${currentYear}, ${currentMonth}, ${day})`}">
                ${day}
            </div>
        `;
    }
}

// Selecionar data
function selectData(year, month, day) {
    selectedData = new Date(year, month, day);
    renderCalendar();
}

// Carregar horários disponíveis
async function loadHorarios() {
    if (!selectedServico || !selectedData) {
        return;
    }
    
    const container = document.getElementById('horarios-container');
    const noHorarios = document.getElementById('no-horarios');
    
    try {
        const dateStr = selectedData.toISOString().split('T')[0];
        const response = await fetch(`/api/public/disponibilidade?empresa=${empresaData.sublink}&data=${dateStr}&servico=${selectedServico.id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar horários');
        }
        
        const data = await response.json();
        const horarios = data.horarios_disponiveis || [];
        
        if (horarios.length === 0) {
            container.classList.add('hidden');
            noHorarios.classList.remove('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        noHorarios.classList.add('hidden');
        
        container.innerHTML = horarios.map(horario => `
            <button class="time-slot px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 ${selectedHorario === horario ? 'selected' : 'hover:border-[#704abf]'}"
                    onclick="selectHorario('${horario}')">
                ${horario}
            </button>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        showToast('error', 'Erro', 'Não foi possível carregar os horários disponíveis');
    }
}

// Selecionar horário
function selectHorario(horario) {
    selectedHorario = horario;
    loadHorarios(); // Re-render para mostrar seleção
}

// Atualizar resumo
function updateResumo() {
    if (selectedServico) {
        document.getElementById('resumo-servico').textContent = selectedServico.nome;
        document.getElementById('resumo-duracao').textContent = `${selectedServico.duracao_minutos} minutos`;
        document.getElementById('resumo-preco').textContent = `R$ ${parseFloat(selectedServico.preco || 0).toFixed(2)}`;
    }
    
    if (selectedData) {
        document.getElementById('resumo-data').textContent = selectedData.toLocaleDateString('pt-BR');
    }
    
    if (selectedHorario) {
        document.getElementById('resumo-horario').textContent = selectedHorario;
    }
}

// Validar step atual
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!selectedServico) {
                showToast('warning', 'Atenção', 'Selecione um serviço para continuar');
                return false;
            }
            break;
        case 2:
            if (!selectedData) {
                showToast('warning', 'Atenção', 'Selecione uma data para continuar');
                return false;
            }
            break;
        case 3:
            if (!selectedHorario) {
                showToast('warning', 'Atenção', 'Selecione um horário para continuar');
                return false;
            }
            break;
    }
    return true;
}

// Submeter agendamento
async function handleSubmitAgendamento(e) {
    e.preventDefault();
    
    const nome = document.getElementById('cliente-nome').value;
    const telefone = document.getElementById('cliente-telefone').value;
    const email = document.getElementById('cliente-email').value;
    
    if (!nome || !telefone) {
        showToast('warning', 'Atenção', 'Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const dataHora = new Date(selectedData);
        const [hora, minuto] = selectedHorario.split(':');
        dataHora.setHours(parseInt(hora), parseInt(minuto));
        
        const response = await fetch('/api/public/agendamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empresa_sublink: empresaData.sublink,
                servico_id: selectedServico.id,
                data_hora_inicio: dataHora.toISOString(),
                cliente_nome: nome,
                cliente_telefone: telefone,
                cliente_email: email || null
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar agendamento');
        }
        
        const result = await response.json();
        showSuccess(result.agendamento);
        
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        showToast('error', 'Erro', error.message);
    }
}

// Mostrar sucesso
function showSuccess(agendamento) {
    // Esconder outros elementos
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('navigation-buttons').classList.add('hidden');
    
    // Mostrar estado de sucesso
    document.getElementById('success-state').classList.remove('hidden');
    
    // Preencher detalhes
    const detailsContainer = document.getElementById('success-details');
    detailsContainer.innerHTML = `
        <div class="flex justify-between">
            <span class="text-gray-600">Protocolo:</span>
            <span class="font-medium text-gray-900">#${agendamento.id}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Serviço:</span>
            <span class="font-medium text-gray-900">${selectedServico.nome}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Data:</span>
            <span class="font-medium text-gray-900">${selectedData.toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Horário:</span>
            <span class="font-medium text-gray-900">${selectedHorario}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Cliente:</span>
            <span class="font-medium text-gray-900">${agendamento.cliente_nome}</span>
        </div>
        <div class="flex justify-between border-t pt-2">
            <span class="text-gray-600">Status:</span>
            <span class="font-semibold text-green-600">Confirmado</span>
        </div>
    `;
}

// Mostrar loading
function showLoading() {
    document.getElementById('loading-state').classList.remove('hidden');
}

// Esconder loading
function hideLoading() {
    document.getElementById('loading-state').classList.add('hidden');
}

// Mostrar erro
function showError(message) {
    hideLoading();
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-state').classList.remove('hidden');
}

// Mostrar toast
function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    const icons = {
        'success': '<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><i data-lucide="check" class="w-4 h-4 text-green-600"></i></div>',
        'error': '<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"><i data-lucide="x" class="w-4 h-4 text-red-600"></i></div>',
        'warning': '<div class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center"><i data-lucide="alert-triangle" class="w-4 h-4 text-yellow-600"></i></div>'
    };
    
    const colors = {
        'success': { title: 'font-semibold text-green-800', message: 'text-sm text-green-600' },
        'error': { title: 'font-semibold text-red-800', message: 'text-sm text-red-600' },
        'warning': { title: 'font-semibold text-yellow-800', message: 'text-sm text-yellow-600' }
    };
    
    toastIcon.innerHTML = icons[type] || icons.warning;
    toastTitle.className = colors[type]?.title || colors.warning.title;
    toastMessage.className = colors[type]?.message || colors.warning.message;
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');
    
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
    }, 5000);
}

