from django.db import models
from django.conf import settings

# Models are objects that exist in the database. They abstract away
# the low level implementation details of using SQL to talk to database.

class Class(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    is_started = models.BooleanField(default=False)
    live_link = models.URLField(blank=True, null=True)

class Student(models.Model):    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_picture/', null=True, blank=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    join_date = models.DateTimeField()
    is_teacher = models.BooleanField(default=False)

class Material(models.Model):
    description = models.TextField(max_length=2000, null=False)
    created_date = models.DateTimeField(null=True)
    file = models.FileField(upload_to='materials/', null=True, blank=True)
    in_class = models.ForeignKey(Class, on_delete=models.CASCADE)

class Messages(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField(max_length=2000, null=False)
    in_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    sent_time = models.DateTimeField()

class ForumThread(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    in_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    text = models.TextField(max_length=2000, null=False)
    created_date = models.DateTimeField(null=True)

class ForumAnswer(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    thread = models.ForeignKey(ForumThread, on_delete=models.CASCADE)
    text = models.TextField(max_length=2000, null=False)
    sent_time = models.DateTimeField()

class Colour(models.Model):
    user_id = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    light_theme = models.BooleanField(default=True)
    highlight_colour = models.TextField(max_length=7, default="#0000FF")

class Tag(models.Model):
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE)
    tag = models.TextField(max_length=100, null=False)

class Assignment(models.Model):
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE)
    name = models.TextField(max_length=100)
    description = models.TextField(max_length=2000)
    created_date = models.DateTimeField(null=True)
    due_date = models.DateTimeField(null=True)

class Submission(models.Model):
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    assignment_id = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    marked = models.BooleanField(default=False)
    points = models.PositiveIntegerField(null=True, blank=True)

class Quiz(models.Model):
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE)
    name = models.TextField(max_length=100)
    description = models.TextField(max_length=100)
    due_date = models.DateTimeField(null=True)

class Question(models.Model):
    quiz_id = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    text = models.TextField(max_length=2000)
    multiple_choice = models.BooleanField(default=True)
    option_a = models.TextField(max_length=2000, blank=True, null=True)
    option_b = models.TextField(max_length=2000, blank=True, null=True)
    option_c = models.TextField(max_length=2000, blank=True, null=True)
    option_d = models.TextField(max_length=2000, blank=True, null=True)
    solution = models.TextField(max_length=2000, blank=True, null=True)

class Result(models.Model):
    quiz_id = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    points = models.IntegerField()

class Rating(models.Model):
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    rating = models.PositiveIntegerField(null=True, blank=True)