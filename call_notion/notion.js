const dotenv = require('dotenv');
dotenv.config();

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
    if(post.properties['Published On'] !== undefined) {
      return{
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

module.exports = async function published_posts(){

  const blogPosts = await getBlogPosts();

  const published_posts = blogPosts.filter((post) => {
    if(post !== null){
      return post;
    }
  })

  return published_posts;
}