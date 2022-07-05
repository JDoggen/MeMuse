import { launch } from "puppeteer";
import { ClientService } from "./services/client-service";
import { LoggingService } from "./services/logging-service";
import { MuseService } from "./services/muse-service";
import { PDFService } from "./services/pdf-service";
import { SettingsService } from "./services/settings-service";
const prompt = require('prompt');

class App
{

    public async run(): Promise<void>
    {
        try {
            LoggingService.instance.cls();
            SettingsService.instance.load();
            const url = await this.getURL();
            if(this.isStandalone()) {
                const chroimumPath = this.getChromiumPath();
                SettingsService.instance.settings.chromium.executablePath = chroimumPath;
            }
            await ClientService.instance.createBrowser();
            const title = await MuseService.instance.scrape(url);
            await PDFService.instance.writeToPDF(title);
            process.exit(0);
        } catch (err) {
            LoggingService.instance.err(<object>err);
        }
    }

    private getURL(): Promise<string> {
        return new Promise((resolve, reject) => {
            
        if(process.argv.length >= 3) {
            resolve(process.argv[2]);
        } else {
            return prompt.get('URL', (err: any, result: {URL: string}) => {
                if(!!err) {
                    reject(err);
                }
                resolve(result.URL);
            });
        }
    })
    }

    private getChromiumPath(): string {
        const appPath = process.argv[0];
        const path = appPath.substring(0,appPath.lastIndexOf('\\'));
        return `${path}\\chromium\\win64-756035\\chrome-win\\chrome.exe`
    }

    private isStandalone(): boolean {
        return process.argv0 !== 'node';
    }
    
}

const app = new App();
app.run();