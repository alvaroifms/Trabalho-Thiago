const body = document.querySelector('body')
const container = document.querySelector('#container')

const emailLogado = localStorage.getItem('estudante_logado')
const dadosEstudante = JSON.parse(localStorage.getItem(`estudante_${emailLogado}`))

// ----------------------------------------------------
// CARREGAR EVENTOS COM FILTRO E REDIRECIONAMENTO DIRETO
// ----------------------------------------------------
function carregarEventosParaEstudante() {
    // 1. Injeta ou reaproveita o campo de busca no container
    let campoBusca = document.querySelector('#filtro-evento-estudante')
    if (!campoBusca) {
        const divBusca = document.createElement('div')
        divBusca.style.marginBottom = '20px'
        divBusca.style.width = '100%'
        divBusca.innerHTML = `
            <input type="text" id="filtro-evento-estudante" placeholder="Digite o nome do evento" style="width: 100%; padding: 10px; font-size: 1rem; border-radius: 8px; border: 1px solid #ccc;">
            <p id="msg-erro-estudante" style="color: #e74c3c; font-size: 0.85rem; margin-top: 5px; display: none;"></p>
        `
        container.parentNode.insertBefore(divBusca, container)
        campoBusca = document.querySelector('#filtro-evento-estudante')

        // 🚀 Evento no ENTER: Redireciona direto para o evento digitado
        campoBusca.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                const termo = campoBusca.value.trim().toLowerCase()
                const msgErro = document.querySelector('#msg-erro-estudante')
                if (msgErro) msgErro.style.display = 'none'

                if (!termo) return

                let eventoEncontrado = null

                for (let i = 0; i < localStorage.length; i++) {
                    const chave = localStorage.key(i)
                    if (chave.startsWith('evento_data_')) {
                        const dadosEvento = JSON.parse(localStorage.getItem(chave))
                        if (dadosEvento.nome.toLowerCase() === termo) {
                            eventoEncontrado = dadosEvento
                            break
                        }
                    }
                }

                if (eventoEncontrado) {
                    // Limpa o campo e vai direto para a verificação do evento
                    campoBusca.value = ''
                    divBusca.style.display = 'none'
                    verificarParticipacao(eventoEncontrado.idCard)
                } else if (msgErro) {
                    msgErro.innerText = `Nenhum evento encontrado com o nome "${campoBusca.value}".`
                    msgErro.style.display = 'block'
                }
            }
        })

        // Evento no INPUT: Filtra os cards em tempo real conforme digita
        campoBusca.addEventListener('input', (e) => {
            renderizarListaCards(e.target.value)
        })
    } else {
        campoBusca.parentNode.style.display = 'block'
    }

    renderizarListaCards()
}

// Renderiza a lista de cards baseada no filtro digitado
function renderizarListaCards(termoBusca = '') {
    container.innerHTML = ''
    const termoLimpo = termoBusca.toLowerCase().trim()

    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i)
        if (chave.startsWith('evento_data_')) {
            const dadosEvento = JSON.parse(localStorage.getItem(chave))
            if (dadosEvento.nome.toLowerCase().includes(termoLimpo)) {
                criarCardEstudante(dadosEvento.nome, dadosEvento.idCard)
            }
        }
    }
}

function criarCardEstudante(nome, idCard) {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = idCard
    card.innerText = nome
    card.onclick = () => { 
        // Esconde a barra de busca ao entrar no evento
        const divBusca = document.querySelector('#filtro-evento-estudante')?.parentNode
        if (divBusca) divBusca.style.display = 'none'

        verificarParticipacao(idCard) 
    }
    container.appendChild(card)
}

function verificarParticipacao(idCard) {
    container.style.display = 'none'
    const dadosEvento = JSON.parse(localStorage.getItem(`evento_data_${idCard}`))

    if (!dadosEvento.participantes) {
        dadosEvento.participantes = []
    }

    const jaParticipa = dadosEvento.participantes.some(p => p.email === emailLogado)

    if (jaParticipa) {
        verChamadaEstudante(dadosEvento)
    } else {
        mostrarConviteParticipacao(dadosEvento)
    }
}

function mostrarConviteParticipacao(dadosEvento) {
    const divConvite = document.createElement('div')
    divConvite.id = 'painel-convite'
    divConvite.innerHTML = `
        <h3>Você vai participar do evento: "${dadosEvento.nome}"?</h3>
        <button id="btn-aceitar">Sim, vou participar</button>
        <button id="btn-recusar" style="margin-left: 10px;">Não vou</button>
    `
    body.appendChild(divConvite)

    divConvite.querySelector('#btn-aceitar').onclick = () => {
        dadosEvento.participantes.push({
            nome: dadosEstudante ? dadosEstudante.nome : "Estudante",
            email: emailLogado
        })
        localStorage.setItem(`evento_data_${dadosEvento.idCard}`, JSON.stringify(dadosEvento))
        
        divConvite.remove()
        verChamadaEstudante(dadosEvento)
    }

    divConvite.querySelector('#btn-recusar').onclick = () => {
        divConvite.remove()
        // Restaura a busca e o container
        const divBusca = document.querySelector('#filtro-evento-estudante')?.parentNode
        if (divBusca) divBusca.style.display = 'block'
        container.style.display = 'block'
    }
}

function verChamadaEstudante(dadosEvento) {
    const tabelaAntiga = body.querySelector('table')
    if (tabelaAntiga) tabelaAntiga.remove()
    const containerAntigo = body.querySelector('.tabela-container')
    if (containerAntigo) containerAntigo.remove()
    const botaoAntigo = body.querySelector('.btn-voltar')
    if (botaoAntigo) botaoAntigo.remove()

    const btnVoltar = document.createElement('button')
    btnVoltar.classList.add('btn-voltar')
    btnVoltar.innerText = 'Voltar aos Eventos'
    btnVoltar.onclick = () => {
        containerTabela.remove()
        btnVoltar.remove()
        
        // Exibe de volta o campo de busca e o container de cards
        const divBusca = document.querySelector('#filtro-evento-estudante')?.parentNode
        if (divBusca) divBusca.style.display = 'block'
        container.style.display = 'block'
    }
    body.appendChild(btnVoltar)

    // 1. Container para garantir rolagem lateral no celular sem quebrar a tela
    const containerTabela = document.createElement('div')
    containerTabela.classList.add('tabela-container')

    // 2. Tabela limpa (sem width, height ou border travados!)
    const tabela = document.createElement('table')
    tabela.classList.add('tabela-chamada')

    // Cabeçalho da Tabela
    const thead = document.createElement('thead')
    const linhaCabecalho = document.createElement('tr')
    linhaCabecalho.innerHTML = `
        <th>Seu Nome</th>
        <th>% Faltas</th>
    `
    for (let c = 0; c < dadosEvento.totalChamadas; c++) {
        const thChamada = document.createElement('th')
        thChamada.innerText = `Aula ${c + 1}`
        linhaCabecalho.append(thChamada)
    }
    thead.appendChild(linhaCabecalho)
    tabela.append(thead)

    // Corpo da Tabela
    const tbody = document.createElement('tbody')
    const tr = document.createElement('tr')
    
    const tdNome = document.createElement('td')
    tdNome.innerText = dadosEstudante ? dadosEstudante.nome : "Estudante"
    tr.append(tdNome)

    const tdPorcentagem = document.createElement('td')
    tdPorcentagem.style.fontWeight = 'bold'
    tr.append(tdPorcentagem)

    let totalFaltas = 0
    for (let c = 0; c < dadosEvento.totalChamadas; c++) {
        const tdStatus = document.createElement('td')
        
        const chaveStatus = `aluno_${emailLogado}_col_${c}`
        const statusSalvo = (dadosEvento.historicoPresenca && dadosEvento.historicoPresenca[chaveStatus]) ? dadosEvento.historicoPresenca[chaveStatus] : 'falta'
        
        // Cria a tag visual estilizada para o status
        const spanStatus = document.createElement('span')
        spanStatus.innerText = statusSalvo
        spanStatus.className = `status-badge status-${statusSalvo}`
        
        tdStatus.appendChild(spanStatus)
        
        if (statusSalvo === 'falta') {
            totalFaltas++
        }
        tr.append(tdStatus)
    }

    if (dadosEvento.totalChamadas > 0) {
        const porcentagem = ((totalFaltas / dadosEvento.totalChamadas) * 100).toFixed(1)
        tdPorcentagem.innerText = `${porcentagem}%`
    } else {
        tdPorcentagem.innerText = '0.0%'
    }

    tbody.append(tr)
    tabela.append(tbody)

    containerTabela.appendChild(tabela)
    body.appendChild(containerTabela)
}
carregarEventosParaEstudante()