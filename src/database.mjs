import {terminal} from "virtual:terminal";

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
        let json = await res.json();
        if(Array.isArray(json)) {
            if(json.length === 0) {
                terminal.log(`Parse error, invalid data: ${json}`);
                return undefined;
            }
            
            json = json[0]; //should only ever be one result because PID is unique
        }
        return new Item(json.pid, json.name, json.short_name, json.count);
    }
    catch(err) {
        terminal.log(`JSON parse error: ${err}`);
        terminal.log(await res.text());
        return undefined;
    }
}

export async function sendCountChange(pid, delta) {
    const key = getAccessKey();
    if(key == null) {
        terminal.log("Missing access key");
        return false;
    }
    
    const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Access-Key": key,
            "DB-Operation": JSON.stringify({
                "operation": "deltaItemByID",
                "pid": pid,
                "delta": delta
            })
        }
    }).catch((err) => {
        terminal.log(`Fetch error: ${err}`);
        return false;
    });
    
    if(!res) return res;
    
    if(!res.ok) {
        terminal.log(`DB Error [${res.status}]: ${await res.text()}`);
        return false;
    }
    
    return true;
}

export class Item {
    constructor(pid, name, short_name, count) {
        this.pid = pid;
        this.name = name;
        this.short_name = short_name;
        this.count = count;
    }
    
    getPID() {
        return this.pid;
    }
    getName() {
        return this.name;
    }
    getDisplayName() {
        return this.short_name || getName();
    }
    getCount() {
        return this.count;
    }
}
