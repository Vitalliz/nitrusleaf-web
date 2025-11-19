// Script para páginas de autenticação

// Validação de senha no cadastro
document.addEventListener('DOMContentLoaded', function() {
    const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmar_senha');
    
    if (senha && confirmarSenha) {
        function validarSenhas() {
            if (senha.value !== confirmarSenha.value) {
                confirmarSenha.setCustomValidity('As senhas não coincidem');
            } else {
                confirmarSenha.setCustomValidity('');
            }
        }
        
        senha.addEventListener('change', validarSenhas);
        confirmarSenha.addEventListener('keyup', validarSenhas);
    }
});

