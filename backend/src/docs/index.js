const swaggerUi = require("swagger-ui-express");
const spec = require("./openapi.json");

module.exports = function mountDocs(app) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
};