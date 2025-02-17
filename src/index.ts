import express, { Request, Response } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import router from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(json());

// Usa as rotas agrupadas (todas ficam sob /api)
app.use(router);

// Rota de teste - Adicionada
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API funcionando!' });
});

// Rota de verificação básica
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor rodando');
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
