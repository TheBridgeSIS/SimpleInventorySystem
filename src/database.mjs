import {terminal} from "virtual:terminal"

const WORKER_URL = "https://neon-worker.thebridgesis.workers.dev";
// const WORKER_URL = "https://192.168.1.27:8787";

function getAccessKey() {
    return localStorage.getItem("accessKey"); //TODO be more secure, use session tokens or something
}

export function checkForAccessKey() {
    if(getAccessKey()) {
        terminal.log("Access key already exists");
        return;
    }
    
    while(true) {
        let raw = prompt("Access Key:");
        if(raw == null) { //using == instead of === means that undefined will eval to true aswell
            terminal.log("Invalid access key inputed, trying again");
            continue;
        }
        
        let filtered = raw.replace(/[\u{0100}-\u{FFFF}]/gu, "?").replace(/\s/g, ""); //input filtering, only allow ANSI characters
        if(filtered.length === 0) {
            terminal.log("Invalid access key inputed, trying again");
            continue;
        }
        
        localStorage.setItem("accessKey", filtered);
        terminal.log("Access key set");
        return;
    }
}

export async function loadItem(pid) {
    const key = getAccessKey();
    if(key == null) {
        terminal.log("Missing access key");
        return undefined;
    }
    
    const res = await fetch(WORKER_URL, {
        method: "GET",
        headers: {
            "Access-Key": key,
            "DB-Operation": JSON.stringify({
                "operation": "getItemByID",
                "pid": pid
            })
        }
    }).catch((err) => {
        terminal.log(`Fetch error: ${err}`);
        return undefined;
    });
    
    //hacky way to return from a callback
    if(!res) return res;
    
    if(!res.ok) {
        terminal.log(`DB error [${res.status}]: ${await res.text()}`);
        return undefined;
    }
    
    try {
        return await res.json();
    }
    catch(err) {
        terminal.log(`JSON parse error: ${err}`);
        terminal.log(await res.text());
        return undefined;
    }
}
