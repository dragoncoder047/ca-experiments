// https://sourceforge.net/p/golly/code/ci/master/tree/Scripts/Python/glife/RuleTree.py
function functionToTree(states, neighbors, slowcalc) {
    const numParams = neighbors + 1;
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

    function recur(at) {
        if (at === 0) return slowcalc(...params);
        var nn = [at];
        for (var i = 0; i < states; i++) {
            params[numParams - at] = i;
            nn.push(recur(at - 1));
        }
        return getNode(nn);
    }

    recur(numParams);
    return seq;
}