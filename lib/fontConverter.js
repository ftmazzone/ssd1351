const fs = require('fs');
const ft = require('freetype2');
const path = require('path');
let face = {};

function convertStringToCharsInt(input) {
    return input.split('').map(
        (c) => {
            return c.charCodeAt(0);
        }
    );
}

function renderBitmap(bitmap) {
    const charBytes = [];
    for (var j = 0; j < bitmap.pitch; j++) {
        charBytes[j] = [];
        let i = j;
        let k = 0;
        while (i < bitmap.buffer.length) {
            charBytes[j][k] = bitmap.buffer.readUInt8(i);
            i = i + bitmap.pitch;
            k++;
        }
    }
    return {
        data: charBytes,
        height: bitmap.width,
        width: bitmap.rows,
    };
}

module.exports = class FontConverter {
    constructor(pathFont, charSize = { charWidth: 0, charHeight: 15 * 64, horzResolution: 128, vertResolution: 128 }) {
        if (!pathFont) {
            pathFont = path.join(__dirname,'../fonts/Roboto-Regular.ttf');
        }

        ft.New_Memory_Face(fs.readFileSync(pathFont), 0, face);
        face = face.face;
        ft.Set_Pixel_Sizes(face, 1, 1);
        ft.Set_Char_Size(face, charSize.charWidth, charSize.charHeight, charSize.horzResolution, charSize.vertResolution);
        ft.Set_Transform(face, [0, 1 << 16, -1 << 16, 0], 0);
    }

    convertStringToPixelChars(input) {
        const charCodes = convertStringToCharsInt(input);
        const bitmaps = charCodes.map(function (ch) {
            ft.Load_Char(face, ch, ft.LOAD_DEFAULT);
            ft.Render_Glyph(face.glyph, ft.RENDER_MODE_MONO);
            return face.glyph.bitmap;
        });

        const charBytes = bitmaps.map(renderBitmap);
        return charBytes;
    }
}