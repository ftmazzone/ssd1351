"use strict";

const path = require('path');
const { createCanvas, registerFont } = require('canvas');
const Ssd1351 = require('..').Ssd1351;

async function test() {
	try {

		let row = 0;
		const startTime = Date.now();
		registerFont(path.join(__dirname, '../fonts/Roboto-Regular.ttf'), { family: 'Roboto-Regular' });
		registerFont(path.join(__dirname, '../node_modules/weather-icons/font/weathericons-regular-webfont.ttf'), { family: 'weathericons-regular-webfont' });
		const canvas = createCanvas(128, 128);
		const ctx = canvas.getContext('2d', { pixelFormat: 'RGB16_565' });

		const ssd1351 = new Ssd1351();
		await ssd1351.turnOnDisplay();

		while (Date.now() - startTime < 5 * 60 * 1000) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.font = '87px weathericons-regular-webfont';
			let textMeasures = ctx.measureText(String.fromCharCode(0xf010));
			ctx.fillStyle = 'blue';
			ctx.fillText(String.fromCharCode(0xf010), (127 - textMeasures.width) / 2, (128 + textMeasures.actualBoundingBoxAscent - textMeasures.actualBoundingBoxDescent) / 2);

			await ssd1351.drawCanvas(ctx)
			await ssd1351.setVerticalScroll(0);
			await ssd1351.updateScreen();

			await new Promise(resolve => setTimeout(resolve, 10000));
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.font = '45px Roboto-Regular';
			ctx.fillStyle = '#550A21';
			const currentDate = (new Date()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
			textMeasures = ctx.measureText(currentDate);
			ctx.fillText(currentDate, 0, textMeasures.actualBoundingBoxAscent);

			await ssd1351.drawCanvas(ctx)
			await ssd1351.setVerticalScroll(row = (row + 3) % 128);
			await ssd1351.updateScreen();
			await new Promise(resolve => setTimeout(resolve, 10000));
		}
		await ssd1351.turnOffDisplay();

	} catch (err) {
		console.error(err);
	}
}

test();
