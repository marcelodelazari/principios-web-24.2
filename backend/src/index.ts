import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { json } from "body-parser";
import router from "./routes";
import swaggerUi from "swagger-ui-express";
import * as fs from "fs";
import * as yaml from "js-yaml";
import path from "path";

console.log("=== SERVIDOR INICIANDO ===");
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(json());

// Ajuste do caminho para o swagger.yaml
const swaggerPath = path.join(__dirname, "../swagger.yaml");
if (!fs.existsSync(swaggerPath)) {
  console.error("swagger.yaml não encontrado no caminho:", swaggerPath);
} else {
  const swaggerDocument = yaml.load(
    fs.readFileSync(swaggerPath, "utf8")
  ) as object;
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Usa as rotas agrupadas
app.use(router);

// Rota de teste
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "API funcionando!" });
});

// Rota de verificação básica
app.get("/", (req: Request, res: Response) => {
  res.send("Servidor rodando");
});

// Manipulador de erro global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor",
  });
});

// Inicia o servidor somente se não estiver no ambiente de teste
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`🔥 Servidor rodando na porta ${port}`);
  });
}

export default app;
