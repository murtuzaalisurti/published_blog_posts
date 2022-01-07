const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID;

function get_all_blog_posts_by_scraping() {
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
      ttt_urls.push($(element).attr('href'));
    })

    $('#main article .entry-header .entry-date .posted-on a .published').each((_idx, element) => {
      ttt_publish_dates.push($(element).text());
    })

    $('#main article header h2 a').each((_idx, element) => {
      axios.get(`${$(element).attr('href')}`).then((res) => {
        const $ = cheerio.load(res.data);
        ttt_desc.push($('.entry-content > p:first').text());
      }).catch((err) => {
        console.log(err);
      })
    })

  }).then(() => {

    setTimeout(async () => {

      for (let i = 0; i < ttt_headings.length; i++) {
        all_blog_posts.push({ url: ttt_urls[i], desc: ttt_desc[i], published: ttt_publish_dates[i] })
      }
      const res_2 = await notion.databases.query({ database_id: `${databaseId}` });

      res_2.results.forEach(async (page, index) => {
        console.log(page.properties.URL)
        if (page.properties.URL !== undefined) {
          for (let k = 0; k < all_blog_posts.length; k++) {
            if (page.properties.URL.url == all_blog_posts[k].url) {
              try {
                const res_3 = await notion.pages.update({
                  page_id: page.id,
                  properties: {
                    "Excerpt": {
                      "rich_text": [
                        {
                          "type": "text",
                          "text": {
                            "content": `${all_blog_posts[k].desc}`
                          }
                        }
                      ]
                    }
                  }
                })
              } catch (err) {
                console.log(err.message)
              }
            }
          }
        }
      })
    }, 10000)

  }).catch((err) => {
    console.log(err);
  })

  return all_blog_posts;
}

async function update() {
  const res_2 = await notion.databases.query({ database_id: `${databaseId}` });

  res_2.results.forEach(async (page, index) => {
    console.log(page.properties.Name.title[0].plain_text)
    if (index === 0) {
      try {
        const res_3 = await notion.pages.update({
          page_id: 'ed81579c-887a-4955-9934-fb2b3275f31b',
          properties: {
            "Excerpt": {
              "rich_text": [
                {
                  "type": "text",
                  "text": {
                    "content": "hello"
                  }
                }
              ]
            }
          }
        })
      } catch (err) {
        console.log(err.message)
      }
    }
  })
}
// update();



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
        url: post.properties.URL.url,
        desc: post.properties.Excerpt.rich_text[0].plain_text
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