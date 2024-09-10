import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

// Carregar variáveis do .env
dotenv.config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST_DEV:', process.env.DB_HOST_DEV);
console.log('DB_PORT_DEV:', process.env.DB_PORT_DEV);
console.log('DB_USERNAME_DEV:', process.env.DB_USERNAME_DEV);
console.log('DB_PASSWORD_DEV:', process.env.DB_PASSWORD_DEV);
console.log('DB_NAME_DEV:', process.env.DB_NAME_DEV);


// Função para validar as variáveis de ambiente necessárias
const checkEnvVars = (vars: string[]) => {
  vars.forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`A variável de ambiente ${v} não está definida!`);
    }
  });
};

// Validação de variáveis de ambiente para cada ambiente
const validateEnvVars = () => {
  const commonVars = ['DB_PORT_DEV', 'DB_USERNAME_DEV', 'DB_PASSWORD_DEV', 'DB_NAME_DEV'];
  if (process.env.NODE_ENV === 'development') {
    checkEnvVars(['DB_HOST_DEV', ...commonVars]);
  } else if (process.env.NODE_ENV === 'test') {
    checkEnvVars(['DB_HOST_TEST', 'DB_PORT_TEST', 'DB_USERNAME_TEST', 'DB_PASSWORD_TEST', 'DB_NAME_TEST']);
  } else if (process.env.NODE_ENV === 'production') {
    checkEnvVars(['DB_HOST_PROD', 'DB_PORT_PROD', 'DB_USERNAME_PROD', 'DB_PASSWORD_PROD', 'DB_NAME_PROD']);
  } else {
    throw new Error('Ambiente desconhecido! Verifique suas variáveis de ambiente.');
  }
};

// Chamar validação das variáveis de ambiente
validateEnvVars();

const environment = process.env.NODE_ENV || 'development';

// Função para retornar o caminho das entidades baseado no ambiente
const getEntityPath = (): string => {
  return environment === 'production' ? 'dist/entity/**/*.js' : 'src/entity/**/*.ts';
};

// Configuração do banco de dados com base no ambiente
const dbConfig = (): DataSource => {
  if (environment === 'development') {
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST_DEV,
      port: Number(process.env.DB_PORT_DEV),
      username: process.env.DB_USERNAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      database: process.env.DB_NAME_DEV,
      synchronize: true,  // Para desenvolvimento, o synchronize pode ficar ativo
      logging: true,
      entities: [getEntityPath()],
    });
  } 

  if (environment === 'test') {
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST_TEST,
      port: Number(process.env.DB_PORT_TEST),
      username: process.env.DB_USERNAME_TEST,
      password: process.env.DB_PASSWORD_TEST,
      database: process.env.DB_NAME_TEST,
      synchronize: true, // Em testes, synchronize pode ficar ativado para rapidez
      logging: false,
      entities: [getEntityPath()],
    });
  }

  if (environment === 'production') {
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST_PROD,
      port: Number(process.env.DB_PORT_PROD),
      username: process.env.DB_USERNAME_PROD,
      password: process.env.DB_PASSWORD_PROD,
      database: process.env.DB_NAME_PROD,
      synchronize: false, // Em produção, deve-se usar migrações
      logging: ['error'], // Log apenas de erros em produção
      entities: [getEntityPath()],
    });
  }
  

  throw new Error('Ambiente desconhecido! Verifique suas variáveis de ambiente.');
};

// Exportar a configuração para uso na aplicação
export const AppDataSource = dbConfig();
