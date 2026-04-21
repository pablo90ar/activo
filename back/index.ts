import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import routes from './src/routes/index';
import { authMiddleware } from './src/authMiddleware';
import { initWs } from './src/ws';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use('/api', authMiddleware);
app.use('/api', routes);

initWs(server);

server.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
