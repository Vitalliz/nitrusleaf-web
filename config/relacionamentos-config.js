import Usuarios from "../models/Usuarios.js"
import Talhoes from "../models/Talhoes.js";
import Propriedades from "../models/Propriedades.js";
import Pes from "../models/Pes.js";
export default function configurarRelacionamentos() {
    Usuarios.hasMany(Propriedades, { 
        foreignKey: 'id_usuario', 
        as: 'propriedades' });
    Propriedades.belongsTo(Usuarios, { 
        foreignKey: 'id_usuario', 
        as: 'usuario' });
    Propriedades.hasMany(Talhoes, { 
        foreignKey: 'id_propriedade', 
        as: 'talhoes' });
    Talhoes.belongsTo(Propriedades, { 
        foreignKey: 'id_propriedade', 
        as: 'propriedade'});
    Talhoes.hasMany(Pes, { 
        foreignKey: 'id_talhao', 
        as: 'pes' });
    Pes.belongsTo(Talhoes, { 
        foreignKey: 'id_talhao', 
        as: 'talhao' });

}
