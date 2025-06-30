import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { configDotenv } from 'dotenv';

configDotenv(); 

export class CourseScrapper {
    private browser: Browser | null = null;
    private page: Page | null = null;

    /**
     * Initialize Puppeteer browser and page
     */
    private async init(): Promise<void> {
        if (!this.browser) {
            console.log('🚀 Initializing Puppeteer browser...');
            this.browser = await puppeteer.launch({
                headless: false, // Set to true if you don't want to see the browser
                defaultViewport: null
                
            });
            this.page = await this.browser.newPage();
            console.log('✅ Browser initialized successfully');
        }
    }

    /**
     * Scrape all content from Langara.ca main page
     */
    async scrapeMainPage(): Promise<{
        url: string;
        title: string;
        content: string;
        textContent: string;
        timestamp: string;
    }> {
        try {

            if(!process.env.LANGARAID || !process.env.LANGARAPASSWORD) {
                throw new Error('Environment variables LANGARAID and LANGARAPASSWORD must be set');
            }

            await this.init();
            
            if (!this.page) {
                throw new Error('Page not initialized');
            }

            console.log('🌐 Navigating to langara.ca...');
            await this.page.goto('https://swing.langara.bc.ca/prod/twbkwbis.P_WWWLogin', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            await this.page.locator("#UserID").click();

            await this.page.keyboard.type(process.env.LANGARAID); 

            await this.page.locator('input[type="password"]').click();

            await this.page.keyboard.type(process.env.LANGARAPASSWORD);

            await this.page.click('input[type="submit"]');

            await this.page.waitForNavigation();

            const currentUrl = this.page.url();
            console.log(`🌐 Successfully navigated to: ${currentUrl}`);

            // Get the page title
            const title = await this.page.title();
            console.log(`📝 Page title: ${title}`);

            // Get all HTML content
            const htmlContent = await this.page.content();
            console.log('✅ Retrieved HTML content');

            // Use Cheerio to parse and get text content
            const $ = cheerio.load(htmlContent);
            const textContent = $('body').text().trim();
            
            console.log(`📊 Content length: ${htmlContent.length} characters`);
            console.log(`📊 Text content length: ${textContent.length} characters`);

            return {
                url: 'https://langara.ca',
                title: title,
                content: htmlContent,
                textContent: textContent,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error scraping Langara main page:', error);
            throw error;
        }
    }

    /**
     * Close the browser
     */
    async close(): Promise<void> {
        if (this.browser) {
            console.log('🔒 Closing browser...');
            await this.browser.close();
            this.browser = null;
            this.page = null;
            console.log('✅ Browser closed');
        }
    }

    /**
     * Static method for quick scraping without managing instance
     */
    static async quickScrape(): Promise<{
        url: string;
        title: string;
        content: string;
        textContent: string;
        timestamp: string;
    }> {
        const scraper = new CourseScrapper();
        try {
            const result = await scraper.scrapeMainPage();
            return result;
        } finally {
            await scraper.close();
        }
    }
}