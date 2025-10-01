const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const usersRouter = require('./routes/users');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// serve client static files
app.use(express.static(path.join(__dirname, '..', '..', 'client')));

app.use('/api/users', usersRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;
