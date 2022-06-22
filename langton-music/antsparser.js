function loadWorld(text, antSpecies, world) {
    text = text.replaceAll(/#.*?$/gm, '');
    var header = {};
    while (true) {
        match = /([a-z]+)\s*:\s*(.+?)(?:;|(?=\[))/is.exec(text.trim()); //jshint ignore:line
        if (!match) break;
        text = text.slice(match[0].length);
        var key = match[1], value = match[2];
        console.log('header entry: ', key, value);
        header[key] = value;
    }
    var antBreeds = {};
    var foundAntBreeds = 0;
    var match, i;
    while (true) {
        match = /\[([a-z]+)\s+([a-z]+)\s+(.+?)\]/is.exec(text.trim()); //jshint ignore:line
        if (!match) break;
        text = text.slice(match[0].length);
        var species = match[1], breed = match[2], commands = match[3];
        console.log('ant breed: ', species, breed);
        if (!(species in antSpecies)) throw `Unknown ant species: ${species}`;
        if (breed in antBreeds) throw `Breed ${breed} is already defined, which defintion?`;
        foundAntBreeds++;
        var commandsParsed = {};
        while (true) {
            match = /\{(\S+)\s+=>\s+(.+?)\}/s.exec(commands.trim()); //jshint ignore:line
            if (!match) break;
            commands = commands.slice(match[0].length);
            var statedesc = match[1], actions = match[2];
            console.log('state tab: ', statedesc, actions);
            commandsParsed[statedesc] = actions;
        }
        antBreeds[breed] = [antSpecies[species], commandsParsed];
    }
    if (foundAntBreeds === 0) throw 'There are no ant breeds.';
    text = text.trim().replaceAll(/\s+/g, '');
    var x = 0, y = 0, ants = [];
    world.clear();
    console.log('rest of text: ', text);
    while (true) {
        match = /(\d*)([p-y]?[A-X]|[$.])(?:\[(.+?):([0-3])(?::(.+?))?\])?/.exec(text.trim());
        if (!match) break;
        text = text.slice(match[0].length);
        console.log('RLE ', match[0]);
        var count = parseInt(match[1] || 1), cellState = match[2], antBreed = match[3], antDir = parseInt(match[4]), antState = match[5] ?? 1;
        if (antBreed && cellState === '$') throw "RLE error: Can't put ant after $";
        if (cellState === '$') {
            x = 0;
            y += count;
        } else {
            cellState = lettersToStateNum(cellState);
            console.log('lettersToStateNum() returned', cellState);
            for (i = 0; i < count; i++, x++) world.setCell(x, y, cellState);
            if (antBreed) ants.push(new (antBreeds[antBreed][0])(antBreed, world, antBreeds[antBreed][1], antState, x - 1, y, antDir));
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
