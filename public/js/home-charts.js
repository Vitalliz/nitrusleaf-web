document.addEventListener('DOMContentLoaded', () => {
    const resumoDeficiencias = window.resumoDeficiencias;
    const totalPesAnalisados = window.totalPesAnalisados;
    const talhoesComparacao = window.talhoesComparacao;
    const talhoesMensagem = window.talhoesMensagem;
    const evolucaoAnalises = window.evolucaoAnalises;
    const evolucaoMensagem = window.evolucaoMensagem;
    const maxTalhaoValor = window.maxTalhaoValor || 0;

    const donutCanvas = document.getElementById('chart-deficiencias');
    const donutEmpty = document.getElementById('deficiencias-empty');
    if (resumoDeficiencias && resumoDeficiencias.total > 0) {
        new Chart(donutCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Cobre', 'Manganês', 'Adversos'],
                datasets: [{
                    data: [resumoDeficiencias.totais.cobre, resumoDeficiencias.totais.manganes, resumoDeficiencias.totais.outros],
                    backgroundColor: ['#D84A0F', '#FFB534', '#ACACAC'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const value = context.raw || 0;
                                const percent = resumoDeficiencias.total ? Math.round((value * 100) / resumoDeficiencias.total) : 0;
                                return `${context.label}: ${percent}%`;
                            }
                        }
                    }
                },
                cutout: '60%',
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.2
            }
        });
    } else if (donutCanvas && donutEmpty) {
        donutCanvas.classList.add('hidden');
        donutEmpty.classList.remove('hidden');
    }

    const talhaoCanvas = document.getElementById('chart-talhao');
    const talhoesEmpty = document.getElementById('talhoes-empty');
    const possuiTalhoes = Array.isArray(talhoesComparacao) && talhoesComparacao.length > 0 && talhoesComparacao.some(item => item.cobre || item.manganes);
    if (talhaoCanvas && possuiTalhoes) {
        new Chart(talhaoCanvas, {
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
                aspectRatio: 1.3,
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
    } else if (talhaoCanvas && talhoesEmpty) {
        talhaoCanvas.classList.add('hidden');
        talhoesEmpty.textContent = talhoesMensagem || 'Nenhum dado disponível';
        talhoesEmpty.classList.remove('hidden');
    }

    const evolucaoCanvas = document.getElementById('chart-evolucao');
    const evolucaoEmpty = document.getElementById('evolucao-empty');
    const possuiEvolucao = Array.isArray(evolucaoAnalises?.datas) && evolucaoAnalises.datas.length > 0 && (evolucaoAnalises.cobre.some(value => value > 0) || evolucaoAnalises.manganes.some(value => value > 0));
    if (evolucaoCanvas && possuiEvolucao) {
        new Chart(evolucaoCanvas, {
            type: 'bar',
            data: {
                labels: evolucaoAnalises.datas,
                datasets: [
                    {
                        label: 'Cobre',
                        data: evolucaoAnalises.cobre,
                        backgroundColor: '#D84A0F',
                        borderRadius: 6
                    },
                    {
                        label: 'Manganês',
                        data: evolucaoAnalises.manganes,
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
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.3,
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
                        suggestedMax: 100,
                        ticks: {
                            callback(value) {
                                return `${value}%`;
                            },
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
    } else if (evolucaoCanvas && evolucaoEmpty) {
        evolucaoCanvas.classList.add('hidden');
        evolucaoEmpty.textContent = evolucaoMensagem || 'Nenhum dado feito nos últimos meses';
        evolucaoEmpty.classList.remove('hidden');
    }
});

