const published_posts = require('./call_notion/notion');

const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.get('/', function (req, res){
  res.sendFile('index.html', {root: __dirname});
})

app.get('/blogs', async (req, res) => {
  const published = await published_posts();
  res.json(published);
})

app.listen(process.env.PORT)