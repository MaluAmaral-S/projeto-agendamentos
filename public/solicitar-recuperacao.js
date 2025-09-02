document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('request-form');
    const messageDiv = document.getElementById('message');
    const emailInput = document.getElementById('email');
    const submitButton = form.querySelector('button');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        messageDiv.textContent = '';
        messageDiv.className = 'mt-4 text-center text-white h-5';

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailInput.value
                }),
            });

            // A lógica da API já está segura, então o frontend não precisa saber se o e-mail existe ou não.
            // Apenas mostramos uma mensagem padrão para o usuário.
            messageDiv.textContent = 'Se a conta existir, um link foi enviado.';
            messageDiv.classList.add('text-green-300');
            form.reset();

        } catch (error) {
            // Mesmo em caso de erro de rede, mostramos uma mensagem genérica para segurança.
            messageDiv.textContent = 'Ocorreu um problema. Tente novamente.';
            messageDiv.classList.add('text-red-300');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Link de Recuperação';
        }
    });
});