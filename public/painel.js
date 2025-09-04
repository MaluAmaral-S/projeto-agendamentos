// public/painel.js - Versão Final Otimizada

// Estado da aplicação
let userData = {};
let businessHours = {}; 

const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// --- FUNÇÕES DE INICIALIZAÇÃO E AUTENTICAÇÃO ---
document.addEventListener('DOMContentLoaded', checkAuthAndLoadData);

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
        
        await loadBusinessHours(); 
        setupBusinessHoursUI();   

    } catch (error) {
        console.error('Erro CRÍTICO em checkAuthAndLoadData:', error);
        if (Object.keys(businessHours).length === 0) {
            initializeDefaultHours();
        }
        setupBusinessHoursUI();
    }
}

function populateUserInfo() {
    document.getElementById('nome-usuario').textContent = userData.name || 'Utilizador';
    document.getElementById('nome-empresa').textContent = userData.businessName || 'Empresa';
}

function setupEventListeners() {
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    setupTabs();
    document.getElementById('form-servico')?.addEventListener('submit', handleCreateService);
    document.getElementById('servico-duracao')?.addEventListener('input', formatarInputDuracao);
    
    // Os botões de "Aplicar a todos" foram removidos, então seus listeners também podem ser removidos.
    // Se você mantiver os botões no HTML, descomente as linhas abaixo.
    // document.getElementById('btn-apply-weekdays').addEventListener('click', () => applyHours('weekdays'));
    // document.getElementById('btn-apply-weekend').addEventListener('click', () => applyHours('weekend'));
    // document.getElementById('btn-apply-all').addEventListener('click', () => applyHours('all'));
    
    document.getElementById('save-hours-btn').addEventListener('click', saveBusinessHours);
}


// --- LÓGICA DE HORÁRIOS DE FUNCIONAMENTO (ATUALIZADA) ---

function setupBusinessHoursUI() {
    const dayCardsContainer = document.getElementById('day-cards-container');
    if (!dayCardsContainer) {
        console.error('ERRO FATAL: Elemento #day-cards-container não encontrado no HTML.');
        return;
    }
    // Limpa o contêiner de botões de seleção, pois não será mais usado
    const daySelectorContainer = document.getElementById('day-selector-container');
    if(daySelectorContainer) daySelectorContainer.innerHTML = '';

    renderAllDayCards();
}

// Em public/painel.js, substitua esta função:

function renderAllDayCards() {
    const dayCardsContainer = document.getElementById('day-cards-container');
    if (!dayCardsContainer) return;

    if (!businessHours || Object.keys(businessHours).length === 0) {
        dayCardsContainer.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro: Não foi possível carregar os dados de horários.</p>';
        return;
    }

    dayCardsContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    let allCardsHTML = '';

    daysOfWeek.forEach((dayName, dayIndex) => {
        const dayData = businessHours[dayIndex];
        const intervals = (dayData && dayData.intervals) ? dayData.intervals : [];
        const isOpen = (dayData && dayData.isOpen) ? dayData.isOpen : false;

        // *** INÍCIO DA ALTERAÇÃO DE ESTILO ***
        const intervalsHTML = intervals.map((interval, intervalIndex) => `
            <div class="flex items-center gap-2">
                <div class="flex-grow space-y-1">
                    <div class="flex items-center gap-1">
                        <label for="start-${dayIndex}-${intervalIndex}" class="text-sm font-medium text-gray-600 w-8">De:</label>
                        <input id="start-${dayIndex}-${intervalIndex}" type="time" value="${interval.start}" data-day-index="${dayIndex}" data-interval-index="${intervalIndex}" data-type="start" class="time-input w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#704abf] focus:border-[#704abf]">
                    </div>
                    <div class="flex items-center gap-1">
                        <label for="end-${dayIndex}-${intervalIndex}" class="text-sm font-medium text-gray-600 w-8">Até:</label>
                        <input id="end-${dayIndex}-${intervalIndex}" type="time" value="${interval.end}" data-day-index="${dayIndex}" data-interval-index="${intervalIndex}" data-type="end" class="time-input w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#704abf] focus:border-[#704abf]">
                    </div>
                </div>
                <div class="flex-shrink-0">
                    <button data-day-index="${dayIndex}" data-interval-index="${intervalIndex}" class="btn-remove-interval p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('<hr class="my-2 border-gray-100">'); // Adiciona uma linha separadora entre os intervalos
        // *** FIM DA ALTERAÇÃO DE ESTILO ***

        allCardsHTML += `
            <div class="border rounded-lg p-4 bg-white shadow-sm flex flex-col">
                <div class="flex items-center justify-between mb-4 pb-3 border-b">
                    <span class="font-semibold text-md text-gray-800">${dayName}</span>
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-medium ${isOpen ? 'text-gray-800' : 'text-gray-500'}">${isOpen ? 'Aberto' : 'Fechado'}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="toggle-${dayIndex}" data-day-index="${dayIndex}" class="sr-only peer toggle-day" ${isOpen ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#704abf]"></div>
                        </label>
                    </div>
                </div>
                <div id="intervals-container-${dayIndex}" class="space-y-2 flex-grow ${!isOpen ? 'hidden' : ''}">
                    ${intervalsHTML}
                </div>
                <button data-day-index="${dayIndex}" class="btn-add-interval w-full mt-4 px-4 py-2 text-sm bg-purple-50 text-[#704abf] font-semibold rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 ${!isOpen ? 'hidden' : ''}">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i>
                    Adicionar intervalo
                </button>
            </div>
        `;
    });

    dayCardsContainer.innerHTML = allCardsHTML;
    addCardEventListeners(dayCardsContainer);
    lucide.createIcons();
}


function addCardEventListeners(container) {
    container.querySelectorAll('.toggle-day').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const dayIndex = parseInt(e.target.dataset.dayIndex);
            if (!businessHours[dayIndex]) businessHours[dayIndex] = { isOpen: false, intervals: [] };
            businessHours[dayIndex].isOpen = e.target.checked;
            renderAllDayCards();
        });
    });
    
    container.querySelectorAll('.btn-add-interval').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dayIndex = parseInt(e.currentTarget.dataset.dayIndex);
            if (!businessHours[dayIndex]) businessHours[dayIndex] = { isOpen: false, intervals: [] };
            businessHours[dayIndex].intervals.push({ start: '09:00', end: '18:00' });
            renderAllDayCards();
        });
    });

    container.querySelectorAll('.btn-remove-interval').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dayIndex = parseInt(e.currentTarget.dataset.dayIndex);
            const intervalIndex = parseInt(e.currentTarget.dataset.intervalIndex);
            if (businessHours[dayIndex] && businessHours[dayIndex].intervals) {
                businessHours[dayIndex].intervals.splice(intervalIndex, 1);
                renderAllDayCards();
            }
        });
    });

    container.querySelectorAll('.time-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const dayIndex = parseInt(e.target.dataset.dayIndex);
            const intervalIndex = parseInt(e.target.dataset.intervalIndex);
            const type = e.target.dataset.type;
            if (businessHours[dayIndex] && businessHours[dayIndex].intervals[intervalIndex]) {
                businessHours[dayIndex].intervals[intervalIndex][type] = e.target.value;
            }
        });
    });
}

function initializeDefaultHours() {
    businessHours = {
        0: { isOpen: false, intervals: [] },
        1: { isOpen: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
        2: { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
        3: { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
        4: { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
        5: { isOpen: true, intervals: [{ start: '08:00', end: '18:00' }] },
        6: { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }] }
    };
    console.warn('AVISO: Usando horários padrão como fallback.');
}

async function loadBusinessHours() {
    try {
        const response = await fetch('/api/business-hours');
        if (!response.ok) throw new Error(`Falha ao carregar dados do servidor. Status: ${response.status}`);
        const data = await response.json();
        
        if (data && data.businessHours && Object.keys(data.businessHours).length > 0) {
            businessHours = data.businessHours;
        } else {
            throw new Error('Nenhum horário configurado, usando padrão.');
        }
    } catch (error) {
        console.warn('AVISO em loadBusinessHours:', error.message);
        initializeDefaultHours();
    }
}

// --- CÓDIGO ORIGINAL MANTIDO (SERVIÇOS, ABAS, ETC.) ---
async function saveBusinessHours() {
    for (const dayIndex in businessHours) {
        if (businessHours[dayIndex].isOpen) {
            for (const interval of businessHours[dayIndex].intervals) {
                if (!interval.start || !interval.end) {
                    showToast('error', 'Erro de Validação', `No dia ${daysOfWeek[dayIndex]}, preencha todos os campos de horário.`);
                    return;
                }
                if (interval.start >= interval.end) {
                    showToast('error', 'Erro de Validação', `No dia ${daysOfWeek[dayIndex]}, o horário de término deve ser posterior ao de início.`);
                    return;
                }
            }
        }
    }
    try {
        const response = await fetch('/api/business-hours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessHours })
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Erro ao salvar horários.');
        showToast('success', 'Sucesso!', 'Horários de funcionamento guardados com sucesso!');
    } catch (error) {
        showToast('error', 'Erro!', error.message);
    }
}
function setupTabs() { const tabButtons=document.querySelectorAll('nav button[id^="tab-"]'),contentPanels=document.querySelectorAll('main div[id^="content-"]');tabButtons.forEach(button=>{button.classList.contains("text-[#704abf]")?button.classList.add("hover:text-[#704abf]"):button.classList.add("hover:text-gray-700")}),tabButtons.forEach(button=>{button.addEventListener("click",()=>{const targetContentId=button.id.replace("tab-","content-");tabButtons.forEach(btn=>{btn.classList.remove("border-[#704abf]","text-[#704abf]","hover:text-[#704abf]"),btn.classList.add("border-transparent","text-gray-500","hover:text-gray-700")}),button.classList.add("border-[#704abf]","text-[#704abf]","hover:text-[#704abf]"),button.classList.remove("border-transparent","text-gray-500","hover:text-gray-700"),contentPanels.forEach(panel=>{panel.id===targetContentId?panel.classList.remove("hidden"):panel.classList.add("hidden")})})})}
async function handleCreateService(e){e.preventDefault();const t=e.target,n=document.getElementById("servico-nome").value,o=document.getElementById("servico-descricao").value,s=document.getElementById("servico-preco").value,a=document.getElementById("servico-duracao").value,i=parseDuracaoParaMinutos(a);if(i<=0)return void showToast("error","Erro de Validação","A duração do serviço é obrigatória.");try{const e=await fetch("/api/servicos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nome:n,descricao:o,duracao_minutos:i,preco:s})}),a=await e.json();if(!e.ok)throw new Error(a.message||"Erro ao criar serviço.");showToast("success","Sucesso!","Serviço adicionado com sucesso."),t.reset(),loadServicos()}catch(e){showToast("error","Erro!",e.message)}}
async function loadServicos(){try{const e=await fetch("/api/servicos");if(!e.ok)throw new Error("Falha ao procurar serviços.");const t=await e.json(),n=document.getElementById("lista-servicos");n.innerHTML=0===t.length?'<div class="text-center py-8 text-gray-500"><i data-lucide="scissors" class="w-12 h-12 mx-auto mb-3 text-gray-300"></i><p>Nenhum serviço registado ainda.</p></div>':t.map((e=>`
                <div class="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div>
                        <p class="font-semibold text-gray-800">${e.nome}</p>
                        <p class="text-sm text-gray-500">${formatarMinutosParaDuracao(e.duracao_minutos)} - R$ ${parseFloat(e.preco||0).toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="p-2 text-gray-400 hover:text-blue-500"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="confirmDeleteService(${e.id})" class="p-2 text-gray-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>`)).join(""),lucide.createIcons()}catch(e){showToast("error","Erro!",e.message)}}
function confirmDeleteService(e){showModal("Tem a certeza?","Deseja realmente eliminar este serviço? Esta ação não pode ser revertida.",(async()=>{try{const t=await fetch(`/api/servicos/${e}`,{method:"DELETE"});if(!t.ok)throw new Error("Não foi possível eliminar o serviço.");showToast("success","Eliminado!","O serviço foi removido."),loadServicos()}catch(e){showToast("error","Erro!",e.message)}}))}
function formatarInputDuracao(e){const t=e.target;let n=t.value.replace(/\D/g,"");n.length>4&&(n=n.slice(0,4)),t.value=n.length>2?`${n.slice(0,2)}h:${n.slice(2,4)}min`:n.length>0?`${n.slice(0,2)}h`:""}
function parseDuracaoParaMinutos(e){if(!e)return 0;const t=e.replace(/\D/g,"");if(0===t.length)return 0;let n=0,o=0;return t.length<=2?n=parseInt(t,10):(n=parseInt(t.slice(0,2),10),o=parseInt(t.slice(2,4),10)),60*n+(o||0)}
function formatarMinutosParaDuracao(e){if(!e||e<1)return"0min";const t=Math.floor(e/60),n=e%60;let o="";return t>0&&(o+=`${String(t).padStart(2,"0")}h`),n>0&&(o+=`:${String(n).padStart(2,"0")}min`),o.startsWith(":")?o.slice(1):o}
async function handleLogout(){try{const e=await fetch("/api/auth/logout",{method:"GET",headers:{"Content-Type":"application/json"}});e.ok?(localStorage.removeItem("token"),window.location.href="/login.html"):(console.error("Erro ao fazer logout"),showToast("error","Erro","Não foi possível fazer logout. Tente novamente."))}catch(e){console.error("Erro ao fazer logout:",e),showToast("error","Erro","Ocorreu um erro ao tentar fazer logout.")}}
function showToast(e,t,n){const o=document.getElementById("toast"),s=document.getElementById("toast-icon"),a=document.getElementById("toast-title"),i=document.getElementById("toast-message");let d;switch(e){case"success":d='<i data-lucide="check-circle" class="w-6 h-6 text-green-500"></i>';break;case"error":d='<i data-lucide="alert-circle" class="w-6 h-6 text-red-500"></i>';break;default:d='<i data-lucide="info" class="w-6 h-6 text-blue-500"></i>'}s.innerHTML=d,a.textContent=t,i.textContent=n,lucide.createIcons(),o.classList.remove("translate-x-full","opacity-0"),setTimeout(()=>{o.classList.add("translate-x-full","opacity-0")},5e3)}
function showModal(e,t,n){const o=document.getElementById("modal-confirmacao"),s=document.getElementById("modal-mensagem"),a=document.getElementById("modal-cancelar"),i=document.getElementById("modal-confirmar");s.textContent=t,o.classList.remove("hidden"),i.onclick=()=>{o.classList.add("hidden"),n()},a.onclick=()=>{o.classList.add("hidden")}}
