function strip_comment_and_trim(line) {
    if (line.indexOf("#") == -1) return line.trim();
    return line.slice(0, line.indexOf("#")).trim();
}

function rule_parse(contents) {
    var sections = { RULE: [] }, currentSection = "RULE";
    contents = contents.split(/\r|\n|\r\n/);
    for (var line of contents) {
        line = strip_comment_and_trim(line);
        if (!line) continue;
        var match = /^@([A-Z]+)\s*(\S*)/.exec(line);
        if (match != null) {
            sections[match[1]] = [];
            currentSection = match[1];
        } else {
            sections[currentSection].push(line);
        }
    }
    return sections;
}

function expand_vars(transition, vars) {
    //return [transition];
    for (var i = 0; i < transition.length; i++) {
        if (typeof transition[i] === "string") {
            var varname = transition[i];
            var out = [];
            if (!(varname in vars)) throw "undefined var " + varname;
            console.log("expanding var " + varname);
            for (var v of vars[varname]) {
                var temp = transition.map(x => x === varname ? v : x);
                console.log(temp);
                out.push(...expand_vars(temp, vars));
            }
            return out;
        }
    }
    return [transition];
}

function permu2(xs) {
    if (xs.length < 2) return [xs];
    var out = []; h = [];
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        if (xs.indexOf(x) != i) continue;
        var rest = xs.slice(0, i).concat(xs.slice(i + 1));
        for (var sub of permu2(rest))
            out.push([x].concat(sub));
    }
    return out;
}

const PERMUTE_LATER = ['vonNeumann', 'Moore', 'hexagonal', 'triangularVonNeumann', 'triangularMoore', 'oneDimensional'];

const _MARGOLUS = {
    none: [
        [0, 1, 2, 3, 4, 5, 6, 7]
    ],
    reflect_horizontal: [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [1, 0, 3, 2, 5, 4, 7, 6]
    ],
    reflect_vertical: [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [2, 3, 0, 1, 6, 7, 4, 5]
    ],
    rotate4: [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [2, 0, 3, 1, 6, 4, 7, 5],
        [3, 2, 1, 0, 7, 6, 5, 4],
        [1, 3, 0, 2, 5, 7, 4, 6]
    ],
    rotate4reflect: [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [2, 0, 3, 1, 6, 4, 7, 5],
        [3, 2, 1, 0, 7, 6, 5, 4],
        [1, 3, 0, 2, 5, 7, 4, 6],
        [1, 0, 3, 2, 5, 4, 7, 6],
        [0, 2, 1, 3, 4, 6, 5, 7],
        [2, 3, 0, 1, 6, 7, 4, 5],
        [3, 1, 2, 0, 7, 5, 6, 4]
    ],
    permute: permu2(new Array(4).map((_, i) => i)).map(p => p.concat(p.map(x => x + 4))) // [p + [x + 4 for x in p] for p in permu2(list(range(4)))]
};

const SYMMETRIES = {
    vonNeumann: {
        none: [
            [0, 1, 2, 3, 4, 5]
        ],
        rotate4: [
            [0, 1, 2, 3, 4, 5],
            [0, 2, 3, 4, 1, 5],
            [0, 3, 4, 1, 2, 5],
            [0, 4, 1, 2, 3, 5]
        ],
        rotate4reflect: [
            [0, 1, 2, 3, 4, 5],
            [0, 2, 3, 4, 1, 5],
            [0, 3, 4, 1, 2, 5],
            [0, 4, 1, 2, 3, 5],
            [0, 4, 3, 2, 1, 5],
            [0, 3, 2, 1, 4, 5],
            [0, 2, 1, 4, 3, 5],
            [0, 1, 4, 3, 2, 5]
        ],
        reflect_horizontal: [
            [0, 1, 2, 3, 4, 5],
            [0, 1, 4, 3, 2, 5]
        ],
        permute: [[0, 1, 2, 3, 4, 5]], // special case; handled by code below
    },
    Moore: {
        none: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        ],
        rotate4: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [0, 3, 4, 5, 6, 7, 8, 1, 2, 9],
            [0, 5, 6, 7, 8, 1, 2, 3, 4, 9],
            [0, 7, 8, 1, 2, 3, 4, 5, 6, 9]
        ],
        rotate8: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [0, 2, 3, 4, 5, 6, 7, 8, 1, 9],
            [0, 3, 4, 5, 6, 7, 8, 1, 2, 9],
            [0, 4, 5, 6, 7, 8, 1, 2, 3, 9],
            [0, 5, 6, 7, 8, 1, 2, 3, 4, 9],
            [0, 6, 7, 8, 1, 2, 3, 4, 5, 9],
            [0, 7, 8, 1, 2, 3, 4, 5, 6, 9],
            [0, 8, 1, 2, 3, 4, 5, 6, 7, 9]
        ],
        rotate4reflect: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [0, 3, 4, 5, 6, 7, 8, 1, 2, 9],
            [0, 5, 6, 7, 8, 1, 2, 3, 4, 9],
            [0, 7, 8, 1, 2, 3, 4, 5, 6, 9],
            [0, 1, 8, 7, 6, 5, 4, 3, 2, 9],
            [0, 7, 6, 5, 4, 3, 2, 1, 8, 9],
            [0, 5, 4, 3, 2, 1, 8, 7, 6, 9],
            [0, 3, 2, 1, 8, 7, 6, 5, 4, 9]
        ],
        rotate8reflect: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [0, 2, 3, 4, 5, 6, 7, 8, 1, 9]
            [0, 3, 4, 5, 6, 7, 8, 1, 2, 9],
            [0, 4, 5, 6, 7, 8, 1, 2, 3, 9],
            [0, 5, 6, 7, 8, 1, 2, 3, 4, 9],
            [0, 6, 7, 8, 1, 2, 3, 4, 5, 9],
            [0, 7, 8, 1, 2, 3, 4, 5, 6, 9],
            [0, 8, 1, 2, 3, 4, 5, 6, 7, 9],
            [0, 8, 7, 6, 5, 4, 3, 2, 1, 9],
            [0, 7, 6, 5, 4, 3, 2, 1, 8, 9],
            [0, 6, 5, 4, 3, 2, 1, 8, 7, 9],
            [0, 5, 4, 3, 2, 1, 8, 7, 6, 9],
            [0, 4, 3, 2, 1, 8, 7, 6, 5, 9],
            [0, 3, 2, 1, 8, 7, 6, 5, 4, 9],
            [0, 2, 1, 8, 7, 6, 5, 4, 3, 9],
            [0, 1, 8, 7, 6, 5, 4, 3, 2, 9]
        ],
        reflect_horizontal: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [0, 1, 8, 7, 6, 5, 4, 3, 2, 9]
        ],
        permute: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]] // special case; handled by code below
    },
    Margolus: _MARGOLUS,
    square4_figure8v: _MARGOLUS,
    square4_figure8h: _MARGOLUS,
    square4_cyclic: _MARGOLUS,
    triangularVonNeumann: {
        none: [
            [0, 1, 2, 3, 4]
        ],
        rotate: [
            [0, 1, 2, 3, 4],
            [0, 3, 1, 2, 4],
            [0, 2, 3, 1, 4]
        ],
        rotate_reflect: [
            [0, 1, 2, 3, 4],
            [0, 3, 1, 2, 4],
            [0, 2, 3, 1, 4],
            [0, 3, 2, 1, 4],
            [0, 1, 3, 2, 4],
            [0, 2, 1, 3, 4]
        ],
        permute: [[0, 1, 2, 3, 4]] // special case; handled by code below
    },
    triangularMoore: {
        none: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        ],
        rotate: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            [0, 2, 3, 1, 7, 8, 9, 10, 11, 12, 4, 5, 6, 13],
            [0, 3, 1, 2, 10, 11, 12, 4, 5, 6, 7, 8, 9, 13]
        ],
        rotate_reflect: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            [0, 2, 3, 1, 7, 8, 9, 10, 11, 12, 4, 5, 6, 13],
            [0, 3, 1, 2, 10, 11, 12, 4, 5, 6, 7, 8, 9, 13],
            [0, 3, 2, 1, 9, 8, 7, 6, 5, 4, 12, 11, 10, 13],
            [0, 2, 1, 3, 6, 5, 4, 12, 11, 10, 9, 8, 7, 13],
            [0, 1, 3, 2, 12, 11, 10, 9, 8, 7, 6, 5, 4, 13]
        ],
        permute: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], // special case; handled by code below
    },
    oneDimensional: {
        none: [
            [0, 1, 2, 3]
        ],
        reflect: [
            [0, 1, 2, 3],
            [0, 2, 1, 3]
        ],
        permute: [[0, 1, 2, 3]], // special case; handled by code below
    },
    hexagonal: {
        none: [
            [0, 1, 2, 3, 4, 5, 6, 7]
        ],
        rotate2: [
            [0, 1, 2, 3, 4, 5, 6, 7],
            [0, 4, 5, 6, 1, 2, 3, 7]
        ],
        rotate3: [
            [0, 1, 2, 3, 4, 5, 6, 7],
            [0, 3, 4, 5, 6, 1, 2, 7],
            [0, 5, 6, 1, 2, 3, 4, 7]
        ],
        rotate6: [
            [0, 1, 2, 3, 4, 5, 6, 7],
            [0, 2, 3, 4, 5, 6, 1, 7],
            [0, 3, 4, 5, 6, 1, 2, 7],
            [0, 4, 5, 6, 1, 2, 3, 7],
            [0, 5, 6, 1, 2, 3, 4, 7],
            [0, 6, 1, 2, 3, 4, 5, 7]
        ],
        rotate6reflect: [
            [0, 1, 2, 3, 4, 5, 6, 7],
            [0, 2, 3, 4, 5, 6, 1, 7],
            [0, 3, 4, 5, 6, 1, 2, 7],
            [0, 4, 5, 6, 1, 2, 3, 7],
            [0, 5, 6, 1, 2, 3, 4, 7],
            [0, 6, 1, 2, 3, 4, 5, 7],
            [0, 6, 5, 4, 3, 2, 1, 7],
            [0, 5, 4, 3, 2, 1, 6, 7],
            [0, 4, 3, 2, 1, 6, 5, 7],
            [0, 3, 2, 1, 6, 5, 4, 7],
            [0, 2, 1, 6, 5, 4, 3, 7],
            [0, 1, 6, 5, 4, 3, 2, 7]
        ],
        permute: [[0, 1, 2, 3, 4, 5, 6, 7]], // special case; handled by code below
    },
};

function expand_symmetry(transition, neighborhood, symmetry) {
    if (symmetry === "permute" && PERMUTE_LATER.includes(neighborhood)) return permu2(transition.slice(1, -1)).map(st => [transition[0]].concat(st).concat([transition[transition.length - 1]]));
    var ns = SYMMETRIES[neighborhood][symmetry], out = [];
    for (var nums of ns)
        out.push(nums.map(i => transition[i]));
    return out;
}

function table_to_function(table_lines) {
    var vars = {};
    var transitions = [];
    var n_states, num_entries, symmetry, neighborhood, entries;
    for (var line of table_lines) {
        line = strip_comment_and_trim(line);
        if (line.startsWith('n_states:')) {
            n_states = parseInt(line.slice(9).trim());
            if (n_states < 0 || n_states > 256) throw `Bad n_states value: ${line.slice(9)}`;
        }
        else if (line.startsWith('neighborhood:')) {
            neighborhood = line.slice(13).trim();
            if (!(neighborhood in SYMMETRIES)) throw `Unknown neighborhood ${line.slice(13)}`;
            num_entries = SYMMETRIES[neighborhood].none[0].length;
        }
        else if (line.startsWith('symmetries:')) {
            symmetry = line.slice(11).trim();
            if (!(symmetry in SYMMETRIES[neighborhood])) throw `Bad symmetry: ${line.slice(11)}`;
        }
        else if (line.startsWith('var ')) {
            line = line.slice(4);
            [varname, line] = line.split(/(?<!=.*)\s*=\s*/, 2);
            entries = line.replaceAll(/[={}\s]/g, '').split(/,+/);
            var s = [];
            for (var e of entries) {
                if (e in vars) s.push(...vars[e]);
                else s.push(parseInt(e));
            }
            vars[varname] = s;
        }
        else { // transition
            entries = line.replaceAll(/[={}\n\s]/g, '').split(/,+/);
            if (entries.length !== num_entries) throw `Wrong number of entries on this line: ${line} (got ${entries.length}, expected ${num_entries})`;
            entries = entries.map(e => e in vars ? e : parseInt(e));
            transitions.push(entries);
        }
    }
    var final_transitions = [];
    console.log(vars);
    for (var tt of transitions)
        for (var ttt of expand_symmetry(tt, neighborhood, symmetry))
            for (var tttt of expand_vars(ttt, vars))
                final_transitions.push(tttt);
    return {
        n_states, neighborhood, num_neighbors: num_entries - 2,
        slowcalc(...args) {
            if (args.length + 1 !== num_entries)
                throw `Bad number of arguments to slowcalc() (got ${args.length}, expected ${num_entries - 1})`;
            for (var tran of final_transitions) {
                var matched = true;
                for (var i = 0; i < num_entries - 2; i++) {
                    if (args[i] != tran[i]) {
                        matched = false;
                        break;
                    }
                }
                if (matched) return tran[tran.length - 1];
            }
            return args[0];
        }
    };
}

function memoize(slowfun) {
    var cache = {};
    var mm = function (...args) {
        var key = "" + args;
        if (cache[key]) return cache[key];
        cache[key] = slowfun(...args);
        return cache[key];
    };
    mm.cache = cache;
    return mm;
}