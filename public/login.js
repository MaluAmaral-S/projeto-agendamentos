// public/login.js

// --- ELEMENTOS DO DOM ---
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toast = document.getElementById('toast');

// NOVO: Adicionamos os elementos do modal de sucesso
const successModal = document.getElementById('modal-sucesso-cadastro');
const goToLoginBtn = document.getElementById('btn-ir-para-login');

// Elementos de loading (do seu arquivo)
const loginLoading = document.getElementById('login-loading');
const loginBtnText = document.getElementById('login-btn-text');
const registerLoading = document.getElementById('register-loading');
const registerBtnText = document.getElementById('register-btn-text');

// Elementos de toggle de senha (do seu arquivo)
const toggleLoginPassword = document.getElementById('toggle-login-password');
const toggleRegisterPassword = document.getElementById('toggle-register-password');
const loginPasswordInput = document.getElementById('login-password');
const registerPasswordInput = document.getElementById('register-password');

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // REMOVIDO: Verificação de token no localStorage, o backend agora cuida disso.
    setupTabs();
    setupForms();
    setupPasswordToggles();
});

// --- FUNÇÕES DE SETUP (do seu arquivo) ---
function setupTabs() {
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));
}

function setupForms() {
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // NOVO: Adicionamos o evento para o botão do modal
    goToLoginBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        registerForm.reset();
        switchTab('login');
    });
}

function setupPasswordToggles() {
    toggleLoginPassword.addEventListener('click', () => togglePasswordVisibility(loginPasswordInput, toggleLoginPassword));
    toggleRegisterPassword.addEventListener('click', () => togglePasswordVisibility(registerPasswordInput, toggleRegisterPassword));
}

// --- FUNÇÕES DE MANIPULAÇÃO DA API ---

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    setLoadingState(true, 'login');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // MUDANÇA: 'senha' -> 'password' para bater com o backend
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            // MUDANÇA CRÍTICA: Não salvamos mais nada no localStorage.
            // O cookie HttpOnly é gerenciado pelo navegador.
            
            // Redireciona diretamente para o painel
            window.location.href = '/painel';
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        showToast('error', 'Erro no login', error.message);
    } finally {
        setLoadingState(false, 'login');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const business = document.getElementById('register-business').value;
    const businessType = document.getElementById('register-business-type').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    setLoadingState(true, 'register');
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // MUDANÇA CRÍTICA: Ajustamos os nomes dos campos para bater com o backend
            body: JSON.stringify({ name, business, businessType, email, password })
        });
        
        if (response.ok) {
            // SUCESSO: Em vez do toast, chamamos o modal como solicitado.
            successModal.classList.remove('hidden');
            lucide.createIcons(); // Recria o ícone de check dentro do modal
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao criar conta');
        }
    } catch (error) {
        showToast('error', 'Erro no cadastro', error.message);
    } finally {
        setLoadingState(false, 'register');
    }
}

// --- FUNÇÕES DE UI (do seu arquivo, com pequenas melhorias) ---

function switchTab(tab) {
    // ... (seu código para switchTab, está perfeito)
    if (tab === 'login') {
        tabLogin.classList.add('bg-white/20'); tabRegister.classList.remove('bg-white/20');
        loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
    } else {
        tabRegister.classList.add('bg-white/20'); tabLogin.classList.remove('bg-white/20');
        registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
    }
}

function togglePasswordVisibility(input, button) {
    // ... (seu código para togglePasswordVisibility, está perfeito)
    const icon = button.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

function setLoadingState(loading, form) {
    // ... (seu código para setLoadingState, está perfeito)
    const btn = form === 'login' ? loginForm.querySelector('button') : registerForm.querySelector('button');
    const loadingIcon = form === 'login' ? loginLoading : registerLoading;
    const btnText = form === 'login' ? loginBtnText : registerBtnText;
    
    if (loading) {
        loadingIcon.classList.remove('hidden');
        btnText.textContent = form === 'login' ? 'Entrando...' : 'Criando...';
        btn.disabled = true;
    } else {
        loadingIcon.classList.add('hidden');
        btnText.textContent = form === 'login' ? 'Entrar' : 'Criar Conta';
        btn.disabled = false;
    }
}

function showToast(type, title, message) {
    // ... (seu código para showToast, está perfeito)
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    if (type === 'success') {
        toastIcon.innerHTML = `<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><i data-lucide="check" class="w-4 h-4 text-green-600"></i></div>`;
    } else if (type === 'error') {
        toastIcon.innerHTML = `<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"><i data-lucide="x" class="w-4 h-4 text-red-600"></i></div>`;
    }
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.remove('translate-x-full');
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 5000);
}

// Adicionamos um listener para fechar o toast se o usuário clicar nele
toast.addEventListener('click', () => toast.classList.add('translate-x-full'));