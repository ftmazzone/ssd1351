# ssd1351

Node.js module for controlling [OLED SSD1351](https://www.newhavendisplay.com/app_notes/SSD1351.pdf) devices. 

[![dependencies Status](https://david-dm.org/ftmazzone/ssd1351/status.svg?style=flat-square)](https://david-dm.org/ftmazzone/ssd1351)
[![Build Status](https://img.shields.io/travis/ftmazzone/ssd1351/master.svg?style=flat-square)](https://travis-ci.org/ftmazzone/ssd1351)
[![codecov](https://codecov.io/gh/ftmazzone/ssd1351/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ftmazzone/ssd1351)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=SSD1351&metric=alert_status&style=flat-square)](https://sonarcloud.io/dashboard?id=SSD1351)

## Prerequisites
### Wiring

| SSD1351 pin    |Raspberry Pi pin|Raspberry Pi GPIO|
|----------------|:---------------|:----------------|
| GND            |  20            |                 |
| VCC (3,3 V)    |  17            |                 |
| SCL (SPI_CLK)  | 23             |        11       |
| SDA (SPI_MOSI) |  19            |        10       |
| RES            |  22            |        25       |
| DC             |  18            |        24       |
| CS (SPI_CEO_N) |  24            |        8        |

### Installation

```sh
npm install ssd1351
```

## Available Methods

### convertHexColourToRgb

Converts hexadecimal colour code to a rgb colour code.

Usage:
```javascript
Ssd1351.convertHexColourToRgb('#FF530D'); // Returns { r: 255, g: 83, b: 13 }
```

### convertRgbColourToRgb565

Converts rgb colour code to the a 16 bits colour code compatible with the oled screen.

Usage:
```javascript
Ssd1351.convertRgbColourToRgb565(128, 128, 128); // Returns [ 132, 16 ]
```

### drawLine

Draws a line with the specified colour and saves it in the application memory buffer.  
__Remark__ : This method only writes the string in the application buffer. Use [updateScreen](#updatescreen) to update the oled display content.

Usage:
```javascript
await ssd1351.drawLine(0, 0, 127, 127); // Draws a white line from the top left corner of the screen to the bottom right.
await ssd1351.drawLine(0, 0, 127, 127,Ssd1351.convertHexColourToRgb('#FF530D')); // Draws a red line from the top left corner of the screen to the bottom right.
```

### getCursor

Gets current cursor position as an object {x,y}.

Usage:
```javascript
ssd1351.getCursor(); // Returns for example{ x:64, y: 40}
```

### setCursor

Sets the current cursor position.

Usage:
```javascript
ssd1351.setCursor(0, 0); // Sets the cursor position : 1 row, 1 column
```

### setRawData

Sets the array of bits to be displayed on the OLED screen.

**Remark :** This method can be used to display an image directly on the oled screen. In the below example, the library [jimp](https://github.com/oliver-moran/jimp) - [MIT](https://github.com/oliver-moran/jimp/blob/master/LICENSE) is used to resize the picture.

Usage:
```javascript
const Jimp = require("jimp");
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

console.info('draw image');
ssd1351.setRawData(pixelsBuffer);

await ssd1351.setCursor(0, 0);
await ssd1351.updateScreen();
```

### setVerticalScroll

Sets the row to be displayed at the top of the screen. This method can be used to scroll vertically the content of the screen.

Usage:
```javascript
await ssd1351.setVerticalScroll(10);
```

### turnOffDisplay

Turn off the display.

Usage:
```javascript
await ssd1351.turnOffDisplay();
```

### turnOnDisplay

Turns on the display. Per default the contrast is set to the maximum.

Usage:
```javascript
const Ssd1351 = require('ssd1351').Ssd1351;
const ssd1351 = new Ssd1351();
await ssd1351.turnOnDisplay(); // Maximum brightness
await ssd1351.turnOnDisplay(0x10); // Reduced brightness
```

### updateScreen

Writes the application buffer to the oled GDDRAM (Graphic Display Data RAM). Call this method to update the oled display content.

Usage:
```javascript
await ssd1351.writeString(oledFont5x7, 4, '12:12', { r: 255, g: 255, b: 255 }); // Writes in white the string 12:12 with the pixel font 'oledFont5x7', the character size '4'
```

### writeString

Writes the specified string given in parameter at the current cursor position.  
__Remark__ : This method only writes the string in the application buffer. Use [updateScreen](#updatescreen) to update the oled display content.

Usage:
```javascript
await ssd1351.writeString(oledFont5x7, 4, '12:12', { r: 255, g: 255, b: 255 }); // Writes in white the string 12:12 with the pixel font 'oledFont5x7', the character size '4'
```

### writeOutlineString

Writes the specified outline string given in parameter at the current cursor position. 
__Remark__ : This method only writes the string in the application buffer. Use [updateScreen](#updatescreen) to update the oled display content.

Usage:
```javascript
const Ssd1351 = require('ssd1351').Ssd1351;
const FontConverter = require('ssd1351').FontConverter;
const robotoFontConverter = new FontConverter(path.join(__dirname,'/fonts/Roboto-Regular.ttf'),{charWidth: 0, charHeight: 15 * 64, horzResolution: 128, vertResolution: 128});
const ssd1351 = new Ssd1351();
await ssd1351.turnOnDisplay();
await ssd1351.clearDisplay();
ssd1351.setCursor(0, 0);
await ssd1351.writeOutlineString((new Date()).toLocaleTimeString(), robotoFontConverter, 5, Ssd1351.convertHexColourToRgb('#FF530D'),false); //Return the size of the string. The application buffer is not updated.
await ssd1351.writeOutlineString((new Date()).toLocaleTimeString(), robotoFontConverter, 5, Ssd1351.convertHexColourToRgb('#FF530D')); //Writes in the application buffer the current time in orange. The space between each character is 5 pixels.
```

## Credits
* [freetype2](https://github.com/ericfreese/node-freetype2) to render outline fonts - [MIT](https://github.com/ericfreese/node-freetype2/blob/master/LICENSE)
* [Roboto font](https://fonts.google.com/specimen/Roboto) to display the default outline font - [Apache v2](http://www.apache.org/licenses/LICENSE-2.0)
* [spi-device](https://github.com/fivdi/spi-device) to send spi messages - [MIT](https://github.com/fivdi/spi-device/blob/master/LICENSE)
* [oled-font-5x7](https://github.com/noopkat/oled-font-5x7) to display string using a 5 x 7 system font - [MIT](https://github.com/noopkat/oled-font-5x7/blob/master/LICENSE)
* [oled-i2c-bus](https://github.com/baltazorr/oled-i2c-bus) for the idea and display algorithms - [MIT](https://opensource.org/licenses/MIT)
* [onoff](https://github.com/fivdi/onoff) to control the spi device - [MIT](https://github.com/fivdi/onoff/blob/master/LICENSE)
* [chai](https://github.com/chaijs/chai) for unit testing - [MIT](https://github.com/chaijs/chai/blob/master/LICENSE)
* [mocha](https://github.com/mochajs/mocha) for unit testing - [MIT](https://github.com/mochajs/mocha/blob/master/LICENSE)
* [nyc](https://github.com/istanbuljs/nyc) for unit testing - [ISC](https://github.com/istanbuljs/nyc/blob/master/LICENSE.txt)
* [rewire](https://github.com/jhnns/rewire) for unit testing - [MIT](https://github.com/jhnns/rewire/blob/master/LICENSE)
