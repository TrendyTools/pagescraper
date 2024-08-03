import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import cheerio from 'cheerio';

interface ScrapeRequestBody {
  url: string;
}

export default async function (request: ZuploRequest, context: ZuploContext) {
  const body: ScrapeRequestBody = await request.json();
  const { url } = body;

  if (!url) {
    return { error: 'URL is required' };
  }

  try {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    const html = $.html();

    return { html };
  } catch (error) {
    context.log.error(`Error fetching or parsing URL: ${error.message}`);
    return { error: 'Failed to fetch or parse the URL.' };
  }
}
