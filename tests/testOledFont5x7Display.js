"use strict";

const oledFont5x7 = require('oled-font-5x7');
const Ssd1351 = require('..').Ssd1351;

async function test() {
	try {

		let y = 0;
		const startTime = Date.now();
		const ssd1351 = new Ssd1351();
		await ssd1351.turnOnDisplay();

		while (Date.now() - startTime < 5 * 60 * 1000) {
			await ssd1351.clearDisplay();
			const currentDate = (new Date()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
			y = (y + 10) % 128;
			console.log(y);
			ssd1351.setCursor(0, y);
			ssd1351.writeString(oledFont5x7, 4, currentDate, { r: 255, g: 255, b: 255 });
			await ssd1351.updateScreen();
			await new Promise(resolve => setTimeout(resolve, 10000));
		}
		await ssd1351.turnOffDisplay();

	} catch (err) {
		console.error(err);
	}
}

test();
