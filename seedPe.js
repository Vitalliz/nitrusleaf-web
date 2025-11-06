import connection from './config/sequelize-config.js';
import Talhoes from './models/Talhoes.js';
import Pes from './models/Pes.js';

async function main() {
  try {
    await connection.authenticate();
    console.log('Conectado ao banco. Procurando um talhão existente...');

    const talhao = await Talhoes.findOne();
    if (!talhao) {
      console.error('Nenhum talhão encontrado. Crie um talhão primeiro (pela UI ou via rota /talhoes/new).');
      process.exit(1);
    }

    // Verifica se já existe um pé chamado "Pé 1" nesse talhão
    const existente = await Pes.findOne({ where: { nome: 'Pé 1', id_talhao: talhao.id_talhao } });
    if (existente) {
      console.log('Já existe um pé "Pé 1" para o talhão', talhao.nome, '(id:', talhao.id_talhao + ')');
      console.log('Registro:', existente.get({ plain: true }));
      process.exit(0);
    }

    const novoPe = await Pes.create({
      nome: 'Pé 1',
      id_talhao: talhao.id_talhao,
      situacao: 'Sem-informações',
      deficiencia_cobre: false,
      deficiencia_manganes: false,
      outros: false,
      observacoes: null
    });

    console.log('Pé criado com sucesso:', novoPe.get({ plain: true }));
    console.log('Acesse a página de resultados pelo caminho /resultados/' + novoPe.id_pe + ' ou use a navegação do app.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar pé:', error);
    process.exit(1);
  }
}

main();
