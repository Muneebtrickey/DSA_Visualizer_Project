from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

def index(request):
    return render(request, 'visualizer/index.html')

class BubbleSortView(APIView):
    def post(self, request):
        arr = request.data.get('array', [])
        steps = []
        n = len(arr)
        temp_arr = arr.copy()

        # Calculate all steps on the backend
        for i in range(n):
            for j in range(0, n - i - 1):
                steps.append({
                    'array': temp_arr.copy(),
                    'comparing': [j, j + 1],
                    'swapping': []
                })
                if temp_arr[j] > temp_arr[j + 1]:
                    temp_arr[j], temp_arr[j + 1] = temp_arr[j + 1], temp_arr[j]
                    steps.append({
                        'array': temp_arr.copy(),
                        'comparing': [],
                        'swapping': [j, j + 1]
                    })
        
        return Response({"steps": steps})