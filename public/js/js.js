const date = new Date();
const day = date.getDate()
const month = date.getMonth() + 1
const year = date.getFullYear()
const currentDate = document.querySelector('.currentDate')
currentDate.innerHTML = `Novos pedidos foram realizados desde o último acesso ao sistema. Hoje é <strong>${day}/${month}/${year}</strong>.`

// Mini Perfil
    let subMenu = document.getElementById("subMenu");
    function toggleMenu(){
        subMenu.classList.toggle("open-menu");
    }


// Grafico de pizza
    const dados = [19, 43, 38]; // Total: 100%
    const coresP = ['#D84A0F', '#ACACAC', '#FFB534'];

    function criarGraficoPizza(dados, cores) {
        const somaTotal = dados.reduce((acc, val) => acc + val, 0);
        if (somaTotal !== 100) {
            console.error('A soma dos dados deve ser 100%');
            return;
        }

        let acumulado = 0;
        const fatias = dados.map((valor, index) => {
            const inicio = acumulado;
            acumulado += valor;
            return `${coresP[index]} ${inicio}% ${acumulado}%`;
        });

        const grafico = document.getElementById('grafico-pizza');
        grafico.style.background = `conic-gradient(${fatias.join(', ')})`;
        adicionarPorcentagens(dados);
    }

    function adicionarPorcentagens(dados) {
        const container = document.querySelector('.graficoContainer');
        let acumulado = 0;

        dados.forEach((valor, index) => {
            const anguloInicial = acumulado;
            acumulado += valor;
            const anguloCentral = anguloInicial + valor / 2;

            const radiano = (anguloCentral * 4.0 * Math.PI) / 180;
            const x = 50 + 35 * Math.cos(radiano);
            const y = 50 + 35 * Math.sin(radiano);

            const porcentagem = document.createElement('div');
            porcentagem.classList.add('porcentagem');
            porcentagem.textContent = `${valor}%`;
            porcentagem.style.left = `${x}%`;
            porcentagem.style.top = `${y}%`;
            porcentagem.style.transform = `translate(-15px , -26px)`;

            container.appendChild(porcentagem);
        });
    }

    criarGraficoPizza(dados, cores);

    // Função para criar a legenda com textos
    function criarLegenda(textos, cores) {
        const legendaContainer = document.getElementById('legenda');
        textos.forEach((texto, index) => {
            const legendaItem = document.createElement('div');
            legendaItem.classList.add('legenda-item');

            // Cor da fatia
            const cor = document.createElement('div');
            cor.classList.add('cor');
            cor.style.backgroundColor = cores[index];

            // Texto personalizado
            const textoElemento = document.createElement('span');
            textoElemento.textContent = texto;  // Exibe o texto personalizado

            // Adiciona a cor e o texto à legenda
            legendaItem.appendChild(cor);
            legendaItem.appendChild(textoElemento);

            legendaContainer.appendChild(legendaItem);
        });
    }

    // Exemplo de dados e cores
    const textos = ["Categoria A", "Categoria B", "Categoria C", "Categoria D"];
    const cores = ["#FF5733", "#33FF57", "#3357FF", "#F3F33F"];

    // Criar a legenda com textos personalizados e cores
    criarLegenda(textos, cores);


// Função para manipular o envio do formulário via AJAX
document.getElementById('upload-form').onsubmit = async (e) => {
    e.preventDefault();  // Impede o envio tradicional do formulário

    const formData = new FormData(document.getElementById('upload-form'));  // Cria o objeto FormData

    try {
        const res = await fetch('/upload', {
            method: 'POST',
            body: formData,  // Envia os dados do formulário, incluindo o arquivo
        });

        const data = await res.json();
        if (data.success) {
            document.getElementById('message').innerText = data.message;
            alert(data.message);  // Alerta de sucesso
        } else {
            document.getElementById('message').innerText = 'Erro no upload';
            alert('Erro no upload');
        }
    } catch (error) {
        document.getElementById('message').innerText = 'Erro ao enviar o arquivo';
        alert('Erro de rede ao tentar fazer o upload');
    }
};

// Função para carregar as opções da dropdown
async function loadOptions() {
    try {
        // Fazendo uma requisição para obter as opções do servidor
        const response = await fetch('/options');
        const options = await response.json();

        const selectElement = document.getElementById('options');
        selectElement.innerHTML = '';  // Limpando a opção "Carregando..."

        // Adicionando as opções no select
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            selectElement.appendChild(optionElement);
        });
    } catch (error) {
        console.error('Erro ao carregar opções:', error);
    }
}

// Carregar as opções assim que a página for carregada
window.onload = loadOptions;

