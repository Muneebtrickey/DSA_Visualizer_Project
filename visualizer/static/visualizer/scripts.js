/**
 * DSA Lab - Frontend Logic
 * This script handles all interactive elements of the DSA Visualizer,
 * including tab switching, algorithm execution, and UI updates.
 */

let currentTab = 'sorting';
let currentArray = [];
let isExecuting = false; // Flag to prevent multiple executions at once

// DOM Elements
const container = document.getElementById("viz-container");
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
const executeBtn = document.getElementById("execute-btn");
const speedInput = document.getElementById("speed");

/**
 * Metadata for each category including descriptions, complexities, and learning resources.
 */
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

/**
 * Switches between different DSA categories (tabs).
 * @param {string} tab - The category ID.
 * @param {HTMLElement} element - The clicked navigation element.
 */
function switchTab(tab, element) {
    if (isExecuting) return; // Prevent switching while an animation is running

    currentTab = tab;
    
    // Update Active Link UI
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    
    // Update Headers
    document.getElementById('view-title').innerText = metadata[tab].title;
    document.getElementById('view-desc').innerText = metadata[tab].desc;
    
    // Populate Algorithm Dropdown
    const select = document.getElementById('algorithm-select');
    select.innerHTML = '';
    metadata[tab].algos.forEach(algo => {
        const opt = document.createElement('option');
        opt.value = algo.id;
        opt.innerText = algo.name;
        select.appendChild(opt);
    });

    // Toggle Search Input
    document.getElementById('target-input-container').style.display = tab === 'searching' ? 'block' : 'none';
    
    updateInfo();
    initVisualization();
}

/**
 * Updates algorithm-specific information, complexity badges, and resources.
 */
function updateInfo() {
    const algoId = document.getElementById('algorithm-select').value;
    const algo = metadata[currentTab].algos.find(a => a.id === algoId);
    if (algo) {
        document.getElementById('time-comp').innerText = algo.time;
        document.getElementById('space-comp').innerText = algo.space;
        document.getElementById('algo-explanation').innerText = algo.desc;
        
        const formattedName = algo.name.replace(/ /g, '+');
        
        // Update Resource Links
        const resourceLinks = document.getElementById('resource-links').getElementsByTagName('a');
        resourceLinks[0].href = metadata[currentTab].resource;
        resourceLinks[2].href = `https://www.youtube.com/results?search_query=${formattedName}+visualized`;
    }
}

/**
 * Initializes the visualization stage with fresh data based on the current tab.
 */
function initVisualization() {
    if (isExecuting) return;

    container.innerHTML = "";
    const size = parseInt(document.getElementById('size').value);
    currentArray = [];
    
    if (currentTab === 'sorting' || currentTab === 'searching') {
        for (let i = 0; i < size; i++) {
            currentArray.push(Math.floor(Math.random() * 300) + 20);
        }
        // Binary search requires a sorted array
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

/**
 * Helper to get the current animation delay from the speed slider.
 * Higher slider value = Lower delay (faster animation).
 */
function getDelay() {
    const val = parseInt(speedInput.value);
    // Range 50-600. We map it so that 600 is very fast (50ms) and 50 is slow (600ms).
    return 650 - val;
}

/**
 * Renders an array as vertical bars (Sorting/Searching).
 */
function renderBars(arr, states = {}) {
    container.innerHTML = "";
    const max = Math.max(...arr);
    arr.forEach((value, index) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${(value / max) * 100}%`;
        
        // Apply styling based on current step state
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

/**
 * Renders linked list nodes with arrows.
 */
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

/**
 * Renders a vertical stack.
 */
function renderStack(arr) {
    container.innerHTML = "";
    const stackBox = document.createElement("div");
    stackBox.className = "d-flex flex-column-reverse gap-2 p-3 border border-secondary border-top-0";
    stackBox.style.width = "120px";
    stackBox.style.minHeight = "200px";

    arr.forEach(val => {
        const item = document.createElement("div");
        item.className = "node w-100 rounded-0";
        item.style.margin = "0";
        item.innerText = val;
        stackBox.appendChild(item);
    });
    container.appendChild(stackBox);
}

/**
 * Renders a horizontal queue.
 */
function renderQueue(arr) {
    container.innerHTML = "";
    const queueBox = document.createElement("div");
    queueBox.className = "d-flex align-items-center gap-2 p-3 border border-secondary border-start-0 border-end-0";
    queueBox.style.minWidth = "300px";
    queueBox.style.height = "100px";

    arr.forEach(val => {
        const item = document.createElement("div");
        item.className = "node";
        item.style.margin = "0";
        item.innerText = val;
        queueBox.appendChild(item);
    });
    container.appendChild(queueBox);
}

/**
 * Renders a static Binary Search Tree SVG placeholder.
 */
function renderTree() {
    container.innerHTML = "";
    const treeSvg = `
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
    container.innerHTML = treeSvg;
}

/**
 * Handles the execution of algorithms by communicating with the backend API.
 */
async function executeAlgorithm() {
    if (isExecuting) return;
    
    const algo = document.getElementById("algorithm-select").value;
    isExecuting = true;
    executeBtn.disabled = true;
    executeBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Executing...';

    try {
        if (currentTab === 'sorting') {
            const response = await fetch('/api/sort/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify({ array: currentArray, algorithm: algo })
            });
            const data = await response.json();
            for (let step of data.steps) {
                renderBars(step.array, step);
                // Delay is read dynamically each step so speed changes mid-animation work!
                await new Promise(r => setTimeout(r, getDelay()));
            }
        } else if (currentTab === 'searching') {
            const targetInput = document.getElementById('search-target');
            const target = parseInt(targetInput.value);
            if (isNaN(target)) {
                alert("Please enter a target value");
                throw new Error("Invalid target");
            }
            
            const response = await fetch('/api/search/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify({ array: currentArray, algorithm: algo, target: target })
            });
            const data = await response.json();
            for (let step of data.steps) {
                renderBars(step.array, step);
                await new Promise(r => setTimeout(r, getDelay()));
            }
        } else if (currentTab === 'linkedlist') {
            // Simulated local push for demo purposes
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
    } catch (err) {
        console.error(err);
    } finally {
        isExecuting = false;
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<i class="bi bi-play-fill"></i> Execute';
    }
}

// Initial Page Load
window.onload = () => {
    initVisualization();
    updateInfo();
};
