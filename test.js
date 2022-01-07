const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID;

async function update() {
    const res_2 = await notion.databases.query({ database_id: `${databaseId}` });

    res_2.results.forEach(async (page, index) => {
        console.log(page.id, page.properties);
        if (index === 0) {
            try {
                const res_3 = await notion.pages.update({
                    page_id: page.id,
                    properties: {
                        "vote": {
                            number: 3
                        },
                        "desc": {
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "hello there"
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
update();