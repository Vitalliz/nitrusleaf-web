  // Seleciona o botão e o input de arquivo
  const btnUpload = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');

  // Quando o botão de upload for clicado, aciona o input de arquivo
  btnUpload.addEventListener('click', function() {
      fileInput.click();  // Aciona a ação do input tipo file
  });

  // Função para fazer o upload da imagem
  fileInput.addEventListener('change', function() {
      if (fileInput.files.length > 0) {
          const file = fileInput.files[0];  // Obtém o arquivo selecionado
          const formData = new FormData();  // Cria um objeto FormData para enviar os dados
          formData.append('file', file);  // Adiciona o arquivo ao FormData

          // Envia o FormData para o servidor usando o fetch
          fetch('/uploads', {  // Aqui você pode substituir pela URL do seu endpoint de upload
              method: 'POST',
              body: formData
          })
          .then(response => response.json())  // Espera a resposta em JSON
          .then(data => {
              if (data.success) {
                  alert('Upload realizado com sucesso!');
              } else {
                  alert('Falha no upload: ' + data.message);
              }
          })
          .catch(error => {
              alert('Erro ao enviar arquivo: ' + error.message);
          });
      }
  });