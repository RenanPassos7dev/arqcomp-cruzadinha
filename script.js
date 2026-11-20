const palavras = [
  {
    resposta: "MICROCONTROLADOR",
    linha: 3,
    coluna: 3,
    direcao: "H",
    pista:
      "Circuito integrado que reúne processamento, memória e periféricos em um único chip.",
  },
  {
    resposta: "MEMORIADEMASSA",
    linha: 0,
    coluna: 9,
    direcao: "V",
    pista:
      "Armazenamento não volátil usado para guardar grandes volumes de arquivos.",
  },
  {
    resposta: "REGISTRADORES",
    linha: 0,
    coluna: 4,
    direcao: "V",
    pista:
      "Pequenas unidades internas que guardam dados de uso imediato pelo processador.",
  },
  {
    resposta: "ADDRESSBUS",
    linha: 0,
    coluna: 6,
    direcao: "V",
    pista:
      "Via que indica a posição de memória ou dispositivo que será acessado.",
  },
  {
    resposta: "DUALCORE",
    linha: 1,
    coluna: 15,
    direcao: "V",
    pista:
      "Projeto de processador que reúne duas unidades independentes de execução.",
  },
  {
    resposta: "QUADCORE",
    linha: 5,
    coluna: 11,
    direcao: "H",
    pista:
      "Configuração de processamento que reúne quatro núcleos no mesmo chip.",
  },
  {
    resposta: "DATABUS",
    linha: 13,
    coluna: 8,
    direcao: "H",
    pista:
      "Conjunto de linhas responsável por transportar informações entre componentes.",
  },
  {
    resposta: "EEPROM",
    linha: 8,
    coluna: 8,
    direcao: "H",
    pista:
      "Memória não volátil que pode ser apagada e regravada eletricamente.",
  },
  {
    resposta: "FLASH",
    linha: 11,
    coluna: 6,
    direcao: "H",
    pista:
      "Tipo de memória não volátil usada em cartões, pendrives e unidades SSD.",
  },
  {
    resposta: "CACHE",
    linha: 1,
    coluna: 0,
    direcao: "H",
    pista:
      "Memória pequena e rápida que reduz o tempo de acesso a dados frequentes.",
  },
  {
    resposta: "CPU",
    linha: 1,
    coluna: 0,
    direcao: "V",
    pista:
      "Componente central que interpreta e executa instruções de programas.",
  },
  {
    resposta: "ULA",
    linha: 10,
    coluna: 7,
    direcao: "V",
    pista: "Parte responsável por cálculos matemáticos e decisões lógicas.",
  },
  {
    resposta: "RAM",
    linha: 5,
    coluna: 17,
    direcao: "V",
    pista:
      "Memória volátil que mantém dados disponíveis durante a execução dos programas.",
  },
  {
    resposta: "ROM",
    linha: 7,
    coluna: 15,
    direcao: "H",
    pista:
      "Memória não volátil tradicionalmente usada para armazenar instruções permanentes.",
  },
  {
    resposta: "DMA",
    linha: 1,
    coluna: 15,
    direcao: "H",
    pista:
      "Recurso que permite transferências entre memória e periféricos sem ocupar continuamente o processador.",
  },
  {
    resposta: "UC",
    linha: 3,
    coluna: 0,
    direcao: "H",
    pista:
      "Bloco que coordena a sequência de operações e sinais do processador.",
  },
];

palavras.forEach((p, indice) => (p.id = indice));

const LINHAS = 14,
  COLUNAS = 19;
const grade = new Map();
let palavraSelecionada = null;
let palavrasCertas = new Set();
let partidaConcluida = false;
const $ = (id) => document.getElementById(id);
const chave = (l, c) => `${l},${c}`;
const posicoes = (p) =>
  [...p.resposta].map((letra, i) => ({
    linha: p.linha + (p.direcao === "V" ? i : 0),
    coluna: p.coluna + (p.direcao === "H" ? i : 0),
    letra,
  }));

function prepararGrade() {
  const inicios = new Map();
  palavras.forEach((p) => {
    const k = chave(p.linha, p.coluna);
    if (!inicios.has(k)) inicios.set(k, []);
    inicios.get(k).push(p);
  });
  [...inicios.keys()]
    .sort((a, b) => {
      const [la, ca] = a.split(",").map(Number),
        [lb, cb] = b.split(",").map(Number);
      return la - lb || ca - cb;
    })
    .forEach((k, i) => inicios.get(k).forEach((p) => (p.numero = i + 1)));

  palavras.forEach((p) =>
    posicoes(p).forEach((pos) => {
      const k = chave(pos.linha, pos.coluna);
      if (!grade.has(k))
        grade.set(k, {
          letra: pos.letra,
          palavras: [],
          input: null,
          elemento: null,
        });
      const casa = grade.get(k);
      if (casa.letra !== pos.letra) throw new Error(`Conflito na casa ${k}`);
      casa.palavras.push(p);
    }),
  );
  palavras.forEach((p) => {
    const casas = posicoes(p);
    if (
      casas.some(
        (x) =>
          x.linha < 0 ||
          x.linha >= LINHAS ||
          x.coluna < 0 ||
          x.coluna >= COLUNAS,
      )
    )
      throw new Error(`A palavra ${p.resposta} ultrapassa a grade.`);
    if (
      !casas.some(
        (x) => grade.get(chave(x.linha, x.coluna)).palavras.length > 1,
      )
    )
      throw new Error(`A palavra ${p.resposta} não cruza outra.`);
  });
}

function criarTabuleiro() {
  prepararGrade();
  const tab = $("crossword");
  tab.style.setProperty("--columns", COLUNAS);
  for (let l = 0; l < LINHAS; l++)
    for (let c = 0; c < COLUNAS; c++) {
      const k = chave(l, c),
        dados = grade.get(k),
        celula = document.createElement("div");
      celula.className = dados ? "cell" : "cell blocked";
      celula.style.gridRow = l + 1;
      celula.style.gridColumn = c + 1;
      if (dados) {
        const inicio = palavras.find((p) => p.linha === l && p.coluna === c);
        if (inicio) {
          const n = document.createElement("span");
          n.className = "cell-number";
          n.textContent = inicio.numero;
          celula.appendChild(n);
        }
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.autocomplete = "off";
        input.spellcheck = false;
        input.setAttribute("aria-label", `Linha ${l + 1}, coluna ${c + 1}`);
        input.addEventListener("input", () => {
          if (partidaConcluida) return;
          input.value = input.value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .slice(-1);
          celula.classList.remove("is-wrong", "is-correct");
          dados.palavras.forEach((p) => palavrasCertas.delete(p.id));
          atualizarProgresso();
          if (input.value && palavraSelecionada) {
            const next = proximaCasa(palavraSelecionada, k, 1);
            if (next) next.focus();
          }
        });
        input.addEventListener("keydown", (e) => navegarGrade(e, k));
        input.addEventListener("focus", () => selecionarPorCasa(k));
        celula.addEventListener("click", () => {
          selecionarPorCasa(k);
          input.focus();
        });
        celula.appendChild(input);
        dados.input = input;
        dados.elemento = celula;
      }
      tab.appendChild(celula);
    }
}
function proximaCasa(p, k, passo) {
  const lista = posicoes(p),
    i = lista.findIndex((x) => chave(x.linha, x.coluna) === k),
    dest = lista[i + passo];
  return dest ? grade.get(chave(dest.linha, dest.coluna)).input : null;
}
function navegarGrade(e, k) {
  if (!palavraSelecionada) return;
  if (e.key === "Backspace" && !grade.get(k).input.value) {
    const prev = proximaCasa(palavraSelecionada, k, -1);
    if (prev) {
      prev.focus();
      prev.value = "";
    }
  }
  const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (e.key in moves) {
    e.preventDefault();
    const next = proximaCasa(palavraSelecionada, k, moves[e.key]);
    if (next) next.focus();
  }
}
function selecionarPorCasa(k) {
  const dados = grade.get(k);
  if (!dados) return;
  const p =
    dados.palavras.find((x) => x === palavraSelecionada) ||
    dados.palavras.find((x) => !palavrasCertas.has(x.numero)) ||
    dados.palavras[0];
  selecionarPalavra(p, false);
}
function selecionarPalavra(p, focar = true) {
  if (partidaConcluida) return;
  palavraSelecionada = p;
  document
    .querySelectorAll(".cell")
    .forEach((el) => el.classList.remove("selected"));
  posicoes(p).forEach((x) =>
    grade.get(chave(x.linha, x.coluna)).elemento.classList.add("selected"),
  );
  document
    .querySelectorAll(".clue")
    .forEach((el) =>
      el.classList.toggle("is-selected", Number(el.dataset.id) === p.id),
    );
  $("selectedClue").querySelector(".selected-number").textContent = String(
    p.numero,
  ).padStart(2, "0");
  $("selectedClue").querySelector("strong").textContent = p.pista;
  $("selectedClue").querySelector(".direction-tag").textContent =
    p.direcao === "H" ? "HORIZONTAL" : "VERTICAL";
  if (focar) {
    const inputs = posicoes(p).map(
      (x) => grade.get(chave(x.linha, x.coluna)).input,
    );
    (inputs.find((x) => !x.value) || inputs[0]).focus();
  }
}
function criarPistas() {
  const hs = palavras
    .filter((p) => p.direcao === "H")
    .sort((a, b) => a.numero - b.numero);
  const vs = palavras
    .filter((p) => p.direcao === "V")
    .sort((a, b) => a.numero - b.numero);
  $("hCount").textContent = hs.length;
  $("vCount").textContent = vs.length;
  [
    [hs, "horizontalClues"],
    [vs, "verticalClues"],
  ].forEach(([lista, id]) => {
    lista.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "clue";
      b.dataset.number = p.numero;
      b.dataset.id = p.id;
      b.innerHTML = `<span class="clue-number">${String(p.numero).padStart(2, "0")}</span><span class="clue-copy">${p.pista}</span><span class="clue-check">✓</span>`;
      b.addEventListener("click", () => selecionarPalavra(p));
      $(id).appendChild(b);
    });
  });
  document.querySelectorAll(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter")
        .forEach((x) => x.classList.toggle("active", x === btn));
      document
        .querySelectorAll(".clue-group")
        .forEach(
          (group) =>
            (group.hidden =
              btn.dataset.filter !== "all" &&
              group.dataset.group !== btn.dataset.filter),
        );
    }),
  );
}
function atualizarProgresso() {
  const total = palavrasCertas.size,
    pct = Math.round((total / palavras.length) * 100);
  $("progressLabel").textContent = `${total} de ${palavras.length}`;
  $("percentLabel").textContent = `${pct}%`;
  $("progressBar").style.width = `${pct}%`;
  $("clueCount").textContent = palavras.length;
  palavras.forEach((p) => {
    const clue = document.querySelector(`.clue[data-id="${p.id}"]`);
    if (clue) clue.classList.toggle("is-done", palavrasCertas.has(p.id));
  });
}
function conferir() {
  if (partidaConcluida) return;
  let certas = 0,
    erradas = 0,
    incompletas = 0;
  palavras.forEach((p) => {
    const casas = posicoes(p),
      valores = casas.map(
        (x) => grade.get(chave(x.linha, x.coluna)).input.value,
      );
    if (valores.every((v) => !v)) {
      return;
    }
    if (valores.some((v) => !v)) {
      incompletas++;
      return;
    }
    const ok = valores.join("") === p.resposta;
    casas.forEach((x) => {
      const el = grade.get(chave(x.linha, x.coluna)).elemento;
      el.classList.remove("is-correct", "is-wrong");
      el.classList.add(ok ? "is-correct" : "is-wrong");
    });
    if (ok) {
      palavrasCertas.add(p.id);
      certas++;
    } else {
      erradas++;
    }
  });
  atualizarProgresso();
  const feedback = $("feedback");
  feedback.className = "feedback";
  if (erradas) {
    feedback.textContent = `${erradas} resposta(s) precisam de revisão. As casas em vermelho indicam onde conferir.`;
    feedback.classList.add("bad");
  } else if (palavrasCertas.size === palavras.length) {
    feedback.textContent = "Excelente! Você completou todas as palavras.";
    feedback.classList.add("good");
    partidaConcluida = true;
    $("completion").classList.add("visible");
    $("completion").setAttribute("aria-hidden", "false");
  } else if (certas) {
    feedback.textContent = `${certas} palavra(s) correta(s)! ${incompletas ? incompletas + " ainda estão incompletas." : "Continue preenchendo o tabuleiro."}`;
    feedback.classList.add("good");
  } else if (incompletas) {
    feedback.textContent = `Você ainda tem ${incompletas} palavra(s) incompleta(s). Continue!`;
  } else {
    feedback.textContent = "Preencha as casas antes de conferir.";
  }
}
function limparPalavra() {
  if (!palavraSelecionada || partidaConcluida) return;
  posicoes(palavraSelecionada).forEach((x) => {
    const d = grade.get(chave(x.linha, x.coluna));
    d.input.value = "";
    d.elemento.classList.remove("is-correct", "is-wrong");
  });
  palavrasCertas.delete(palavraSelecionada.id);
  atualizarProgresso();
  $("feedback").textContent = "As letras da palavra selecionada foram limpas.";
}
function reiniciar() {
  partidaConcluida = false;
  palavrasCertas.clear();
  grade.forEach((d) => {
    d.input.value = "";
    d.elemento.classList.remove("selected", "is-correct", "is-wrong");
  });
  document
    .querySelectorAll(".clue")
    .forEach((x) => x.classList.remove("is-done", "is-selected"));
  $("completion").classList.remove("visible");
  $("completion").setAttribute("aria-hidden", "true");
  palavraSelecionada = null;
  $("selectedClue").querySelector(".selected-number").textContent = "—";
  $("selectedClue").querySelector("strong").textContent =
    "Escolha uma pista para começar";
  $("selectedClue").querySelector(".direction-tag").textContent = "—";
  $("feedback").className = "feedback";
  $("feedback").textContent = "Escolha uma pista para iniciar o desafio.";
  atualizarProgresso();
}
$("checkButton").addEventListener("click", conferir);
$("clearButton").addEventListener("click", limparPalavra);
$("restartButton").addEventListener("click", reiniciar);
$("playAgain").addEventListener("click", reiniciar);
criarTabuleiro();
criarPistas();
atualizarProgresso();
