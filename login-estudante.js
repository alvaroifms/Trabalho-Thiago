const form = document.querySelector('#form-login')
const btnIrCadastro = document.querySelector('#btn-ir-cadastro')

form.onsubmit = (e) => {
    e.preventDefault()

    const email = document.querySelector('#login-email').value
    const senha = document.querySelector('#login-senha').value

    // 1. Busca se existe algum estudante cadastrado com esse e-mail
    const dadosSalvos = localStorage.getItem(`estudante_${email}`)

    // 2. Se não encontrar o cadastro no banco
    if (!dadosSalvos) {
        alert('E-mail não encontrado! Por favor, cadastre-se.')
        return
    }

    // 3. Converte os dados do texto do localStorage de volta para Objeto
    const estudante = JSON.parse(dadosSalvos)

    // 4. Valida se a senha digitada bate com a senha do cadastro
    if (estudante.senha === senha) {
        alert(`Bem-vindo, ${estudante.nome}!`)
        
        // Salva uma "sessão" temporária para sabermos qual aluno está logado na próxima tela
        localStorage.setItem('estudante_logado', email)
        
        // Redireciona o estudante logado para a tela onde ele verá as faltas dele
        window.location.href = 'painel-estudante.html'
    } else {
        alert('Senha incorreta! Tente novamente.')
    }
}

// Redireciona para o cadastro caso o aluno não tenha conta
btnIrCadastro.onclick = () => {
    window.location.href = 'cadastro-estudante.html'
}
