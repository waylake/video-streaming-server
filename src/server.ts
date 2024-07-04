import app from "./app";
import { envConfig } from "./config/envConfig";
import { logger } from "./config/loggerConfig";

const PORT = envConfig.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
