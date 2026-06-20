const operadores = {
    'AND': (a, b) => a && b,
    '^': (a, b) => a && b,
    'OR': (a, b) => a || b,
    'v': (a, b) => a || b,
    'NOT': (a) => !a,
    '~': (a) => !a,
    'IMP': (a, b) => !a || b,
    '->': (a, b) => !a || b,
    'IFF': (a, b) => (a && b) || (!a && !b),
    '<->': (a, b) => (a && b) || (!a && !b)
}

const precedencia = {
    '~': 4, 'NOT': 4,
    '^': 3, 'AND': 3, '∧': 3,
    'v': 2, 'OR': 2,
    '->': 1, 'IMP': 1, '→': 1,
    '<->': 0, 'IFF': 0
}

function quebrar(expresao) {
    const valores = /(AND|OR|NOT|IMP|IFF|v|\^|~|->|<->|[A-Z]|\(|\))/g
    return expresao.match(valores)
        .filter(elemento => elemento.trim() !== '')
        .map(elemento => elemento.trim())
}

function calcular(elementos) {
    const saida = []
    const juncaoOperacional = []

    for (const elemento of elementos) {
        if (elemento === '(') {
            juncaoOperacional.push(elemento)
        } else if (elemento === ')') {
            while (juncaoOperacional.length > 0 && juncaoOperacional[juncaoOperacional.length - 1] !== '(') {
                saida.push(juncaoOperacional.pop())
            }
            if (juncaoOperacional.length > 0 && juncaoOperacional[juncaoOperacional.length - 1] === '(') {
                juncaoOperacional.pop()
            } else {
                throw new Error("Parênteses usados erradament")
            }
        } else if (precedencia[elemento] !== undefined) {
            while (juncaoOperacional.length > 0 &&
                   precedencia[juncaoOperacional[juncaoOperacional.length - 1]] >= precedencia[elemento] &&
                   juncaoOperacional[juncaoOperacional.length - 1] !== '(') {
                saida.push(juncaoOperacional.pop())
            }
            juncaoOperacional.push(elemento)
        } else {
            saida.push(elemento)
        }
    }

    while (juncaoOperacional.length > 0) {
        const op = juncaoOperacional.pop()
        if (op === '(' || op === ')') {
            throw new Error("Parênteses usados erradament")
        }
        saida.push(op)
    }
    return saida
}

function evaluarOrganizacao(elementosOrganizados, valoresVariaveis) {
    const pilha = []

    for (const elemento of elementosOrganizados) {
        if (precedencia[elemento] !== undefined) {
            let resultado
            if (elemento === 'NOT' || elemento === '~') {
                if (pilha.length < 1) throw new Error("O NOT tá operando no que burro")
                const val = pilha.pop()
                resultado = operadores[elemento](val)
            } else {
                if (pilha.length < 2) throw new Error("Escreve direito, tá faltando coisa")
                const val2 = pilha.pop()
                const val1 = pilha.pop()
                resultado = operadores[elemento](val1, val2)
            }
            pilha.push(resultado)
        } else {
            pilha.push(valoresVariaveis[elemento])
        }
    }

    if (pilha.length !== 1) {
        throw new Error("Escreve direito, tá sobrando variável sem comando")
    }
    return pilha[0]
}

function criarTabelaVerdade() {
    const expresaoInput = document.getElementById('expresaoInput')
    const resposta = document.getElementById('resultwado')
    const expresao = expresaoInput.value.toUpperCase()

    resposta.innerHTML = ''

    if (!expresao) {
        return
    }   

    try {
        const elementos = quebrar(expresao)
        const elementosOrganizados = calcular(elementos)

        const variaveis = Array.from(new Set(elementos.filter(elemento => /^[A-Z]$/.test(elemento)))).sort()

        if (variaveis.length === 0 && expresao.match(/^[TVFtvf]$/)) {
            const valorFinal = expresao.toUpperCase() === 'T'
            resposta.innerHTML = `
                <table class="tabela-verdade">
                    <thead>
                        <tr>
                            <th>${expresao}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${valorFinal ? 'V' : 'F'}</td>
                        </tr>
                    </tbody>
                </table>
            `
            return
        } else if (variaveis.length === 0) {
            throw new Error("Tá sem variável. Use letras para as variáveis.")
        }

        let tabela = '<table class="tabela-verdade"><thead><tr>'
        variaveis.forEach(v => {
            tabela += `<th>${v}</th>`
        })
        tabela += `<th>${expresao}</th></tr></thead><tbody>`

        const numLinhas = Math.pow(2, variaveis.length)

        for (let i = 0; i < numLinhas; i++) {
            const valoresVariaveis = {}
            let linha = '<tr>'
            for (let j = 0; j < variaveis.length; j++) {
                const valor = (i >> (variaveis.length - 1 - j)) & 1
                valoresVariaveis[variaveis[j]] = valor === 1
                linha += `<td>${valor === 1 ? 'V' : 'F'}</td>`
            }

            const resultadoFinal = evaluarOrganizacao(elementosOrganizados, valoresVariaveis)
            linha += `<td>${resultadoFinal ? 'V' : 'F'}</td>`
            linha += '</tr>'
            tabela += linha
        }

        tabela += '</tbody></table>'

        const classificacao = classificarExpressao(elementosOrganizados, variaveis, null)
        resposta.innerHTML = tabela + `\n <p class="classificacao">Classificação: ${classificacao}</p>`

    } catch (error) {
        resposta.innerHTML = `<p class="error-message">Teve erro. ${error.message}</p>`;
        console.error(error)
    }
}

function classificarExpressao(elementosOrganizados, variaveis, valoresVariaveis) {
    const resultados = []
    const numeroLinhas = Math.pow(2, variaveis.length)

    for (let i = 0; i < numeroLinhas; i++) {
        const valores = {}
        for (let j = 0; j < variaveis.length; j++) {
            const valor = (i >> (variaveis.length - 1 - j)) & 1
            valores[variaveis[j]] = valor === 1
        }
        resultados.push(evaluarOrganizacao(elementosOrganizados, valores))
    }

    const todosVerdadeiros = resultados.every(r => r === true)
    const todosFalsos = resultados.every(r => r === false)

    if (todosVerdadeiros) return 'Tautologia'
    if (todosFalsos) return 'Contradição'
    return 'Contingência'
}

document.addEventListener('DOMContentLoaded', () => {
    criarTabelaVerdade()
})

//((P and not P) and (Q imp P)) imp (P and Q)