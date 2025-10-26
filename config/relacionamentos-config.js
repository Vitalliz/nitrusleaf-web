import Usuarios from "../models/Usuarios.js";
import Talhoes from "../models/Talhoes.js";
import Propriedades from "../models/Propriedades.js";
import Pes from "../models/Pes.js";
import Relatorios from "../models/Relatorios.js";
import Foto from "../models/Foto.js";
import Alqueires from "../models/Alqueires.js";

export default function configurarRelacionamentos() {
    Usuarios.hasMany(Propriedades, {
        foreignKey: 'id_usuario',
        as: 'propriedades'
    });
    Propriedades.belongsTo(Usuarios, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    });
    Propriedades.hasMany(Alqueires, {
        foreignKey: 'id_propriedade',
        as: 'alqueires'
    });
    Alqueires.belongsTo(Propriedades, {
        foreignKey: 'id_propriedade',
        as: 'propriedade'
    });
    Alqueires.hasMany(Talhoes, {
        foreignKey: 'id_alqueire',
        as: 'talhoes'
    });
    Talhoes.belongsTo(Alqueires, {
        foreignKey: 'id_alqueire',
        as: 'alqueire'
    });
    Propriedades.hasMany(Talhoes, {
        foreignKey: 'id_propriedade',
        as: 'talhoes'
    });
    Talhoes.belongsTo(Propriedades, {
        foreignKey: 'id_propriedade',
        as: 'propriedade'
    });
    Talhoes.hasMany(Pes, {
        foreignKey: 'id_talhao',
        as: 'pes'
    });
    Pes.belongsTo(Talhoes, {
        foreignKey: 'id_talhao',
        as: 'talhao'
    });
    Pes.hasMany(Relatorios, {
        foreignKey: 'id_pe',
        as: 'relatorios'
    });
    Relatorios.belongsTo(Pes, {
        foreignKey: 'id_pe',
        as: 'pe'
    });
    Relatorios.belongsTo(Foto, {
        foreignKey: 'id_foto',
        as: 'foto'
    });
    Pes.hasMany(Foto, {
        foreignKey: 'id_pe',
        as: 'fotos'
    });
    Foto.belongsTo(Pes, {
        foreignKey: 'id_pe',
        as: 'pe'
    });
    Talhoes.hasMany(Foto, {
        foreignKey: 'id_talhao',
        as: 'fotos'
    });
    Foto.belongsTo(Talhoes, {
        foreignKey: 'id_talhao',
        as: 'talhao'
    });
}
