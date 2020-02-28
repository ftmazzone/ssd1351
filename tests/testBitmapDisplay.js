"use strict";

const path = require('path');
const Ssd1351 = require('..').Ssd1351;
const Jimp = require("jimp");

async function test() {
    try {


        const startTime = Date.now();
        const ssd1351 = new Ssd1351();
        await ssd1351.turnOnDisplay();

        const height = 128, width = 128;
        let i = 0;
        const pixelsBuffer = Array.from({ length: height * width * 2 });
        const myImage = await Jimp.read(path.join(__dirname, "testPicture.png"));
        await myImage.rgba(false);
        myImage.resize(height, width)
            .scan(0, 0, height, width, function (x, y, idx) {
                const bytes = Ssd1351.convertRgbColourToRgb565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
                pixelsBuffer[idx / 2] = bytes[0];
                pixelsBuffer[idx / 2 + 1] = bytes[1];
                if (0 === idx) {
                    console.info('convert rgb colour to rgb 565 bit colour');
                }
                else if (height * width === idx / 4) {
                    resolve(pixelsBuffer);
                }
            });

        ssd1351.RawData = pixelsBuffer;
        await ssd1351.updateScreen();

        while (Date.now() - startTime < 5 * 60 * 1000) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            for (let i = 255; i >= 0; i--) {
                await ssd1351.setContrast(i);
                await new Promise(resolve => setTimeout(resolve, 20));
            }
            await new Promise(resolve => setTimeout(resolve, 10000));
            for (let i = 0; i < 255; i++) {
                await ssd1351.setContrast(i);
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        }
        await ssd1351.turnOffDisplay();
    } catch (err) {
        console.error(err);
    }
}

test();
