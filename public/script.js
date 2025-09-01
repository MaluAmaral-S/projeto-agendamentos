// Aguarda o HTML ser completamente carregado para executar o script
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro");
  const mensagemDiv = document.getElementById("mensagem");

  // Verifica se estamos na página de cadastro
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evita o recarregamento da página

      // Pega os valores dos campos do formulário
      const nome_fantasia = document.getElementById("nome_fantasia").value;
      const tipo_negocio = document.getElementById("tipo_negocio").value;
      const nome_usuario = document.getElementById("nome_usuario").value;
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      // Monta o objeto com os dados para enviar à API
      const dados = {
        nome_fantasia,
        tipo_negocio,
        nome_usuario,
        email,
        senha,
      };

      // Limpa mensagens anteriores
      mensagemDiv.textContent = "";
      mensagemDiv.className = "";

      try {
        // Envia os dados para o backend usando fetch
        const response = await fetch("http://localhost:3000/api/empresas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        });

        const result = await response.json();

        if (response.ok) {
          // Se a resposta for bem-sucedida (status 2xx)
          mensagemDiv.textContent = `Empresa cadastrada com sucesso! Seu link de agendamento é: /${result.sublink}`;
          mensagemDiv.classList.add("text-green-600");
          form.reset(); // Limpa o formulário
          
          // Opcional: Redirecionar para o painel de controle após alguns segundos
          // setTimeout(() => {
          //   window.location.href = '/painel.html'; //
          // }, 3000);

        } else {
          // Se a resposta indicar um erro (status 4xx ou 5xx)
          mensagemDiv.textContent = `Erro: ${result.error || 'Não foi possível cadastrar.'}`;
          mensagemDiv.classList.add("text-red-600");
        }
      } catch (error) {
        // Se houver um erro de rede ou na conexão
        console.error("Erro de conexão:", error);
        mensagemDiv.textContent = "Erro de conexão. Verifique se o servidor está rodando.";
        mensagemDiv.classList.add("text-red-600");
      }
    });
  }
});

const resp = await fetch('/api/assinaturas/checkout', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
const data = await resp.json();
window.location.href = data.init_point; // redireciona para o Mercado Pago