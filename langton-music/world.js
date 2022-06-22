class World {
    constructor(ctx, cellSize = 16, colors = {}) {
        this.cells = {};
        this.cellSize = cellSize;
        this.ctx = ctx;
        this.stateColors = colors;
    }
    draw() {
        for (var cell in this.cells) {
            var [x, y] = cell.split(',');
            this.drawCell(parseInt(x), parseInt(y), this.getColor(this.cells[cell]));
        }
    }
    drawCell(x, y, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.translate(x * this.cellSize, y * this.cellSize);
        this.ctx.fillRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize);
        this.ctx.restore();
    }
    getColor(state) {
        if (!(state in this.stateColors))
            this.stateColors[state] = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        return this.stateColors[state];
    }
    getCell(x, y) {
        return this.cells[`${x},${y}`] ?? 0;
    }
    setCell(x, y, state) {
        var coords = `${x},${y}`;
        if (state === 0) delete this.cells[coords];
        else this.cells[coords] = state;
    }
    clear() {
        this.cells = {};
    }
}