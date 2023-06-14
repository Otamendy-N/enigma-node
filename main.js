class Keyboard {
    alphabet = [];
    constructor(alphabet) {
        this.alphabet = [...alphabet]
    }
    forward(letter = "") {
        let signal = this.alphabet.findIndex(c => c === letter)
        return signal;
    }

    backward(signal = 0) {
        let letter = this.alphabet[signal]
        return letter;
    }
}

class Plugboard {
    left = []
    right = []
    constructor(alphabet, pairs) {
        this.left = [...alphabet]
        this.right = [...alphabet]
        for (let i = 0; i < pairs.length; i++) {
            let a = pairs[i][0]
            let b = pairs[i][1]
            let positionA = this.left.findIndex(x => x === a)
            let positionB = this.left.findIndex(x => x === b)
            this.left[positionA] = b
            this.left[positionB] = a
        }
    }

    forward(signal) {
        let letter = this.right[signal]
        let newSignal = this.left.findIndex(x => x === letter);
        return newSignal;
    }

    backward(signal) {
        let letter = this.left[signal]
        let newSignal = this.right.findIndex(x => x === letter);
        return newSignal;
    }
}

class Reflector {
    left = []
    right = []
    configurations = {
        A: [..."EJMZALYXVBWFCRQUONTSPIKHGD "],
        B: [..."YRUHQSLDPXNGOKMIEBFZCWVJAT "],
        C: [..."FVPJIAOYEDRZXWGCTKUQSBNMHL "],
    }

    constructor(alphabet, wiringType = "A") {
        this.left = alphabet
        this.right = this.configurations[wiringType]
    }

    reflect(signal) {
        let letter = this.right[signal]
        let newSignal = this.left.findIndex(x => x === letter)
        return newSignal
    }
}

class Rotor {
    left = []
    right = []
    alphabet = []
    configurations = {
        I: { wiring: [..."EKMFLGDQVZNTOWYHXUSPAIBRCJ "], notch: "Q" },
        II: { wiring: [..."AJDKSIRUXBLHWTMCQGZNPYFVOE "], notch: "E" },
        III: { wiring: [..."BDFHJLCPRTXVZNYEIWGAKMUSQO "], notch: "V" },
        IV: { wiring: [..."ESOVPZJAYQUIRHXLNFTGKDCMWB "], notch: "J" },
        V: { wiring: [..."VZBRGITYUPSDNHLXAWMJQOFECK "], notch: "Z" },
    }
    constructor(alphabet, wiringType = "I") {
        this.left = [...alphabet]
        this.alphabet = [...alphabet]
        this.right = this.configurations[wiringType].wiring
        this.notch = this.configurations[wiringType].notch
    }

    forward(signal) {
        let letter = this.right[signal]
        let newSignal = this.left.findIndex(x => x === letter)
        return newSignal
    }
    backward(signal) {
        let letter = this.left[signal]
        let newSignal = this.right.findIndex(x => x === letter)
        return newSignal
    }
    show() {
        let table = this.left.map((char, i) => ({ left: char, right: this.right[i] }))
        console.table(table)
    }
    rotate() {
        let firstLeft = this.left.shift()
        this.left.push(firstLeft)

        let firstRight = this.right.shift()
        this.right.push(firstRight)
    }
    rotateToLetter(char) {
        let desiredLetterIndex = this.left.findIndex(x => x === char)
        for (let i = 0; i < desiredLetterIndex; i++) {
            this.rotate()
        }
    }
    rotateRing(n = 1){
        for (let i = 0; i < (n - 1); i++) {
            this.rotateBackwards()
        }

        let notchIndex = this.alphabet.findIndex(x => x === this.notch)
        this.notch =this.alphabet[Math.abs((notchIndex - n) % this.alphabet.length)]
    }
    rotateBackwards() {
        let firstLeft = this.left.pop()
        this.left.unshift(firstLeft)

        let firstRight = this.right.pop()
        this.right.unshift(firstRight)
    }
}

class EnigmaMachine {
    alphabet
    keyboard
    plugboard
    rotor1
    rotor2
    rotor3
    reflector

    constructor(alphabet, config) {
        this.alphabet = [...alphabet]
        this.keyboard = new Keyboard([...alphabet])
        this.plugboard = new Plugboard([...alphabet], config.pairs)

        this.rotor1 = new Rotor([...alphabet], config.rotors[0])
        this.rotor2 = new Rotor([...alphabet], config.rotors[1])
        this.rotor3 = new Rotor([...alphabet], config.rotors[2])

        this.reflector = new Reflector([...alphabet], config.reflectorType)
        this.setRings(config.rings)
    }

    setKey(key = "AAA") {
        this.rotor1.rotateToLetter(key[0])
        this.rotor2.rotateToLetter(key[1])
        this.rotor3.rotateToLetter(key[2])
    }
    getKey() {
        return this.rotor1.left[0] + this.rotor2.left[0] + this.rotor3.left[0]
    }

    setRings(rings) {
        this.rotor1.rotateRing(rings[0])
        this.rotor2.rotateRing(rings[1])
        this.rotor3.rotateRing(rings[2])
    }

    encrypt(letter) {
        this.rotateRotors()


        let signal = this.keyboard.forward(letter)
        signal = this.plugboard.forward(signal)
        signal = this.rotor3.forward(signal)
        signal = this.rotor2.forward(signal)
        signal = this.rotor1.forward(signal)
        signal = this.reflector.reflect(signal)
        signal = this.rotor1.backward(signal)
        signal = this.rotor2.backward(signal)
        signal = this.rotor3.backward(signal)
        signal = this.plugboard.backward(signal)


        return this.keyboard.backward(signal)
    }

    rotateRotors() {
        let shouldAllRotate =
            (this.rotor2.left[0] === this.rotor2.notch
                && this.rotor3.left[0] === this.rotor3.notch)
        if (shouldAllRotate) {
            this.rotor1.rotate()
            this.rotor2.rotate()
            this.rotor3.rotate()
        } else if (this.rotor2.left[0] === this.rotor2.notch) {
            this.rotor1.rotate()
            this.rotor2.rotate()
            this.rotor3.rotate()
        } else if (this.rotor3.left[0] === this.rotor3.notch) {
            this.rotor2.rotate()
            this.rotor3.rotate()
        } else {
            this.rotor3.rotate()
        }
    }
}

const log = console.log;
const alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ "]

const myConfigurations = {
    rotors: ["I", "II", "III"],
    reflectorType: "B",
    pairs: ["AR", "GK", "OX"],
    rings: [5, 2, 13]
}
const myEnigma = new EnigmaMachine(alphabet, myConfigurations)
myEnigma.setKey("DOG")

const cypherText = [..."ESTO FUNCAAAAA PARECE QUE SE MUERE SI CAMBIAS UN POQUITO EL RING"].map(char => myEnigma.encrypt(char)).join("")
log(cypherText)

// ---------------------------------------

const othersConfigurations = {
    rotors: ["II", "I", "III"],
    reflectorType: "B",
    pairs: ["AR", "GK", "OX"],
    rings: [5, 21, 4]
}
const othersEnigma = new EnigmaMachine(alphabet, othersConfigurations)
othersEnigma.setKey("DOG")


const decypherText = [...cypherText].map(char => othersEnigma.encrypt(char)).join("")
log(decypherText)






