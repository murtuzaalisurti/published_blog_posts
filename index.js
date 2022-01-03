const published_posts = require('./call_notion/notion');

const express = require('express');
const app = express();
const dotenv = require('dotenv');
// const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
dotenv.config();

app.use(express.static('public'));
app.set('view engine', 'ejs');

var css_tricks_headings = [];
var first_para = [];
axios.get('https://css-tricks.com/author/murtuzaalisurti/').then((res) => {
  const $ = cheerio.load(res.data);

  // dev.to
  // var first_para = '';
 // var headings = [];
  // $('header h1').each((_idx, element) => {
  //   headings.push($(element).text());
  // });
  // first_para = $('#article-body > p').text();
  // first_para.split(" ", 30).join(" ")
  //res.render('index', { published, heading: `${headings[0]}`, para: first_para.split(" ", 30).join(" ") })


  //css tricks
  $('#maincontent article .article-article h2 a').each((_idx, element) => {
    css_tricks_headings.push($(element).text());
  })

  $('#maincontent article .article-article .card-content p').each((_idx, element) => {
    first_para.push($(element).text());
  })

  console.log(css_tricks_headings, first_para);

  //example
  // const $ = cheerio.load('<h2 class="title">Hello world</h2>')

  // $('h2.title').text('Hello there!')
  // $('h2').addClass('welcome')

  // $.html()
}).catch((err) => {
  console.log(err);
})

app.get('/', async function (req, res) {
  const published = await published_posts();
  res.render('index', { published, heading: css_tricks_headings[0], para: {first_post: first_para[0], second_post: first_para[1]} })
})

app.listen(process.env.PORT, () => { console.log('listening...') });