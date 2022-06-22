class Ant {
    constructor(breed, world, commands, initialState = 1, x = 0, y = 0, dir = 0) {
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
        this.fixupCommands();
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
    fixupCommands() {
        for (var cs in this.commands) {
            var commandStr = this.commands[cs];
            var fixedTicks = [], ticks = commandStr.split(',').map(c => c.trim());
            for (var tick of ticks) {
                var fixedSubticks = [], subticks = tick.split(/\s+/);
                for (var subtick of subticks) {
                    var match = /([a-z]+)(?:\(([^\)]*)\))?/.exec(subtick);
                    if (!match) throw `Malformed sub-command in state ${cs}: ${subtick}`;
                    var commandName = match[1], argument = match[2];
                    if (typeof this[`do_${commandName}`] !== 'function') throw `Ant breed ${this.name} Unknown command '${commandName}' to species ${this.constructor.name} in state ${cs}`;
                    fixedSubticks.push([commandName, argument]);
                }
                fixedTicks.push(fixedSubticks);
            }
            this.commands[cs] = fixedTicks;
        }
    }
    dumpBreed() {
        return `[${this.constructor.name} ${this.breed}\n${this.commands.map(c => [c[0], c[1].map(sc => sc.map(cd => cd[1] ? `${cd[0]}(${cd[1]})` : cd[0]).join(' ')).join(',\n    ')]).map(c => `  {${c[0]} =>\n    ${c[1]}\n  }`).join('\n')}\n]`;
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
        this.ctx.beginPath(); this.ctx.arc(0,  1, 2, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(0,  5, 2, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(0, -3, 2, 0, 2 * Math.PI); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(0,  1, 2, 0, 2 * Math.PI); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(0,  5, 2, 0, 2 * Math.PI); this.ctx.stroke();
        //eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath(); this.ctx.arc( 1, -4, 1, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(-1, -4, 1, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc( 1, -4, 1, 0, 2 * Math.PI); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(-1, -4, 1, 0, 2 * Math.PI); this.ctx.stroke();
        //pupils
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath(); this.ctx.arc( 1, -4.5, 0.5, 0, 2 * Math.PI); this.ctx.fill();
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
}
class Beatle extends Ant { }

class Turmite extends Ant { }