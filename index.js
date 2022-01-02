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
  // res.sendFile('index.html', {root: __dirname});
})

// app.get('/blogs', async (req, res) => {
//   const published = await published_posts();
//   res.json(published);
// })

app.listen(process.env.PORT, () => {console.log('listening...')});


// fetch('/blogs').then((response) => {
//   return response.json()
// }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// })