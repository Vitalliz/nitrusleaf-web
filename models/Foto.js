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
        allowNull: true,
        references: {
            model: 'pes',
            key: 'id_pe'
        }
    },
    id_talhao: {
        type: sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'talhoes',
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


// Sync removido - será feito centralmente no index.js após o banco estar pronto
// Foto.sync({ force: false });

export default Foto;
