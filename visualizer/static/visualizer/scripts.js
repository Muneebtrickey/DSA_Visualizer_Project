/**
 * DSA Lab - Frontend Logic
 */

let currentTab = 'sorting';
let currentArray = [];
let graphEdges = [];
let nodePositions = []; // Persistent positions for graph nodes
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
    },
    graphs: {
        title: "Graph Visualizer",
        desc: "Visualizing nodes and edges with traversal algorithms.",
        resource: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
        algos: [
            { id: 'bfs', name: 'Breadth-First Search', time: 'O(V+E)', space: 'O(V)', desc: 'Explores all neighbor nodes at the present depth before moving to nodes at the next depth level.' },
            { id: 'dfs', name: 'Depth-First Search', time: 'O(V+E)', space: 'O(V)', desc: 'Explores as far as possible along each branch before backtracking.' }
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
    
    // Hide dropdown for graphs since we have separate BFS/DFS buttons
    const algoSelectContainer = document.getElementById('algo-select-container');
    if (algoSelectContainer) {
        algoSelectContainer.style.display = tab === 'graphs' ? 'none' : 'block';
    }

    // Show BFS/DFS buttons only for graphs
    const bfsBtn = document.getElementById('bfs-btn');
    const dfsBtn = document.getElementById('dfs-btn');
    if (bfsBtn && dfsBtn) {
        bfsBtn.style.display = tab === 'graphs' ? 'block' : 'none';
        dfsBtn.style.display = tab === 'graphs' ? 'block' : 'none';
    }

    updateInfo();
    initVisualization();
}

/**
 * Executes BFS or DFS traversal on the current graph.
 */
async function runTraversal(type) {
    if (isExecuting || currentArray.length === 0) return;
    isExecuting = true;
    stopRequested = false;
    abortController = new AbortController();
    
    // Disable buttons
    document.getElementById('execute-btn').disabled = true;
    document.getElementById('bfs-btn').disabled = true;
    document.getElementById('dfs-btn').disabled = true;

    try {
        const adj = Array.from({ length: currentArray.length }, () => []);
        graphEdges.forEach(([u, v]) => {
            if (u < currentArray.length && v < currentArray.length) {
                adj[u].push(v);
                adj[v].push(u);
            }
        });

        const visited = new Set();
        const traversalOrder = [];

        if (type === 'bfs') {
            const queue = [0];
            visited.add(0);
            while (queue.length > 0) {
                if (stopRequested) break;
                const node = queue.shift();
                traversalOrder.push(node);
                renderGraph(currentArray, [...traversalOrder], graphEdges);
                await sleep(getDelay());

                for (const neighbor of adj[node]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        } else {
            const stack = [0];
            // Standard DFS traversal
            async function dfs(node) {
                if (stopRequested || visited.has(node)) return;
                visited.add(node);
                traversalOrder.push(node);
                renderGraph(currentArray, [...traversalOrder], graphEdges);
                await sleep(getDelay());

                for (const neighbor of adj[node]) {
                    await dfs(neighbor);
                }
            }
            await dfs(0);
        }
    } catch (err) {
        console.error("Traversal error:", err);
    } finally {
        isExecuting = false;
        stopRequested = false;
        document.getElementById('execute-btn').disabled = false;
        document.getElementById('bfs-btn').disabled = false;
        document.getElementById('dfs-btn').disabled = false;
    }
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
        currentArray = [50, 30, 70];
        renderTree(currentArray);
    } else if (currentTab === 'graphs') {
        // Initial Graph: Nodes 0-4 with some connections
        currentArray = [0, 1, 2, 3, 4];
        graphEdges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]];
        
        // Initialize persistent positions in a circle for the first 5 nodes
        const centerX = 300, centerY = 200, radius = 120;
        nodePositions = currentArray.map((_, i) => ({
            x: centerX + radius * Math.cos((2 * Math.PI * i) / currentArray.length),
            y: centerY + radius * Math.sin((2 * Math.PI * i) / currentArray.length)
        }));
        
        renderGraph(currentArray, [], graphEdges);
    }
}

/**
 * Renders a Graph using SVG.
 */
function renderGraph(nodes, highlighted = [], edges = []) {
    container.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 600 400");
    container.appendChild(svg);

    // Use persistent positions if available, otherwise initialize them in a circle
    if (!nodePositions || nodePositions.length !== nodes.length) {
        const centerX = 300, centerY = 200, radius = 120;
        nodePositions = nodes.map((_, i) => ({
            x: centerX + radius * Math.cos((2 * Math.PI * i) / nodes.length),
            y: centerY + radius * Math.sin((2 * Math.PI * i) / nodes.length)
        }));
    }
    
    const positions = nodePositions;

    // Draw Edges
    const connections = edges.length > 0 ? edges : graphEdges;
    connections.forEach(([u, v]) => {
        if (u < nodes.length && v < nodes.length) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", positions[u].x);
            line.setAttribute("y1", positions[u].y);
            line.setAttribute("x2", positions[v].x);
            line.setAttribute("y2", positions[v].y);
            line.setAttribute("stroke", "#1e293b");
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);
        }
    });

    // Draw Nodes
    nodes.forEach((node, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", positions[i].x);
        circle.setAttribute("cy", positions[i].y);
        circle.setAttribute("r", 20);
        circle.setAttribute("fill", highlighted.includes(i) ? "#f59e0b" : "#10b981");
        circle.setAttribute("stroke", "#2dd4bf");
        circle.setAttribute("stroke-width", "2");
        g.appendChild(circle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", positions[i].x);
        text.setAttribute("y", positions[i].y + 5);
        text.setAttribute("fill", "white");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-weight", "bold");
        text.textContent = i;
        g.appendChild(text);

        svg.appendChild(g);
    });
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

/**
 * Renders a Binary Search Tree dynamically using SVG.
 */
function renderTree(arr) {
    container.innerHTML = "";
    if (!arr || arr.length === 0) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 600 400");
    container.appendChild(svg);

    // Build BST structure from array
    let root = null;
    arr.forEach(val => {
        root = insertBST(root, val);
    });

    // Draw tree recursively
    drawBSTNode(svg, root, 300, 50, 150);
}

function insertBST(node, val) {
    if (!node) return { val, left: null, right: null };
    if (val < node.val) node.left = insertBST(node.left, val);
    else node.right = insertBST(node.right, val);
    return node;
}

function drawBSTNode(svg, node, x, y, xOffset) {
    if (!node) return;

    const radius = 22;
    const verticalGap = 70;

    // Draw lines to children
    if (node.left) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", x - xOffset);
        line.setAttribute("y2", y + verticalGap);
        line.setAttribute("stroke", "#2dd4bf");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
        drawBSTNode(svg, node.left, x - xOffset, y + verticalGap, xOffset / 2);
    }
    if (node.right) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", x + xOffset);
        line.setAttribute("y2", y + verticalGap);
        line.setAttribute("stroke", "#2dd4bf");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
        drawBSTNode(svg, node.right, x + xOffset, y + verticalGap, xOffset / 2);
    }

    // Draw node circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "#10b981");
    circle.setAttribute("stroke", "#2dd4bf");
    circle.setAttribute("stroke-width", "2");
    svg.appendChild(circle);

    // Draw node value
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 5);
    text.setAttribute("fill", "white");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("font-size", "14px");
    text.textContent = node.val;
    svg.appendChild(text);
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
            if (algo === 'stack') {
                renderStack(currentArray);
            } else {
                renderQueue(currentArray);
            }
        } else if (currentTab === 'trees') {
            const newVal = Math.floor(Math.random() * 90) + 10;
            currentArray.push(newVal);
            renderTree(currentArray);
        } else if (currentTab === 'graphs') {
            const newNode = currentArray.length;
            currentArray.push(newNode);
            if (newNode > 0) {
                const randomNode = Math.floor(Math.random() * newNode);
                graphEdges.push([randomNode, newNode]);
                
                // Assign new position near the connected node
                const parentPos = nodePositions[randomNode];
                const angle = Math.random() * 2 * Math.PI;
                const dist = 70 + Math.random() * 30;
                nodePositions.push({
                    x: Math.max(40, Math.min(560, parentPos.x + dist * Math.cos(angle))),
                    y: Math.max(40, Math.min(360, parentPos.y + dist * Math.sin(angle)))
                });
            } else {
                nodePositions.push({ x: 300, y: 200 });
            }
            renderGraph(currentArray, [], graphEdges);
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

/**
 * Deletes the last element/node from the current visualization.
 */
function deleteElement() {
    if (isExecuting) return;
    if (currentArray.length === 0) return;

    // Remove the last item
    currentArray.pop();

    // Re-render based on current tab
    if (currentTab === 'linkedlist') {
        renderNodes(currentArray);
    } else if (currentTab === 'stackqueue') {
        const algo = document.getElementById("algorithm-select").value;
        algo === 'stack' ? renderStack(currentArray) : renderQueue(currentArray);
    } else if (currentTab === 'sorting' || currentTab === 'searching') {
        renderBars(currentArray);
    } else if (currentTab === 'trees') {
        renderTree(currentArray);
    } else if (currentTab === 'graphs') {
        const deletedNode = currentArray.length; // after pop, length is the index of deleted node
        graphEdges = graphEdges.filter(([u, v]) => u !== deletedNode && v !== deletedNode);
        nodePositions.pop(); // Maintain sync with currentArray
        renderGraph(currentArray);
    }
}

window.onload = () => {
    initVisualization();
    updateInfo();
};
