const FontConverter = require('./fontConverter');
const Ssd1351 = require('./ssd1351');


const init = function () {
    this.Ssd1351 = Ssd1351;
    this.FontConverter = FontConverter;
    return this;
}

module.exports = init();