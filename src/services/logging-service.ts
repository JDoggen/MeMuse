import {redBright, green, yellow, magentaBright } from 'cli-color';
import fs from 'fs';

export class LoggingService{

    // #region singleton
    private static _instance: LoggingService
    public static get instance(): LoggingService {
        if(!LoggingService._instance){
            LoggingService._instance = new LoggingService();
        }
        return LoggingService._instance;
    }
    private constructor () {
    }
    // #endregion

    public cls(): void{
        process.stdout.write('\u033c');
    }
    public info(message: object | string): void{
        this.log(green('' + message));
    }

    public warn(message: object | string): void{
        this.log(yellow('' + message));
    }
    
    public err(message: object | string): void{
        this.log(redBright('' + message));
    }
    
    public highlight(message: object | string): void{
        this.log(magentaBright('' + message));
    }

    // public async logToFile(message: object | string): Promise<void> {
    //     try{
    //         const exists = fs.existsSync(Constants.logFile);
    //         if(!exists){
    //             fs.writeFileSync(Constants.logFile, '');
    //         }
    //         message = message.toString();
    //         fs.appendFileSync(Constants.logFile, `[${this.currentTime()}] ${message}\n`);
    //     } catch(err){
    //         // Fail gracefully
    //     }
    // }
    
    private log(message: string){
        console.log(`[${this.currentTime()}] ${message}`);
    }

    private currentTime(): string{
        const date = new Date();
        const day = ('00' + date.getDate()).slice(-2);
        const month = ('00' + (date.getMonth() + 1)).slice(-2);
        const year = (date.getFullYear()).toString();
        const hours = ('00' + date.getHours()).slice(-2);
        const minutes = ('00' + date.getMinutes()).slice(-2);
        const seconds = ('00' + date.getSeconds()).slice(-2);
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    }


}