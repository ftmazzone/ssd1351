const Ssd1351 = require('./ssd1351');

const init = function () {
    this.Ssd1351 = Ssd1351;
    return this;
}

module.exports = init();