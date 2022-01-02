const published_posts = require('./call_notion/notion');

const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', async function (req, res){
  const published = await published_posts();
  res.render('index', { published })
})

app.listen(process.env.PORT, () => {console.log('listening...')});