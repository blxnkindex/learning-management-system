from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.http import FileResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status
from django.conf import settings
from django.utils import timezone
import datetime

from .models import *
from .serializers import *

# Handles login post request.
class login_view(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        # Ensure user credentials are correct.
        serializer = login_serializer(data=self.request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Login User.
        login(request, user) 
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Handles register post request.
class register_view(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        # Ensure register info is correct.
        serializer = register_serializer(data=self.request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Create new user object to store authentication info.
        new_user = User.objects.create_user(username=serializer.validated_data['username'],
                                            email=serializer.validated_data['username'],
                                            password=serializer.validated_data['password'])
        
        # Create associated profile object to store identification info.
        profile = Profile.objects.create(first_name=serializer.validated_data['first_name'],
                                         last_name=serializer.validated_data['last_name'],
                                         join_date=datetime.datetime.now(tz=timezone.utc),
                                         user=new_user,
                                         is_teacher=serializer.validated_data['is_teacher'])

        # Set default user color pallete.
        color = Colour.objects.create(user_id=new_user)

        # Save changes to database.
        profile.save()
        color.save()

        # Login newly created user.
        login(request, new_user)
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Handles logout request.
class logout_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Perform logout.
        logout(request)
        return Response(None, status=status.HTTP_200_OK)
    
# Returns user info.
class user(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    # Query can come through 2 paths, either 'user/<int:id>/' or 'user/'. The
    # first type returns information about user with particular id. The second,
    # returns info of requesting user.
    def get(self, request, id=None):
        # Query by id.
        if id is not None:
            user = User.objects.get(id=id)

        # Query self
        else:
            user = request.user
        
        # Return JSON using serializer.
        serializer = user_serializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

# Returns class info.
class classes(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query can come through 2 paths, either 'classes/' or 'classes/<int:id>/'.
    # The first type returns list of classes requesting user is in. The second
    # type returns class with given id.
    def get(self, request, id=None):
        # Query by id.
        if id is not None:
            serializer = class_serializer(Class.objects.get(id=id), many=False)      
        # Query classes user is part of.
        else:
            class_as_student = Class.objects.filter(pk__in=Student.objects.filter(user=request.user).values_list('joined_class'))
            classes_as_teacher = request.user.class_set.all()            
            serializer = class_serializer(class_as_student | classes_as_teacher, many=True)

        # Return JSON using serializer.
        return Response(serializer.data, status=status.HTTP_200_OK)

# Returns list of students in a particular class.
class class_students(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'classes/<int:id>/students/'
    def get(self, request, id):
        # Get student_set of class with given id.
        serializer = student_serializer(Class.objects.get(id=id).student_set, many=True)

        # Return JSON using serializer.
        return Response(serializer.data, status=status.HTTP_200_OK)

# Returns list of classes a given user is part of.
class user_classes(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'user_classes/<int:id>/'
    def get(self, request, id):
        # Grab classes that user is part of either by being teacher or student.
        class_as_student = Class.objects.filter(pk__in=Student.objects.filter(user=User.objects.get(id=id)).values_list('joined_class'))
        classes_as_teacher = User.objects.get(id=id).class_set.all()

        # Return JSON using serializer.
        serializer = class_serializer(class_as_student | classes_as_teacher, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Creates new class given name.
class create_class_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'create_class/'
    def post(self, request, format=None):
        # Extract fields of request using serializer and raise data for invalid data.
        serializer = create_class_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Create new class using name and set teacher to requesting user.
        new_class = Class.objects.create(teacher=request.user, name=validated_data['name'])

        # Save new class to database and return class_id.
        new_class.save()
        response_data = {
            'class_id': new_class.id  # Include the newly created class ID in the response
        }
        return Response(response_data, status=status.HTTP_202_ACCEPTED)

# Joins requesting user to given class.  
class join_class_view(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    # Query comes through 'join_class/'
    def post(self, request, format=None):
        # Extract fields of request using serializer and raise error for invalid data.
        serializer = get_class_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Add user to class by creating new student object. (Only if they haven't joined already)
        if not Student.objects.filter(user=request.user, joined_class=validated_data['class']).exists():
            new_student = Student.objects.create(user=request.user, joined_class=validated_data['class'])
            new_student.save()            
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Starts live mode for a class.
class class_start_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'class_start/'.
    def post(self, request, format=None):
        # Extract fields of request using serializer and raise error for invalid data.
        serializer = get_class_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Set live mode status in class object and save to database.
        link = self.request.data.get('live_link')
        validated_data['class'].live_link = link
        validated_data['class'].is_started = True
        validated_data['class'].save()
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Stops live mode for a class.
class class_stop_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'class_stop/'.
    def post(self, request, format=None):
        # Extract fields of request using serializer and raise error for invalid data.
        serializer = get_class_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Set live mode status in class object and save to database.
        validated_data['class'].is_started = False
        validated_data['class'].live_link = ''
        validated_data['class'].save()

        # Delete all messages sent during current live mode.
        Messages.objects.filter(in_class=validated_data['class']).all().delete()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Creates a new material within a given class
class materials_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Request comes through 'materials/' with file data and metadata fields.
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = material_create_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)
        material = Material.objects.create(file=serializer.validated_data['file'],
                                           description=serializer.validated_data['description'],
                                           created_date=datetime.datetime.now(tz=timezone.utc),
                                           in_class=serializer.validated_data['in_class'])
        
        # Get list of students in class that need to be emailed.
        recipient_list = []
        students = Student.objects.filter(joined_class=Class.objects.get(id=material.in_class.id))
        for i in students:
            recipient_list.append(str(i.user))
        
        # Set email destination and content.
        email_from = settings.DEFAULT_FROM_EMAIL
        subject = f"Announcement from [{material.in_class.name}] - New Material"
        message = f"Teacher has uploaded new material '{material.description}' to the class {material.in_class.name}. Log in to WhiteboardCollab to view it now!"
        
        # Send email to all students in the class.
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)

        # Save material to database.
        material.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Sends a message from requesting user to particular class.
class messages_send_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'messages_send/'
    def post(self, request, format=None):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = messages_send_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Create new message object.
        new_message = Messages.objects.create(user_id=request.user, 
                                              message=validated_data['message'],
                                              in_class=validated_data['class'], 
                                              sent_time=datetime.datetime.now(tz=timezone.utc))
        
        # Save message to database.
        new_message.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)    

# Gets messages associated with particular class
class messages_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'messages_get/<int:class_id>/'
    def get(self, request, class_id):
        # Filter messages by class_id
        messages = Messages.objects.filter(in_class=Class.objects.get(id=class_id)).order_by("sent_time")
        
        # Return JSON using serializer.
        serializer = messages_serializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Returns list of materials available in particular class.
class materials_list_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'materials_list/<int:class_id>/'
    def get(self, request, class_id):
        # Filter materials by class_id
        materials = Material.objects.filter(in_class=Class.objects.get(id=class_id))

        # Return JSON using serializer.
        serializer = material_serializer(materials, many=True)
        for i in range(len(serializer.data)):
            # Remove filepath from filename.
            serializer.data[i]['file'] = serializer.data[i]['file'][11:]
        return Response(serializer.data, status=status.HTTP_200_OK)

# Downloads material with given filename
class material_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'materials/<str:filename>/'
    def get(self, request, filename):
        # Get material of interest.
        material = Material.objects.get(file="materials/" + filename)

        # Return material as file (downloads on user side)
        return FileResponse(material.file.open(), as_attachment=True)

# Creates a new thread in the forum.
class forum_post_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'forum/'
    def post(self, request, format=None):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = forum_post_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Create new forumThread object.
        new_post = ForumThread.objects.create(user_id=request.user, 
                                              text=validated_data['text'],
                                              in_class=validated_data['class'], 
                                              created_date=datetime.datetime.now(tz=timezone.utc))
        
        # Get list of students in class that need to be emailed.
        recipient_list = []
        students = Student.objects.filter(joined_class=Class.objects.get(id=new_post.in_class.id))
        for i in students:
            recipient_list.append(str(i.user))

        # Set email destination and content.
        email_from = settings.DEFAULT_FROM_EMAIL
        subject = f"Announcement from [{new_post.in_class.name}] - New Forum Post"
        message = f"There was a new thread added to the Forum for the class {new_post.in_class.name}. Log in to WhiteboardCollab to view it now!"
        
        # Send email to all students in class.
        send_mail(subject, message, email_from,recipient_list, fail_silently=False)

        # Save new post to database.
        new_post.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Gets list of forum threads in given class.
class forum_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'forum/<int:class_id>/'
    def get(self, request, class_id):
        # Filter forum threads by class_id.
        threads = ForumThread.objects.filter(in_class=Class.objects.get(id=class_id)).order_by("-created_date")
        
        # Return JSON using serializer.
        serializer = forum_serializer(threads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)    

# Posts an answer to given forum thread.
class answer_post_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'answer/'
    def post(self, request, format=None):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = answer_post_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Create answer object.
        new_answer = ForumAnswer.objects.create(user_id=request.user, 
                                              text=validated_data['text'],
                                              thread=validated_data['forum'], 
                                              sent_time=datetime.datetime.now(tz=timezone.utc))
        
        # Save answer object to the database.
        new_answer.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Gets list of answers to given forum thread.
class answer_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'answer/<int:forum_id>/'
    def get(self, request, forum_id):
        # Filter answers by forum_id.
        answers = ForumAnswer.objects.filter(thread=ForumThread.objects.get(id=forum_id)).order_by("-sent_time")
        
        # Return JSON using serializer.
        serializer = answer_serializer(answers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Gets color pallet for requesting user. 
class color_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'color_get/'
    def get(self, request):
        # Get color object of requesting user.
        colour = request.user.colour

        # Return JSON using serializer.
        serializer = colour_serializer(colour)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Sets color pallet for requesting user.   
class color_set_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'color_set/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = colour_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Get current color object for requesting user.
        user_colour = Colour.objects.get(user_id=request.user)

        # Update color object.
        user_colour.light_theme=validated_data['light_theme']
        user_colour.highlight_colour=validated_data['highlight_colour']

        # Save changes to database.
        user_colour.save()
        return Response(None, status=status.HTTP_200_OK)

# Gets list of tags for given class.
class tags_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'tags_get/<int:class_id>/'
    def get(self, request, class_id):
        # Return tag set from class with given id.
        tags = Class.objects.get(id=class_id).tag_set.all().values_list("tag", flat=True).distinct()
        return Response(tags, status=status.HTTP_200_OK)

# Sets a tag for given class.
class tag_set_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = tag_serializer(data=self.request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Create new tag object.
        new_tag = Tag.objects.create(class_id=validated_data['class_id'],
                                     tag=validated_data['tag'])
        
        # Save tag to database.
        new_tag.save()
        return Response(None, status=status.HTTP_200_OK)

# Returns list of reccomendations based on tag similarity.
class recommendations_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'recommendations/'
    def get(self, request):
        # Get classes user is in.
        classes = Class.objects.filter(pk__in=Student.objects.filter(user=request.user).values_list('joined_class'))
        
        # Get list of all tags from these classes.
        tags = set()
        for c in classes:
            tags |= set(c.tag_set.all().values_list("tag", flat=True).distinct())

        # Get list of classes user is not in.
        classes_not_part_of = Class.objects.all().difference(classes)

        # For each of these classes see if any tags match and if so at it to list
        # of recommendations. Also count the number of matching tags in each.
        recommended_classes = {}
        for c in classes_not_part_of:
            class_tags = set(c.tag_set.all().values_list("tag", flat=True).distinct())
            num_matches = len(set(tags) & set(class_tags))
            if num_matches:
                recommended_classes[c] = num_matches

        # Sort recommended classes by number of matching tags.
        recommended_classes = dict(sorted(recommended_classes.items(), key=lambda item: item[1], reverse=True)).keys()
        
        # Return JSON using serializer.
        serializer = class_serializer(recommended_classes, many=True)        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# Sets profile picture foir requesting user.
class profile_picture_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'profile_picture/'
    def post(self, request, *args, **kwargs):
        # Get requesting user profile.
        profile = request.user.profile

        # Extract fields of request and file data and raise error for invalid data.
        serializer = profile_picture_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Set new profile picture in profile object.
        profile.profile_picture = serializer.validated_data['profile_picture']
        
        # Save profile to database.
        profile.save()
        return Response(None, status=status.HTTP_200_OK)
    
# Returns profile picture by filename.
class profile_picture_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'profile_picture/<str:filename>/'
    def get(self, request, filename):
        # Get profile picture file from database.
        profile_picture = Profile.objects.get(profile_picture="profile_picture/" + filename).profile_picture
        
        # Return profile picture file.
        return FileResponse(profile_picture.open(), as_attachment=True)
    
# Creates assignment in a given class.
class assignment_create_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'assignment_create/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = assignment_create_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Create new assignment object.
        assignment = Assignment.objects.create(class_id=serializer.validated_data['class_id'],
                                               name=serializer.validated_data['name'],
                                               description=serializer.validated_data['description'],
                                               created_date=datetime.datetime.now(tz=timezone.utc),
                                               due_date=serializer.validated_data['due_date'])

        # Get list of students in class that need to be emailed.
        recipient_list = []
        students = Student.objects.filter(joined_class=Class.objects.get(id=assignment.class_id.id))
        for i in students:
            recipient_list.append(str(i.user))

        # Set email destination and content.
        email_from = settings.DEFAULT_FROM_EMAIL
        class_curr = Class.objects.filter(id=assignment.class_id.id)
        subject = f"Announcement from [{class_curr[0].name}] - New Assignment Posted"
        message = f"There was a new assignment posted for the class {class_curr[0].name}. Log in to WhiteboardCollab to view it now!"
        
        # Send email to all students in class.
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)

        # Save new assignment to database.        
        assignment.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Get list of assignments in given class.
class assignment_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    # Query comes through 'assignment_get/<int:class_id>/'
    def get(self, request, class_id):
        # Filter assignments by class_id.
        assignments = Assignment.objects.filter(class_id=Class.objects.get(id=class_id))

        # Return JSON using serializer.
        serializer = assignment_serializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# Create a submission for given assignment.
class submission_create_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'submission_create/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = submission_create_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Create new submission object.
        submission = Submission.objects.create(user_id=request.user,
                                               assignment_id=serializer.validated_data['assignment_id'],
                                               file=serializer.validated_data['file'])
        # Set email destination and content.
        student = str(request.user)
        recipient_list = []
        recipient_list.append(student)
        email_from = settings.DEFAULT_FROM_EMAIL
        assignment = Assignment.objects.filter(id=submission.assignment_id.id)
        subject = f"Announcement - Your Submission"
        message = f"You have successfuly submitted your assignment {assignment[0].name}. Log in to WhiteboardCollab to view it now!"
        
        # Send email to student which submitted assignment.
        send_mail(subject, message, email_from,recipient_list, fail_silently=False)
        
        # Save submission to databse.
        submission.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Get list of submissions for given assignment
class submissions_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'submissions_get/<int:assignment_id>/'
    def get(self, request, assignment_id):
        # Filter submissions by assignment_id
        submissions = Submission.objects.filter(assignment_id=Assignment.objects.get(id=assignment_id))
        
        # Return JSON using serializer.
        serializer = submission_serializer(submissions, many=True)
        for i in range(len(serializer.data)):
            # Remove path from filename.
            serializer.data[i]['file'] = serializer.data[i]['file'][13:]
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
# Download a given submission file.
class submissions_download_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'submissions_download/<str:filename>/'
    def get(self, request, filename):
        # Get submission object.
        submission = Submission.objects.get(file="submissions/" + filename)

        # Return file to user.
        return FileResponse(submission.file.open(), as_attachment=True)
    
# Marks a given submission.
class mark_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'mark/<int:submission_id>/'
    def post(self, request, submission_id):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = mark_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Get submission object by submission_id
        submission = Submission.objects.get(id=submission_id)

        # Get student object for requesting user associated with class submission is in.
        student = Student.objects.get(user=submission.user_id, joined_class=submission.assignment_id.class_id)
        
        # If submission is remarked must subtract previous result from current total.
        if (submission.marked):
            student.points-=submission.points

        # Update submission points and set marked status.
        submission.points = serializer.validated_data['points']
        student.points+=submission.points
        submission.marked = True

        # Save changes to database.
        submission.save()
        student.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Returns list of acheivements for given user.
class user_acheivement_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'user/achievements/<int:id>/'
    def get(self, request, id):
        # Get user object with given id.
        user = User.objects.get(id=id)

        # Get list of classes user is in.
        student_classes = Class.objects.filter(pk__in=Student.objects.filter(user=User.objects.get(id=id)).values_list('joined_class'))
        
        # Update acheivements for each class at a time.
        achievements = []
        for _class in student_classes:
            class_name = _class.name

            # Calculate Class Leader achievement
            class_leader_points = Student.objects.filter(joined_class=_class).order_by('-points').values_list('points', flat=True)
            if len(class_leader_points) > 0 and class_leader_points[0] == Student.objects.get(user=user, joined_class=_class).points:
                achievements.append(("Class Leader", class_name))

            # Calculate Completionist achievement
            all_assignments = Assignment.objects.filter(class_id=_class)
            user_submissions = Submission.objects.filter(user_id=user, assignment_id__in=all_assignments)
            if user_submissions.count() == all_assignments.count() and all_assignments.count() != 0:
                achievements.append(("Completionist", class_name))

            # Calculate Top 3 achievement
            top_3_students = Student.objects.filter(joined_class=_class).order_by('-points')[:3]
            if Student.objects.get(user=user, joined_class=_class) in top_3_students:
                achievements.append(("Top 3", class_name))

            # Calculate Credit, Distinction, and High Distinction achievements
            all_quizes = Quiz.objects.filter(class_id=_class)
            user_quiz_results = Result.objects.filter(user_id=user, quiz_id__in=all_quizes)
            quiz_points = list(user_quiz_results.values_list('points', flat=True))
            submission_points = list(user_submissions.values_list('points', flat=True))
            all_points = quiz_points + submission_points
            if len(all_points):
                class_grade = sum(all_points)/len(all_points) / 10
                if 65 <= class_grade < 75:
                    achievements.append(("Credit", class_name))
                elif 75 <= class_grade < 85:
                    achievements.append(("Distinction", class_name))
                elif class_grade >= 85:
                    achievements.append(("High Distinction", class_name))

            # Calculate Question Asker achievement
            user_forum_threads = ForumThread.objects.filter(user_id=user, in_class=_class)
            if user_forum_threads.exists():
                achievements.append(("Question Asker", class_name))

            # Calculate Question Answerer achievement
            forum_threads = ForumThread.objects.filter(in_class=_class)
            user_forum_answers = ForumAnswer.objects.filter(user_id=user, thread__in=forum_threads)
            if user_forum_answers.exists():
                achievements.append(("Question Answerer", class_name))

        # Calculate Studious achievement
        enrolled_courses = Student.objects.filter(user_id=user).count()
        if enrolled_courses >= 5:
            achievements.append(("Studious", class_name))

        # Return list of (Acheivement, Classname) pairs.
        return Response(achievements, status=status.HTTP_200_OK)

# Creates a new quiz in given class. 
class quiz_create_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'quiz_create/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = quiz_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Create new quiz object.
        new_quiz = Quiz.objects.create(class_id=serializer.validated_data['class_id'],
                                               name=serializer.validated_data['name'],
                                               description=serializer.validated_data['description'],
                                               due_date=serializer.validated_data['due_date'])
        
        # Save quiz to database.
        new_quiz.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Get list of quizes in given class.
class quiz_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'quiz_get/<int:class_id>/'
    def get(self, request, class_id):
        # Filter quizes by class_id
        quizes = Quiz.objects.filter(class_id=Class.objects.get(id=class_id)).order_by("due_date")
        
        # Return JSON using serializer.
        serializer = quiz_serializer(quizes, many=True)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
# Create a question for a given quiz.
class question_create_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'question_create/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = question_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Create new question object.
        new_question = Question.objects.create(quiz_id=serializer.validated_data['quiz_id'],
                                               text=serializer.validated_data['text'],
                                               multiple_choice=serializer.validated_data['multiple_choice'],
                                               option_a=serializer.validated_data['option_a'],
                                               option_b=serializer.validated_data['option_b'],
                                               option_c=serializer.validated_data['option_c'],
                                               option_d=serializer.validated_data['option_d'],
                                               solution=serializer.validated_data['solution'])

        # Save new question to database.
        new_question.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)
    
# Get list of questions in a given quiz.
class question_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'question_get/<int:quiz_id>/'
    def get(self, request, quiz_id):
        # Filter questions by quiz_id
        questions = Question.objects.filter(quiz_id=Quiz.objects.get(id=quiz_id))

        # Return JSON using serializer.
        serializer = question_serializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)\
        
# Create a result to a given quiz.
class result_create_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'result_create/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = result_create_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Update student points.
        student = Student.objects.get(user=request.user, joined_class=serializer.validated_data['quiz_id'].class_id)
        student.points+=serializer.validated_data['points']
        
        # Create new result object.
        new_result = Result.objects.create(quiz_id=serializer.validated_data['quiz_id'],
                                           user_id=request.user,
                                           points=serializer.validated_data['points'])
        
        # Save changes to database.
        student.save()
        new_result.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Get list of results to given quiz. 
class result_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'result_get/<int:quiz_id>/'
    def get(self, request, quiz_id):
        # Filter results by quiz_id
        results = Result.objects.filter(quiz_id=Quiz.objects.get(id=quiz_id))

        # Return JSON using serializer.
        serializer = result_serializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
# Create a new rating for given class associated with requesting user.
class rating_create_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'rating_create/'
    def post(self, request):
        # Extract fields of request and file data and raise error for invalid data.
        serializer = rating_create_serializer(data=request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)

        # Create new rating.
        new_rating = Rating.objects.create(class_id=serializer.validated_data['class_id'],
                                           user_id=request.user,
                                           rating=serializer.validated_data['rating'])

        # Save rating to database.
        new_rating.save()
        return Response(None, status=status.HTTP_202_ACCEPTED)

# Gets a ratings for a given class.
class rating_get_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'rating_get/<int:class_id>/'
    def get(self, request, class_id):
        # Get ratings with given class_id
        ratings = Rating.objects.filter(class_id=class_id)

        # Return JSON using serializer.
        serializer = rating_serializer(ratings, many=True)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

# Gets classes with highest ratings.
class class_highest_rated_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'class_highest_rated/'
    def get(self, request):
        # Get a list of all classes.
        classes = Class.objects.filter()
        rated_classes = []

        # Find the average rating of each class.
        for i in classes:
            ratings = Rating.objects.filter(class_id=i.id)
            avg_rating = 0
            for a in ratings:
                avg_rating += a.rating
            if len(ratings) != 0:
                avg_rating = avg_rating / len(ratings)
            else:
                avg_rating = 0
            d = {
                "name": i.name,
                "id": i.id,
                "rating": avg_rating
            }
            rated_classes.append(d)

        # Sorts the classes by their rating.
        highest_rated = sorted(rated_classes, key=lambda d: d["rating"], reverse=True)
        return Response(highest_rated, status=status.HTTP_200_OK)

# Gets most popular classes (have most students)
class class_most_popular_view(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Query comes through 'class_most_popular/'
    def get(self, request):
        # Get a list of all classes
        classes = Class.objects.filter()
        p_classes = []

        # Find the amount of students in each class.
        for i in classes:
            students = Student.objects.filter(joined_class=Class.objects.get(id=i.id))
            s_count = len(students)
            d = {
                "name": i.name,
                "id": i.id,
                "students": s_count
            }
            p_classes.append(d)

        # Sorts the classes by amount of students.
        pop_classes = sorted(p_classes, key=lambda tup: tup['students'], reverse=True)
        return Response(pop_classes, status=status.HTTP_200_OK)