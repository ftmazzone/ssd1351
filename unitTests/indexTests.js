const assert = require('chai').assert;
const index = require('..');

describe('index', function () {

    describe("constructor", function () {
        it('Check that the classes Ssd1351 and FontConverter are available', function () {
            //Act
            const Ssd1351 = index.Ssd1351

            //Assert
            assert.exists(Ssd1351);
        });
    });
});