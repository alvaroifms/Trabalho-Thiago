const body = document.querySelector('body')
const criar = document.querySelector('#criar')
const container = document.querySelector('#container')
const campoPesquisa = document.querySelector('#campo-pesquisa')

let contador = parseInt(localStorage.getItem('contador_global')) || 0

// ----------------------------------------------------
// FUNÇÃO DE CARREGAR E EXIBIR OS EVENTOS (COM FILTRO)
// ----------------------------------------------------
function carregarEventosSalvos(termoBusca = '') {
    container.innerHTML = ''
    
    // Normaliza o termo de busca para comparar sem diferença de maiúsculas/minúsculas
    const buscaLimpa = termoBusca.toLowerCase().trim()

    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i)
        if (chave.startsWith('evento_data_')) {
            const dadosEvento = JSON.parse(localStorage.getItem(chave))
            
            // Filtra pelo nome do evento se houver algo digitado
            if (dadosEvento.nome.toLowerCase().includes(buscaLimpa)) {
                criarElementoCard(dadosEvento.nome, dadosEvento.idCard)
            }
        }
    }
}

// ----------------------------------------------------
// EVENTO DE PESQUISA EM TEMPO REAL
// ----------------------------------------------------
if (campoPesquisa) {
    campoPesquisa.addEventListener('input', (e) => {
        carregarEventosSalvos(e.target.value)
    })
}

// ----------------------------------------------------
// CRIAR NOVO EVENTO (COM VALIDAÇÃO DE NOME DUPLICADO)
// ----------------------------------------------------
criar.onclick = () => {
    const form = document.createElement('form')
    form.innerHTML = `
        <input type="text" placeholder="Nome do evento:" class="nome-evento" required>
        <input type="submit" value="Pronto">
    `
    
    form.onsubmit = (e) => {
        e.preventDefault()
        const nomeDigitado = form.querySelector('.nome-evento').value.trim()

        // 🔍 Validação 1: Verificar se o nome está vazio
        if (!nomeDigitado) {
            alert('Por favor, digite um nome válido para o evento.')
            return
        }

        // 🔍 Validação 2: Verificar se já existe um evento com o mesmo nome
        let jaExiste = false
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i)
            if (chave.startsWith('evento_data_')) {
                const eventoExistente = JSON.parse(localStorage.getItem(chave))
                if (eventoExistente.nome.toLowerCase() === nomeDigitado.toLowerCase()) {
                    jaExiste = true
                    break
                }
            }
        }

        if (jaExiste) {
            alert(`Já existe um evento cadastrado com o nome "${nomeDigitado}". Por favor, escolha outro nome.`)
            return // Impede o cadastro
        }

        // Se passou na validação, cria o evento
        const idCard = `evento${contador}`

        const novoEvento = {
            idCard: idCard,
            nome: nomeDigitado,
            totalChamadas: 0,
            participantes: [], 
            historicoPresenca: {},
            datasChamadas: [] 
        }
// ----------------------------------------------------
// CRIAR NOVO EVENTO (COM VALIDAÇÃO E REDIRECIONAMENTO DIRETO)
// ----------------------------------------------------
criar.onclick = () => {
    const form = document.createElement('form')
    form.innerHTML = `
        <input type="text" placeholder="Nome do evento:" class="nome-evento" required>
        <input type="submit" value="Pronto">
    `
    
    form.onsubmit = (e) => {
        e.preventDefault()
        const nomeDigitado = form.querySelector('.nome-evento').value.trim()

        // 🔍 Validação 1: Verificar se o nome está vazio
        if (!nomeDigitado) {
            alert('Por favor, digite um nome válido para o evento.')
            return
        }

        // 🔍 Validação 2: Verificar se já existe um evento com o mesmo nome
        let jaExiste = false
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i)
            if (chave.startsWith('evento_data_')) {
                const eventoExistente = JSON.parse(localStorage.getItem(chave))
                if (eventoExistente.nome.toLowerCase() === nomeDigitado.toLowerCase()) {
                    jaExiste = true
                    break
                }
            }
        }

        if (jaExiste) {
            alert(`Já existe um evento cadastrado com o nome "${nomeDigitado}". Por favor, escolha outro nome.`)
            return // Impede o cadastro
        }

        // Se passou na validação, cria o evento
        const idCard = `evento${contador}`

        const novoEvento = {
            idCard: idCard,
            nome: nomeDigitado,
            totalChamadas: 0,
            participantes: [], 
            historicoPresenca: {},
            datasChamadas: [] 
        }

        // 1. Salva no localStorage
        localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(novoEvento))

        // 2. Atualiza o contador global
        contador++
        localStorage.setItem('contador_global', contador)

        // 3. Cria o card na lista (para quando ele clicar em "Voltar" depois)
        criarElementoCard(nomeDigitado, idCard)

        // 4. Remove o formulário da tela
        form.remove()

        // 🚀 5. REDIRECIONA DIRETO PARA A TELA DE CHAMADA DO EVENTO CRIADO
        chamada(idCard)
    }
    body.appendChild(form)
}
        localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(novoEvento))

        criarElementoCard(nomeDigitado, idCard)

        contador++
        localStorage.setItem('contador_global', contador)
        form.remove()
    }
    body.appendChild(form)
}

// ----------------------------------------------------
// CRIAR O CARD VISUAL NA TELA
// ----------------------------------------------------
function criarElementoCard(nome, idCard) {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = idCard
    
    const textoNome = document.createElement('span')
    textoNome.innerText = nome
    card.appendChild(textoNome)

    const btnExcluir = document.createElement('button')
    btnExcluir.innerText = 'X'
    btnExcluir.classList.add('btn-excluir')
    btnExcluir.style.marginLeft = '15px'
    
    btnExcluir.onclick = (e) => {
        e.stopPropagation() 
        
        if (confirm(`Deseja mesmo excluir o evento "${nome}"?`)) {
            localStorage.removeItem(`evento_data_${idCard}`)
            card.remove()
        }
    }
    card.appendChild(btnExcluir)

    card.onclick = () => {
        chamada(idCard) 
    }
    container.appendChild(card)
}

// ----------------------------------------------------
// TELA E TABELA DE CHAMADA
// ----------------------------------------------------
function chamada(idCard) {
    container.style.display = 'none'
    criar.style.display = 'none'
    if (campoPesquisa) campoPesquisa.style.display = 'none'

    const tabelaAntiga = body.querySelector('table')
    if (tabelaAntiga) tabelaAntiga.remove()
    const botaoAntigo = body.querySelector('.btn-voltar')
    if (botaoAntigo) botaoAntigo.remove()

    const dadosEvento = JSON.parse(localStorage.getItem(`evento_data_${idCard}`))
    const tabela = document.createElement('table')
    tabela.classList.add('tabela-chamada')

    const btnVoltar = document.createElement('button')
    btnVoltar.classList.add('btn-voltar')
    btnVoltar.innerText = 'Voltar'
    btnVoltar.onclick = () => { voltar(tabela, btnVoltar) }
    body.appendChild(btnVoltar)

    if (!dadosEvento.datasChamadas) dadosEvento.datasChamadas = []
    if (!dadosEvento.participantes) dadosEvento.participantes = []

    const listaEstudantesReais = dadosEvento.participantes

    const atualizarTelaTabela = () => {
        tabela.innerHTML = '' 

        const linhaCabecalho = document.createElement('tr')
        linhaCabecalho.id = 'linha-cabecalho'
        
        const thAlunos = document.createElement('th')
        thAlunos.innerText = 'Alunos'
        linhaCabecalho.appendChild(thAlunos)

        const thPorcentagem = document.createElement('th')
        thPorcentagem.innerText = '% Faltas'
        linhaCabecalho.appendChild(thPorcentagem)

        const btnMais = document.createElement('input')
        btnMais.type = 'button'
        btnMais.value = '+'
        btnMais.style.marginLeft = '8px'
        btnMais.onclick = () => {
            dadosEvento.totalChamadas++
            dadosEvento.datasChamadas.push('')
            localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(dadosEvento))
            atualizarTelaTabela() 
        }
        thPorcentagem.appendChild(btnMais)

        dadosEvento.datasChamadas.forEach((dataSalva, colunaIndex) => {
            const thNova = document.createElement('th')
            
            const labelChamada = document.createElement('div')
            labelChamada.innerText = `Chamada ${colunaIndex + 1}`
            labelChamada.style.fontSize = '12px'
            
            const inputData = document.createElement('input')
            inputData.type = 'text'
            inputData.placeholder = 'DD/MM'
            inputData.value = dataSalva || ''
            inputData.style.width = '60px'
            inputData.style.textAlign = 'center'
            inputData.style.marginTop = '4px'
            
            inputData.oninput = () => {
                dadosEvento.datasChamadas[colunaIndex] = inputData.value
                localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(dadosEvento))
            }

            const btnApagarColuna = document.createElement('button')
            btnApagarColuna.innerText = 'Apagar'
            btnApagarColuna.style.display = 'block'
            btnApagarColuna.style.margin = '4px auto 0 auto'
            btnApagarColuna.style.fontSize = '10px'
            btnApagarColuna.style.color = 'red'
            
            btnApagarColuna.onclick = () => {
                if (confirm(`Deseja mesmo apagar a Chamada ${colunaIndex + 1}?`)) {
                    dadosEvento.datasChamadas.splice(colunaIndex, 1)
                    dadosEvento.totalChamadas--

                    const novoHistorico = {}
                    listaEstudantesReais.forEach(aluno => {
                        let novoIndexCol = 0
                        for (let c = 0; c <= dadosEvento.totalChamadas + 1; c++) {
                            if (c === colunaIndex) continue 
                            
                            const chaveAntiga = `aluno_${aluno.email}_col_${c}`
                            if (dadosEvento.historicoPresenca[chaveAntiga]) {
                                const chaveNova = `aluno_${aluno.email}_col_${novoIndexCol}`
                                novoHistorico[chaveNova] = dadosEvento.historicoPresenca[chaveAntiga]
                            }
                            novoIndexCol++
                        }
                    })
                    dadosEvento.historicoPresenca = novoHistorico
                    localStorage.setItem(`evento_data_${idCard}`, JSON.stringify(dadosEvento))
                    atualizarTelaTabela()
                }
            }

            thNova.appendChild(labelChamada)
            thNova.appendChild(inputData)
            thNova.appendChild(btnApagarColuna)
            linhaCabecalho.appendChild(thNova)
        })

        tabela.appendChild(linhaCabecalho)

        listaEstudantesReais.forEach((aluno) => {
            const tr = document.createElement('tr')
            
            const tdNome = document.createElement('td')
            tdNome.innerText = aluno.nome
            tr.appendChild(tdNome)

            const tdPorcentagem = document.createElement('td')
            tdPorcentagem.classList.add('contador-porcentagem')
            tdPorcentagem.style.textAlign = 'center'
            tdPorcentagem.innerText = '0%'
            tr.appendChild(tdPorcentagem)

            let totalFaltasAluno = 0

            dadosEvento.datasChamadas.forEach((_, colunaIndex) => {
                const tdBotao = document.createElement('td')
                const botaoPresenca = document.createElement('button')
                const chaveStatus = `aluno_${aluno.email}_col_${colunaIndex}`
                
                if (!dadosEvento.historicoPresenca[chaveStatus]) {
                    dadosEvento.historicoPresenca[chaveStatus] = 'falta'
                }
                
                const statusAtual = dadosEvento.historicoPresenca[chaveStatus]
                if (statusAtual === 'falta') totalFaltasAluno++

                botaoPresenca.innerText = statusAtual
                botaoPresenca.className = statusAtual 

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
                    
                    const totalCols = dadosEvento.datasChamadas.length
                    const faltasAtuais = tr.querySelectorAll('button.falta').length
                    tdPorcentagem.innerText = `${((faltasAtuais / totalCols) * 100).toFixed(1)}%`
                }

                tdBotao.appendChild(botaoPresenca)
                tr.appendChild(tdBotao)
            })

            if (dadosEvento.datasChamadas.length > 0) {
                const porcentagem = ((totalFaltasAluno / dadosEvento.datasChamadas.length) * 100).toFixed(1)
                tdPorcentagem.innerText = `${porcentagem}%`
            }

            tabela.appendChild(tr)
        })
    }

    atualizarTelaTabela()
    body.appendChild(tabela)
}

function voltar(tabela, botao) {
    tabela.remove()   
    botao.remove()    
    container.style.display = 'block' 
    criar.style.display = 'block'
    if (campoPesquisa) campoPesquisa.style.display = 'block'
}

// Inicializa a lista
carregarEventosSalvos()