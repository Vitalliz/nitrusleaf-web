import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Pes from "./Pes.js";
import Talhoes from "./Talhoes.js";

const Foto = connection.define('foto', {
    id_foto: {
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
    id_talhao: {
        type: sequelize.INTEGER,
        references: {
            model: Talhoes,
            key: 'id_talhao'
        }
    },
    url: {
        type: sequelize.STRING,
        allowNull: false,
    },
    data_tiragem: {
        type: sequelize.DATE,
    },
    resultado_analise: {
        type: sequelize.STRING,
    }
});


Foto.sync({ force: false });

export default Foto;
