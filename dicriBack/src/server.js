const app = require('./app');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
dotenv.config();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Backend escuchando en puerto ${PORT}`);
});
