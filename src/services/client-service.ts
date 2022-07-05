import puppeteer, { Browser, Page } from 'puppeteer';
import { LoggingService } from "./logging-service";
import { SettingsService } from "./settings-service";

export class ClientService{

     // #region singleton
     private static _instance: ClientService
     public static get instance(): ClientService {
         if(!ClientService._instance){
            ClientService._instance = new ClientService();
         }
         return ClientService._instance;
     }
     private constructor () {
     }
     // #endregion
 
     public browser: Browser;
     public page: Page;

      public async createBrowser(): Promise<void>{
         LoggingService.instance.info('Launching browser');
         const settings = SettingsService.instance.settings.chromium;
         this.browser = await puppeteer.launch(SettingsService.instance.settings.chromium);
         this.page = (await this.browser.pages())[0];
     }


      public async moveTo(url: string, page? : puppeteer.Page): Promise<void> {
         if(!page){
            page = this.page;
         }
         await page.goto(url);
      }
}