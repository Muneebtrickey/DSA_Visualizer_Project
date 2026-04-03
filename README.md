# DSA Visualizer

A web-based platform for visualizing data structures and algorithms, built with Django and modern web technologies. This project is designed to help developers and students better understand how common algorithms function through interactive, step-by-step animations.

## Core Features

- **Algorithm Visualizations**: Real-time animations for sorting (Bubble, Selection, Insertion, Quick, Merge) and searching (Linear, Binary) algorithms.
- **Data Structure Demos**: Interactive exploration of Linked Lists, Stacks, Queues, and Binary Search Trees.
- **Complexity Analysis**: Integrated time and space complexity information for each algorithm.
- **Modern Interface**: A responsive, dark-themed UI built with a focus on clarity and performance.
- **Backend Integration**: Leverages a Django REST API to process algorithm logic, ensuring consistency between the UI and actual execution.

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, and Bootstrap 5 for the layout and animations.
- **Backend**: Python and Django, using Django REST Framework for API communication.
- **Visuals**: SVG and dynamic DOM manipulation for efficient rendering of data structures.

## Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/dsa-visualizer.git
   cd dsa-visualizer
   ```

2. **Set up a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install the required packages**:
   ```bash
   pip install django djangorestframework
   ```

4. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

5. **Access the application**:
   Open your browser and navigate to `http://127.0.0.1:8000`.

## Project Overview

- `visualizer/views.py`: Contains the core algorithm logic and API endpoints.
- `visualizer/static/visualizer/scripts.js`: Manages the frontend state and animation logic.
- `visualizer/templates/visualizer/index.html`: The main user interface structure.

## Contributing

If you would like to contribute, please feel free to submit a pull request or report issues. We are always looking to add more algorithms and improve the overall visualization experience.
