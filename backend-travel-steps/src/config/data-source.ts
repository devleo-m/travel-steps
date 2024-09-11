import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

// Carregar variáveis do .env de acordo com o ambiente
dotenv.config();

console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

const environment = process.env.NODE_ENV;

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
  const commonVars = ['DB_USERNAME_DEV', 'DB_PASSWORD_DEV', 'DB_NAME_DEV'];

  if (environment === 'development') {
    checkEnvVars(['DB_HOST_DEV', 'DB_PORT_DEV', 'DB_USERNAME_DEV', 'DB_PASSWORD_DEV', 'DB_NAME_DEV']);
  } else if (environment === 'test') {
    checkEnvVars(['DB_HOST_TEST', 'DB_PORT_TEST', 'DB_USERNAME_TEST', 'DB_PASSWORD_TEST', 'DB_NAME_TEST']);
  } else if (environment === 'production') {
    checkEnvVars(['DB_HOST_PROD', 'DB_PORT_PROD', 'DB_USERNAME_PROD', 'DB_PASSWORD_PROD', 'DB_NAME_PROD']);
  } else {
    throw new Error('Ambiente desconhecido! Verifique suas variáveis de ambiente.');
  }
};

// Chamar validação das variáveis de ambiente
validateEnvVars();

// Função para retornar o caminho das entidades baseado no ambiente
const getEntityPath = (): string => {
  return environment === 'production' ? 'dist/entity/**/*.js' : 'src/entity/**/*.ts';
};

// Configuração do banco de dados com base no ambiente
const dbConfig = (): DataSource => {
  if (environment === 'development') {
    // Conexão para ambiente de desenvolvimento (Docker)
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST_DEV,
      port: Number(process.env.DB_PORT_DEV),
      username: process.env.DB_USERNAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      database: process.env.DB_NAME_DEV,
      synchronize: true,  // Sincronizar para facilitar o desenvolvimento
      logging: true,
      entities: [getEntityPath()],
    });
  } 

  if (environment === 'test') {
    // Conexão para ambiente de teste (Docker)
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST_TEST,
      port: Number(process.env.DB_PORT_TEST),
      username: process.env.DB_USERNAME_TEST,
      password: process.env.DB_PASSWORD_TEST,
      database: process.env.DB_NAME_TEST,
      synchronize: true, // Sincronizar em testes para recriar as tabelas rapidamente
      logging: false,
      entities: [getEntityPath()],
    });
  }

  if (environment === 'production') {
    // Conexão para ambiente de produção (local/externo, sem Docker)
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST_PROD,
      port: Number(process.env.DB_PORT_PROD),
      username: process.env.DB_USERNAME_PROD,
      password: process.env.DB_PASSWORD_PROD,
      database: process.env.DB_NAME_PROD,
      synchronize: false, // Nunca sincronizar em produção para evitar perder dados
      logging: ['error'], // Log apenas de erros em produção
      entities: [getEntityPath()],
    });
  }

  throw new Error('Ambiente desconhecido! Verifique suas variáveis de ambiente.');
};

// Exportar a configuração do DataSource para ser usada no projeto
export const AppDataSource = dbConfig();