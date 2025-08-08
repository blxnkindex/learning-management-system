from rest_framework import serializers

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.validators import validate_email

from .models import *

# Serializers describe how data is converted to and from JSON representations.
# Some serializers have validation rules to ensure data is correct and throw
# errors if not.

class user_serializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='profile.first_name')
    last_name = serializers.CharField(source='profile.last_name')
    join_date = serializers.DateTimeField(source='profile.join_date')
    is_teacher = serializers.BooleanField(source='profile.is_teacher')
    is_self = serializers.SerializerMethodField()
    picture = serializers.ImageField(source='profile.profile_picture')

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "join_date", "is_teacher", "is_self", "picture"]

    def get_is_self(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.id == request.user.id
        return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            data['is_self'] = self.get_is_self(instance)
        return data

class login_serializer(serializers.Serializer):
    username = serializers.CharField(
        label="username",
        write_only=True
    )
    password = serializers.CharField(
        label="password",
        write_only=True
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user = authenticate(request=self.context.get('request'), username=username, password=password)
        if not user:
            msg = 'Access denied: wrong username or password.'
            raise serializers.ValidationError(msg, code='authorization')
        attrs['user'] = user    
        return attrs
    
class register_serializer(serializers.Serializer):
    username = serializers.CharField(
        label="username",
        write_only=True
    )
    password = serializers.CharField(
        label="password",
        write_only=True
    )
    first_name = serializers.CharField(
        label="first_name",
        write_only=True
    )
    last_name = serializers.CharField(
        label="last_name",
        write_only=True
    )
    is_teacher = serializers.BooleanField(
        label="is_teacher",
        write_only=True
    )

    def validate(self, attrs):
        username = attrs.get('username')
        validate_email(username)
        if User.objects.filter(username=username).exists():
            msg = 'User already exists.'
            raise serializers.ValidationError(msg)
        return attrs
    
class class_serializer(serializers.ModelSerializer):
    teacher_profile = user_serializer(source="teacher")

    class Meta:
        model = Class
        fields = ["id", "name", "is_started", "live_link", "teacher_profile"]

class create_class_serializer(serializers.Serializer):
    name = serializers.CharField(
        label="name",
        write_only=True
    )
    live_link = ''

    def validate(self, attrs):
        name = attrs.get('name')
        if Class.objects.filter(name=name).exists():
            msg = 'Class already exists.'
            raise serializers.ValidationError(msg)
        return attrs
class get_class_serializer(serializers.Serializer):
    name = serializers.CharField(
        label="name",
        write_only=True
    )
    
    def validate(self, attrs):
        attrs['class'] = Class.objects.get(name=attrs.get('name'))
        return attrs
    

class student_serializer(serializers.ModelSerializer):
    user = user_serializer()

    class Meta:
        model = Student
        fields = ['user', 'points']

class material_create_serializer(serializers.ModelSerializer):
    class Meta:
        model = Material 
        fields = ['file', 'description', 'created_date', 'in_class']
    
class material_serializer(serializers.ModelSerializer):
    class Meta:
        model = Material 
        fields = ['id', 'file', 'description', 'created_date', 'in_class']

class messages_send_serializer(serializers.Serializer):
    class_id = serializers.CharField(
        label="class_id",
        write_only=True
    )
    message = serializers.CharField(
        label="message",
        write_only=True
    )
    
    def validate(self, attrs):
        attrs['class'] = Class.objects.get(id=attrs.get('class_id'))
        return attrs
    
class messages_serializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user_id.profile.first_name')
    class Meta:
        model = Messages
        fields = ["user_id", "user", "message", "in_class", "sent_time"]

class forum_post_serializer(serializers.Serializer):
    class_id = serializers.CharField(
        label="class_id",
        write_only=True
    )
    text = serializers.CharField(
        label="text",
        write_only=True
    )
    
    def validate(self, attrs):
        attrs['class'] = Class.objects.get(id=attrs.get('class_id'))
        return attrs
    
class forum_serializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user_id.profile.first_name')
    class Meta:
        model = ForumThread
        fields = ["id", "user_id", "user_name", "text", "created_date"]

class answer_post_serializer(serializers.Serializer):
    forum_id = serializers.CharField(
        label="forum_id",
        write_only=True
    )
    text = serializers.CharField(
        label="text",
        write_only=True
    )
    
    def validate(self, attrs):
        attrs['forum'] = ForumThread.objects.get(id=attrs.get('forum_id'))
        return attrs
    
class answer_serializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user_id.profile.first_name')
    class Meta:
        model = ForumAnswer
        fields = ["user_id", "user_name", "text", "sent_time"]

class colour_serializer(serializers.ModelSerializer):
    class Meta:
        model = Colour 
        fields = ['light_theme', 'highlight_colour']

class tag_serializer(serializers.ModelSerializer):
    class Meta:
        model = Tag 
        fields = ['class_id', 'tag']

class profile_picture_serializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture']

class assignment_create_serializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment 
        fields = ['class_id', 'name', 'description', 'due_date']

class assignment_serializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment 
        fields = ['id', 'class_id', 'name', 'description', 'created_date', 'due_date']

class submission_serializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user_id.profile.first_name')
    class Meta:
        model = Submission 
        fields = ['id', 'user_id', 'user_name', 'assignment_id', 'file', 'marked', 'points']

class submission_create_serializer(serializers.ModelSerializer):
    class Meta:
        model = Submission 
        fields = ['assignment_id', 'file']

class mark_serializer(serializers.ModelSerializer):
    class Meta:
        model = Submission 
        fields = ['marked', 'points']

class quiz_serializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz 
        fields = ['id', 'class_id', 'name', 'description', 'due_date']

class question_serializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['quiz_id', 'text', 'multiple_choice', 'option_a', 'option_b', 'option_c', 'option_d', 'solution']

class result_serializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user_id.profile.first_name')
    class Meta:
        model = Result
        fields = ['quiz_id', 'user_id', 'user', 'points']

class result_create_serializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ['quiz_id', 'points']

class rating_create_serializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['class_id', 'rating']

class rating_serializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['class_id','user_id', 'rating']
