let clickCount = 0;

const BtnScan = document.getElementById('btn-scan');
const closePopupBtn = document.getElementById('close-btn');
const popup = document.getElementById('popup');
// Seleciona o botão e os elementos das formas
const button = document.getElementById('close-btn');
const square = document.getElementById('action-one');

// Quando clicar no botão, abre a popup
BtnScan.addEventListener('click', () => {
  popup.style.display = 'flex';
  square.style.display = 'none'; // Garante que o quadrado inicie oculto
  clickCount = 0; // Reseta o contador de cliques quando a popup é aberta
});

// Função para alternar entre as formas
button.addEventListener('click', function () {
  clickCount++; // Incrementa o contador de cliques
  // Primeira ação: Mostrar o quadrado
  if (clickCount === 1) {
    square.style.display = 'block';  // Exibe o quadrado
  }
  // Segunda ação: Fechar a popup
  else if (clickCount === 2) {
    popup.style.display = 'none';  // Esconde a popup
  }
});

// Caso o usuário clique fora da popup, ela também será fechada
window.addEventListener('click', (event) => {
  if (event.target === popup) {
    popup.style.display = 'none';
  }
});
