import { readFileSync } from "fs";
import { Constants } from "../models/classes/constants";
import { ISettings } from "../models/interfaces/settings";
import { LoggingService } from "./logging-service";

export class SettingsService{

    // #region singleton
    private static _instance: SettingsService
    public static get instance(): SettingsService {
        if(!SettingsService._instance){
            SettingsService._instance = new SettingsService();
        }
        return SettingsService._instance;
    }
    private constructor () {
    }
    // #endregion


    public settings: ISettings;
    
    public load(): void{
        try{
            LoggingService.instance.info('Loading settings')
            const file = readFileSync(Constants.settingsFile);
            this.settings = JSON.parse(file.toString());
            LoggingService.instance.info('Read settings');
        } catch(err){
            throw new Error(`${Constants.settingsFile} is not defined. Make sure the file exists and is accessible!`);
        } 
    }
    
}