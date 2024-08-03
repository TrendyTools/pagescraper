import { ZuploContext, ZuploRequest } from "@zuplo/runtime";
import puppeteer from "./modules/third-party/puppeteer";
import { GoogleGenerativeAI } from "./modules/third-party/@google/generative-ai";
import cloudinary from "./modules/third-party/cloudinary";
import { Readable } from 'stream';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    // Scrape HTML
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();

    // Screenshot
    const screenshotBuffer = await page.screenshot();
    const uploadResult = await cloudinary.v2.uploader.upload_stream(
      { resource_type: 'image', public_id: `screenshots/${Date.now()}` },
      (error, result) => {
        if (error) {
          context.log.error(`Error uploading screenshot: ${error.message}`);
          return { error: 'Failed to upload screenshot' };
        }
        return { screenshotUrl: result.secure_url };
      }
    )(Readable.from(screenshotBuffer));

    // Summarize with Gemini
    const prompt = `Extract the name of this tool/website, nothing else: ${html}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = await response.text();

    return { html, screenshotUrl: uploadResult.secure_url, summary };

  } catch (error) {
    context.log.error(`Error: ${error.message}`);
    return { error: 'Failed to scrape or process the URL.' };
  }
}
