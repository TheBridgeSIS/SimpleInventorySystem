/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {neon} from "@neondatabase/serverless"

export default {
    /**
     * @param {Request} request
     * @param {object} env
     * @param ctx
     */
    async fetch(request, env, ctx) {
        if(!env.ACCESS_KEY) {
            return new Response("Internal Server Error: Server misconfigured, ACCESS_KEY missing from env. Please try again later.", {status: 503}); //503 = Service Unavailable
        }
        
        const keyIn = request.headers.get("Access-Key");
        if(keyIn !== env.ACCESS_KEY) {
            return new Response("Client Error: Invalid access key.", {status: 401}); //401 = Unauthorized
        }
        
        const opIn = request.headers.get("DB-Operation");
        if(!opIn) {
            return new Response("Client Error: Missing header DB-Operation.", {status: 400}); //400 = Bad Request
        }
        
        let operation;
        try {
            operation = JSON.parse(opIn);
        }
        catch(err) {
            return new Response("Client Error: DB-Operation was not valid JSON", {status: 400}); //400 = Bad Request
        }
        if(!operation.operation) {
            return new Response("Client Error: DB-Operation missing value 'operation'", {status: 400}); //400 = Bad Request
        }
        
        switch(operation.operation) {
            case "read": {
                break;
            }
            default: {
                return new Response(`Client Error: Invalid DB-Operation '${opIn}'`, {status: 400}); //400 = Bad Request
            }
        }
        
        if(!env.DB_URL) {
            return new Response("Internal Server Error: Server misconfigured, DB_KEY missing from env. Please try again later.", {status: 503}); //503 = Service Unavailable
        }
        const sql = neon(env.DB_URL);
        
        const post = await sql`SELECT * FROM inventory`;
        return new Response(JSON.stringify(post));
    }
};
