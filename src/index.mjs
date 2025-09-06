import * as Vision from "./vision.mjs";
import * as DB from "./database.mjs";
import * as Interface from "./interface.mjs";

import {terminal} from "virtual:terminal";

Interface.init();
DB.checkForAccessKey(); //block further activity until a key is stored

Vision.initQuagga(async (results) => {
    //multiple detections
    if(Array.isArray(results)) {
        for(let result of results) await handleDetection(result);
        return;
    }
    
    //single detection
    await handleDetection(results);
});

async function handleDetection(result) {
    if(!result.codeResult) return;
    
    let code = result.codeResult.code;
    let format = result.codeResult.format;
    
    if(!code || !format) return;
    
    let isValid = Vision.filterDetection(code, format);
    if(isValid) {
        terminal.log(`Detected ${code}, Format: ${format}`);
        
        let item = await DB.loadItem(code);
        
        Interface.displayScannedItem(item);
    }
}
