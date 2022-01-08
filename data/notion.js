const dotenv = require('dotenv');
dotenv.config();

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID;

const getBlogPosts = async () => {

  const data = await notion.databases.query({ 
    database_id: databaseId,
    sorts: [{
      property: 'Published On',
      direction: 'descending'
    }]
  });

  const blogPosts = data.results.map((post) => {

    if (post.properties['Published On'] !== undefined) {
      const parsed_date = Date.parse(`${post.properties['Published On'].date.start}`);
      const publish_date = new Date(parsed_date).toLocaleString('default', { day: '2-digit' });
      const publish_month = new Date(parsed_date).toLocaleString('default', {month: 'short'});
      const formatted_date = `${publish_month} ${publish_date}`;

      const description = `${post.properties.Excerpt.rich_text[0].plain_text}`.slice(" ", 160)+"...";
      let publication = post.properties['Published in'].select.name;
      if(post.properties['Published in'].select.name == "DEV Community (dev.to)"){
        publication = 'dev.to';
      }

      return {
        id: post.id,
        title: post.properties.Name.title[0].text.content,
        publish_date: formatted_date,
        publication: publication,
        status: post.properties.Status.select.name,
        url: post.properties.URL.url,
        desc: description
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