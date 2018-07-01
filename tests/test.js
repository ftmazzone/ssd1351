const Ssd1351 = require('..').Ssd1351;
const FontConverter = require('..').FontConverter;
const oledFont5x7 = require('oled-font-5x7');
const path = require('path');

async function test() {
    try {
        const robotoFontConverter = new FontConverter(path.join(__dirname,
            '../fonts/Roboto-Regular.ttf'),
            {
                charWidth: 0, charHeight: 15 * 64, horzResolution: 128, vertResolution: 128
            });
        const ssd1351 = new Ssd1351();
        await ssd1351.turnOnDisplay();
        ssd1351.clearDisplay();

        await ssd1351.drawLine(0, 0, 127, 127,Ssd1351.convertHexColourToRgb('#FF530D'));
        await ssd1351.drawLine(127, 0, 0, 127,Ssd1351.convertHexColourToRgb('#00FF00'));
        await ssd1351.drawLine(64, 0, 64, 127,Ssd1351.convertHexColourToRgb('#0000FF'));
        await ssd1351.drawLine(0, 64, 127, 64);
        await ssd1351.drawLine(0, 0, 127, 127, Ssd1351.convertHexColourToRgb('#FF530D'));

        // await ssd1351.clearDisplay();
        // await ssd1351.turnOffDisplay();
        // await ssd1351.turnOnDisplay(0x10);

        //await ssd1351.writeString(oledFont5x7, 1, '1', { r: 255, g: 255, b: 255 });
        // ssd1351.setCursor(0, 0);
        // await ssd1351.writeString(oledFont5x7, 4, '14:14', { r: 255, g: 255, b: 255 });
        //ssd1351.clearDisplay();
         await ssd1351.updateScreen();

        // for (let i = 0; i < 128; i++) {
        //     await ssd1351.setVerticalScroll(i);
        // }

        // for (let i = 1; i < 255; i++) {
        //     setTimeout(async () => {
        //         await ssd1351.setContrast(i);
        //     }, i * 50);
        // }

        // console.log(Ssd1351.convertRgbColourToRgb565(0, 0, 255));

        //Test Bitmap display     
        // const Jimp = require("jimp");
        // const height = 128, width = 128;
        // let i = 0;
        // const pixelsBuffer = Array.from({ length: height * width * 2 });
        // const myImage = await Jimp.read(path.join(__dirname, "testPicture.png"));
        // await myImage.rgba(false);
        // myImage.resize(height, width)
        //     .scan(0, 0, height, width, function (x, y, idx) {
        //         const bytes = Ssd1351.convertRgbColourToRgb565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
        //         pixelsBuffer[idx / 2] = bytes[0];
        //         pixelsBuffer[idx / 2 + 1] = bytes[1];
        //         if (0 === idx) {
        //             console.info('convert rgb colour to rgb 565 bit colour');
        //         }
        //         else if (height * width === idx / 4) {
        //             resolve(pixelsBuffer);
        //         }
        //     });

        // console.info('draw image');
        // ssd1351.setRawData(pixelsBuffer);

        // await ssd1351.setCursor(0, 0);
        // await ssd1351.updateScreen();

        // const showTime = setInterval(async () => {
        //     try {
        //         const heure = new Date();
        //         const cultureUtilisateur = 'fr-FR';
        //         ssd1351.clearDisplay();
        //         ssd1351.setCursor(0, 0);      
        //         await ssd1351.writeOutlineString((new Date()).toLocaleTimeString(), robotoFontConverter, 5, Ssd1351.convertHexColourToRgb('#FF530D')); //Writes in the application buffer the current time in orange. The space between each character is 5 pixels.
        //         //  ssd1351.writeString(oledFont5x7, 2, heure.getDate().toLocaleString(cultureUtilisateur) +
        //         //     '/' + (heure.getMonth() + 1).toLocaleString(cultureUtilisateur) +
        //         //     '/' + heure.getFullYear(), { r: 255, g: 255, b: 255 });
        //         await ssd1351.updateScreen();
        //     } catch (e) {
        //         console.error(e);
        //     }
        // }, 1000);

        // setTimeout(async () => {
        //     clearInterval(showTime);
        //     await ssd1351.turnOffDisplay();
        // }, 60000);

        // ssd1351.setCursor(0, 0);
        //await ssd1351.drawLine(0, 0, 127, 127, Ssd1351.convertHexColourToRgb('#FF530D'));
        //  await writeString(font, 2, '01/02/2012');
    }
    catch (e) {
        console.error(e);
    }
}

test();