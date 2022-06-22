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
    bbox(ants) {
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, got = false;
        for (var cell of Object.getOwnPropertyNames(this.cells)) {
            var [x, y] = cell.split(',');
            x = parseInt(x); y = parseInt(y);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            got = true;
        }
        for (var ant of ants) {
            minX = Math.min(minX, ant.x); maxX = Math.max(maxX, ant.x);
            minY = Math.min(minY, ant.y); maxY = Math.max(maxY, ant.y);
            got = true;
        }
        if (!got) return { tl: [0, 0], br: [0, 0] };
        return { tl: [minX, minY], br: [maxX, maxY] };
    }
}