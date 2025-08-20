import Quagga from '@ericblade/quagga2';

Quagga.init({
    inputStream: {
        type: "LiveStream",
        target: document.querySelector("#camera-stream")
    },
    locate: true,
    debug: true,
    decoder: {
        readers : ["code_128_reader"]
    }
}, function(err) {
    if(err) {
        console.log(err);
        alert(err);
        return;
    }
    
    console.log("Quaggga initialization finished");
    Quagga.start();
    
    //example code
    //https://github.com/serratus/quaggaJS/blob/master/example/live_w_locator.js
    Quagga.onProcessed(function(result) {
        let ctx = Quagga.canvas.ctx.overlay;
        let canvas = Quagga.canvas.dom.overlay;
        
        if(result) {
            if(result.boxes) {
                ctx.clearRect(0, 0, parseInt(canvas.getAttribute("width")), parseInt(canvas.getAttribute("height")));
                
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
    });
});
