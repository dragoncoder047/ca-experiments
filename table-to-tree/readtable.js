// https://sourceforge.net/p/golly/code/ci/master/tree/Scripts/Python/glife/ReadRuleTable.py

function permu2(xs) {
    if (xs.length < 2) return [xs];
    var out = []; h = [];
    for (var x of xs) {
        h.push(x);
        if (h.slice(0, h.length - 1).includes(x)) continue;
        var ts = xs.slice().filter(i => i !== x);
        for (var ps of permu2(ts)) {
            out.push([x].concat(ps));
        }
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

function parseTable(text) {
    var vars = {};
    var symmetry_string = null;
    var symmetry = null;
    var n_states = 0;
    var neighborhood = null;
    var transitions = [];
    var num_entries = 0;
    var entries, e, varname;
    for (var line of text.split(/\n|\r|\r\n/)) {
        if (line[0] === '#' || !line.trim()) continue;
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
            symmetry_string = line.slice(11).trim();
            if (!(symmetry_string in SYMMETRIES[neighborhood])) throw `Bad symmetry: ${line.slice(11)}`;
            symmetry = SYMMETRIES[neighborhood][symmetry_string];
        }
        else if (line.startsWith('var ')) {
            line = line.slice(4);
            line = line.replace(/#.*$/, '');
            [varname, line] = line.split(/(?<!=.*)\s*=\s*/, 2);
            entries = line.replace(/[={}\n\s]/, '').split(/,+/);
            var s = [];
            for (e of entries) {
                if (e in vars) s.push(...vars[e]);
                else s.push(parseInt(e));
            }
            vars[varname] = s;
        }
        else { // transition
            line = line.replace(/#.*$/, '');
            entries = line.replace(/[={}\n\s]/, '').split(/,+/);
            if (entries.length !== num_entries) throw `Wrong number of entries on this line: ${line} (got ${entries.length}, expected ${num_entries})`;
            entries = entries.map(e => e in vars ? e : parseInt(e));
            var bound_vars = entries.filter((e, i) => !entries.slice(i + 1).includes(e) && e in vars && entries.filter(ee => ee === e).length > 1);
            var var_val_indices = Object.assign({}, ...bound_vars.map(x => { var y = {}; y[x] = 0; return y; }));
            while (true) {
                var transition = [];
                for (e of entries) {
                    if (bound_vars.includes(e))
                        transition.push([vars[e][var_val_indices[e]]]);
                    else if (e in vars)
                        transition.push(vars[e]);
                    else
                        transition.push([parseInt(e)]);
                }
                if (symmetry_string === 'permute' && PERMUTE_LATER.includes(neighborhood)) {
                    for (var permuted_section of permu2(transition.slice(1, -1))) {
                        var permuted_transition = [transition[0]].concat(permuted_section).concat(transition[transition.length - 1]);
                        if (!transitions.includes(permuted_transition)) transitions.push(permuted_transition);
                    }
                } else {
                    for (var sy of symmetry) {
                        var tran = sy.map(i => transition[i]);
                        if (!transitions.includes(tran)) transitions.push(tran);
                    }
                }
                var var_val_to_change = 0;
                while (var_val_to_change < bound_vars.length) {
                    var var_label = bound_vars[var_val_to_change];
                    if (var_val_indices[var_label] < vars[var_label].length - 1) {
                        var_val_indices[var_label]++;
                        break;
                    }
                    else {
                        var_val_indices[var_label] = 0;
                        var_val_to_change++;
                    }
                }
                if (var_val_to_change >= bound_vars.length) break;
            }
        }
    }
    return {
        n_states, neighborhood, num_neighbors: num_entries - 2, transitions,
        slowcalc(...args) {
            var temp = transitions.slice();
            for (var i = 0; i < args.length - 1; i++) {
                temp = temp.filter(t => t[i].includes(args[i]));
            }
            return temp[0]?.[args.length - 1]?.[0] ?? args[args.length - 1];
        }
    };
}