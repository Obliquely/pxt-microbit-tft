
/**
 * Custom functions and blocks for interfacing with TFT display
 * and supporting the Lunar Lander game.
 *
 * For documentation on the AdaFruit 1.44" TFT display
 * see: https://learn.adafruit.com/adafruit-1-44-color-tft-with-micro-sd-socket
 *
 * The code to drive the display has been adapted from the code provided (in C++)
 * by AdaFruit. 
 *
 * For syntax that makes functions and enums available in the blocks editor
 * see https://makecode.microbit.org/blocks/custom
 */

// TFT display commands
// Only the commands actually used are included here. See the ST7735R
// data sheet for the full set of commands.
enum TftCom {
    //% block = "NOOP" NOOP
    NOOP = 0x00,

    //% block="SWRESET" Software Reset
    SWRESET = 0x01,

    //% block="SLPOUT"  Sleep Out
    SLPOUT = 0x11,

    //% block="NORON"  Normal Display Mode On (no parameters)
    NORON = 0x13,

    //% block="INVOFF"  Display Inversion Off (0)
    INVOFF = 0x20,

    //% block="DISPON" Display On (no parameters)
    DISPON = 0x29,

    //% block="CASET"   Column Address Set
    CASET = 0x2A,

    //% block="RASET"   Row Address Set
    RASET = 0x2B,

    //% block="RAMWR" Memory Write
    RAMWR = 0x2C,

    //% block="MADCTL" Memory Data Access Control (1)
    MADCTL = 0x36,

    //% block="COLMOD" Interface Pixel Format (1)
    COLMOD = 0x3A,
    //% block="GMCTRP1" Gamma (+polarity) Corr'n Characteristics Setting (16)

    //% block="FRMCTR1" Frame Rate Control (in normal mode / full colours) (3)
    FRMCTR1 = 0xB1,
    //% block="FRMCTR2" Frame Rate Control (in idle mode / 8 colours) (3)     
    FRMCTR2 = 0xB2,
    //% block="FRMCTR3" Frame Rate Control (In Partial mode/ full colours) (3)
    FRMCTR3 = 0xB3,

    //% block="INVCTR"  Display Inversion Control (1)
    INVCTR = 0xB4,
    //% block="PWCTR1"  Power Control 1 (3)

    PWCTR1 = 0xC0,
    //% block="PWCTR2"  Power Control 2 (1)
    PWCTR2 = 0xC1,
    //% block="PWCTR3"  Power Control 3 (2)
    PWCTR3 = 0xC2,
    //% block="PWCTR4"  Power Control 4 (2)
    PWCTR4 = 0xC3,
    //% block="PWCTR5"  Power Control 5 (2)
    PWCTR5 = 0xC4,
    //% block="VMCTR1" VCOM Control 1 (VCOM voltage setting) (1)
    VMCTR1 = 0xC5,

    GMCTRP1 = 0xE0,
    //% block="GMCTRN1" Gamma (-polarity) Corr'n Characteristics Setting (16)
    GMCTRN1 = 0xE1,

    //% block="DELAY"
    DELAY = 0xFFFF
}


// Canned sound options (for game sound effects and debugging / startup
enum LunarSound {
    //% block="Start1"  First sound on startup sequence
    Start1,
    //% block="Start2"  Second sound on startup sequence
    Start2,
    //% block="MainBooster"  Firing main enginge
    MainBooster,
    //% block="Crash"  Crash
    Crash,
    //% block="Landing"  Successful Landing
    Landing,
    //% block="Original"  First Test Phrase
    Default
}


/**
 * Custom blocks
 */
//% weight=100 color=#0fbc51 icon=""
namespace lunar {

    /** 
        * whiteNoise(duration: number, pitch: number)
        * Make white noise for about duration milliseconds.
        * The pitch value has (some) influence on the pitch.
        */
    //% block
    export function whiteNoise(duration: number, pitch: number) {

        let total = 0
        duration = duration * 1000

        while (total < duration) {
            pins.digitalWritePin(DigitalPin.P0, 0)
            let wait = pitch + Math.random(500)
            total = total + wait
            control.waitMicros(wait)
            pins.digitalWritePin(DigitalPin.P0, 1)
        }
    }

    /** 
    * explosion()
    * Explosion sound lasting 1000 milliseconds
    */
    //% block
    export function explosion() {

        let total = 0
        let duration = 1000 * 1000
        let baseWait = 1000

        while (total < duration) {
            pins.digitalWritePin(DigitalPin.P0, 0)
            let wait = baseWait + Math.random(3000)
            total = total + wait
            control.waitMicros(wait)
            pins.digitalWritePin(DigitalPin.P0, 1)
            if (baseWait > 200) {
                baseWait = baseWait - 50
            }
        }
    }



    /** 
    * Play a brief sound so we know the button has been pressed.
    */
    //% block
    export function clickSound(sound: LunarSound) {

        if (sound == LunarSound.Default) {
            music.setTempo(180)
            music.playTone(262, music.beat(BeatFraction.Whole))
            music.rest(music.beat(BeatFraction.Quarter))
            return
        }

        if (sound == LunarSound.MainBooster) {
            for (let i = 0; i < 500; i++) {
                pins.digitalWritePin(DigitalPin.P0, 0)
                control.waitMicros(200 + Math.random(501))
                pins.digitalWritePin(DigitalPin.P0, 1)
            }
        }

        if (sound == LunarSound.Start1) {
            music.setTempo(180)
            music.playTone(262, music.beat(BeatFraction.Whole))
            music.rest(music.beat(BeatFraction.Quarter))
            return
        }

        if (sound == LunarSound.Start2) {
            music.setTempo(180)
            music.playTone(392, music.beat(BeatFraction.Whole))
            music.rest(music.beat(BeatFraction.Quarter))
        }
    }

}

/** 
 * Code for interfacing with the TFT
 * API
 * setupDisplay()
 * drawPixel(x: number, y: number, colour: number)
 * 
 * 
 */
namespace display {

    //% block
    export function displayScale(): number {
        return 32
    }

    /*
     * The display width in 'working coordinates'. These are pixel values * displayScale()
    */
    //% block
    export function displayWidth(): number {
        return 128 * displayScale()
    }

    /**
     * The display height in 'working coordinates'. These are pixel values * displayScale()
     */
    //% block
    export function displayHeight(): number {
        return 128 * displayScale()
    }


    /**
     * Convert a working coordinate to an actual pixel coordinate.
    *  Don't expose this in final code. It should be internal.
    */
    //% block
    export function roundedPixel(value: number): number {
        let adjusted = value / displayScale();
        adjusted = adjusted + (value & (displayScale() - 1) ? 1 : 0)
        return adjusted;
    }


    /**
    * Draw a single pixel of a given colour
    */
    //% block 
    export function drawPixel(x: number, y: number, colour: number) {
        if (outOfBounds(x, y)) {
            return
        }

        setAddrWindow(x, y, x + 1, y + 1);
        // send data (16 bits in two bytes)
        tftCom(TftCom.RAMWR, [colour >> 8, colour])
    }


    function outOfBounds(v1: number, v2 = 0, v3 = 0, v4 = 0): boolean {
        if (v1 < 0 || v1 > 127) {
            return true
        }
        if (v2 < 0 || v2 > 127) {
            return true
        }
        if (v3 < 0 || v3 > 127) {
            return true
        }
        if (v4 < 0 || v4 > 127) {
            return true
        }
        return false
    }

    /**
     * Draw a line of a given colour
     */
    //% block
    export function drawLine(x0: number, y0: number, x1: number, y1: number, colour: number) {
        let xDelta = x1 - x0
        let yDelta = y1 - y0

        serial.writeLine("drawLine xDelta = " + xDelta + " yDelta = " + yDelta)

        if (Math.abs(yDelta) > Math.abs(xDelta)) {
            let ySteps = Math.abs(yDelta / displayScale())
            let xIncrement = xDelta == 0 ? 0 : xDelta / ySteps
            let yIncrement = yDelta > 0 ? displayScale() : -1 * displayScale()

            let x = x0
            let y = y0;
            for (let steps = 0; steps <= ySteps; steps++) {
                drawPixel(roundedPixel(x), roundedPixel(y), colour)
                x = x + xIncrement
                y = y + yIncrement
            }
            return
        }

        let xSteps = Math.abs(xDelta / displayScale())
        let yIncrement = yDelta == 0 ? 0 : yDelta / xSteps;
        let xIncrement = xDelta > 0 ? displayScale() : -1 * displayScale()

        let y = y0;
        let x = x0
        for (let steps = 0; steps <= xSteps; steps++) {
            drawPixel(roundedPixel(x), roundedPixel(y), colour)
            y = y + yIncrement
            x = x + xIncrement
        }
    }

    /**
    * Set the address window
    */
    //% block
    export function setAddrWindow(x0: number, y0: number, x1: number, y1: number) {

        if (outOfBounds(x0, y0, x1, y1)) {
            return
        }
        // set the column
        tftCom(TftCom.CASET, [0x00, x0 + 2, 0x00, x1 + 2])  // 2 is an adjust for thr AdaFruit 1.44 display
        // set the row 
        tftCom(TftCom.RASET, [0x00, y0 + 3, 0x00, y1 + 3])   // 3 is an adjust for thr AdaFruit 1.44 display
    }


    /**
     * Fill a rectangle with a given colour
     */
    //%block
    export function fillRect(x: number, y: number, width: number, height: number, colour: number) {

        if (outOfBounds(x, y)) {
            return;
        }

        if ((x + width) > 128) {
            width = 128 - x;
        }

        if ((y + height) > 128) {
            height = 128 - y;
        }

        let hiColour = (colour >> 8) % 256;
        let loColour = colour % 256;

        setAddrWindow(x, y, x + width - 1, y + height - 1);

        // we are going to manually implement the RAMWR command here because
        // we have custom parameters. See comments in tftCom for details
        // of what's going on here.
        pins.digitalWritePin(DigitalPin.P1, 0);     // command/data = command
        pins.digitalWritePin(DigitalPin.P16, 0);    // select the TFT as SPI target
        pins.spiWrite(TftCom.RAMWR);
        pins.digitalWritePin(DigitalPin.P1, 1); // command/data = data

        for (let indexY = height; indexY > 0; indexY--) {
            for (let indexX = width; indexX > 0; indexX--) {
                pins.spiWrite(hiColour)
                pins.spiWrite(loColour)
            }
        }

        pins.digitalWritePin(DigitalPin.P16, 1)     // de-elect the TFT as SPI target
        pins.digitalWritePin(DigitalPin.P1, 0)      // command/data = command
    }


    /**
        * Write a command to the TFT display
        */
    //% block
    export function tftCom(command: TftCom, params: Array<number>) {

        // handle the pseudo 'DELAY' command - provides a delay in milliseconds
        if (command == TftCom.DELAY) {
            let waitTime: number = 500
            if (params.length == 1) {
                waitTime = params[0]
            }
            basic.pause(waitTime)
            return
        }

        // let the TFT know we're sending a command (rather than data)
        pins.digitalWritePin(DigitalPin.P1, 0) // command/data = command
        // select the TFT controller
        pins.digitalWritePin(DigitalPin.P16, 0) // select the TFT as SPI target

        pins.spiWrite(command)

        // let the TFT know we're sending data bytes (rather than a command)
        pins.digitalWritePin(DigitalPin.P1, 1) // command/data = data

        for (let dataItem of params) {
            pins.spiWrite(dataItem)
        }

        // de-select the TFT controller
        pins.digitalWritePin(DigitalPin.P16, 1) // de-elect the TFT as SPI target

        // restore pin to zero (for tidiness - not required)
        pins.digitalWritePin(DigitalPin.P1, 0) // command/data = command
    }

    /**
    * Setup and clear screen ready for used
    */
    //% block
    export function setupScreen() {
        tftSetup()

        fillRect(
            0,
            0,
            128,
            128,
            0
        )
    }


    /**
     * Do initial set up for display. (Required before any drawing begins.)
     */
    //% block 
    function tftSetup() {

        // General Setup (for various display types)

        // 1. Software Reset
        tftCom(TftCom.SWRESET, [])
        tftCom(TftCom.DELAY, [150])     // we need ot wait at least 120ms

        // 2. Exit Sleep Mode
        tftCom(TftCom.SLPOUT, [])
        tftCom(TftCom.DELAY, [150])     // we need to wait at least 120ms

        // 3. Frame rate ctrl - normal mode
        tftCom(TftCom.FRMCTR1, [0x01, 0x2C, 0x2D])

        // 4. Frame rate ctrl - idle mode 
        tftCom(TftCom.FRMCTR2, [0x01, 0x2C, 0x2D])

        // 5. Frame rate ctrl - dot inversion mode
        tftCom(TftCom.FRMCTR3, [0x01, 0x2C, 0x2D, 0x01, 0x2C, 0x2D])

        // 6. Display inversion ctrl - no inversion
        tftCom(TftCom.INVCTR, [0x07])

        // 7. Power Control -4.6v, Auto Mode
        tftCom(TftCom.PWCTR1, [0xA2, 0x02, 0x84])

        // 8. Power control,VGH25 = 2.4C VGSEL = -10 VGH = 3 * AVDD
        tftCom(TftCom.PWCTR2, [0xC5])

        //  9: Power control, Opamp current small + Boost Frequency
        tftCom(TftCom.PWCTR3, [0x0A, 0x00])

        // 10: Power control, BCLK/2, Opamp current small & Medium low
        tftCom(TftCom.PWCTR4, [0x8A, 0x2A])

        // 11: Power control
        tftCom(TftCom.PWCTR5, [0x8A, 0xEE])

        // 12: Power control
        tftCom(TftCom.VMCTR1, [0x0E])

        // 13. Don't invert display
        tftCom(TftCom.INVOFF, [])

        // 14: Memory access control (directions)
        tftCom(TftCom.MADCTL, [0xC8])

        // 15: set color mode, 16-bit colour
        tftCom(TftCom.COLMOD, [0x05])

        // 1.44 display specific set up
        tftCom(TftCom.CASET, [0x00, 0x00, 0x00, 0x7F])
        tftCom(TftCom.RASET, [0x00, 0x00, 0x00, 0x7F])

        // Further General Setup (for various display types)

        //1: Gamma Correction (magic numbers direct from AdaFruit code)
        tftCom(TftCom.GMCTRP1, [0x02, 0x1c, 0x07, 0x12, 0x37, 0x32, 0x29, 0x2d, 0x29, 0x25, 0x2B, 0x39, 0x00, 0x01, 0x03, 0x10])

        //2: Gamma Correction (magic numbers direct from AdaFruit code)
        tftCom(TftCom.GMCTRN1, [0x03, 0x1d, 0x07, 0x06, 0x2E, 0x2C, 0x29, 0x2D, 0x2E, 0x2E, 0x37, 0x3F, 0x00, 0x00, 0x02, 0x10])

        // 3: Normal Display On
        tftCom(TftCom.NORON, [])
        tftCom(TftCom.DELAY, [10])

        // 4: Main screen turn on
        tftCom(TftCom.DISPON, [])
        tftCom(TftCom.DELAY, [100])
    }


    /**
    * Set display a spriteAt
    */
    //% block
    export function fastSpriteAt(x: number, y: number, state: boolean) {

        x = roundedPixel(x)
        y = roundedPixel(y)

        if (outOfBounds(x, y)) {
            return
        }

        let hiSpriteColour = (0xF800 >> 8) & 255;
        let loSpriteColour = 0xF800 & 255;

        let spritePattern = [
            false, false, true, true, false, false,
            false, true, false, false, true, false,
            false, true, false, false, true, false,
            false, false, true, true, false, false,
            false, true, false, false, true, false,
            true, false, false, false, false, true,
            true, false, false, false, false, true
        ];

        setAddrWindow(x, y, x + 5, y + 6)
        // we are going to manually implement the RAMWR command here because
        // we have custom parameters. See comments in tftCom for details
        // of what's going on here.
        pins.digitalWritePin(DigitalPin.P1, 0);     // command/data = command
        pins.digitalWritePin(DigitalPin.P16, 0);    // select the TFT as SPI target
        pins.spiWrite(TftCom.RAMWR);
        pins.digitalWritePin(DigitalPin.P1, 1);     // command/data = data

        for (let pixelOn of spritePattern) {

            if (pixelOn && state) {
                pins.spiWrite(hiSpriteColour)
                pins.spiWrite(loSpriteColour)
            }
            else {
                pins.spiWrite(0)
                pins.spiWrite(0)
            }
        }

        pins.digitalWritePin(DigitalPin.P16, 1) // de-elect the TFT as SPI target
        pins.digitalWritePin(DigitalPin.P1, 0); // command/data = command
    }
}
