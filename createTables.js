import Usuarios from './models/Usuarios.js';
import Propriedades from './models/Propriedades.js';
import Talhoes from './models/Talhoes.js';
import Pes from './models/Pes.js';
import Foto from './models/Foto.js';
import Relatorios from './models/Relatorios.js';

async function createTables() {
  try {
    // Criar tabelas na ordem correta (pais antes dos filhos)
    await Usuarios.sync({ force: false });
    console.log('Tabela "Usuarios" criada.');

    await Propriedades.sync({ force: false });
    console.log('Tabela "Propriedades" criada.');

    await Talhoes.sync({ force: false });
    console.log('Tabela "Talhoes" criada.');

    await Pes.sync({ force: false });
    console.log('Tabela "Pes" criada.');

    await Foto.sync({ force: false });
    console.log('Tabela "Foto" criada.');

    await Relatorios.sync({ force: false });
    console.log('Tabela "Relatorios" criada.');
    
    console.log('Todas as tabelas foram criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar as tabelas:', error);
  }
}

createTables();
