const select = document.getElementById("prop");
const seta = document.getElementById("setajs");

// Estado para controlar o giro da seta
let isMenuOpen = false;

// Quando o menu é clicado
select.addEventListener("mousedown", () => {
  isMenuOpen = !isMenuOpen; 
  if (isMenuOpen) {
    seta.classList.add("menuseta-girar"); 
  } else {
    seta.classList.remove("menuseta-girar"); 
  }
  
});

// Quando o menu perde o foco (clicar fora)
select.addEventListener("blur", () => {
  isMenuOpen = false; // Reseta o estado
  seta.classList.remove("menuseta-girar");
});

// Quando uma opção é selecionada
select.addEventListener("change", () => {
  isMenuOpen = false; // Reseta o estado
  seta.classList.remove("menuseta-girar"); // Garante que a seta volte ao estado inicial
});

