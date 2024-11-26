document.addEventListener("DOMContentLoaded", function () {
    const customMenu = document.querySelector(".custom-menu");
    const selectedElement = customMenu.querySelector(".menu-selected");
    const arrow = customMenu.querySelector(".menu-arrow");
    const optionsContainer = customMenu.querySelector(".menu-options");
    const options = Array.from(customMenu.querySelectorAll(".menu-option"));
  
    // Abrir e fechar o menu ao clicar no cabeçalho
    customMenu.addEventListener("click", (e) => {
      if (e.target.closest(".menu-header")) {
        const isOpen = customMenu.classList.contains("open");
        closeAllMenus();
        if (!isOpen) {
          customMenu.classList.add("open");
        }
      }
    });
  
    // Atualizar o item selecionado ao clicar em uma opção
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const selectedValue = option.textContent;
  
        // Atualiza o cabeçalho com o valor selecionado
        const previousSelectedValue = selectedElement.textContent;
        selectedElement.textContent = selectedValue;
  
        // Atualiza as opções: troca o item selecionado atual com o cabeçalho
        option.textContent = previousSelectedValue;
  
        // Fecha o menu
        customMenu.classList.remove("open");
      });
    });
  
    // Fechar o menu ao clicar fora dele
    document.addEventListener("click", (e) => {
      if (!customMenu.contains(e.target)) {
        customMenu.classList.remove("open");
      }
    });
  
    // Função para fechar todos os menus
    function closeAllMenus() {
      document.querySelectorAll(".custom-menu").forEach((menu) => {
        menu.classList.remove("open");
      });
    }
  });
  