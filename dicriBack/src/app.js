const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/expedientes', require('./routes/expediente.routes'));
app.use('/api/indicios', require('./routes/indicio.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));


app.get('/health', (req, res) => res.json({ status: 'ok' }));


app.use(errorHandler);

module.exports = app;
