// Script consolidado para páginas de análises

// Função genérica para aplicar filtro
function aplicarFiltro(tipo) {
    const propriedadeSelecionada = window.propriedadeSelecionada || '';
    const url = new URL(window.location.href);
    url.searchParams.set('propriedade', propriedadeSelecionada);
    
    let filtroValue = '';
    if (tipo === 'alqueire') {
        filtroValue = document.getElementById('alqueire-filtro').value;
        if (filtroValue) {
            url.searchParams.set('alqueire', filtroValue);
        } else {
            url.searchParams.delete('alqueire');
        }
    } else if (tipo === 'talhao') {
        filtroValue = document.getElementById('talhao-filtro').value;
        if (filtroValue) {
            url.searchParams.set('talhao', filtroValue);
        } else {
            url.searchParams.delete('talhao');
        }
    }
    
    window.location.href = url.toString();
}

// Função genérica para atualizar propriedade
function atualizarPropriedade(redirectPath) {
    const propriedadesSelect = document.getElementById('propriedades');
    if (propriedadesSelect) {
        propriedadesSelect.addEventListener('change', async (e) => {
            const idPropriedade = e.target.value;
            try {
                const response = await fetch("/home", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id_propriedade: idPropriedade }),
                });
                if (response.ok) {
                    window.location.href = `${redirectPath}?propriedade=${idPropriedade}`;
                }
            } catch (error) {
                console.error(error);
            }
        });
    }
}

// Ocorrências
document.addEventListener('DOMContentLoaded', () => {
    // Gráfico de ocorrências
    const canvasOcorrencias = document.getElementById('chart-ocorrencias');
    const resumoDeficiencias = window.resumoDeficiencias;
    
    if (canvasOcorrencias && resumoDeficiencias && resumoDeficiencias.total > 0) {
        new Chart(canvasOcorrencias, {
            type: 'doughnut',
            data: {
                labels: ['Cobre', 'Manganês', 'Adversos'],
                datasets: [{
                    data: [
                        resumoDeficiencias.totais.cobre, 
                        resumoDeficiencias.totais.manganes, 
                        resumoDeficiencias.totais.outros
                    ],
                    backgroundColor: ['#D84A0F', '#FFB534', '#ACACAC'],
                    borderWidth: 0
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 16,
                            color: '#351102',
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    }
                },
                cutout: '60%',
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5
            }
        });
    }
    
    // Atualizar propriedade para ocorrências
    atualizarPropriedade('/analises/ocorrencias');
});

// Deficiência por Talhão
document.addEventListener('DOMContentLoaded', () => {
    const canvasTalhao = document.getElementById('chart-talhao');
    const talhoesComparacao = window.talhoesComparacao || [];
    const maxTalhaoValor = window.maxTalhaoValor || 0;
    
    const possuiTalhoes = Array.isArray(talhoesComparacao) && talhoesComparacao.length > 0 && 
                         talhoesComparacao.some(item => item.cobre || item.manganes);
    
    if (canvasTalhao && possuiTalhoes) {
        new Chart(canvasTalhao, {
            type: 'bar',
            data: {
                labels: talhoesComparacao.map(item => item.nome),
                datasets: [
                    {
                        label: 'Cobre',
                        data: talhoesComparacao.map(item => item.cobre),
                        backgroundColor: '#D84A0F',
                        borderRadius: 6
                    },
                    {
                        label: 'Manganês',
                        data: talhoesComparacao.map(item => item.manganes),
                        backgroundColor: '#FFB534',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            padding: 16,
                            color: '#351102',
                            font: {
                                size: 12,
                                family: 'Roboto',
                                weight: '600'
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                scales: {
                    x: {
                        ticks: {
                            color: '#351102',
                            font: {
                                family: 'Roboto',
                                weight: '600',
                                size: 11
                            }
                        },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: maxTalhaoValor ? maxTalhaoValor + 2 : 5,
                        ticks: {
                            precision: 0,
                            color: '#351102',
                            font: {
                                family: 'Roboto',
                                weight: '600',
                                size: 11
                            }
                        },
                        grid: {
                            color: '#F2D6A4'
                        }
                    }
                }
            }
        });
    }
    
    // Atualizar propriedade para deficiência-talhão
    atualizarPropriedade('/analises/deficiencia-talhao');
});

// Evolução
document.addEventListener('DOMContentLoaded', () => {
    atualizarPropriedade('/analises/evolucao');
});

