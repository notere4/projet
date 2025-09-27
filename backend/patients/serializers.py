from rest_framework import serializers
from .models import Patient, Doctor


class PatientSerializer(serializers.ModelSerializer):
    """Serializer for Patient model"""
    
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    allergies_list = serializers.ReadOnlyField()
    current_treatments_list = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'cin',
            'date_of_birth', 'age', 'phone', 'email', 'address',
            'allergies', 'allergies_list', 'current_treatments', 
            'current_treatments_list', 'last_consultation_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_cin(self, value):
        """Validate CIN format"""
        import re
        if not re.match(r'^\d{8}$', value):
            raise serializers.ValidationError(
                "Le CIN doit contenir exactement 8 chiffres."
            )
        return value


class PatientSearchSerializer(serializers.Serializer):
    """Serializer for patient search parameters"""
    
    cin = serializers.CharField(
        required=False, 
        max_length=8,
        help_text="Recherche par CIN (8 chiffres)"
    )
    name = serializers.CharField(
        required=False, 
        max_length=200,
        help_text="Recherche par nom ou prénom"
    )
    phone = serializers.CharField(
        required=False, 
        max_length=20,
        help_text="Recherche par numéro de téléphone"
    )

    def validate_cin(self, value):
        """Validate CIN format if provided"""
        if value:
            import re
            if not re.match(r'^\d{8}$', value):
                raise serializers.ValidationError(
                    "Le CIN doit contenir exactement 8 chiffres."
                )
        return value


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model"""
    
    full_name = serializers.ReadOnlyField()
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email',
            'specialty', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']