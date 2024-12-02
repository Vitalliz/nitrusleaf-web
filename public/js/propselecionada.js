document.addEventListener('DOMContentLoaded', () => {
    const propriedadesSelect = document.getElementById('propriedades');

    // Verifica se há uma propriedade salva no localStorage
    const propriedadeSelecionada = localStorage.getItem('propriedadeSelecionada');
    if (propriedadeSelecionada) {
        propriedadesSelect.value = propriedadeSelecionada; // Define a propriedade salva como selecionada
    }

    // Listener para salvar a propriedade selecionada no localStorage
    propriedadesSelect.addEventListener('change', (e) => {
        localStorage.setItem('propriedadeSelecionada', e.target.value);
    });
});

// Capturar o evento de mudança no select
document.getElementById('propriedades').addEventListener('change', (event) => {
    const idPropriedade = event.target.value;
    localStorage.setItem('propriedadeSelecionada', idPropriedade);

    // Enviar o ID para o servidor
    fetch('/home', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_propriedade: idPropriedade }),
    })
        .then((res) => res.json())
        .then((data) => console.log('Propriedade atualizada no servidor:', data))
        .catch((error) => console.error('Erro ao atualizar propriedade no servidor:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const propriedadeSelecionada = localStorage.getItem('propriedadeSelecionada');
    const propriedadesSelect = document.getElementById('propriedades');

    if (propriedadeSelecionada) {
        propriedadesSelect.value = propriedadeSelecionada; // Define a propriedade como selecionada
    }
});
