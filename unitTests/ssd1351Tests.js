const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('chai').assert;
const rewire = require("rewire");
const oledFont5x7 = require('oled-font-5x7');
const Ssd1351 = rewire('../lib/ssd1351');

describe('Ssd1351', function () {

    console.error = () => { };

    describe("constructor", function () {
        it('Check that parameters are saved', function () {
            //Act
            const ssd1351 = new Ssd1351(9, 88)

            //Assert
            assert.equal(9, Ssd1351.__get__("rstGpioId"));
            assert.equal(88, Ssd1351.__get__("dcGpioId"));
        });
    });

    describe("clearDisplay", function () {
        it('Check that that array of bytes is reset', function () {
            //Arrange
            const ssd1351 = new Ssd1351();
            const bytesBuffer = [];
            let i = 0;
            for (i = 0; i < 128 * 128 * 2; i++) {
                bytesBuffer[i] = i % 256;
            }
            ssd1351.setRawData(bytesBuffer);
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.clearDisplay();

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'c35020473aed1b4642cd726cad727b63fff2824ad68cedd7ffb73c7cbd890479');
        });
    });

    describe("convertHexColourToRgb", function () {
        it("Check that colour conversion is ok", function () {
            //Act
            const rgbColour = Ssd1351.convertHexColourToRgb('#FF530D');

            //Assert
            assert.deepEqual({ r: 255, g: 83, b: 13 }, rgbColour);
        });

        it("Check that invalid colour conversion is detected", function () {
            assert.throws(function () {
                //Act
                Ssd1351.convertHexColourToRgb('#zF530D');
            });
        });

        it("Check that invalid colour conversion is detected", function () {
            assert.throws(function () {
                //Act
                Ssd1351.convertHexColourToRgb('#FF530DA');
            });
        });
    });

    describe("convertRgbColourToRgb565", function () {
        it("Check that colour conversion is ok", function () {
            //Act
            const rgb565Colour = Ssd1351.convertRgbColourToRgb565(255, 83, 13);

            //Assert
            assert.deepEqual([0xFA, 0x81], rgb565Colour);
        });

        it("Check that invalid colour conversion is detected", function () {
            assert.throws(function () {
                //Act
                Ssd1351.convertRgbColourToRgb565(255, 83, 'aaa');
            });
        });

        it("Check that invalid colour conversion is detected", function () {
            assert.throws(function () {
                //Act
                Ssd1351.convertRgbColourToRgb565(500, 83, 13);
            });
        });
    });

    describe("disconnectSpi", function () {
        it("check that the SPI connection is closed", async function () {
            //Prepare
            let closed = false;
            const ssd1351 = new Ssd1351();
            Ssd1351.__set__("oled", {
                close: function (cb) {
                    closed = true;
                    cb();
                }
            });
            const disconnectSpi = Ssd1351.__get__("disconnectSpi");

            //Act
            await disconnectSpi();

            //Assert
            assert.isTrue(closed);
        });

        it("check that the SPI closing error is thrown", async function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            Ssd1351.__set__("oled", {
                close: function (cb) {
                    cb('spi disconnection error');
                }
            });
            const disconnectSpi = Ssd1351.__get__("disconnectSpi");

            //Act
            try {
                await disconnectSpi();
            }
            catch (e) {
                //Assert
                assert.equal(e, 'spi disconnection error');
            }
        });
    });

    describe("drawLine", function () {
        it("Check that the pixels are correctly displayed", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.drawLine(0, 0, 128, 128);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'c52a63e0fc124d53f5fb1f6e7160a239a88e3a1b302936f34b3961cbab773fc1');
        });

        it("Check that the pixels are correctly displayed - right to left", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.drawLine(127, 127, 0, 0);
            console.log('coucou2');

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'c52a63e0fc124d53f5fb1f6e7160a239a88e3a1b302936f34b3961cbab773fc1');
        });

        it("Check that the pixels are correctly displayed - dx < dy", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.drawLine(0, 0, 64, 128);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'af5078ba20871eb6047c23527f7c5d7d0ab7218f3460b22f82c93dbeec59583d');
        });

        it("Check that the pixels are correctly displayed - dx > dy", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.drawLine(0, 0, 128, 64);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'f0674d6990d03b25f0e77f2359973f8422df348378c8ba433ff299d7d41f3b71');
        });

        it("Check that the pixels are correctly displayed with the correct colour", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.drawLine(0, 0, 128, 128, { r: 128, g: 128, b: 128 });

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'acd80408e21bb9c7c7a42637e2b9b2b37231fd65e3e51ef80fe90a0c01b9824a');
        });
    });

    describe("getCursor", function () {
        it('Check that the correct cursor position is given', function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.setCursor(33, 78);

            //Act
            const cursorCoordinates = ssd1351.getCursor();

            //Assert
            assert.equal(33, cursorCoordinates.x);
            assert.equal(78, cursorCoordinates.y);
        });
    });

    describe("getStringWidth", function () {
        it('Check that the correct width is found', function () {
            //Prepare
            const ssd1351 = new Ssd1351();

            //Act
            const width = ssd1351.getStringWidth({ width: 2 }, 3, 'testString');

            //Assert
            assert.equal(width, 70);
        });
    });

    describe("initializeSpiConnection", function () {
        it("check that the SPI parameters are correct", async function () {
            //Prepare
            const spiOpenParameters = {};
            const ssd1351 = new Ssd1351();
            Ssd1351.__set__("spi", {
                open: function (busNumber, deviceNumber, options, cb) {
                    spiOpenParameters.busNumber = busNumber;
                    spiOpenParameters.deviceNumber = deviceNumber;
                    spiOpenParameters.options = options;
                    cb();
                }
            });
            const initializeSpiConnection = Ssd1351.__get__("initializeSpiConnection");

            //Act
            await initializeSpiConnection();

            //Assert
            assert.equal(spiOpenParameters.busNumber, 0);
            assert.equal(spiOpenParameters.busNumber, 0);
            assert.equal(spiOpenParameters.options.maxSpeedHz % 65536, 0);
        });

        it("check that the SPI initialization error is thrown", async function () {
            //Prepare
            const spiOpenParameters = {};
            const ssd1351 = new Ssd1351();
            Ssd1351.__set__("spi", {
                open: function (busNumber, deviceNumber, options, cb) {
                    spiOpenParameters.busNumber = busNumber;
                    spiOpenParameters.deviceNumber = deviceNumber;
                    spiOpenParameters.options = options;
                    cb('spi initialization error');
                }
            });
            const initializeSpiConnection = Ssd1351.__get__("initializeSpiConnection");

            //Act
            try {
                await initializeSpiConnection();
            }
            catch (e) {
                //Assert
                assert.equal(e, 'spi initialization error');
            }
        });
    });

    describe("setCursor", function () {
        it('Check that parameters are saved', function () {
            //Prepare
            const ssd1351 = new Ssd1351();

            //Act
            ssd1351.setCursor(33, 78);

            //Assert
            assert.equal(33, Ssd1351.__get__("cursor_x"));
            assert.equal(78, Ssd1351.__get__("cursor_y"));
        });
    });

    describe("setRawData", function () {
        it("Check that array size is checked", function () {
            assert.throws(function () {
                //Arrange
                const ssd1351 = new Ssd1351();

                //Act
                ssd1351.setRawData([200 * 200 * 2]);
            });
        });

        it("Check that array is saved", function () {
            //Arrange
            const ssd1351 = new Ssd1351();
            const bytesBuffer = [];
            let i = 0;
            for (i = 0; i < 128 * 128 * 2; i++) {
                bytesBuffer[i] = i % 256;
            }

            //Act
            ssd1351.setRawData(bytesBuffer);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            assert.equal(5, bytesData[5]);
            assert.equal(255, bytesData[255]);
            assert.equal(0, bytesData[256]);
        });
    });

    describe("setContrast", function () {
        it("Check that the byte array is transmitted to the SPI device", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);

            //Act
            await ssd1351.setContrast(56);

            //Assert
            assert.equal(2, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);

            assert.equal(2, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBuffer: new Buffer([0xC1]) }, dataInputs[0]);
            assert.deepEqual({ byteLength: 3, sendBuffer: new Buffer([56, 56, 56]) }, dataInputs[1]);
        });

        it("Check that the byte array is transmitted to the SPI device - minimum reached", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);

            //Act
            await ssd1351.setContrast(-5);

            //Assert
            assert.equal(2, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);

            assert.equal(2, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBuffer: new Buffer([0xC1]) }, dataInputs[0]);
            assert.deepEqual({ byteLength: 3, sendBuffer: new Buffer([0x00, 0x00, 0x00]) }, dataInputs[1]);
        });

        it("Check that the byte array is transmitted to the SPI device - maximum reached", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);

            //Act
            await ssd1351.setContrast(1000);

            //Assert
            assert.equal(2, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);

            assert.equal(2, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBuffer: new Buffer([0xC1]) }, dataInputs[0]);
            assert.deepEqual({ byteLength: 3, sendBuffer: new Buffer([0xFF, 0xFF, 0xFF]) }, dataInputs[1]);
        });
    });

    describe("setVerticalScroll", function () {
        it("Check that the byte array is transmitted to the SPI device", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);

            //Act
            await ssd1351.setVerticalScroll(56);

            //Assert
            assert.equal(2, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);

            assert.equal(2, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBuffer: new Buffer([0xA1]) }, dataInputs[0]);
            assert.deepEqual({ byteLength: 1, sendBuffer: new Buffer([56]) }, dataInputs[1]);
        });
    });

    describe("sendBytes", function () {
        it("check that an sending error is thrown", async function () {
            //Prepare
            let messageSent;
            const ssd1351 = new Ssd1351();
            Ssd1351.__set__("oled", {
                transfer: function (message, cb) {
                    messageSent = message;
                    cb('spi sending error');
                }
            });
            const sendBytes = Ssd1351.__get__("sendBytes");

            //Act
            try {
                await sendBytes([0x00, 0xFF]);
            }
            catch (e) {
                //Assert
                assert.deepEqual(messageSent, [{ sendBuffer: new Buffer([0x00, 0xFF]), byteLength: 2 }]);
                assert.equal(e, 'spi sending error');
            }
        });
    });

    describe("turnOffDisplay", function () {
        it("Check that the byte array is transmitted to the SPI device", async function () {
            //Prepare 
            const hash = crypto.createHash('sha256');
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], rstGpioInputs = [], dataInputs = [];
            let dcUnexported = false, rstUnexported = false, oledTurnedOff = false;
            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "transfer success");
                },
                close: function (fct) {
                    oledTurnedOff = true;
                    fct(null);
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                },
                unexport: function () {
                    dcUnexported = true;
                }
            };

            const rstGpioMock = {
                writeSync: function (value) {
                    rstGpioInputs[rstGpioInputs.length] = value;
                },
                unexport: function () {
                    rstUnexported = true;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);
            Ssd1351.__set__("rstGpio", rstGpioMock);

            //Act
            await ssd1351.turnOffDisplay();

            //Assert
            //Check rst
            assert.equal(2, rstGpioInputs.length);
            assert.equal(rstGpioInputs[0], 0);
            assert.equal(rstGpioInputs[1], 1);
            assert.isTrue(rstUnexported);

            //Check dc
            assert.equal(2, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);
            assert.isTrue(dcUnexported);

            //Check spi inputs
            assert.equal(1, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBuffer: new Buffer([0xA4]) }, dataInputs[0]);

            //Check oled is turned off
            assert.isTrue(oledTurnedOff);
        });

        it("check that a closing error is thrown", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const rstGpioMock = {
                writeSync: function (value) {
                    throw new Error('rstGpioMock error');
                }
            };

            Ssd1351.__set__("rstGpio", rstGpioMock);

            //Act
            try {
                await ssd1351.turnOffDisplay();
            }
            catch (e) {
                //Assert
                assert.equal(e, 'Error: rstGpioMock error');
            }
        });
    });

    describe("turnOnDisplay", function () {
        it("Check that the byte array is transmitted to the SPI device", async function () {
            //Prepare 
            const hash = crypto.createHash('sha256');
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], rstGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            const rstGpioMock = {
                writeSync: function (value) {
                    rstGpioInputs[rstGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);
            Ssd1351.__set__("rstGpio", rstGpioMock);

            const dataExpectedInputs = [
                [0xFD], [0x12],
                [0xFD], [0xB1],
                [0xAE],
                [0xB3], [0xF1],
                [0xCA], [0x7F],
                [0x15], [0x00, 0x7F],
                [0x75], [0x00, 0x7F],
                [0xA0], [0x74],
                [0xA1], [0x00],
                [0xA2], [0x00],
                [0xB5], [0x00],
                [0xAB], [0x01],
                [0xB1], [0x32],
                [0xB4], [0xA0, 0xB5, 0x55],
                [0xBE], [0x05],
                [0xC7], [0x0F],
                [0xB6], [0x01],
                [0xC1], [0xFF, 0xFF, 0xFF],
                [0xAF],
                [0xA6]];

            //Act
            await ssd1351.turnOnDisplay();

            //Assert
            //Check rst
            assert.equal(2, rstGpioInputs.length);
            assert.equal(rstGpioInputs[0], 0);
            assert.equal(rstGpioInputs[1], 1);

            //Check dc
            assert.equal(40, dcGpioInputs.length);
            let i = 0;
            for (i = 0; i < dcGpioInputs.length; i++) {
                assert.equal(dcGpioInputs[i], i % 2);
            }

            //Check spi inputs
            assert.equal(dataExpectedInputs.length, dataInputs.length);
            for (i = 0; i < dataInputs.length; i++) {
                assert.deepEqual({ byteLength: dataExpectedInputs[i].length, sendBuffer: new Buffer(dataExpectedInputs[i]) }, dataInputs[i]);
            }

            //Check that the bytes array is reset
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'c35020473aed1b4642cd726cad727b63fff2824ad68cedd7ffb73c7cbd890479');
        });

        it("Check that Gpio is currently initialized and that the byte array is transmitted to the SPI device", async function () {
            //Prepare 
            const hash = crypto.createHash('sha256');
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], rstGpioInputs = [], dataInputs = [];

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            const rstGpioMock = {
                writeSync: function (value) {
                    rstGpioInputs[rstGpioInputs.length] = value;
                }
            };

            const oledMock = {
                transfer: function (message, fct) {
                    dataInputs[dataInputs.length] = message[0];
                    fct(null, "success");
                }
            };

            const gpioMock = function (gpio, direction) {
                if (25 === gpio) {
                    return rstGpioMock;
                } else {
                    return dcGpioMock;
                }
            };

            const initializeSpiConnectionMock = function () {
                Ssd1351.__set__("oled", oledMock);
                return 'initializeSpiConnectionMock success';
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("Gpio", gpioMock);
            Ssd1351.__set__("initializeSpiConnection", initializeSpiConnectionMock);
            Ssd1351.__set__("dcGpio", undefined);
            Ssd1351.__set__("rstGpio", undefined);
            Ssd1351.__set__("oled", undefined);

            const dataExpectedInputs = [
                [0xFD], [0x12],
                [0xFD], [0xB1],
                [0xAE],
                [0xB3], [0xF1],
                [0xCA], [0x7F],
                [0x15], [0x00, 0x7F],
                [0x75], [0x00, 0x7F],
                [0xA0], [0x74],
                [0xA1], [0x00],
                [0xA2], [0x00],
                [0xB5], [0x00],
                [0xAB], [0x01],
                [0xB1], [0x32],
                [0xB4], [0xA0, 0xB5, 0x55],
                [0xBE], [0x05],
                [0xC7], [0x0F],
                [0xB6], [0x01],
                [0xC1], [0xFF, 0xFF, 0xFF],
                [0xAF],
                [0xA6]];

            //Act
            await ssd1351.turnOnDisplay();

            //Assert
            //Check rst
            assert.equal(2, rstGpioInputs.length);
            assert.equal(rstGpioInputs[0], 0);
            assert.equal(rstGpioInputs[1], 1);

            //Check dc
            assert.equal(40, dcGpioInputs.length);
            let i = 0;
            for (i = 0; i < dcGpioInputs.length; i++) {
                assert.equal(dcGpioInputs[i], i % 2);
            }

            //Check spi inputs
            assert.equal(dataExpectedInputs.length, dataInputs.length);
            for (i = 0; i < dataInputs.length; i++) {
                assert.deepEqual({ byteLength: dataExpectedInputs[i].length, sendBuffer: new Buffer(dataExpectedInputs[i]) }, dataInputs[i]);
            }

            //Check that the bytes array is reset
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'c35020473aed1b4642cd726cad727b63fff2824ad68cedd7ffb73c7cbd890479');
        });

        it("check that an initialization error is thrown", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const gpioMock = function (gpio, direction) {
                throw new Error('rstGpioMock error');
            };

            Ssd1351.__set__("Gpio", gpioMock);
            Ssd1351.__set__("rstGpio", undefined);

            //Act
            try {
                await ssd1351.turnOnDisplay();
            }
            catch (e) {
                //Assert
                assert.equal(e, 'Error: rstGpioMock error');
            }
        });
    });

    describe("updateScreen", function () {
        it("Check that the byte array is transmitted to the SPI device", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();

            const dcGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    const hash = crypto.createHash('sha256');
                    hash.update(message[0].sendBuffer);

                    dataInputs[dataInputs.length] = {
                        sendBufferHash: hash.digest('hex'),
                        byteLength: message[0].byteLength
                    }
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);

            //Act
            await ssd1351.updateScreen();

            //Assert
            assert.equal(6, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);
            assert.equal(dcGpioInputs[2], 0);
            assert.equal(dcGpioInputs[3], 1);
            assert.equal(dcGpioInputs[4], 0);
            assert.equal(dcGpioInputs[5], 1);

            assert.equal(13, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBufferHash: '2f0fd1e89b8de1d57292742ec380ea47066e307ad645f5bc3adad8a06ff58608' }, dataInputs[0]);
            assert.deepEqual({ byteLength: 2, sendBufferHash: 'a4c851fbf3189e47aba2bd90b69036406538b25d92bffbf2ff12267bbea9f023' }, dataInputs[1]);
            assert.deepEqual({ byteLength: 1, sendBufferHash: '0bfe935e70c321c7ca3afc75ce0d0ca2f98b5422e008bb31c00c6d7f1f1c0ad6' }, dataInputs[2]);
            assert.deepEqual({ byteLength: 2, sendBufferHash: 'a4c851fbf3189e47aba2bd90b69036406538b25d92bffbf2ff12267bbea9f023' }, dataInputs[3]);
            assert.deepEqual({ byteLength: 1, sendBufferHash: 'a9253dc8529dd214e5f22397888e78d3390daa47593e26f68c18f97fd7a3876b' }, dataInputs[4]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[5]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[6]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[7]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[8]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[9]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[10]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[11]);
            assert.deepEqual({ byteLength: 4096, sendBufferHash: 'ad7facb2586fc6e966c004d7d1d16b024f5805ff7cb47c7a85dabd8b48892ca7' }, dataInputs[12]);
        });

        it("Check that not byte array is transmitted to the SPI device if the array is empty", async function () {
            //Prepare 
            const ssd1351 = new Ssd1351();
            const dcGpioInputs = [], dataInputs = [];
            const oledMock = {
                transfer: function (message, fct) {
                    const hash = crypto.createHash('sha256');
                    hash.update(message[0].sendBuffer);

                    dataInputs[dataInputs.length] = {
                        sendBufferHash: hash.digest('hex'),
                        byteLength: message[0].byteLength
                    }
                    fct(null, "success");
                }
            };

            const dcGpioMock = {
                writeSync: function (value) {
                    dcGpioInputs[dcGpioInputs.length] = value;
                }
            };

            Ssd1351.__set__("bytesData", []);
            Ssd1351.__set__("oled", oledMock);
            Ssd1351.__set__("dcGpio", dcGpioMock);

            //Act
            await ssd1351.updateScreen();

            //Assert
            assert.equal(6, dcGpioInputs.length);
            assert.equal(dcGpioInputs[0], 0);
            assert.equal(dcGpioInputs[1], 1);
            assert.equal(dcGpioInputs[2], 0);
            assert.equal(dcGpioInputs[3], 1);
            assert.equal(dcGpioInputs[4], 0);
            assert.equal(dcGpioInputs[5], 1);

            assert.equal(5, dataInputs.length);
            assert.deepEqual({ byteLength: 1, sendBufferHash: '2f0fd1e89b8de1d57292742ec380ea47066e307ad645f5bc3adad8a06ff58608' }, dataInputs[0]);
            assert.deepEqual({ byteLength: 2, sendBufferHash: 'a4c851fbf3189e47aba2bd90b69036406538b25d92bffbf2ff12267bbea9f023' }, dataInputs[1]);
            assert.deepEqual({ byteLength: 1, sendBufferHash: '0bfe935e70c321c7ca3afc75ce0d0ca2f98b5422e008bb31c00c6d7f1f1c0ad6' }, dataInputs[2]);
            assert.deepEqual({ byteLength: 2, sendBufferHash: 'a4c851fbf3189e47aba2bd90b69036406538b25d92bffbf2ff12267bbea9f023' }, dataInputs[3]);
            assert.deepEqual({ byteLength: 1, sendBufferHash: 'a9253dc8529dd214e5f22397888e78d3390daa47593e26f68c18f97fd7a3876b' }, dataInputs[4]);
        });
    });

    describe("writeString", function () {
        it("Check that the pixels are correctly displayed (size 1)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeString(oledFont5x7, 1, '14:14');

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), '03d7a8158c0645e715257edee4609884dcc025a4a4364e1edbc39d57308c3ef2');
        });

        it("Check that the pixels are correctly displayed (size 1 & new line)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeString(oledFont5x7, 1, '14:14\n14:14');

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), '89fba37ee61870f563a3c290d540d809a8c2357098a37b28e8ca55210de700a3');
        });

        it("Check that the pixels are correctly displayed (size 1 & wrap words)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeString(oledFont5x7, 1, '14:10 14:11 14:12 14:13 14:14', { r: 255, g: 255, b: 255 }, true);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), '4213523b94abbdf7880c393c29f187bf740e6d97aa94cee90bdf3d069b8daa09');
        });

        it("Check that the pixels are correctly displayed (size 1 & wrap letters)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeString(oledFont5x7, 1, '14:1014:1114:1214:1314:1414:1514:1614:17', { r: 255, g: 255, b: 255 }, true);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'e4113788be366ed50116979a776f53f9e839c6dd75fbe41cb0a8d9d20e29b623');
        });

        it("Check that the pixels are correctly displayed (size 4)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeString(oledFont5x7, 4, '14:14');

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'fde2fc7cf4bcffa39d5f4de27b4be8172d81eab30548e4a77ff0d62748896aa7');
        });

        it("Check that the pixels are correctly displayed with the correct colour (size 4)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeString(oledFont5x7, 4, '14:14', { r: 128, g: 128, b: 128 });

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), '72a54c608e666dd76913e83efa5d3431a33ae3de9310d815b4c45cf380a0d5e6');
        });
    });

    describe("writeOutlineString", function () {
        const robotoFontConverter = new FontConverter(path.join(__dirname,
            '../fonts/Roboto-Regular.ttf'),
            {
                charWidth: 0, charHeight: 15 * 64, horzResolution: 128, vertResolution: 128
            });

        it("Check that the pixels are correctly displayed (size 1) - default colour", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeOutlineString('14:14', robotoFontConverter, 5);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), '2995005a50ec9461c72bbc70f820034d7c48673750b663dd14b8ed167b620882');
        });

        it("Check that the pixels are correctly displayed (size 1) - default spacing", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeOutlineString('14:14', robotoFontConverter);

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'dfca4873bdd117dd0a1b78055d2bb660bda4fa1de43027e18253efd980d6e958');
        });

        it("Check that the pixels are correctly displayed (size 1)", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            ssd1351.writeOutlineString('14:14', robotoFontConverter, 5, Ssd1351.convertHexColourToRgb('#FF530D'));

            //Assert
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), '41d591c8c3f6b471f3a5f7156f80dd8c2e365bb52226c38a291a38fd6774ea43');
        });

        it("Check that the size of the string is calculated if draw is disabled", function () {
            //Prepare
            const ssd1351 = new Ssd1351();
            ssd1351.clearDisplay();
            const hash = crypto.createHash('sha256');

            //Act
            const size = ssd1351.writeOutlineString('14:14', robotoFontConverter, 5, Ssd1351.convertHexColourToRgb('#FF530D'), false);

            //Assert
            assert.deepEqual(size, { height: 19, width: 14 });
            const bytesData = Ssd1351.__get__("bytesData");
            hash.update(new Buffer(bytesData));
            assert.equal(hash.digest('hex'), 'c35020473aed1b4642cd726cad727b63fff2824ad68cedd7ffb73c7cbd890479');
        });
    });
});
