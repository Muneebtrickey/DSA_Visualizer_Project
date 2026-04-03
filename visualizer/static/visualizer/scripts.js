let currentTab = 'sorting';
let currentArray = [];
const container = document.getElementById("viz-container");
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

const metadata = {
    sorting: {
        title: "Sorting Visualizer",
        desc: "Organize data using efficient comparison-based algorithms.",
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
        algos: [
            { id: 'linear', name: 'Linear Search', time: 'O(n)', space: 'O(1)', desc: 'Checks every element in the list sequentially until a match is found.' },
            { id: 'binary', name: 'Binary Search', time: 'O(log n)', space: 'O(1)', desc: 'Repeatedly divides the search interval in half (requires sorted data).' }
        ]
    },
    linkedlist: {
        title: "Linked List Visualizer",
        desc: "Understand dynamic memory allocation and pointers.",
        algos: [
            { id: 'singly', name: 'Singly Linked List', time: 'O(n)', space: 'O(n)', desc: 'A collection of nodes where each node points to the next.' }
        ]
    },
    stackqueue: {
        title: "Stack & Queue",
        desc: "Visualizing LIFO and FIFO data structures.",
        algos: [
            { id: 'stack', name: 'Stack (LIFO)', time: 'O(1)', space: 'O(n)', desc: 'Last-In First-Out structure for push/pop operations.' },
            { id: 'queue', name: 'Queue (FIFO)', time: 'O(1)', space: 'O(n)', desc: 'First-In First-Out structure for enqueue/dequeue.' }
        ]
    },
    trees: {
        title: "Binary Search Tree",
        desc: "Visualizing hierarchical data structures.",
        algos: [
            { id: 'bst', name: 'BST Operations', time: 'O(log n)', space: 'O(n)', desc: 'A node-based tree data structure where each node has at most two children.' }
        ]
    }
};

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    // Note: event.currentTarget might not work if called from here, 
    // but the inline onclick passes it or we can find it.
    // In this case, we'll just handle the active class in the inline onclick.
    
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
    }
}

function initVisualization() {
    container.innerHTML = "";
    const size = parseInt(document.getElementById('size').value);
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

function renderBars(arr, states = {}) {
    container.innerHTML = "";
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
    stackBox.style.border = "2px solid var(--border)";
    stackBox.style.borderTop = "none";
    stackBox.style.width = "100px";
    stackBox.style.padding = "10px";
    stackBox.style.display = "flex";
    stackBox.style.flexDirection = "column-reverse";
    stackBox.style.gap = "10px";

    arr.forEach(val => {
        const item = document.createElement("div");
        item.className = "node p-2 w-100 rounded-0";
        item.style.margin = "0";
        item.innerText = val;
        stackBox.appendChild(item);
    });
    container.appendChild(stackBox);
}

function renderQueue(arr) {
    container.innerHTML = "";
    const queueBox = document.createElement("div");
    queueBox.style.border = "2px solid var(--border)";
    queueBox.style.width = "400px";
    queueBox.style.height = "80px";
    queueBox.style.display = "flex";
    queueBox.style.alignItems = "center";
    queueBox.style.padding = "10px";
    queueBox.style.gap = "10px";
    queueBox.style.borderLeft = "none";
    queueBox.style.borderRight = "none";

    arr.forEach(val => {
        const item = document.createElement("div");
        item.className = "node";
        item.style.margin = "0";
        item.innerText = val;
        queueBox.appendChild(item);
    });
    container.appendChild(queueBox);
}

function renderTree() {
    container.innerHTML = "";
    const treeSvg = `
        <svg width="400" height="300" viewBox="0 0 400 300">
            <line x1="200" y1="50" x2="100" y2="120" stroke="#38bdf8" stroke-width="2" />
            <line x1="200" y1="50" x2="300" y2="120" stroke="#38bdf8" stroke-width="2" />
            <circle cx="200" cy="50" r="20" fill="#6366f1" />
            <text x="200" y="55" fill="white" text-anchor="middle" font-weight="bold">50</text>
            
            <circle cx="100" cy="120" r="20" fill="#6366f1" />
            <text x="100" y="125" fill="white" text-anchor="middle" font-weight="bold">30</text>
            
            <circle cx="300" cy="120" r="20" fill="#6366f1" />
            <text x="300" y="125" fill="white" text-anchor="middle" font-weight="bold">70</text>
        </svg>
    `;
    container.innerHTML = treeSvg;
}

async function executeAlgorithm() {
    const speed = document.getElementById("speed").value;
    const algo = document.getElementById("algorithm-select").value;
    const delay = 650 - speed;

    if (currentTab === 'sorting') {
        const response = await fetch('/api/sort/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            body: JSON.stringify({ array: currentArray, algorithm: algo })
        });
        const data = await response.json();
        for (let step of data.steps) {
            renderBars(step.array, step);
            await new Promise(r => setTimeout(r, delay));
        }
    } else if (currentTab === 'searching') {
        const targetInput = document.getElementById('search-target');
        const target = parseInt(targetInput.value);
        if (isNaN(target)) return alert("Please enter a target value");
        
        const response = await fetch('/api/search/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            body: JSON.stringify({ array: currentArray, algorithm: algo, target: target })
        });
        const data = await response.json();
        for (let step of data.steps) {
            renderBars(step.array, step);
            await new Promise(r => setTimeout(r, delay));
        }
    } else if (currentTab === 'linkedlist') {
        const newVal = Math.floor(Math.random() * 90) + 10;
        currentArray.push(newVal);
        renderNodes(currentArray);
        const nodes = container.querySelectorAll('.node');
        nodes[nodes.length-1].classList.add('found');
        setTimeout(() => nodes[nodes.length-1].classList.remove('found'), 1000);
    } else if (currentTab === 'stackqueue') {
        const newVal = Math.floor(Math.random() * 90) + 10;
        if (algo === 'stack') {
            currentArray.push(newVal);
            renderStack(currentArray);
        } else {
            currentArray.push(newVal);
            renderQueue(currentArray);
        }
    }
}

window.onload = () => {
    initVisualization();
    updateInfo();
};
