const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Train Search API is running...');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
