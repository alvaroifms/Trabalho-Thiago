const body = document.querySelector('body')
const criar = document.querySelector('#criar')
const container = document.querySelector('#container')

// Carrega o contador salvo para os cards ou começa em 0 se for a primeira vez
let contador = parseInt(localStorage.getItem('contador_global')) || 0

// Função auxiliar para carregar todos os eventos salvos logo que a página abre
function carregarEventosSalvos() {
    container.innerHTML = ''
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i)
        if (chave.startsWith('evento_data_')) {
            const dadosEvento = JSON.parse(localStorage.getItem(chave))
            criarElementoCard(dadosEvento.nome, dadosEvento.idCard)
        }
    }
}

// Evento de clique para o professor criar um novo formulário de evento
criar.onclick = () => {
    const form = document.createElement('form')
    form.innerHTML = `
    <input type="text" placeholder="Nome do evento:" class="nome-evento" required>
    <input type="submit" value="Pronto">
    `
    form.onsubmit = (e) => {
        e.preventDefault()
        const nome = form.querySelector('.nome-evento').value
        const idCard = `evento${contador}`

        // Estrutura inicial do objeto do evento para salvar no banco
        const novoEvento = {
            idCard: idCard,
            nome: nome,
            totalChamadas: 0,
            participantes: [], // Começa sem nenhum aluno matriculado
            historicoPresenca: {} 
        }

        // Salva no localStorage e renderiza o card visual
        localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(novoEvento))
        criarElementoCard(nome, idCard)

        contador++
        localStorage.setItem('contador_global', contador)
        form.remove()
    }
    body.appendChild(form)
}

// Cria o componente visual do Card na tela do professor
function criarElementoCard(nome, idCard) {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = idCard
    
    // Texto com o nome do evento
    const textoNome = document.createElement('span')
    textoNome.innerText = nome
    card.appendChild(textoNome)

    // Botão de excluir o evento (X)
    const btnExcluir = document.createElement('button')
    btnExcluir.innerText = 'X'
    btnExcluir.classList.add('btn-excluir')
    btnExcluir.style.marginLeft = '15px'
    
    btnExcluir.onclick = (e) => {
        e.stopPropagation() // Impede que o clique abra a tabela de chamada
        
        if (confirm(`Deseja mesmo excluir o evento "${nome}"?`)) {
            localStorage.removeItem(`evento_data_${idCard}`)
            card.remove()
        }
    }
    card.appendChild(btnExcluir)

    // Ao clicar no card, abre o painel da lista de chamada
    card.onclick = () => {
        chamada(idCard) 
    }
    container.appendChild(card)
}

// Gera a interface da tabela de chamada do evento selecionado
function chamada(idCard) {
    container.style.display = 'none'
    criar.style.display = 'none'

    const tabelaAntiga = body.querySelector('table')
    if (tabelaAntiga) tabelaAntiga.remove()
    const botaoAntigo = body.querySelector('.btn-voltar')
    if (botaoAntigo) botaoAntigo.remove()

    const dadosEvento = JSON.parse(localStorage.getItem(`evento_data_${idCard}`))
    const tabela = document.createElement('table')
    tabela.setAttribute('width', '500')
    tabela.setAttribute('height', '500')
    tabela.setAttribute('border', '1px')

    // Botão para voltar à listagem principal de eventos
    const btnVoltar = document.createElement('button')
    btnVoltar.classList.add('btn-voltar')
    btnVoltar.innerText = 'Voltar'
    btnVoltar.onclick = () => { voltar(tabela, btnVoltar) }
    body.appendChild(btnVoltar)

    // Cabeçalho estruturado com colspan para alinhar perfeitamente com o botão "+"
    const linhaCabecalho = document.createElement('tr')
    linhaCabecalho.id = 'linha-cabecalho'
    linhaCabecalho.innerHTML = `
        <th id="th-alunos">Alunos</th>
        <th id="th-porcentagem" colspan="2">% Faltas</th>
    `
    
    const btnMais = document.createElement('input')
    btnMais.type = 'button'
    btnMais.value = '+'
    btnMais.classList.add('espaco-presenca')
    btnMais.style.marginLeft = '8px'
    
    linhaCabecalho.querySelector('#th-porcentagem').appendChild(btnMais)
    tabela.append(linhaCabecalho)

    // Garante que a propriedade existe para não quebrar o código
    if (!dadosEvento.participantes) {
        dadosEvento.participantes = []
    }
    
    // Pega APENAS a lista de alunos que aceitaram o evento
    const listaEstudantesReais = dadosEvento.participantes

    listaEstudantesReais.forEach((aluno) => {
        const tr = document.createElement('tr')
        tr.id = `linha-aluno-${aluno.email}`
        tr.innerHTML = `
            <td>${aluno.nome}</td>
            <td class="contador-porcentagem" style="text-align: center;">0%</td>
        `
        tabela.append(tr)
    })

    // Função interna que constrói e renderiza uma coluna inteira de chamada
    const renderizarColunaChamada = (colunaIndex) => {
        const trs = tabela.querySelectorAll('tr')
        
        if (colunaIndex === 0) {
            linhaCabecalho.querySelector('#th-porcentagem').removeAttribute('colspan')
        }

        trs.forEach((linha, index) => {
            if (index === 0) {
                const thNova = document.createElement('th')
                thNova.id = `th-chamada-${colunaIndex}`
                thNova.innerText = `Chamada ${colunaIndex + 1}`
                linha.append(thNova)
            } else {
                const alunoEmail = listaEstudantesReais[index - 1].email
                const tdNova = document.createElement('td')
                
                const botaoPresenca = document.createElement('button')
                const chaveStatus = `aluno_${alunoEmail}_col_${colunaIndex}`
                
                if (!dadosEvento.historicoPresenca[chaveStatus]) {
                    dadosEvento.historicoPresenca[chaveStatus] = 'falta'
                }
                
                botaoPresenca.innerText = dadosEvento.historicoPresenca[chaveStatus]
                botaoPresenca.className = dadosEvento.historicoPresenca[chaveStatus]
                
                botaoPresenca.onclick = () => {
                    if (botaoPresenca.innerText === 'falta') {
                        botaoPresenca.innerText = 'presente'
                        botaoPresenca.className = 'presente'
                        dadosEvento.historicoPresenca[chaveStatus] = 'presente'
                    } else {
                        botaoPresenca.innerText = 'falta'
                        botaoPresenca.className = 'falta'
                        dadosEvento.historicoPresenca[chaveStatus] = 'falta'
                    }
                    localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(dadosEvento))
                    atualizarPorcentagemDoAluno(linha)
                }
                
                tdNova.append(botaoPresenca)
                linha.append(tdNova)
            }
        })
    }

    // Carrega colunas e histórico de presenças de aulas antigas que estavam gravadas
    for (let c = 0; c < dadosEvento.totalChamadas; c++) {
        renderizarColunaChamada(c)
    }
    
    // Atualiza o display das porcentagens iniciais após montar o histórico
    const trsAtualizar = tabela.querySelectorAll('tr')
    trsAtualizar.forEach((linha, index) => { if (index > 0) atualizarPorcentagemDoAluno(linha) })

    // Adiciona uma nova aula ao clicar no botão "+"
    btnMais.onclick = () => {
        const proximoIndexCol = dadosEvento.totalChamadas
        dadosEvento.totalChamadas++
        
        localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(dadosEvento))
        
        renderizarColunaChamada(proximoIndexCol)
        
        const trs = tabela.querySelectorAll('tr')
        trs.forEach((linha, index) => { if (index > 0) atualizarPorcentagemDoAluno(linha) })
    }

    body.appendChild(tabela)
}

// Calcula a taxa de faltas atual da linha com base nas colunas totais da tabela
const atualizarPorcentagemDoAluno = (linha) => {
    const totalChamadas = linha.parentElement.querySelectorAll('#linha-cabecalho th').length - 2
    if (totalChamadas <= 0) return

    const totalFaltas = linha.querySelectorAll('button.falta').length
    const porcentagem = ((totalFaltas / totalChamadas) * 100).toFixed(1)
    
    linha.querySelector('.contador-porcentagem').innerText = `${porcentagem}%`
}

// Restaura a visualização para o painel de cards original do professor
function voltar(tabela, botao) {
    tabela.remove()   
    botao.remove()    
    container.style.display = 'block' 
    criar.style.display = 'block'
}

// Inicializa o sistema renderizando os dados que já existem na memória do navegador
carregarEventosSalvos()
