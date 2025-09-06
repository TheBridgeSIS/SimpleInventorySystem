import {terminal} from "virtual:terminal";

import * as DB from "./database.mjs";

const scanResults = document.querySelector("#scanResults>form");
const scanResults_name = document.getElementById("scanResults-name");
const scanResults_pid = document.getElementById("scanResults-pid");
const scanResults_countOp_add = document.getElementById("scanResults-countOp-add");
const scanResults_countOp_remove = document.getElementById("scanResults-countOp-remove");
const scanResults_count = document.getElementById("scanResults-count");
const scanResults_submit = document.getElementById("scanResults-submit");

export function init() {
    scanResults.addEventListener("submit", (e) => {
        e.preventDefault(); //stop http request and site reload
        
        let data = new FormData(scanResults);
        let deltaCount = parseInt(data.get("deltaCount")) || 0;
        
        terminal.log(...data);
        
        if(deltaCount === 0) return;
    });
}
export function displayScannedItem(item) {
    scanResults_name.innerHTML = item.name;
    scanResults_pid.innerHTML = item.pid;
    scanResults_count.value = "1";
    
    scanResults_name.disabled = false;
    scanResults_pid.disabled = false;
    scanResults_countOp_add.disabled = false;
    scanResults_countOp_remove.disabled = false;
    scanResults_count.disabled = false;
    scanResults_submit.disabled = false;
}
