import {terminal} from "virtual:terminal";

import * as DB from "./database.mjs";

const scanResults = document.querySelector("#scanResults>form");
const scanResults_name = document.getElementById("scanResults-name");
const scanResults_pid = document.getElementById("scanResults-pid");
const scanResults_countOp_add = document.getElementById("scanResults-countOp-add");
const scanResults_countOp_remove = document.getElementById("scanResults-countOp-remove");
const scanResults_count = document.getElementById("scanResults-count");
const scanResults_submit = document.getElementById("scanResults-submit");

const itemStats_name = document.getElementById("itemStats-name");
const itemStats_count = document.getElementById("itemStats-count");

let displayedItem = undefined;

export function init() {
    scanResults.addEventListener("submit", async (e) => {
        e.preventDefault(); //stop http request and site reload
        
        if(displayedItem == undefined) return;
        
        let data = new FormData(scanResults);
        let deltaCount = parseInt(data.get("deltaCount")) || 0;
        
        if(deltaCount === 0) return;
        
        deltaCount *= data.get("countOp") === "remove" ? -1 : 1;
        if(!await DB.sendCountChange(displayedItem.pid, deltaCount)) {
            terminal.log("Failed to send count change");
        }
        
        displayScannedItem(await DB.loadItem(displayedItem.pid));
    });
}
export function displayScannedItem(item) {
    displayedItem = item;
    
    if(item != undefined) {
        scanResults_name.innerHTML = item.getDisplayName();
        scanResults_pid.innerHTML = item.getPID();
        scanResults_count.value = "1";
        
        scanResults_name.disabled = false;
        scanResults_pid.disabled = false;
        scanResults_countOp_add.disabled = false;
        scanResults_countOp_remove.disabled = false;
        scanResults_count.disabled = false;
        scanResults_submit.disabled = false;
        
        itemStats_name.innerHTML = item.getName();
        itemStats_count.innerHTML = item.getCount();
    }
    else {
        scanResults_name.innerHTML = "";
        scanResults_pid.innerHTML = "";
        scanResults_count.value = "";
        
        scanResults_name.disabled = true;
        scanResults_pid.disabled = true;
        scanResults_countOp_add.disabled = true;
        scanResults_countOp_remove.disabled = true;
        scanResults_count.disabled = true;
        scanResults_submit.disabled = true;
        
        itemStats_name.innerHTML = "";
        itemStats_count.innerHTML = "";
    }
}
