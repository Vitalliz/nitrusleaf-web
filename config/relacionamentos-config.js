import Talhoes from "../models/Talhoes.js";
import Propriedades from "../models/Propriedades.js";

// Atrasar a configuração do relacionamento até que os modelos estejam completamente carregados
if (Talhoes && Propriedades) {
    Talhoes.belongsTo(Propriedades, {
        foreignKey: 'id_propriedade',
        as: 'propriedade', // Alias para a associação
    });

    Propriedades.hasMany(Talhoes, {
        foreignKey: 'id_propriedade',
        as: 'talhoes', // Alias para a associação
    });
} else {
    console.log('Modelos não carregados corretamente.');
}
