from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

# This is the part that was missing!
def index(request):
    return render(request, 'visualizer/index.html')

class SortingView(APIView):
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
        
        return Response({"steps": steps})

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