// public/redefinir-senha.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    // Adicione referências para os elementos de loading se os tiver em seu HTML
    
    // Pega o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        alert('Token de autorização ausente. Por favor, comece o processo novamente.');
        window.location.href = '/solicitar-recuperacao.html';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.'); // Substitua por um toast, se preferir
            return;
        }

        // Adicionar feedback de loading

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: newPassword }) // Envia o token e a nova senha
            });

            const data = await response.json();

            if (response.ok) {
                alert('Senha redefinida com sucesso! Redirecionando para o login.');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                throw new Error(data.message || 'Não foi possível redefinir a senha.');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            // Remover feedback de loading
        }
    });
});