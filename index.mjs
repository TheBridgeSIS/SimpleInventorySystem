import * as Vision from "./vision.mjs";
import * as DB from "./database.mjs";

import {terminal} from "virtual:terminal";

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
        if(!Array.isArray(item) || item.length === 0) {
            terminal.log(`Invalid data: ${item}`);
            return;
        }
        
        item = item[0]; //take first result
        
        const name = document.querySelector("#scanResults>p:first-child");
        const pid = document.querySelector("#scanResults>p:nth-child(2)");
        const count = document.querySelector("#scanResults>p:last-child");
        
        name.innerHTML = `Name: ${item.name}`;
        pid.innerHTML = `PID: ${item.pid}`;
        count.innerHTML = `Count : ${item.count}`;
        document.getElementById("scanResults").style.display = "block";
    }
}
