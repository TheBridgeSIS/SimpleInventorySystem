import {neon} from "@neondatabase/serverless"

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Method": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": '*'
};

export default {
    /**
     * @param {Request} request
     * @param {object} env
     * @param ctx
     */
    async fetch(request, env, ctx) {
        if(!env.ACCESS_KEY) {
            return new Response("Internal Server Error: Server misconfigured, ACCESS_KEY missing from env. Please try again later.", {status: 503, headers: {
                "Content-Type": "text/plain",
                ...CORS
            }}); //503 = Service Unavailable
        }
        if(!env.DB_URL) {
            return new Response("Internal Server Error: Server misconfigured, DB_KEY missing from env. Please try again later.", {status: 503, headers: {
                "Content-Type": "text/plain",
                ...CORS
            }});
        }
        
        
        //respond to CORS preflight checks
        if(request.method === "OPTIONS") {
            return new Response(null, {status: 200, headers: CORS});
        }
        
        let keyIn = request.headers.get("Access-Key") || "";
        keyIn = keyIn.replace(/[\u{0100}-\u{FFFF}]/gu, "?").replace(/\s/g, ""); //input filtering
        if(keyIn !== env.ACCESS_KEY) {
            return new Response("Client Error: Invalid access key.", {status: 401, headers: {
                "Content-Type": "text/plain",
                ...CORS
            }}); //401 = Unauthorized
        }
        
        const opIn = request.headers.get("DB-Operation");
        if(!opIn) {
            return new Response("Client Error: Missing header DB-Operation.", {status: 400, headers: {
                "Content-Type": "text/plain",
                ...CORS
            }}); //400 = Bad Request
        }
        
        let operation;
        try {
            operation = JSON.parse(opIn);
        }
        catch(err) {
            return new Response("Client Error: DB-Operation was not valid JSON", {status: 400, headers: {
                "Content-Type": "text/plain",
                ...CORS
            }});
        }
        if(!operation.operation) {
            return new Response("Client Error: DB-Operation missing value 'operation'", {status: 400, headers: {
                "Content-Type": "text/plain",
                ...CORS
            }});
        }
        
        /*
        Allowed formats:
        {
            "operation": "getItemByID",
            "pid": "<some number here>"
        } => Row with the matching pid
        {
            "operation": "getAllItems"
        } => List of all rows in inventory
        */
        
        const sql = neon(env.DB_URL);
        switch(operation.operation) {
            case "getItemByID": {
                if(!operation.pid) {
                    return new Response("Client Error: DB-Operation 'getItemByID' missing 'pid' argument", {status: 400, headers: {
                        "Content-Type": "text/plain",
                        ...CORS
                    }});
                }
                
                const result = await sql`SELECT * FROM inventory WHERE pid=${operation.pid}`;
                return new Response(JSON.stringify(result), {status: 200, headers: {
                    "Content-Type": "application/json",
                    ...CORS
                }});
            }
            case "getAllItems": {
                const result = await sql`SELECT * FROM inventory`;
                return new Response(JSON.stringify(result), {status: 200, headers: {
                    "Content-Type": "application/json",
                    ...CORS
                }});
            }
            default: {
                return new Response(`Client Error: Invalid DB-Operation '${opIn}'`, {status: 400, headers: {
                    "Content-Type": "text/plain",
                    ...CORS
                }}); //400 = Bad Request
            }
        }
    }
};
