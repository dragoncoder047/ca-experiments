class Breeder {
    constructor() {
        this.breeds = {};
    }
    empty() {
        this.breeds = {};
    }
    addBreed(breedName, klass, commands) {
        if (breedName in this.breeds) throw `Breed ${breedName} is already defined.`;
        var fixedCommands = {};
        for (var cs in commands) {
            var commandStr = commands[cs];
            console.log('breeder fixing', commandStr);
            var fixedTicks = [], ticks = commandStr.split(',').map(c => c.trim());
            for (var tick of ticks) {
                var fixedSubticks = [], subticks = tick.split(/\s+/);
                for (var subtick of subticks) {
                    var match = /([a-z]+)(?:\(([^\)]*)\))?/.exec(subtick);
                    if (!match) throw `Malformed sub-command in state ${cs}: ${subtick}`;
                    var commandName = match[1], argument = match[2];
                    if (typeof klass.prototype[`do_${commandName}`] !== 'function') throw `Ant breed ${breedName}: Unknown command '${commandName}' to species ${klass.name} in state ${cs}`;
                    fixedSubticks.push([commandName, argument]);
                }
                fixedTicks.push(fixedSubticks);
            }
            fixedCommands[cs] = fixedTicks;
            console.log('fixed', fixedTicks);
        }
        this.breeds[breedName] = [klass, fixedCommands];
    }
    dumpBreeds() {
        var out = '';
        for (var breed of Object.getOwnPropertyNames(this.breeds)) {
            out += `[${this.breeds[breed][0].constructor.name} ${breed}\n${this.breeds[breed][1].map(c => [c[0], c[1].map(sc => sc.map(cd => cd[1] ? `${cd[0]}(${cd[1]})` : cd[0]).join(' ')).join(',\n    ')]).map(c => `  {${c[0]} =>\n    ${c[1]}\n  }`).join('\n')}\n]\n`;
        }
        return out.trim();
    }
    createAnt(breed, world, x, y, dir, state, antsList) {
        if (!(breed in this.breeds)) throw `Unknown ant breed ${breed}`;
        var klass = this.breeds[breed][0];
        var commands = this.breeds[breed][1];
        return new klass(this, antsList, breed, world, commands, state, x, y, dir);
    }
}


class Ant {
    constructor(breeder, antList, breed, world, commands, initialState, x, y, dir) {
        this.breeder = breeder;
        this.antList = antList;
        this.breed = breed;
        this.ctx = world.ctx;
        this.world = world;
        this.state = initialState;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.commands = commands;
        this.queue = [];
        this.halted = false;
        this.dead = false;
    }
    tick() {
        this.ensureQueueNotEmpty();
        var commands = this.queue.shift();
        for (var [name, arg] of commands) {
            this.halted = false;
            this[`do_${name}`](arg);
        }
    }
    ensureQueueNotEmpty() {
        if (this.queue.length === 0) {
            var what = this.commands[`${this.state}:${this.world.getCell(this.x, this.y)}`] ?? [];
            this.queue.push(...what);
        }
        if (this.queue.length === 0) {
            this.halted = true;
            this.queue.push([]);
        }
    }
    draw() {
        this.ctx.save();
        this.ctx.translate(this.world.cellSize * this.x, this.world.cellSize * this.y);
        this.ctx.scale(this.world.cellSize / 16, this.world.cellSize / 16);
        this.ctx.rotate(Math.PI * this.dir / 2);
        //antennae
        this.ctx.fillStyle = this.world.getColor(this.state);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 0.2;
        this.ctx.beginPath();
        this.ctx.moveTo(-4, -7);
        this.ctx.lineTo(0, -3);
        this.ctx.lineTo(4, -7);
        this.ctx.stroke();
        //3 circles
        this.ctx.beginPath(); this.ctx.arc(0, -3, 2, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(0, 1, 2, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(0, 5, 2, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(0, -3, 2, 0, 2 * Math.PI); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(0, 1, 2, 0, 2 * Math.PI); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(0, 5, 2, 0, 2 * Math.PI); this.ctx.stroke();
        //eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath(); this.ctx.arc(1, -4, 1, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(-1, -4, 1, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(1, -4, 1, 0, 2 * Math.PI); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(-1, -4, 1, 0, 2 * Math.PI); this.ctx.stroke();
        //pupils
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath(); this.ctx.arc(1, -4.5, 0.5, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(-1, -4.5, 0.5, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.restore();
    }
    numarg(arg, methodname) {
        arg = arg ?? 1;
        var argNum = parseInt(arg);
        if (isNaN(argNum)) throw `${methodname}(): ${arg} is not a number`;
        return argNum;
    }
    do_state(arg) {
        if (!arg) throw 'state(): which state?';
        var argNum = this.numarg(arg, 'state');
        this.state = argNum;
    }
    do_fd(arg) {
        var argNum = this.numarg(arg, 'fd');
        switch (this.dir) {
            case 0: // N
                this.y -= argNum;
                break;
            case 1: // E
                this.x += argNum;
                break;
            case 2: // S
                this.y += argNum;
                break;
            case 3: // W
                this.x -= argNum;
                break;
        }
    }
    do_rt(arg) {
        var argNum = this.numarg(arg, 'rt');
        this.dir = (this.dir + argNum) % 4;
    }
    do_lt(arg) {
        var argNum = this.numarg(arg, 'lt');
        this.do_rt(4 - argNum);
    }
    do_dir(arg) {
        var argNum = this.numarg(arg, 'dir');
        if (argNum > 3 || argNum < 0) throw `dir(): dir out of range`;
        this.dir = argNum;
    }
    do_bk(arg) {
        var argNum = this.numarg(arg, 'bk');
        this.do_rt(2);
        this.do_fd(argNum);
        this.do_rt(2);
    }
    do_put(arg) {
        var argNum = this.numarg(arg, 'put');
        this.world.setCell(this.x, this.y, argNum);
    }
    do_spawn(arg) {
        var [breed, dir, state] = arg.split(':');
        if (!breed) throw `spawn(): what breed?`;
        if (!dir) throw `spawn(): what direction?`;
        if (!/^[0-3]$/.test(dir)) throw `spawn(): invalid direction: ${dir}`;
        if (state && !/^\d+$/.test(state)) throw `spawn(): invalid state: ${state}`;
        dir = parseInt(dir);
        state = parseInt(state ?? 1);
        this.antList.push(this.breeder.createAnt(breed, this.world, this.x, this.y, (dir + this.dir) % 4, state, this.antList));
    }
    do_die(arg) {
        if (arg) throw `die() takes no argument`;
        this.dead = true;
    }
}
