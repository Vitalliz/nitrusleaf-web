import sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Relatorios from "./Relatorios.js";

const Resultados = connection.define('resultados', {
    id_resultados: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    talhao:{
        type: sequelize.VARCHAR,
        defaultvalue:false
    },
    pe:{
        type: sequelize.VARCHAR,
        defaultvalue:false
    },
    relatorios:{
        type: sequelize.VARCHAR,
        defaultvalue:false
    }
});

Relatorios.sync({ force: false });

export default Resultados;
