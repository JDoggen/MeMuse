export interface ISettings {
    chromium: {
        headless: boolean,
        slowMo: number,
        executablePath?: string,
        defaultViewport: {
            width: number,
            height: number
        }
    }
}