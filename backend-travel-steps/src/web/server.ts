import express from 'express';
import 'reflect-metadata'; // Necessário para TypeORM
import { AppDataSource } from '../config/data-source'; // Certifique-se de que o caminho esteja correto
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsing de JSON
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API está funcionando!');
  });

//inicia o servidor e conectar ao banco de dados
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Banco de dados conectado com sucesso!');

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
};

startServer();
