import { createWriteStream, readdirSync, rm, rmSync, writeFile, writeFileSync } from "fs";
import { get } from "https";
import { ClientService } from "./client-service";
import { LoggingService } from "./logging-service";
import { UtilityService } from "./utility-service";

export class MuseService{

    // #region singleton
    private static _instance: MuseService
    public static get instance(): MuseService {
        if(!MuseService._instance){
            MuseService._instance = new MuseService();
        }
        return MuseService._instance;
    }
    private constructor () {}
    // #endregion


    public async scrape(url: string): Promise<string> {
        LoggingService.instance.info('Clearing cache');
        await this.clearCache();
        LoggingService.instance.info('Scraping sheets');
        const imageUrls: string[] = [];
        await ClientService.instance.moveTo(url);
        await this.handleCookies();
        const titleElement = await ClientService.instance.page.waitForSelector('aside h1');
        const title = await titleElement.evaluate(element => element.textContent);
        LoggingService.instance.info(`Found ${title}`);
        const imageHandlers = await ClientService.instance.page.$$('#jmuse-scroller-component>div');
        let imageCount = imageHandlers.length;
        if(imageCount > 2) imageCount -= 2;
        LoggingService.instance.info(`Found ${imageCount} sheets.`);
        for(let i = 1; i <= imageCount; i++)  {
            const url = await this.readUrl(i);
            if(!!url) {
                imageUrls.push(url);
            }
        }
        const promises: Promise<void>[] = [];
        imageUrls.forEach((image, index) => {
           promises.push(this.downloadImage(index, image));
        });
        await Promise.all(promises);
        return this.format(title);
    }

    private async handleCookies(): Promise<void> {
        try {
            await ClientService.instance.page.waitForSelector('div[role=dialog] button[mode=primary]', {timeout: 500});
            await UtilityService.instance.delay(50);
            await ClientService.instance.page.click('div[role=dialog] button[mode=primary]');
            return;
        } catch(err) {
            return;
        }
    }

    private async readUrl(position: number): Promise<string | undefined> {
        try {
            await ClientService.instance.page.hover(`#jmuse-scroller-component>div:nth-child(${position})`);
            await ClientService.instance.page.waitForSelector(`#jmuse-scroller-component>div:nth-child(${position})>img`, {timeout: 500});
            const element = await ClientService.instance.page.$(`#jmuse-scroller-component>div:nth-child(${position})>img`);
            const url = await element.getProperty('src');
            return <string>await url.jsonValue();

        } catch(err) {
            return undefined;
        }
    }

    private async downloadImage(sequence: number, url: string,): Promise<void> {
        return new Promise((resolve, reject) => {
            const fileExtension = this.getFileExtension(url);
            get(url, (response => {
                response.pipe(createWriteStream(`./resources/img/${sequence}${fileExtension}`))
                    .on('error', reject)
                    .once('close', () => resolve());
            }));
        });
    }

    private async clearCache(): Promise<void> {
        const files: string[] = readdirSync('./resources/img');
        for(const file of files) {
            if(this.isFileValid(file)){
                await new Promise(resolve => rm(`./resources/img/${file}`, resolve));
            } else {
                LoggingService.instance.err(`Found invalid image ${file} in cache`);
            }
        }
    }

    private format(title: string): string {
        return title.replaceAll(' ' ,'_').replaceAll('/', '_').replaceAll('\\', '');
    }

    private getFileExtension(url: string): string {
        if(url.indexOf('.svg') > 0) return '.svg';
        if(url.indexOf('.png') > 0) return '.png';
        throw new Error(`Could not retrieve file extension from url [${url}]`);
    }

    private isFileValid(file: string): boolean {
        const index = file.indexOf('.svg') !== -1 ? file.indexOf('.svg') : file.indexOf('.png');
        if(index === -1) {
            return false;
        }
        const number = file.substring(0, index);
        return !isNaN(Number(number));
    }
}