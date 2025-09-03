import Quagga from '@ericblade/quagga2';
import terminal from 'virtual:terminal';

// Quagga.init({
//     inputStream: {
//         type: "LiveStream",
//         target: document.querySelector("#camera-stream"),
//         constraints: {
//             facingMode: "environment"
//         },
//         singleChannel: false,
//     },
//     locate: true,
//     locator: {
//         halfSample: true,
//         patchSize: "medium"
//     }, 
//     debug: true,
//     decoder: {
//         readers : ["upc_reader", "code_128_reader"],
//         multiple: true
//     },
//     frequency: 10
// }, async function(err) {
//     if(err) {
//         terminal.log(err);
//         return;
//     }
//     terminal.log("Quaggga initialization finished");
    
//     Quagga.start();
    
//     Quagga.onProcessed(function(results) {
//         let ctx = Quagga.canvas.ctx.overlay;
//         let canvas = Quagga.canvas.dom.overlay;
        
//         ctx.clearRect(0, 0, parseInt(canvas.getAttribute("width")), parseInt(canvas.getAttribute("height")));
        
//         if(results) {
//             for(let result of results) {
//                 if(result.boxes) {
//                     result.boxes.filter((box) => box !== result.box).forEach((box) => {
//                         Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, ctx, {color: "green", lineWidth: 2});
//                     });
//                 }
                
//                 if(result.box) {
//                     Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, ctx, {color: "blue", lineWidth: 2});
//                 }
//             }
//         }
//     });
//     Quagga.onDetected(function(results) {
//         for(let result of results) {
//             let code = result.codeResult.code;
//             let format = result.codeResult.format;
            
//             let isValid = filterDetection(code, format);
//             if(isValid) {
//                 terminal.log(`Detected ${code}, Format: ${format}`);
//                 alert(`Detected ${code}, Format: ${format}`);
//             }
//         }
//     });
// });

let testingCodes = {};
const detetionThreshold = 5;
function filterDetection(code, format) {
    if(Object.keys(testingCodes).includes(code)) {
        let data = testingCodes[code];
        
        if(data.format === format) {
            data.detections++;
        
            if(data.detections >= detetionThreshold) {
                testingCodes = {}; //clear all other detections
                return true;
            }
            
            return false;
        }
    }
    
    testingCodes[code] = {
        "format": format,
        "detections": 1
    };
    return false;
}

const res = await fetch("https://neon-worker.thebridgesis.workers.dev", {
    method: "GET",
    headers: {
        "Access-Key": prompt("Password"),
        "DB-Operation": JSON.stringify({
            "operation": "getAllItems"
        })
    },
});
if(!res.ok) {
    alert(`Error ${res.status}: ${await res.text()}`);
}
else {
    alert(JSON.stringify(await res.json()));
}
