// TODO: A lot of clearnUp and add documentation and tidy up the things

class Chip8 {
    constructor(program) {
        this.v = new Array(16);
        this.draw = false;
        this.PC = null;
        this.I = null;
        this.program = program;
        this.StackPointer = null;
        this.keys = new Array(16);
        this.stack = new Array(16);
        this.gfx = new Array(64 * 32);
        this.RAM = new Uint8Array(new ArrayBuffer(0x1000));

        this.delayCounter = null;
        this.soundCounter = null;

        this.fontset = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80 // F
        ];
    }

    Init() {
        for(let i = 0; i < this.gfx.length; i++)
        {
            this.gfx[i] = 0;
        }

        for(let i = 0; i < 16; i++)
        {
            this.keys[i] = 0;
            this.stack[i] = 0;
            this.v[i] = 0;
        }

        for(let i = 0; i < this.RAM.length; i++)
        {
            this.RAM[i] = 0;
        }
        
        for(let i = 0; i < this.fontset.length; i++)
        {
            this.RAM[i] = this.fontset[i];
        }

        this.StackPointer = 0;
        this.I = 0;
        this.delayCounter = 0;
        this.soundCounter = 0;
        this.PC = 0x200;
    }

    load()
    {
        this.Init();
        for(let i = 0; i < this.program.length; i++)
        {
            this.RAM[i + 0x200] = this.program[i];
        }
    }

    setpixel(x, y) {
        var location;
        // If the pixel exceeds the dimensions,
        // wrap it back around.
        if (x > 64) {
            x -= 64;
        } else if (x < 0) {
            x += 64;
        }

        if (y > 32) {
            y -= 32;
        } else if (y < 0) {
            y += 32;
        }

        location = x + (y * 64);

        this.gfx[location] ^= 1;

        return !this.gfx[location];

    }

    run_cycle()
    {
        var opcode = this.RAM[this.PC] << 8 | this.RAM[this.PC + 1];
        var x = (opcode & 0x0F00) >> 8;
        var y = (opcode & 0x00F0) >> 4;

        var PrevOp = this.PC;
        this.PC += 2;

        switch(opcode & 0xF000)
        {
            case 0x0000:
                switch(opcode) {
                    case 0x00E0:
                        background(220);
                        for(let i = 0; i < this.gfx.length; i++)
                            this.gfx[i] = 0;
                        //this.draw = true;
                        break;
                    
                    case 0x00EE:
                        this.PC = this.stack[--this.StackPointer];
                        break;
                    default:
                        console.log("invalid opcode + ", opcode);
                }

                break;

            case 0x1000:
                this.PC = opcode & 0xFFF;
                break;

            case 0x2000:
                this.stack[this.StackPointer] = this.PC;
                this.StackPointer++;
                this.PC = opcode & 0x0FFF;
                break;
            
            case 0x3000:
                if(this.v[x] === (opcode & 0xFF)) {
                    this.PC += 2;
                }
                break;

            case 0x4000:
                if(this.v[x] != (opcode & 0x00FF)) {
                    this.PC += 2;
                }
                break;

            case 0x5000:
                if(this.v[x] === this.v[y])
                    this.PC += 2;
                break;
            case 0x6000:
                this.v[x] = opcode & 0xFF;
                break;

            case 0x7000:
                var val = (opcode & 0xFF) + this.v[x];
                if(val > 255)
                    val -= 256;
                
                this.v[x] = val;
                break;

            case 0x8000:
                switch(opcode & 0x000F)
                {
                    case 0x0000:
                        this.v[x] = this.v[y];
                        break;
                    
                    case 0x0001:
                        this.v[x] |= this.v[y];
                        break;

                    case 0x0002:
                        this.v[x] &= this.v[y];
                        break;

                    case 0x0003:
                        this.v[x] ^= this.v[y];
                        break;
                    
                    case 0x0004:
                        this.v[x] += this.v[y];
                        this.v[0xF] = +(this.v[x] > 255);
                        if (this.v[x] > 255)
                            this.v[x] -= 256;
                        break;

                    case 0x0005:
                        this.v[0xF] = +(this.v[x] > this.v[y]);
                        this.v[x] -= this.v[y];
                        if(this.v[x] < 0)
                            this.v[x] += 256;
                        break;

                    case 0x0006:
                        this.v[0xF] = this.v[x] & 0x1;
                        this.v[x] >>= 1;
                        break;

                    case 0x0007:
                        this.v[0xF] = +(this.v[y] > this.v[x]);
                        this.v[x] = this.v[y] - this.v[x];
                        if(this.v[x] < 0)
                            this.v[x] += 256;
                        break;

                    case 0x000E:
                        this.v[0xF] = +(this.v[x] & 0x80);
                        this.v[x] <<= 1;
                        if (this.v[x] > 255) {
                            this.v[x] -= 256;
                        }
                        break;
                    default:
                        console.log("invalid opcode + ", opcode);
                }

                break;

            case 0x9000:
                if(this.v[x] != this.v[y])
                    this.PC += 2;
                break;

            case 0xA000:
                this.I = opcode & 0xFFF;
                break;
            
            case 0xB000:
                this.PC = (opcode & 0xFFF) + this.v[0];
                break;
                
            case 0xC000:
                this.v[x] = Math.floor(Math.random() * 0xFF) & (opcode & 0xFF);
                break;

            case 0xD000:
                this.v[0xF] = 0;
                var Height = opcode & 0x000F;
                var regx = this.v[x];
                var regy = this.v[y];

                var spr;
                for(let i = 0; i < Height; i++)
                {
                    spr = this.RAM[this.I + i];
                    for(let j = 0; j < 8; j++)
                    {
                        if((spr & 0x80) > 0)
                        {
                            if(this.setpixel(regx + j, regy + i))
                                this.v[0xF] = 1;
                        }
                        
                        spr <<= 1;
                    }
                }
                this.draw = true;
                break;

            case 0xE000:
                switch(opcode & 0x00FF)
                {
                    case 0x009E:
                        if(this.keys[this.v[x]])
                            this.PC += 2;
                        break;

                    case 0x00A1:
                        if(!this.keys[this.v[x]])
                            this.PC += 2;
                        break;
                    default:
                        console.log("invalid opcode + ", opcode);
                        break;
                }

                break;

            case 0xF000:
                switch(opcode & 0x00FF) {
                    case 0x0007:
                        this.v[x] = this.delayCounter;
                        break;

                    case 0x000A:
                        var is_pressed = false;
                        for(let i = 0; i < this.keys.length; i++)
                        {
                            if(this.keys[i] != 0)
                            {
                                this.v[x] = i;
                                is_pressed = true;
                            }
                        }

                        if(!is_pressed)
                        {
                            this.PC = PrevOp;
                        }
                        break;

                    case 0x0015:
                        this.delayCounter = this.v[x];
                        break;

                    case 0x0018:
                        this.soundCounter = this.v[x];
                        break;

                    case 0x001E:
                        this.I += this.v[x];
                        break;

                    case 0x0029:
                        this.I = this.v[x] * 5;
                        break;

                    case 0x0033:
                        var number = this.v[x];
                        for (let i = 3; i > 0; i--) {
                            this.RAM[this.I + i - 1] = parseInt(number % 10);
                            number /= 10;
                        }
                        break;
                    
                    case 0x0055:
                        for(let i = 0; i <= x; i++)
                        {
                            this.RAM[this.I + i] = this.v[this.I];
                        }

                        //this.I += x + 1;
                        break;

                    case 0x0065:
                        for(let i = 0; i <= x; i++)
                        {
                            this.v[i] = this.RAM[this.I + i];
                        }
                        //this.I += x + 1;
                        break;
                    default:
                        console.log("invalid opcode + ", opcode);
            }
            break

        default:
            console.log("Unknown Opcode " + opcode);
            break;
    }
    if(this.delayCounter > 0)
        this.delayCounter--;

    if(this.soundCounter > 0) {
        if(this.soundCounter == 1)
            beepsound.play();
        this.soundCounter--;
    }
}

    reset() {
        this.load();
    }

    ChangeRom(program) {
        this.program = program;
        this.reset();
    }
}