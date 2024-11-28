let clickCount = 0;

// Seleciona o botão e os elementos das formas
const button = document.getElementById('close-btn');
const square = document.getElementById('action-one');
const close = document.getElementById('action-two');

// Função para alternar entre as formas
button.addEventListener('click', function() {
    clickCount++; // Incrementa o contador de cliques

    // Primeira ação: Mostrar o quadrado
    if (clickCount === 1) {
        square.style.display = 'block';
        close.style.display = 'none';
    }
    // Segunda ação: Mostrar o círculo
    else if (clickCount === 2) {
        close.style.display = 'block';
    }
    // Resetar o contador após duas ações
    else if (clickCount > 2) {
        clickCount = 0;
        square.style.display = 'none';
        close.style.display = 'none';
      
    }
});