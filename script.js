const regiaoSelect = document.getElementById('regiao');
const idadeSelect = document.getElementById('idade');
const anoSelect = document.getElementById('ano');
const tabelaCorpo = document.querySelector('#tabela-vacinacao tbody');
const ctx = document.getElementById('grafico-vacinacao').getContext('2d');

let dadosVacinacao = [];
let grafico;

async function carregarDados() {
  try {
    // Tente buscar dados da API (exemplo fictício)
    const response = await fetch('https://api.mock-vacinacao.com.br/dados');
    if (!response.ok) throw new Error('API indisponível');
    dadosVacinacao = await response.json();
  } catch {
    // Fallback: dados locais fictícios
    dadosVacinacao = [
      { local: 'São Paulo', regiao: 'sudeste', idade: '60+', ano: 2021, doses: 5000000 },
      { local: 'Rio de Janeiro', regiao: 'sudeste', idade: '18-59', ano: 2021, doses: 3500000 },
      { local: 'Salvador', regiao: 'nordeste', idade: '0-17', ano: 2021, doses: 1200000 },
      { local: 'Brasília', regiao: 'centro-oeste', idade: '60+', ano: 2022, doses: 2000000 },
      { local: 'Curitiba', regiao: 'sul', idade: '18-59', ano: 2023, doses: 1800000 },
      { local: 'Fortaleza', regiao: 'nordeste', idade: '60+', ano: 2022, doses: 1700000 },
      { local: 'Manaus', regiao: 'norte', idade: '18-59', ano: 2023, doses: 900000 },
      { local: 'Belo Horizonte', regiao: 'sudeste', idade: '0-17', ano: 2023, doses: 1500000 }
    ];
  }
  aplicarFiltros();
}

function aplicarFiltros() {
  const regiao = regiaoSelect.value;
  const idade = idadeSelect.value;
  const ano = parseInt(anoSelect.value);

  let dadosFiltrados = dadosVacinacao.filter(d => {
    return (regiao === 'todas' || d.regiao === regiao)
      && (idade === 'todas' || d.idade === idade)
      && (d.ano === ano);
  });

  atualizarTabela(dadosFiltrados);
  atualizarGrafico(dadosFiltrados);
}

function atualizarTabela(dados) {
  tabelaCorpo.innerHTML = '';

  dados.sort((a, b) => b.doses - a.doses);

  dados.forEach((item, index) => {
    const tr = document.createElement('tr');

    const tdPos = document.createElement('td');
    tdPos.textContent = index + 1;

    const tdLocal = document.createElement('td');
    tdLocal.textContent = item.local;

    const tdDoses = document.createElement('td');
    tdDoses.textContent = item.doses.toLocaleString('pt-BR');

    tr.appendChild(tdPos);
    tr.appendChild(tdLocal);
    tr.appendChild(tdDoses);

    tabelaCorpo.appendChild(tr);
  });
}

function atualizarGrafico(dados) {
  const agrupado = {};
  dados.forEach(d => {
    agrupado[d.local] = (agrupado[d.local] || 0) + d.doses;
  });

  const labels = Object.keys(agrupado);
  const doses = Object.values(agrupado);

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Doses Aplicadas',
        data: doses,
        backgroundColor: 'rgba(54, 162, 235, 0.85)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        datalabels: {
          color: '#000',
          anchor: 'end',
          align: 'top',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter: (value) => value > 0 ? value.toLocaleString('pt-BR') : '',
          display: true,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('pt-BR')}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#333',
            callback: value => value.toLocaleString('pt-BR')
          },
          grid: {
            color: '#ddd'
          }
        },
        x: {
          ticks: {
            color: '#333'
          },
          grid: {
            display: false
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

regiaoSelect.addEventListener('change', aplicarFiltros);
idadeSelect.addEventListener('change', aplicarFiltros);
anoSelect.addEventListener('change', aplicarFiltros);

carregarDados();
