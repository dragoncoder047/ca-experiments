const $ = sel => document.querySelector(sel);

const runButton = $('#run');
const statusBar = $('#status');
const textbox = $('#TABLE');
const outArea = $('#TREE');

function showStatus(text, color = 'black') {
    statusBar.value = text;
    statusBar.style.color = color;
}

function output(text) {
    outArea.textContent = text;
}

const copy = navigator.clipboard.writeText;

const foobar = () => new Promise(r => setTimeout(r, 1000));

runButton.addEventListener('click', async () => {
    var text = textbox.value;
    var result, startTime = +new Date();
    try {
        showStatus('Parsing table, expanding vars...', 'black');
        await foobar();
        result = parseTable(text);
    } catch (e) {
        showStatus(e, 'red');
        throw e;
    }
    var { n_states, neighborhood, num_neighbors, slowcalc, transitions } = result;
    showStatus('Converting to tree...', 'black');
    var nodes;
    try {
        nodes = functionToTree(n_states, num_neighbors, slowcalc);
        await foobar();
    } catch (e) {
        showStatus(e, 'red');
        throw e;
    }
    var endTime = +new Date();
    var out = `num_states=${n_states}
num_neighbors=${num_neighbors}
num_nodes=${nodes.length}
${nodes.map(n => n.join(' ')).join('\n')}
`;
    copy(out);
    output(out);
    showStatus(`Done! Time: ${(endTime - startTime - 2000) / 1000} seconds`, 'green');
});

showStatus('Ready!', 'black');
