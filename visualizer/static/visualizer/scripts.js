/**
 * DSA Lab - Frontend Logic
 */

let currentTab = 'sorting';
let currentArray = [];
let isExecuting = false;
let stopRequested = false;
let abortController = null;
let resolveSleep = null; // Used to wake up sleep immediately

// DOM Elements
const container = document.getElementById("viz-container");
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
const executeBtn = document.getElementById("execute-btn");
const stopBtn = document.getElementById("stop-btn");
const speedInput = document.getElementById("speed");

const metadata = {
    sorting: {
        title: "Sorting Visualizer",
        desc: "Understand how sorting algorithms organize data step-by-step.",
        resource: "https://www.geeksforgeeks.org/sorting-algorithms/",
        algos: [
            { id: 'bubble', name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', desc: 'Repeatedly swaps adjacent elements if they are in the wrong order.' },
            { id: 'selection', name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', desc: 'Finds the minimum element and puts it at the beginning.' },
            { id: 'insertion', name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', desc: 'Builds the final sorted array one item at a time.' },
            { id: 'quick', name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', desc: 'Uses a pivot to partition the array into smaller sub-arrays.' },
            { id: 'merge', name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', desc: 'Divide and conquer algorithm that splits and merges arrays.' }
        ]
    },
    searching: {
        title: "Searching Visualizer",
        desc: "Find specific values within collections of data.",
        resource: "https://www.geeksforgeeks.org/searching-algorithms/",
        algos: [
            { id: 'linear', name: 'Linear Search', time: 'O(n)', space: 'O(1)', desc: 'Checks every element in the list sequentially until a match is found.' },
            { id: 'binary', name: 'Binary Search', time: 'O(log n)', space: 'O(1)', desc: 'Repeatedly divides the search interval in half (requires sorted data).' }
        ]
    },
    linkedlist: {
        title: "Linked List Visualizer",
        desc: "Understand dynamic memory allocation and pointers.",
        resource: "https://www.geeksforgeeks.org/data-structures/linked-list/",
        algos: [
            { id: 'singly', name: 'Singly Linked List', time: 'O(n)', space: 'O(n)', desc: 'A collection of nodes where each node points to the next.' }
        ]
    },
    stackqueue: {
        title: "Stack & Queue",
        desc: "Visualizing LIFO and FIFO data structures.",
        resource: "https://www.geeksforgeeks.org/stack-data-structure/",
        algos: [
            { id: 'stack', name: 'Stack (LIFO)', time: 'O(1)', space: 'O(n)', desc: 'Last-In First-Out structure for push/pop operations.' },
            { id: 'queue', name: 'Queue (FIFO)', time: 'O(1)', space: 'O(n)', desc: 'First-In First-Out structure for enqueue/dequeue.' }
        ]
    },
    trees: {
        title: "Binary Search Tree",
        desc: "Visualizing hierarchical data structures.",
        resource: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
        algos: [
            { id: 'bst', name: 'BST Operations', time: 'O(log n)', space: 'O(n)', desc: 'A node-based tree data structure where each node has at most two children.' }
        ]
    }
};

function switchTab(tab, element) {
    if (isExecuting) return; 
    currentTab = tab;
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    document.getElementById('view-title').innerText = metadata[tab].title;
    document.getElementById('view-desc').innerText = metadata[tab].desc;
    const select = document.getElementById('algorithm-select');
    select.innerHTML = '';
    metadata[tab].algos.forEach(algo => {
        const opt = document.createElement('option');
        opt.value = algo.id;
        opt.innerText = algo.name;
        select.appendChild(opt);
    });
    document.getElementById('target-input-container').style.display = tab === 'searching' ? 'block' : 'none';
    updateInfo();
    initVisualization();
}

function updateInfo() {
    const algoId = document.getElementById('algorithm-select').value;
    const algo = metadata[currentTab].algos.find(a => a.id === algoId);
    if (algo) {
        document.getElementById('time-comp').innerText = algo.time;
        document.getElementById('space-comp').innerText = algo.space;
        document.getElementById('algo-explanation').innerText = algo.desc;
        const formattedName = algo.name.replace(/ /g, '+');
        const resourceLinks = document.getElementById('resource-links').getElementsByTagName('a');
        resourceLinks[0].href = metadata[currentTab].resource;
        resourceLinks[2].href = `https://www.youtube.com/results?search_query=${formattedName}+visualized`;
    }
}

function initVisualization() {
    if (isExecuting) return;
    container.innerHTML = "";
    const sizeInput = document.getElementById('size');
    const size = sizeInput ? parseInt(sizeInput.value) : 25;
    currentArray = [];
    if (currentTab === 'sorting' || currentTab === 'searching') {
        for (let i = 0; i < size; i++) {
            currentArray.push(Math.floor(Math.random() * 300) + 20);
        }
        if (currentTab === 'searching' && document.getElementById('algorithm-select').value === 'binary') {
            currentArray.sort((a, b) => a - b);
        }
        renderBars(currentArray);
    } else if (currentTab === 'linkedlist') {
        currentArray = [10, 25, 40, 55];
        renderNodes(currentArray);
    } else if (currentTab === 'stackqueue') {
        currentArray = [5, 10, 15];
        if (document.getElementById('algorithm-select').value === 'stack') {
            renderStack(currentArray);
        } else {
            renderQueue(currentArray);
        }
    } else if (currentTab === 'trees') {
        renderTree();
    }
}

function getDelay() {
    return 650 - parseInt(speedInput.value);
}

/**
 * Interruptible sleep. If stopVisualization is called, this wakes up immediately.
 */
function sleep(ms) {
    return new Promise(resolve => {
        resolveSleep = resolve;
        setTimeout(() => {
            resolveSleep = null;
            resolve();
        }, ms);
    });
}

function renderBars(arr, states = {}) {
    if (stopRequested) return;
    container.innerHTML = "";
    if (!arr || arr.length === 0) return;
    const max = Math.max(...arr);
    arr.forEach((value, index) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${(value / max) * 100}%`;
        if (states.comparing?.includes(index)) bar.classList.add("comparing");
        if (states.swapping?.includes(index)) bar.classList.add("swapping");
        if (states.found?.includes(index)) bar.classList.add("found");
        if (states.range && index >= states.range[0] && index <= states.range[1]) {
            bar.classList.add("range-highlight");
        }
        const label = document.createElement("div");
        label.className = "bar-label";
        label.innerText = value;
        bar.appendChild(label);
        container.appendChild(bar);
    });
}

function renderNodes(arr) {
    container.innerHTML = "";
    arr.forEach((val, i) => {
        const node = document.createElement("div");
        node.className = "node";
        node.innerText = val;
        container.appendChild(node);
        if (i < arr.length - 1) {
            const arrow = document.createElement("div");
            arrow.innerHTML = '<i class="bi bi-arrow-right fs-2 text-accent"></i>';
            container.appendChild(arrow);
        }
    });
}

function renderStack(arr) {
    container.innerHTML = "";
    const stackBox = document.createElement("div");
    stackBox.className = "d-flex flex-column-reverse gap-2 p-3 border border-secondary border-top-0";
    stackBox.style.width = "120px";
    stackBox.style.minHeight = "200px";
    arr.forEach(val => {
        const item = document.createElement("div");
        item.className = "node w-100 rounded-0";
        item.innerText = val;
        stackBox.appendChild(item);
    });
    container.appendChild(stackBox);
}

function renderQueue(arr) {
    container.innerHTML = "";
    const queueBox = document.createElement("div");
    queueBox.className = "d-flex align-items-center gap-2 p-3 border border-secondary border-start-0 border-end-0";
    queueBox.style.minWidth = "300px";
    queueBox.style.height = "100px";
    arr.forEach(val => {
        const item = document.createElement("div");
        item.className = "node";
        item.innerText = val;
        queueBox.appendChild(item);
    });
    container.appendChild(queueBox);
}

function renderTree() {
    container.innerHTML = "";
    container.innerHTML = `
        <svg width="400" height="300" viewBox="0 0 400 300">
            <line x1="200" y1="50" x2="100" y2="120" stroke="#2dd4bf" stroke-width="2" />
            <line x1="200" y1="50" x2="300" y2="120" stroke="#2dd4bf" stroke-width="2" />
            <circle cx="200" cy="50" r="20" fill="#10b981" />
            <text x="200" y="55" fill="white" text-anchor="middle" font-weight="bold">50</text>
            <circle cx="100" cy="120" r="20" fill="#10b981" />
            <text x="100" y="125" fill="white" text-anchor="middle" font-weight="bold">30</text>
            <circle cx="300" cy="120" r="20" fill="#10b981" />
            <text x="300" y="125" fill="white" text-anchor="middle" font-weight="bold">70</text>
        </svg>
    `;
}

async function executeAlgorithm() {
    if (isExecuting) return;
    const algo = document.getElementById("algorithm-select").value;
    isExecuting = true;
    stopRequested = false;
    abortController = new AbortController();
    executeBtn.disabled = true;

    console.log("Starting execution...");

    try {
        let steps = [];
        if (currentTab === 'sorting' || currentTab === 'searching') {
            const endpoint = currentTab === 'sorting' ? '/api/sort/' : '/api/search/';
            const body = { array: currentArray, algorithm: algo };
            if (currentTab === 'searching') {
                const targetInput = document.getElementById('search-target');
                body.target = parseInt(targetInput.value);
                if (isNaN(body.target)) {
                    alert("Please enter a target value");
                    throw new Error("Invalid target");
                }
            }
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify(body),
                signal: abortController.signal
            });
            if (stopRequested) return;
            const data = await response.json();
            steps = data.steps;
        }

        if (steps && steps.length > 0) {
            for (let step of steps) {
                if (stopRequested) {
                    console.log("Animation loop broken by stop signal.");
                    break;
                }
                renderBars(step.array, step);
                await sleep(getDelay());
            }
        } else if (currentTab === 'linkedlist') {
            currentArray.push(Math.floor(Math.random() * 90) + 10);
            renderNodes(currentArray);
        } else if (currentTab === 'stackqueue') {
            const newVal = Math.floor(Math.random() * 90) + 10;
            currentArray.push(newVal);
            algo === 'stack' ? renderStack(currentArray) : renderQueue(currentArray);
        }
    } catch (err) {
        if (err.name === 'AbortError') console.log('Fetch aborted.');
        else console.error('Execution error:', err);
    } finally {
        console.log("Execution finished/stopped.");
        isExecuting = false;
        stopRequested = false;
        abortController = null;
        executeBtn.disabled = false;
    }
}

function stopVisualization() {
    console.log("Stop button clicked!");
    stopRequested = true;
    if (abortController) abortController.abort();
    if (resolveSleep) {
        console.log("Waking up sleep...");
        resolveSleep();
        resolveSleep = null;
    }
}

window.onload = () => {
    initVisualization();
    updateInfo();
};
