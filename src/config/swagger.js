import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EasyToLet API",
      version: "1.0.0",
      description: "User Authentication & Management API"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ]
  },

  // 👇 THIS IS THE MOST COMMON BUG
  // use absolute glob, recursive
  apis: ["./src/**/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
