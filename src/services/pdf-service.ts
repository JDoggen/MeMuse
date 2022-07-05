import { readdirSync, createWriteStream, readFileSync } from "fs";
import { trace } from "potrace";
import SVGtoPDF from "svg-to-pdfkit";
import { LoggingService } from "./logging-service";
import { UtilityService } from "./utility-service";

const PDFDocument = require('pdfkit');

export class PDFService {
    // #region singleton
    private static _instance: PDFService
    public static get instance(): PDFService {
        if(!PDFService._instance){
            PDFService._instance = new PDFService();
        }
        return PDFService._instance;
    }

    private constructor () {
    }
    // #endregion

    public async writeToPDF(title: string): Promise<void> {
        const files: string[] = this.readFileNames();
        const document: PDFKit.PDFDocument = new PDFDocument({bufferPages: true});
        const stream = createWriteStream(`./resources/pdf/${title}.pdf`);
        let page = 0;
        if(files.some(file => this.isPng(file))) {
            LoggingService.instance.warn('Found 1 or more .png files, quality might not be optimal');
        }
        for(const file of files) {
            if(page > 0) {
                document.addPage();
                document.switchToPage(page);
            }
            const path = `./resources/img/${file}`;
            let data: Buffer = undefined;
            if(this.isPng(path)) {
                data = await this.pngToSvg(path);
            } else {
                data = readFileSync(path);
            }
            SVGtoPDF(document, data.toString(), 0, 0, {preserveAspectRatio: 'none'});
            page += 1;
        }
        document.pipe(stream);
        document.end();
        LoggingService.instance.info('Closing stream')
        await UtilityService.instance.delay(250);
    } 

    private readFileNames(): string[] {
        const files = readdirSync('./resources/img');
        return files.sort((a,b) => Number(a.replace('.svg', '')) - Number(b.replace('.svg', '')));
    }

    private isPng(file: string): boolean {
        return file.endsWith('.png');
    }

    private pngToSvg(path: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            trace(path, (err, svg) => {
                if(!!err) {
                    reject(err);
                }
                resolve(Buffer.from(svg));
            });
        });
    }
}