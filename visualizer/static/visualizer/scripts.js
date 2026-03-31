let currentArray = [];
const container = document.getElementById("array-container");

function generateArray() {
    container.innerHTML = "";
    currentArray = Array.from({length: 15}, () => Math.floor(Math.random() * 250) + 10);
    renderBars(currentArray);
}

function renderBars(arr, comparing = [], swapping = []) {
    container.innerHTML = "";
    arr.forEach((value, index) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${value}px`;
        
        if (comparing.includes(index)) bar.classList.add("bar-comparing");
        if (swapping.includes(index)) bar.classList.add("bar-swapping");
        
        container.appendChild(bar);
    });
}

async function startSorting() {
    const speed = document.getElementById("speed").value;
    
    // Get the CSRF token from the page
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const response = await fetch('/api/bubble-sort/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken  // <--- This is the key!
        },
        body: JSON.stringify({ array: currentArray })
    });
    
    const data = await response.json();
    
    for (let step of data.steps) {
        renderBars(step.array, step.comparing, step.swapping);
        await new Promise(r => setTimeout(r, 600 - speed));
    }
}

generateArray();