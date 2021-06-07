"use strict";

const Ssd1351 = require('../lib').Ssd1351;

async function test() {
    try {

        const startTime = Date.now();
        const ssd1351 = new Ssd1351();
        await ssd1351.turnOnDisplay();

        ssd1351.drawRectangle(32, 32, 64, 64);
        await ssd1351.updateScreen();
        await new Promise(resolve => setTimeout(resolve, 10000));

        ssd1351.fillRectangle(48, 48, 32, 32);
        await ssd1351.updateScreen();
        await new Promise(resolve => setTimeout(resolve, 10000));

        while (Date.now() - startTime < 5 * 60 * 1000) {

            ssd1351.clearDisplay();
            ssd1351.drawRectangle(32, 32, 64, 64, Ssd1351.convertHexColourToRgb('#FF530D'));
            await ssd1351.updateScreen();
            await new Promise(resolve => setTimeout(resolve, 10000));

            ssd1351.fillRectangle(48, 48, 32, 32, Ssd1351.convertHexColourToRgb('#00FF00'));
            await ssd1351.updateScreen();
            await new Promise(resolve => setTimeout(resolve, 10000));

        }
        await ssd1351.turnOffDisplay();
    } catch (err) {
        console.error(err);
    }
}

test();