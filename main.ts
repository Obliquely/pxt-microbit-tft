let xVelocity = 0
let xPosition = 0
let gravity = 0
let yPosition = 0
let startup = false
let yVelocity = 0
let playSound = 0
basic.forever(() => {
    playSound = 0
    yVelocity = yVelocity + gravity
    if (input.buttonIsPressed(Button.A)) {
        yVelocity = yVelocity - 8
        playSound = 1
    }
    display.fastSpriteAt(xPosition, yPosition, false)
    xPosition = xPosition + xVelocity
    yPosition = yPosition + yVelocity
    display.fastSpriteAt(xPosition, yPosition, true)
    if (yPosition < 0 || yPosition > display.displayHeight() - 400) {
        yPosition = 8 * display.displayScale()
        yVelocity = 0
        lunar.explosion()
    }
    if (playSound == 1) {
        lunar.whiteNoise(75, 200)
    } else {
        basic.pause(75)
    }
})
input.onButtonPressed(Button.B, () => {
    if (startup == true) {
        startup = false
        pins.spiFrequency(4000000)
        display.setupScreen()
        lunar.clickSound(LunarSound.Start1)
    } else {
        serial.writeValue("Reset Game", 0)
        music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
        yPosition = 8 * display.displayScale()
        xPosition = 60 * display.displayScale()
        gravity = 1
        yVelocity = 0
        xVelocity = 0
    }
})
input.onButtonPressed(Button.AB, () => {
    lunar.clickSound(LunarSound.Start1)
    display.setupScreen()
})
music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
startup = true
yPosition = 8 * display.displayScale()
xPosition = 60 * display.displayScale()
gravity = 1
yVelocity = 0
xVelocity = 0
serial.writeLine("Lunar Start Up")
display.drawLine(
    0,
    4064,
    480,
    3680,
    65535
)
display.drawLine(
    480,
    3680,
    960,
    3680,
    65535
)
display.drawLine(
    960,
    3680,
    1440,
    4064,
    65535
)
