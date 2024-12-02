document.addEventListener('DOMContentLoaded', async () => {
    const propriedadesSelect = document.getElementById('propriedades');
    const talhoesSelect = document.getElementById('talhoes');
    const pesList = document.getElementById('pes');

   // Função para carregar propriedades do usuário
const carregarPropriedades = async (idUsuario) => {
    try {
        const response = await fetch(`/dados/${idUsuario}`); // Faz a requisição à rota
        const usuario = await response.json(); // Converte a resposta para JSON

        // Verifica se o usuário possui propriedades
        if (!usuario.propriedades || usuario.propriedades.length === 0) {
            propriedadesSelect.innerHTML = '<option>Nenhuma propriedade disponível</option>';
            return;
        }

        // Popula o select de propriedades
        propriedadesSelect.innerHTML = usuario.propriedades
            .map(
                (prop) =>
                    `<option value="${prop.id_propriedade}">${prop.nome}</option>`
            )
            .join('');

        // Carrega os talhões da primeira propriedade
        carregarTalhoes(usuario.propriedades[0]);
    } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
    }
};


    // Função para carregar talhões de uma propriedade
    const carregarTalhoes = (propriedades) => {
        if (!propriedades) return;

        talhoesSelect.innerHTML = propriedades.talhoes
            .map((talhoes) => `<%= forEach<option value="${talhoes.id_talhao}">${talhoes.nome}</option>`)
            .join('');

        // Carrega os pés do primeiro talhão (se existirem)
        if (propriedades.talhoes.length > 0) {
            carregarPes(propriedades.talhoes[0]);
        }
    };

    // Função para carregar pés de um talhão
    const carregarPes = (talhoes) => {
        if (!talhoes) return;

        pesList.innerHTML = talhoes.pes
            .map((pes) => `<li>${pes.nome}</li>`)
            .join('');
    };

    // Listeners para os selects
    propriedadesSelect.addEventListener('change', (e) => {
        const propriedadeSelecionada = propriedadesSelect.value;
        const propriedade = usuario.propriedades.find(
            (prop) => prop.id_propriedade === parseInt(propriedadeSelecionada)
        );
        carregarTalhoes(propriedade);
    });

    talhoesSelect.addEventListener('change', (e) => {
        const talhaoSelecionado = talhoesSelect.value;
        const propriedade = usuarios.propriedades.find(
            (prop) => prop.talhoes.some((t) => t.id_talhao === parseInt(talhaoSelecionado))
        );
        const talhao = propriedade.talhoes.find((t) => t.id_talhao === parseInt(talhaoSelecionado));
        carregarPes(talhao);
    });

    // Inicializa carregando o usuário com ID 1
    carregarPropriedades(1);
});
    

