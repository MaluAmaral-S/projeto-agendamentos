document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verify-code-form');

    // Recupera o e-mail armazenado no sessionStorage
    const email = sessionStorage.getItem('recoveryEmail');
    if (!email) {
        alert('E-mail de recuperação não encontrado. Por favor, solicite a recuperação novamente.');
        window.location.href = '/solicitar-recuperacao.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('verification-code').value;

        try {
            const response = await fetch('/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (response.ok) {
                // Se o código for válido, redireciona para a página de redefinir senha
                window.location.href = '/redefinir-senha.html';
            } else {
                throw new Error(data.message || 'Erro ao verificar o código.');
            }
        } catch (error) {
            alert(error.message); // Simplificado com alert, pode usar o seu showToast
        }
    });
});