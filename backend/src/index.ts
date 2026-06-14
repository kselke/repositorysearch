import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search';

const app = express();
const PORT = process.env['PORT'] ?? 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', searchRouter);

app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});
