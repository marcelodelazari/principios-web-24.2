import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Cria a conexão com o PostgreSQL
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Usa a variável do .env
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect()
    .then(() => console.log('🔥 Conectado ao PostgreSQL!'))
    .catch((err) => console.error('Erro ao conectar ao PostgreSQL:', err));
