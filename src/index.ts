import express, { Request, Response } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(json());

// Ajuste do caminho para o swagger.yaml
const swaggerPath = path.join(__dirname, '../swagger.yaml'); // Partindo de dist/ para a raiz
if (!fs.existsSync(swaggerPath)) {
  console.error('swagger.yaml não encontrado no caminho:', swaggerPath);
} else {
  const swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, 'utf8')) as object;
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Usa as rotas agrupadas
app.use(router);

// Rota de teste
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API funcionando!' });
});

// Rota de verificação básica
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor rodando');
});

// Exporte o app para o Vercel saber como utilizar
export default app;
