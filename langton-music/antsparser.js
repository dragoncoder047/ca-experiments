function loadWorld(text, antSpecies, world, breeder) {
    text = text.replaceAll(/%%.*?$/gm, '');
    var header = {};
    while (true) {
        match = /^([a-z]+?)\s*:\s*(.+?)(?:;|(?=\[))/is.exec(text.trim()); //jshint ignore:line
        if (!match) break;
        text = text.slice(match[0].length);
        var key = match[1], value = match[2];
        console.log('header entry: ', key, value);
        header[key] = value;
    }
    breeder.empty();
    var foundAntBreeds = 0;
    var match, i;
    while (true) {
        text = text.trim();
        match = /^\[([a-z]+)\s+([a-z]+)\s+(.+?)\]/is.exec(text); //jshint ignore:line
        if (!match) break;
        text = text.slice(match[0].length);
        var species = match[1], breed = match[2], commands = match[3];
        console.log('ant breed: ', species, breed);
        if (!(species in antSpecies)) throw `Unknown ant species: ${species}`;
        foundAntBreeds++;
        var commandsParsed = {};
        while (true) {
            commands = commands.trim();
            match = /^\{(\S+)\s*=>\s*(.+?)\}/s.exec(commands); //jshint ignore:line
            if (!match) break;
            commands = commands.slice(match[0].length);
            var statedesc = match[1], actions = match[2];
            console.log('state tab: ', statedesc, actions);
            commandsParsed[statedesc] = actions;
        }
        if (commands.trim()) throw `Rule parsing failed on: ${commands}`;
        breeder.addBreed(breed, antSpecies[species], commandsParsed);
        console.log(commandsParsed);
    }
    if (foundAntBreeds === 0) throw 'There are no ant breeds.';
    text = text.trim().replaceAll(/\s+/g, '');
    var x = 0, y = 0, ants = [];
    world.clear();
    console.log('rest of text: ', text);
    while (true) {
        text = text.trim();
        match = /^(\d*)([p-y]?[A-X]|[$.])(?:\[(.+?):([0-3])(?::(\d+))?\])?/.exec(text);
        if (!match) break;
        text = text.slice(match[0].length);
        console.log('RLE ', match[0]);
        var count = parseInt(match[1] || 1), cellState = match[2], antBreed = match[3], antDir = parseInt(match[4]), antState = parseInt(match[5] ?? 1);
        console.log(antBreed, antDir);
        if (antBreed && cellState === '$') throw "RLE error: Can't put ant after $";
        if (cellState === '$') {
            x = 0;
            y += count;
        } else {
            cellState = lettersToStateNum(cellState);
            console.log('lettersToStateNum() returned', cellState);
            for (i = 0; i < count; i++, x++) world.setCell(x, y, cellState);
            if (antBreed && antDir) ants.push(breeder.createAnt(antBreed, world, x - 1, y, antDir, antState, ants));
        }
    }
    return { ants, header };
}

function lettersToStateNum(letters) {
    const AA = '.ABCDEFGHIJKLMNOPQRSTUVWX';
    const pq = '~pqrstuvwxy';
    if (letters.length === 1) return AA.indexOf(letters);
    else return 24 * pq.indexOf(letters[0]) + AA.indexOf(letters[1]);
}
