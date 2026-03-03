import express from 'express';
import cors from 'cors';
import routes from './src/routes/index';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);


app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});