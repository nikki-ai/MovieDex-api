require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const movies = require('./MovieData.js');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny': 'common';

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN; 
  const authToken = req.get('Authorization');

  if(!authToken || authToken.split(' ')[1] !== apiToken){
    return res.status(401).json({error: 'Unauthorized request'});
  }

  next();
});

function mainScreen(req, res) {
  res.json('Moviedex-api! Go to /movies');
}


function handleGetMovie(req, res) {
  const { genre, country, avg_vote } = req.query;
  let results = movies;


  if (genre){
    results = results.filter((m) => m.genre.toLowerCase().includes(genre.toLowerCase()));
  }

  if (country){
    results = results.filter((m) => m.country.toLowerCase().includes(country.toLowerCase()));
  }

  if (avg_vote){
    results = results.filter((m) => Number(m.avg_vote) >= Number(avg_vote));
  }

  res.json(results);
}

app.get('/', mainScreen);
app.get('/movie', handleGetMovie);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }};
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
