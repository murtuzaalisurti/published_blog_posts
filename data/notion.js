const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const cheerio = require('cheerio');

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID;

async function get_all_blog_posts_by_scraping() {
  const all_blog_posts = [];
  axios.get('https://dev.to/api/articles?username=murtuzaalisurti').then((res) => {
    res.data.forEach((article) => {
      all_blog_posts.push({ url: article.url, desc: article.description, published: article.readable_publish_date })
    })
  });

  const css_tricks_headings = [];
  const css_tricks_url = [];
  const first_para = [];
  const css_tricks_publish = [];
  axios.get('https://css-tricks.com/author/murtuzaalisurti/').then((res) => {
    const $ = cheerio.load(res.data);

    $('#maincontent article .article-article h2 a').each((_idx, element) => {
      css_tricks_headings.push($(element).text());
      css_tricks_url.push($(element).attr('href'));
    })

    $('#maincontent article .article-article .card-content p').each((_idx, element) => {
      first_para.push($(element).text());
    })

    $('#maincontent article .article-article .author-row time').each((_idx, element) => {
      css_tricks_publish.push($(element).text().slice(1, ($(element).text().length - 1)));
    })

    for (let i = 0; i < css_tricks_headings.length; i++) {
      all_blog_posts.push({ url: css_tricks_url[i], desc: first_para[i], published: css_tricks_publish[i] })
    }
  }).catch((err) => {
    console.log(err);
  })

  const ttt_headings = [];
  const ttt_urls = [];
  const ttt_desc = [];
  const ttt_publish_dates = [];
  axios.get('https://techthatthrills.wordpress.com').then((res) => {
    const $ = cheerio.load(res.data);

    $('#main article header h2 a').each((_idx, element) => {
      ttt_headings.push($(element).text());
    })

    $('#main article .entry-header .entry-date .posted-on a .published').each((_idx, element) => {
      ttt_publish_dates.push($(element).text());
    })

    $('#main article header h2 a').each((_idx, element) => {
      axios.get(`${$(element).attr('href')}`).then((res) => {
        const $ = cheerio.load(res.data);
        $('.entry-content p').each((_idx, element) => {
          if (_idx == 0) {
            // console.log($(element).text());
            ttt_desc.push($(element).text());
          }
        })
      }).then(() => {
        // console.log(ttt_desc)
      }).catch((err) => {
        console.log(err);
      })
      ttt_urls.push($(element).attr('href'));
    })
    // console.log(ttt_urls);

    for (let i = 0; i < ttt_headings.length; i++) {
      all_blog_posts.push({ url: ttt_urls[i], desc: ttt_desc[i], published: ttt_publish_dates[i] })
      // console.log(all_blog_posts);
    }
    var blogs = all_blog_posts;
  }).catch((err) => {
    console.log(err);
  })

  // setTimeout(() => {
  //   return all_blog_posts;
  // }, 5000)
  return blogs;
  // async function returning(){
  //   return await all_blog_posts
  // }
  // const all_scraped_posts = await all_blog_posts;
}

async function get() {
  const posts = await get_all_blog_posts_by_scraping();
  // posts.forEach((post) => {
  //   console.log(post);
  // })
  console.log(posts);
}
setTimeout(() => {
  get();
}, 8000)


// async function print(){
//   const print_posts = await getBlogPosts();
//   console.log(print_posts)
// }
// print();

const getBlogPosts = async () => {
  const payload = {
    path: `databases/${databaseId}/query`,
    method: 'POST'
  }

  const data = await notion.request(payload);

  const scraped_posts = await get_all_blog_posts_by_scraping();

  const blogPosts = data.results.map((post) => {

    if (post.properties['Published On'] !== undefined) {
      for (let j = 0; j < scraped_posts.length; j++) {
        if (scraped_posts[j].url === post.properties.URL.url) {
          // console.log(scraped_posts[j].desc);
          return {
            id: post.id,
            title: post.properties.Name.title[0].text.content,
            publish_date: post.properties['Published On'].date.start,
            publication: post.properties['Published in'].select.name,
            status: post.properties.Status.select.name,
            url: post.properties.URL.url,
            desc: scraped_posts[j].desc
          }
        }
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