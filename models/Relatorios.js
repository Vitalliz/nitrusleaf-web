import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Pes from "./Pes.js";
import Foto from "./Foto.js";

const Relatorios = connection.define('relatorios', {
    id_relatorio: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_pe: {
        type: sequelize.INTEGER,
        references: {
            model: Pes,
            key: 'id_pe'
        }
    },
    id_foto: {
        type: sequelize.INTEGER,
        references: {
            model: Foto,
            key: 'id_foto'
        }
    },
    deficiencia_cobre: {
        type: sequelize.BOOLEAN,
        defaultValue: false,
    },
    deficiencia_manganes: {
        type: sequelize.BOOLEAN,
        defaultValue: false,
    },
    outros: {
        type: sequelize.BOOLEAN,
        defaultValue: false,
    },
    observacoes: {
        type: sequelize.STRING,
    },
    data_analise: {
        type: sequelize.DATE,
        allowNull: false,
    }
});

Relatorios.sync({ force: false });

export default Relatorios;
