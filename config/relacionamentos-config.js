import Talhoes from "../models/Talhoes.js";
import Propriedades from "../models/Propriedades.js";
import Pes from "../models/Pes.js";
export default function configurarRelacionamentos() {
    Talhoes.belongsTo(Propriedades, {
        foreignKey: 'id_propriedade',
        as: 'propriedade',
    });

    Propriedades.hasMany(Talhoes, {
        foreignKey: 'id_propriedade',
        as: 'talhoes',
    });

    Talhoes.hasMany(Pes, {
        foreignKey: 'id_talhao',
        as: 'pes',
    });

    Pes.belongsTo(Talhoes, {
        foreignKey: 'id_talhao',
        as: 'talhao',
    });
}
