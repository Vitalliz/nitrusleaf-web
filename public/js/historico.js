document.addEventListener("DOMContentLoaded", () => {
    const propriedadesSelect = document.getElementById("propriedades");

    if (propriedadesSelect) {
        propriedadesSelect.addEventListener("change", async (e) => {
            const idPropriedade = e.target.value;

            try {
                const response = await fetch("/historico/selecionar-propriedade", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id_propriedade: idPropriedade }),
                });

                if (!response.ok) {
                    throw new Error("Erro ao atualizar a propriedade selecionada.");
                }

                window.location.reload();
            } catch (error) {
                console.error(error);
                alert("Erro ao trocar a propriedade selecionada.");
            }
        });
    }
});

