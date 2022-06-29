// https://sourceforge.net/p/golly/code/ci/master/tree/Scripts/Python/glife/RuleTree.py
async function functionToTree(states, slowcalc) {
    const numParams = 8 + 1;
    var world = {};
    var nodeSeq = 0;
    var seq = [];
    var params = new Array(numParams).fill(0);

    function getNode(nn) {
        var nnj = nn.join(',');
        if (nnj in world) return world[nnj];
        else {
            var inew = nodeSeq++;
            seq.push(nn);
            world[nnj] = inew;
            return inew;
        }
    }

    async function recur(at) {
        if (at === 0) return await slowcalc(...params);
        var nn = [at];
        for (var i = 0; i < states; i++) {
            params[numParams - at] = i;
            nn.push(await recur(at - 1));
        }
        return getNode(nn);
    }

    await recur(numParams);
    return function (nw, n, ne, w, c, e, sw, s, se) {
        var vals = [nw, ne, sw, se, n, s, e, w, c];
        var node = seq[seq.length - 1];
        for (var val of vals) node = seq[node[val + 1]];
        return node;
    };
}

function treeOnTheFly(states, fun) {
    var foo = {
        cache: {},
        queue: [],
        bar(...args) {
            var k = args.join(',');
            if (k in foo.cache) {
                var [b, res] = foo.queue.shift();
                var aa = b.split(',').map(parseInt);
                var aar = fun(...aa);
                res(aar);
                return foo.cache[k];
            }
            else {
                var result = fun(...args);
                if (foo.queue[0][0] == k) foo.queue.shift()[1](result);
                foo.cache[k] = result;
                return result;
            }
        }
    };
    functionToTree(states, function (...args) {
        return new Promise(res => {
            var key = args.join(',');
            foo.queue.push([key, res]);
        });
    }).then(newfun => foo.bar = newfun);
    return function (...args) {
        return foo.bar(...args);
    };
}