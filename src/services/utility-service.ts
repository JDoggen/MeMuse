export class UtilityService {

    // #region singleton
    private static _instance: UtilityService
    public static get instance(): UtilityService {
        if(!UtilityService._instance){
            UtilityService._instance = new UtilityService();
        }
        return UtilityService._instance;
    }

    private constructor () {
    }
    // #endregion

    public delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), ms);
        })
    }

}