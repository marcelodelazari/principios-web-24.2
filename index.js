// Importando dependências
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors'); // Para permitir requisições de diferentes origens

// Criando a aplicação Express
const app = express();

// Habilitando o CORS
app.use(cors());

// Middleware para parse de JSON no corpo da requisição
app.use(express.json());

// Carregando o arquivo Swagger (documentação da API)
const swaggerDocument = YAML.load('./swagger.yaml');

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Bem-vindo à Plataforma Colaborativa API!');
  });
  
// Rota de teste para confirmar que a API está funcionando
app.get('/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Definindo a porta do servidor
const PORT = process.env.PORT || 5000;

// Iniciando o servidor Express
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
