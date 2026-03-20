require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const cropPricesRouter = require('./routes/cropPrices');
const schemesRouter = require('./routes/schemes');
const labourRouter = require('./routes/labour');
const marketplaceRouter = require('./routes/marketplace');
const barterRouter = require('./routes/barter');
const advisorRouter = require('./routes/advisor');
const fearRouter = require('./routes/fear');
const videosRouter = require('./routes/videos');
const financeRouter = require('./routes/finance');
const businessRouter = require('./routes/business');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1); // Fix for express-rate-limit X-Forwarded-For warning

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://kisan-platform-yl3f.vercel.app',
    'https://kisan-platform-tp85.vercel.app'
  ]
}));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use('/api/prices', cropPricesRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/labour', labourRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/barter', barterRouter);
app.use('/api/advisor', advisorRouter);
app.use('/api/fear', fearRouter);
app.use('/api/videos', videosRouter);
app.use('/api/finance', financeRouter);
app.use('/api/business', businessRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => console.log(`Kisan API running on port ${PORT}`));