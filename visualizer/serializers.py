from rest_framework import serializers

class AlgorithmStepSerializer(serializers.Serializer):
    array = serializers.ListField(child=serializers.IntegerField())
    comparing = serializers.ListField(child=serializers.IntegerField(), required=False)
    swapping = serializers.ListField(child=serializers.IntegerField(), required=False)