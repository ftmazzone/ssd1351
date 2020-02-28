"use strict";

const Ssd1351 = require('..').Ssd1351;

async function test() {
	try {

		const startTime = Date.now();
		const ssd1351 = new Ssd1351();
		await ssd1351.turnOnDisplay();

		while (Date.now() - startTime < 5 * 60 * 1000) {

			ssd1351.clearDisplay();
			ssd1351.drawLine(0, 0, 127, 127, Ssd1351.convertHexColourToRgb('#FF530D'));
			ssd1351.drawLine(127, 0, 0, 127, Ssd1351.convertHexColourToRgb('#00FF00'));
			ssd1351.drawLine(64, 0, 64, 127, Ssd1351.convertHexColourToRgb('#0000FF'));
			ssd1351.drawLine(0, 64, 127, 64);
			ssd1351.drawLine(0, 0, 127, 127, Ssd1351.convertHexColourToRgb('#FF530D'));
			await ssd1351.updateScreen();

			await new Promise(resolve => setTimeout(resolve, 10000));

			ssd1351.clearDisplay();
			ssd1351.drawRectangle(0, 0, 128, 64, Ssd1351.convertHexColourToRgb('#FF530D'));
			await ssd1351.updateScreen();

			await new Promise(resolve => setTimeout(resolve, 10000));
		}
		await ssd1351.turnOffDisplay();
	} catch (err) {
		console.error(err);
	}
}

test();