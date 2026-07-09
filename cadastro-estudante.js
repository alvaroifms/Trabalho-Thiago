const form = document.querySelector('#form-cadastro')
const btnVoltar = document.querySelector('#btn-voltar')

form.onsubmit = (e) => {
    e.preventDefault()


    const estudante = {
        nome: document.querySelector('#cad-nome').value,
        email: document.querySelector('#cad-email').value,
        senha: document.querySelector('#cad-senha').value,
        periodo: document.querySelector('#cad-periodo').value,
        instituicao: document.querySelector('#cad-instituicao').value
    }


    localStorage.setItem(`estudante_${estudante.email}`, JSON.stringify(estudante))
    
    alert('Cadastro realizado com sucesso!')
    
 
    window.location.href = 'login-estudante.html' 
}


btnVoltar.onclick = () => {
    window.location.href = 'index.html' 
}
