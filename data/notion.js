const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const cheerio = require('cheerio');
const all_blog_posts = [];
axios.get('https://dev.to/api/articles?username=murtuzaalisurti').then((res) => {
  res.data.forEach((article) => {
    all_blog_posts.push({url: article.url, desc: article.description, published: article.readable_publish_date})
  })
  // console.log(all_blog_posts);
});

const css_tricks_headings = [];
const css_tricks_url = [];
const first_para = [];
const css_tricks_publish = [];
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
    css_tricks_url.push($(element).attr('href'));
  })

  $('#maincontent article .article-article .card-content p').each((_idx, element) => {
    first_para.push($(element).text());
  })

  $('#maincontent article .article-article .author-row time').each((_idx, element) => {
    css_tricks_publish.push($(element).text().slice(1, ($(element).text().length-1)));
  })

  for(let i = 0; i < css_tricks_headings.length; i++) {
    all_blog_posts.push({url: css_tricks_url[i], desc: first_para[i], published: css_tricks_publish[i]})
  }
  console.log(all_blog_posts)
  // console.log(css_tricks_headings, first_para);

  //example
  // const $ = cheerio.load('<h2 class="title">Hello world</h2>')

  // $('h2.title').text('Hello there!')
  // $('h2').addClass('welcome')

  // $.html()
}).catch((err) => {
  console.log(err);
})

const ttt_headings = [];
const ttt_urls = [];
axios.get('https://techthatthrills.wordpress.com').then((res) => {
  const $ = cheerio.load(res.data);
  // console.log($('#main article header h2 a').text());
  $('#main article header h2 a').each((_idx, element) => {
    ttt_headings.push($(element).text());
    // console.log($(element).text());
  })

  $('#main article header h2 a').each((_idx, element) => {
    ttt_urls.push($(element).attr('href'));
    // console.log($(element).text());
  })
  // console.log(ttt_urls)
}).catch((err) => {
  console.log(err);
})

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID;

const getBlogPosts = async () => {
  const payload = {
    path: `databases/${databaseId}/query`,
    method: 'POST'
  }

  const data = await notion.request(payload);

  const blogPosts = data.results.map((post) => {
    if (post.properties['Published On'] !== undefined) {
      return {
        id: post.id,
        title: post.properties.Name.title[0].text.content,
        publish_date: post.properties['Published On'].date.start,
        publication: post.properties['Published in'].select.name,
        status: post.properties.Status.select.name,
        url: post.properties.URL.url
      }
    } else {
      return null;
    }
  })

  return blogPosts;
}

module.exports = async function published_posts() {

  const blogPosts = await getBlogPosts();

  const published_posts = blogPosts.filter((post) => {
    if (post !== null) {
      return post;
    }
  })

  return published_posts;
}