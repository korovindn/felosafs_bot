const { createCanvas, loadImage } = require('canvas')

function randomiser(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

module.exports = {
    draw: async function (t, a, imgUrl) { //commets about this function u can find at felosafs-online-editor
       
        const canvas = createCanvas(1000, 700)

        let ctx = canvas.getContext("2d");

        const image = await loadImage(imgUrl);
        console.log(image.height, image.width);
        ctx.drawImage(image, 0, (700-1000/image.width*image.height)/2, 1000, 1000/image.width*image.height);
        
        let grad = randomiser(0, 3);
        ctx.globalCompositeOperation = 'screen';

        if (grad === 0) {
            let blue = ctx.createLinearGradient(0, 700, 1000, 0);
            blue.addColorStop(0, "rgba(0,72,128)");
            blue.addColorStop(0.5, "black");
            blue.addColorStop(1, "rgba(0,72,128)");
            ctx.fillStyle = blue;
            ctx.fillRect(0, 0, 1000, 700);
        }
        if (grad === 1){
            let purple = ctx.createLinearGradient(0, 700, 1000, 0);
            purple.addColorStop(0, "rgba(96,0,72)");
            purple.addColorStop(0.5, "black");
            purple.addColorStop(1, "rgba(96,0,72)");
            ctx.fillStyle = purple;
            ctx.fillRect(0, 0, 1000, 700);
        }
        if (grad === 2){
            let green = ctx.createLinearGradient(0, 700, 1000, 0);
            green.addColorStop(0, "rgba(0,75,0)");
            green.addColorStop(0.5, "black");
            green.addColorStop(1, "rgba(0,75,0)");
            ctx.fillStyle = green;
            ctx.fillRect(0, 0, 1000, 700);
        }
        if (grad === 3){
            let yellow = ctx.createLinearGradient(0, 700, 1000, 0);
            yellow.addColorStop(0, "rgba(128,72,0)");
            yellow.addColorStop(0.5, "black");
            yellow.addColorStop(1, "rgba(128,72,0)");
            ctx.fillStyle = yellow;
            ctx.fillRect(0, 0, 1000, 700);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.rect(0, 0, 1000, 700);
        ctx.fill();
        ctx.font = '600 italic  48px Montserrat';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';

        let maxWidth = 840;
        let words = t.split(' '); 
        let lines = [];
        let width = 0;
        let currentLine = '';
        for (let i = 0; i < words.length; i++) {
            width = ctx.measureText(currentLine + " " + words[i]).width;
            if(i == 0) {
                currentLine += words[i];
            } else if (width < maxWidth) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
            if (i == words.length-1) {
                lines.push(currentLine);
            }
        }
        let verticalOffsetText = 58 * (lines.length-1); 

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i], 
                70, 
                canvas.height - verticalOffsetText - 205 + (i * 58));
        }

        ctx.font = 'bold  48px Montserrat';

        maxWidth = 600;
        words = a.split(' ');
        lines = [];
        width = 0;
        currentLine = '';
        let authorWidth = 0;
        for (let i = 0; i < words.length; i++) {
            width = ctx.measureText(currentLine + " " + words[i]).width;
            if(i == 0) {
                if(authorWidth<ctx.measureText(currentLine).width) authorWidth = ctx.measureText(currentLine).width;
                currentLine += words[i];
            } else if (width < maxWidth) {
                currentLine += " " + words[i];
            } else {
                if(authorWidth<ctx.measureText(currentLine).width) authorWidth = ctx.measureText(currentLine).width;
                lines.push(currentLine);
                currentLine = words[i];
            }
            if (i == words.length-1) {
                if(authorWidth<ctx.measureText(currentLine).width) authorWidth = ctx.measureText(currentLine).width;
                lines.push(currentLine);
            }
        }

        let verticalOffsetAuthor = 58 * (lines.length-1);

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                1000-70-authorWidth, 
                canvas.height - verticalOffsetAuthor - 55 + (i * 58));
        }

        str = "—";
        ctx.fillText(str, 1000-70-authorWidth, canvas.height - verticalOffsetAuthor - 100)
        str = "“";
        ctx.font = 'bold italic  144px Montserrat';
        ctx.fillText(str, 70-10, canvas.height - verticalOffsetText - 250);
        
        return canvas.toDataURL();
    }
}