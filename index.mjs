import Quagga from '@ericblade/quagga2';

// async function findBestCamera(facingMode) {
//     let bestID = undefined;
//     let bestRes = 0;
//     try {
//         let deviceList = await navigator.mediaDevices.enumerateDevices();
//         for(let device of deviceList) {
//             // alert(device.deviceId);
//             let stream = await navigator.mediaDevices.getUserMedia({video: true});
//             // alert(JSON.stringify(stream));
            
//             alert(`${JSON.stringify(device)}\n\n${JSON.stringify(stream)}`);
            
//             for(let track of stream.getVideoTracks()) {
//                 let capabilities = track.getCapabilities();
                
//                 if(facingMode && capabilities.facingMode !== facingMode)
//                     continue;
                
//                 // alert(JSON.stringify(track));
//                 // alert(JSON.stringify(capabilities.width));
                
//                 let width = capabilities.width?.max ?? capabilities.width?.min ?? 0;
//                 let height = capabilities.height?.max ?? capabilities.height?.min ?? 0;
//                 let res = width * height;
                
//                 // alert(res);
                
//                 if(res > bestRes) {
//                     // alert(track.getSettings().deviceId);
//                     bestRes = res;
//                     bestID = track.getSettings().deviceId;
//                 }
//             }
//         }
//     }
//     catch(err) {
//         alert(err);
//     }
    
//     return bestID;
// }

const debugOut = document.querySelector("#debugOut");

// let bestCamID = await findBestCamera();
Quagga.init({
    inputStream: {
        type: "LiveStream",
        target: document.querySelector("#camera-stream"),
        constraints: {
            // deviceId: bestCamID
        },
        singleChannel: false,
    },
    locate: true,
    locator: {
        halfSample: true,
        patchSize: "medium"
    }, 
    debug: true,
    decoder: {
        readers : ["upc_reader", "code_128_reader"],
        multiple: true
    },
    frequency: 5
}, async function(err) {
    if(err) {
        console.log(err);
        alert(err);
        return;
    }
    console.log("Quaggga initialization finished");
    
    Quagga.start();
    // (await Quagga.CameraAccess.enumerateVideoDevices()).forEach((device) => {
    //     alert(`ID: ${device.deviceId}\nGroup: ${device.groupId}\nKind: ${device.kind}\nLabel: ${device.label}`);
    // });
    // debugOut.innerHTML = `${Quagga.CameraAccess.getActiveStreamLabel()} - ${bestCamID}`;
    
    Quagga.onProcessed(function(results) {
        let ctx = Quagga.canvas.ctx.overlay;
        let canvas = Quagga.canvas.dom.overlay;
        
        ctx.clearRect(0, 0, parseInt(canvas.getAttribute("width")), parseInt(canvas.getAttribute("height")));
        
        if(results) {
            for(let result of results) {
                if(result.boxes) {
                    result.boxes.filter((box) => box !== result.box).forEach((box) => {
                        Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, ctx, {color: "green", lineWidth: 2});
                    });
                }
                
                if(result.box) {
                    Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, ctx, {color: "blue", lineWidth: 2});
                }
                
                if(result.codeResult && result.code) {
                    Quagga.ImageDebug.drawPath(result.line, {x: "x", y: "y"}, ctx, {color: "red", lineWidth: 3});
                }
            }
        }
    });
    Quagga.onDetected(function(results) {
        for(let result of results) {
            let code = result.codeResult.code;
            let format = result.codeResult.format;
            
            alert(`${code}\n${format}`);
        }
    });
});
