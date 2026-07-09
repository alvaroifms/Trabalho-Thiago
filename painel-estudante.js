const body = document.querySelector('body')
const container = document.querySelector('#container')

const emailLogado = localStorage.getItem('estudante_logado')
const dadosEstudante = JSON.parse(localStorage.getItem(`estudante_${emailLogado}`))

function carregarEventosParaEstudante() {
    container.innerHTML = ''
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i)
        if (chave.startsWith('evento_data_')) {
            const dadosEvento = JSON.parse(localStorage.getItem(chave))
            criarCardEstudante(dadosEvento.nome, dadosEvento.idCard)
        }
    }
}

function criarCardEstudante(nome, idCard) {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = idCard
    card.innerText = nome
    card.onclick = () => { 
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
            nome: dadosEstudante.nome,
            email: emailLogado
        })
        localStorage.setItem(`evento_data_${dadosEvento.idCard}`, JSON.stringify(dadosEvento))
        
        divConvite.remove()
        verChamadaEstudante(dadosEvento)
    }

    
    divConvite.querySelector('#btn-recusar').onclick = () => {
        divConvite.remove()
        container.style.display = 'block'
    }
}


function verChamadaEstudante(dadosEvento) {
    const tabelaAntiga = body.querySelector('table')
    if (tabelaAntiga) tabelaAntiga.remove()
    const botaoAntigo = body.querySelector('.btn-voltar')
    if (botaoAntigo) botaoAntigo.remove()

    const btnVoltar = document.createElement('button')
    btnVoltar.classList.add('btn-voltar')
    btnVoltar.innerText = 'Voltar aos Eventos'
    btnVoltar.onclick = () => {
        tabela.remove()
        btnVoltar.remove()
        container.style.display = 'block'
    }
    body.appendChild(btnVoltar)

    const tabela = document.createElement('table')
    tabela.setAttribute('width', '500')
    tabela.setAttribute('height', '150')
    tabela.setAttribute('border', '1px')

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
    tabela.append(linhaCabecalho)

    const tr = document.createElement('tr')
    
    const tdNome = document.createElement('td')
    tdNome.innerText = dadosEstudante ? dadosEstudante.nome : "Estudante"
    tr.append(tdNome)

    const tdPorcentagem = document.createElement('td')
    tdPorcentagem.style.textAlign = 'center'
    tr.append(tdPorcentagem)

    let totalFaltas = 0
    for (let c = 0; c < dadosEvento.totalChamadas; c++) {
        const tdStatus = document.createElement('td')
        tdStatus.style.textAlign = 'center'
        
        const chaveStatus = `aluno_${emailLogado}_col_${c}`
        const statusSalvo = dadosEvento.historicoPresenca[chaveStatus] || 'falta'
        
        tdStatus.innerText = statusSalvo
        tdStatus.className = `status-texto-${statusSalvo}`
        
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

    tabela.append(tr)
    body.appendChild(tabela)
}

carregarEventosParaEstudante()
