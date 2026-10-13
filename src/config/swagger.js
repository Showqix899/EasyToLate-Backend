import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EasyToLet API",
      version: "1.0.0",
      description: "Express + MongoDB backend",
    },
    servers: [{ url: "http://localhost:5000" }], 
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  // absolute paths, so it works no matter where you run node from
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../models/*.js"),
  ],
};

export default swaggerJsdoc(options);