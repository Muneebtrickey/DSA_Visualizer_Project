from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

def index(request):
    """Main entry point for the visualizer application."""
    return render(request, 'visualizer/index.html')

class SortingView(APIView):
    """API for sorting algorithm steps."""
    def post(self, request):
        arr = request.data.get('array', [])
        algorithm = request.data.get('algorithm', 'bubble')
        steps = []

        if algorithm == 'bubble':
            steps = self.bubble_sort(arr.copy())
        elif algorithm == 'selection':
            steps = self.selection_sort(arr.copy())
        elif algorithm == 'insertion':
            steps = self.insertion_sort(arr.copy())
        elif algorithm == 'quick':
            temp_arr = arr.copy()
            self.quick_sort(temp_arr, 0, len(temp_arr) - 1, steps)
        elif algorithm == 'merge':
            temp_arr = arr.copy()
            self.merge_sort(temp_arr, 0, len(temp_arr) - 1, steps)
        
        return Response({"steps": steps})

    # --- Quick Sort ---
    def quick_sort(self, arr, low, high, steps):
        if low < high:
            pivot_index = self.partition(arr, low, high, steps)
            self.quick_sort(arr, low, pivot_index - 1, steps)
            self.quick_sort(arr, pivot_index + 1, high, steps)

    def partition(self, arr, low, high, steps):
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            steps.append({'array': arr.copy(), 'comparing': [j, high]})
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                steps.append({'array': arr.copy(), 'swapping': [i, j]})
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        steps.append({'array': arr.copy(), 'swapping': [i + 1, high]})
        return i + 1

    # --- Merge Sort ---
    def merge_sort(self, arr, l, r, steps):
        if l < r:
            m = l + (r - l) // 2
            self.merge_sort(arr, l, m, steps)
            self.merge_sort(arr, m + 1, r, steps)
            self.merge(arr, l, m, r, steps)

    def merge(self, arr, l, m, r, steps):
        n1 = m - l + 1
        n2 = r - m
        L = arr[l:m+1]
        R = arr[m+1:r+1]
        i = j = 0
        k = l
        while i < n1 and j < n2:
            steps.append({'array': arr.copy(), 'comparing': [l + i, m + 1 + j]})
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            steps.append({'array': arr.copy(), 'swapping': [k]})
            k += 1
        while i < n1:
            arr[k] = L[i]
            i += 1
            k += 1
            steps.append({'array': arr.copy(), 'swapping': [k-1]})
        while j < n2:
            arr[k] = R[j]
            j += 1
            k += 1
            steps.append({'array': arr.copy(), 'swapping': [k-1]})

    def bubble_sort(self, arr):
        steps = []
        n = len(arr)
        for i in range(n):
            for j in range(0, n - i - 1):
                steps.append({'array': arr.copy(), 'comparing': [j, j + 1]})
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
                    steps.append({'array': arr.copy(), 'swapping': [j, j + 1]})
        return steps

    def selection_sort(self, arr):
        steps = []
        n = len(arr)
        for i in range(n):
            min_idx = i
            for j in range(i + 1, n):
                steps.append({'array': arr.copy(), 'comparing': [min_idx, j]})
                if arr[j] < arr[min_idx]:
                    min_idx = j
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            steps.append({'array': arr.copy(), 'swapping': [i, min_idx]})
        return steps

    def insertion_sort(self, arr):
        steps = []
        for i in range(1, len(arr)):
            key = arr[i]
            j = i - 1
            while j >= 0 and key < arr[j]:
                steps.append({'array': arr.copy(), 'comparing': [j, j + 1]})
                arr[j + 1] = arr[j]
                steps.append({'array': arr.copy(), 'swapping': [j, j + 1]})
                j -= 1
            arr[j + 1] = key
        return steps

class SearchingView(APIView):
    """API for searching algorithm steps."""
    def post(self, request):
        arr = request.data.get('array', [])
        target = request.data.get('target', 0)
        algorithm = request.data.get('algorithm', 'linear')
        steps = []

        if algorithm == 'linear':
            steps = self.linear_search(arr, target)
        elif algorithm == 'binary':
            # Binary search requires sorted array
            sorted_arr = sorted(arr)
            steps = self.binary_search(sorted_arr, target)
        
        return Response({"steps": steps})

    def linear_search(self, arr, target):
        steps = []
        for i in range(len(arr)):
            steps.append({'array': arr, 'comparing': [i]})
            if arr[i] == target:
                steps.append({'array': arr, 'found': [i]})
                break
        return steps

    def binary_search(self, arr, target):
        steps = []
        low = 0
        high = len(arr) - 1
        while low <= high:
            mid = (low + high) // 2
            steps.append({'array': arr, 'comparing': [mid], 'range': [low, high]})
            if arr[mid] == target:
                steps.append({'array': arr, 'found': [mid]})
                break
            elif arr[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        return steps