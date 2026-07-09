const form = document.querySelector('#form-login')
const btnIrCadastro = document.querySelector('#btn-ir-cadastro')

form.onsubmit = (e) => {
    e.preventDefault()

    const email = document.querySelector('#login-email').value
    const senha = document.querySelector('#login-senha').value

    
    const dadosSalvos = localStorage.getItem(`estudante_${email}`)

    
    if (!dadosSalvos) {
        alert('E-mail não encontrado! Por favor, cadastre-se.')
        return
    }

    
    const estudante = JSON.parse(dadosSalvos)

   
    if (estudante.senha === senha) {
        alert(`Bem-vindo, ${estudante.nome}!`)
        
        
        localStorage.setItem('estudante_logado', email)
        
        
        window.location.href = 'painel-estudante.html'
    } else {
        alert('Senha incorreta! Tente novamente.')
    }
}


btnIrCadastro.onclick = () => {
    window.location.href = 'cadastro-estudante.html'
}
