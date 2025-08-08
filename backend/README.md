# LMS Backend
## Setting Up Virtual Environment
To begin developing you must first activate the virtual environment. 
If this is the first time, first run the following command to initialize virtualenv:
```
python -m venv venv
```
Then for each time you are working on the repository run:
```
source venv/bin/activate
pip install -r requirements.txt
```
This turns on virtualenv and installs all the required packages (if not already installed). If while developing you install a new package via pip, you must save the new requirements by using:
```
pip freeze > requirements.txt
```
Ensure that requirements.txt is then committed to the git repository. To leave the virtual environment run:
```
deactivate
```

## Running the Server
Firstly, to ensure the databse is setup you must run:
```
python manage.py makemigrations
python manage.py migrate
```
The server can then be run using the following command:
```
python manage.py runserver
```

## Project Structure
```lms/``` - Contains Django configuration and global url routing information for the lms site.

```lms_app/``` - Contains the main implementation of the lms backend.

## API Endpoints
### **Register**
Registers a new user and logs them in.
```http
POST /register/ 
```
Parameters:
```javascript
{
    "username"   : string (must be an email),
    "password"   : string,
    "first_name" : string,
    "last_name"  : string,
    "is_teacher" : boolean,
}
```
Returns: HTTP 202 on success else HTTP 400 on error

### **Login**
Logs a user in.
```http
POST /login/ 
```
Parameters:
```javascript
{
    "username" : string,
    "password" : string,
}
```
Returns: HTTP 202 and SessionID cookie on success else HTTP 400 on error

### **Logout**
Logs a user out.
```http
POST /logout/ 
```
### **User**
Gets a single user info by id.
```http
GET /user/{id}/ (id is an integer)
```
Gets self user info.
```http
GET /user/ 
```
Returns

```javascript
{    
    "id"         : integer,        
    "username"   : string,
    "first_name" : string,
    "last_name"  : string,
    "is_teacher" : boolean,
    "join_date"  : string,
    "is_self"    : boolean, (is the requesting user requesting themselves),
    "picture"    : string
}
```
else HTTP 400 on error

### **Classes**
Get a single class info by id.
```http
GET /classes/{id}/ (id is an integer)
```
Returns
```javascript
{
    "id"   : int,
    "name" : string,
    "teacher_profile": {
        "id"         : int,
        "username"   : string,
        "first_name" : string,
        "last_name"  : string,
        "join_date"  : string,
        "is_teacher" : boolean,
        "picture"    : string
    }
}
```

Get all classes info that requesting user is part of.
```http
GET /classes/ 
```
Returns
```javascript
[
    {
        "id"   : int,
        "name" : string
        "teacher_profile": {
            "id"         : int,
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "join_date"  : string,
            "is_teacher" : boolean,
            "picture"    : string
        }
    },
    {
        "id"   : int,
        "name" : string
        "teacher_profile": {
            "id"         : int,
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "join_date"  : string,
            "is_teacher" : boolean,
            "picture"    : string
        }
    }
    ...
]
```

### **Class Students**
Gets all students in a class.
```http
GET /classes/{class_id}/students/
```
Returns
```javascript
[
    ...
    {
        "user": {
            "id"         : integer,        
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "is_teacher" : boolean,
            "join_date"  : string,
            "picture"    : string
        },
        "points": integer
    },
    {
        "user": {
            "id"         : integer,        
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "is_teacher" : boolean,
            "join_date"  : string,
            "picture"    : string
        },
        "points": integer
    }
    ...
]
```

### **User Classes**
Gets lists of classes user with given id is part of.
```http
GET /user_classes/{user_id}/
```
Returns
```javascript
[
    {
        "id"   : int,
        "name" : string
        "teacher_profile": {
            "id"         : int,
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "join_date"  : string,
            "is_teacher" : boolean,
            "picture"    : string
        }
    },
    {
        "id"   : int,
        "name" : string
        "teacher_profile": {
            "id"         : int,
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "join_date"  : string,
            "is_teacher" : boolean,
            "picture"    : string
        }
    }
    ...
]
```

### **Create Classes**
Creates a class with a given name. Requesting user becomes the teacher.
```http
POST /create_class/ 
```
Parameters:
```javascript
{
    "name" : string
}
```
Returns: HTTP 202 on success else HTTP 400 on error and this data below of the new id
```javascript
{
    "class_id" : int
}
```

### **Join Classes**
Joins a class with specified id.
```http
POST /join_class/ 
```
Parameters:
```javascript
{
    "name" : string
}
```
Returns: HTTP 202 on success else HTTP 400 on error

### **Start Class**
Starts class with given id
```http
POST /class_start/ 
```
Parameters:
```javascript
{
    "id" : int
}
```
Returns: HTTP 202 on success else HTTP 400 on error

### **Stop Class**
Stops class with given id
```http
POST /class_stop/ 
```
Parameters:
```javascript
{
    "id" : int
}
```
Returns: HTTP 202 on success else HTTP 400 on error

### **Send Message**
Sends message in class with given id
```http
POST /messages_send/ 
```
Parameters:
```javascript
{
    "class_id" : int,
    "message"  : string,
}
```

### **Get Message**
Gets all messages in a class sorted in chronographical order.
```http
GET /messages_get/{class_id}/ (class_id is an integer)
```
Returns:
```javascript
[
    ... Older messages
    {
        "user_id"   : int,
        "user"      : string,
        "message"   : string,
        "in_class"  : int,
        "sent_time" : string, (example "2023-06-26T19:39:42.998861Z")
    },
    {
        "user_id"   : int,
        "user"      : string,
        "message"   : string,
        "in_class"  : int,
        "sent_time" : string,
    },
    ... Newer messages
]
```

### **Materials**
Uploads teaching materials for class
```http
POST /materials/ 
```
Parameters:
```javascript
{
    "description"  : string,
    "file"         : file,
    "in_class"     : int
}
```
Note that file must be passed through as "multipart/form-data". All I know is that this command works:
```bash
http -f post :8000/materials/ description="test" in_class=1 file@./README.md 'Cookie:sessionid=6uo5eel1zdnr6374a7mkimrz7dqo0z3q;csrftoken=2lmpiwnGZfTD5IJLUnd206WOLPnBxx1a;' X-CsrfToken:2lmpiwnGZfTD5IJLUnd206WOLPnBxx1a
```
Which is equivalent to:
```html
<form enctype="multipart/form-data" method="post" action="http://example.com/jobs">
    <input type="text" name="description" />
    <input type="number" name="in_class" />
    <input type="file" name="file" />
</form>
```

### **Listing Materials**
Returns list of teaching materials uploaded to class
```http
GET /materials_list/{class_id}/
```
Returns:
```javascript
[
    {
        "description" : string,
        "created_date"  : string,
        "file": string, (filename)
    },
    {
        "description" : string,
        "created_date"  : string,
        "file": string,
    }
    ...

]
```

### **Downloading Files**
Files can be downloaded by using:
```http
GET /materials/{filename}/
```
Where filename is identical to that returned by materials_list.

### **Create Forum Post**
```http
POST /forum/
```
Parameters:
```javascript
{
    "class_id" : int,
    "text"     : string,
}
```

### **Get Forum Posts**
```http
GET /forum/{class_id}/
```
Returns:
```javascript
[
    {
        "user_id"      : int,
        "user_name"    : string,
        "text"         : string,
        "created_date" : string, (example "2023-06-26T19:39:42.998861Z")
    },
    {
        "user_id"      : int,
        "user_name"    : string,
        "text"         : string,
        "created_date" : string,
    }
    ...
]
```

### **Post Answer to Forum Thread**
```http
POST /answer/
```
Parameters:
```javascript
{
    "forum_id" : int,
    "text"     : string
}
```

### **Get Answers to Forum Thread**
```http
GET /answer/{forum_id}/
```
Returns:
```javascript
[
    ... Older answers
    {
        "user_id"   : int,
        "user_name" : string,
        "text"      : string,
        "sent_time" : string, (example "2023-06-26T19:39:42.998861Z")
    },
    {
        "user_id"   : int,
        "user_name" : string,
        "text"      : string,
        "sent_time" : string
    }
    ... Newer answers
]
```

### **Get Colour Pallete**
Returns colour pallete for requesting user
```http
GET /color_get/
```
```javascript
{
    "light_theme"      : boolean,
    "highlight_colour" : string, (hex "#0000FF")
}
```
All users are given a pallet when they register. The
default pallet is:
```javascript
{
    "light_theme"      : True,
    "highlight_colour" : "#0000FF"
}
```

### **Set Colour Pallete**
Sets colour pallete for requesting user
```http
POST /color_set/
```
Parameters
```javascript
{
    "light_theme"      : boolean,
    "highlight_colour" : string, (hex "#0000FF")
}
```

### **Getting Class Tags**
Gets list of tags associated with a particular class
```http
GET tags_get/{class_id}/
```
Returns
```javascript
[
    string,
    string,
    string,
    ...
]
```

### **Setting Class Tags**
Adds a tag to a particular class
```http
POST /tag_set/
```
Parameters
```javascript
{
    "class_id" : int,
    "tag"      : string
}
```

### **Getting Recommended Classes**
Gets list of recommended classes for the requesting user. A class is recommeded when its tags match classes the current user is already part of. The more tags that match, the earlier it appears in the returned list. Classes that user is already part of or have no matching tags are not returned.
```http
GET /recommendations/
```
Returns
```javascript
[
    ... Most Recommended
    {
        "id"   : int,
        "name" : string
        "teacher_profile": {
            "id"         : int,
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "join_date"  : string,
            "is_teacher" : boolean,
            "picture"    : string
        }
    },
    {
        "id"   : int,
        "name" : string
        "teacher_profile": {
            "id"         : int,
            "username"   : string,
            "first_name" : string,
            "last_name"  : string,
            "join_date"  : string,
            "is_teacher" : boolean,
            "picture"    : string
        }
    }
    ... Least Recommended
]
```

### **Upload Profile Picture**
Uploads profile picture to current user
```http
POST /profile_picture/ 
```
Parameters:
```javascript
{
    "profile_picture" : file,
}
```

### **Get Profile Picture**
Gets profile_picture by filename
```http
GET /profile_picture/{filename}
```
Return profile picture

### **Create Assignments**
Creates assignment associated with a given class
```http
POST /assignment_create/
```
Parameters
```javascript
{
    "class_id"    : int,
    "name"        : string,
    "description" : string,
    "due_date"    : string, (date time format e.g. "2023-06-26T19:39:42.998861Z")
}
```

### **Get Assignments**
Gets assignments associated with a given class
```http
GET /assignment_get/{class_id}/
```
Returns
```javascript
[
    ...
    {
        "class_id"     : int,
        "name"         : string,
        "description"  : string,
        "created_date" : string, (datetime format)
        "due_date"     : string, (datetime format)
    },
    {
        "class_id"     : int,
        "name"         : string,
        "description"  : string,
        "created_date" : string, (datetime format)
        "due_date"     : string, (datetime format)
    },
    ...
]
```

### **Get Submissions**
Gets submissions for a particular assignment.
```http
GET /submissions_get/{assignment_id}/
```
Returns
```javascript
[
    ...
    {
        "user_id":       int,
        "user_name":     string,
        "assignment_id": int,
        "file":          string, (filename)
        "marked":        bool,
        "points":        int
    },
    {
        "user_id":       int,
        "user_name":     string,
        "assignment_id": int,
        "file":          string, (filename)
        "marked":        bool,
        "points":        int
    },
    ...
]
```

### **Create Submission**
Creates submission for a particular assignment.
```http
POST /submissions_create/
```
Parameters
```javascript
{
    "assignment_id" : int,
    "file"          : file
}
```

### **Mark Submission**
Marks a submission
```http
POST /mark/{submission_id}
```
Parameters
```javascript
{
    "marked" : bool,
    "points" : int
}
```

### **Achievements**
Produces a list of acheivements a user has gained.
```http
GET /user/achievements/{user_id}/
```
Returns a list of achievment name / class_id pairs.
```javascript
[
    [
        string, (achievment name)
        string, (class_name)
    ],
    [
        string, (achievment name)
        string, (class_name)
    ],
    ...    
]
```

### **Quiz Creation**
Creates a quiz within a given class.
```http
POST /quiz_create/
```
Parameters
```javascript
{
    "class_id"    : int,
    "name"        : string,
    "description" : string,
    "due_date"    : string, (datetime)
}
```

### **Get Quiz**
Gets list of quizes in given class.
```http
GET /quiz_get/{class_id}/
```
Returns quizes ordered by due_date.
```javascript
[
    ... Due Earlier
    {
        "class_id"    : int,
        "name"        : string,
        "description" : string,
        "due_date"    : string, (datetime)
    },
    {
        "class_id"    : int,
        "name"        : string,
        "description" : string,
        "due_date"    : string, (datetime)
    },
    ... Due Later
]
```

### **Question Creation**
Creates a question in a quiz.
```http
POST /question_create/
```
Parameters:
```javascript
{
    "quiz_id"         : int,
    "text"            : string,
    "multiple_choice" : boolean,
    "option_a"        : string,
    "option_b"        : string,
    "option_c"        : string,
    "option_d"        : string,
    "solution"        : string
}
```

### **Get Questions**
Gets questions for a given quiz.
```http
GET /question_get/{quiz_id}/
```
Returns:
```javascript
[
    {
        "quiz_id"         : int,
        "text"            : string,
        "multiple_choice" : boolean,
        "option_a"        : string,
        "option_b"        : string,
        "option_c"        : string,
        "option_d"        : string,
        "solution"        : string
    },
    {
        "quiz_id"         : int,
        "text"            : string,
        "multiple_choice" : boolean,
        "option_a"        : string,
        "option_b"        : string,
        "option_c"        : string,
        "option_d"        : string,
        "solution"        : string
    },
    ...
]
```

### **Result Creation**
Creates a result to a quiz for requesting user.
```http
POST /result_create/
```
Parameters
```javascript
{
    "quiz_id" : int,
    "points"  : int
}
```

### **Get Results**
Get all results to a quiz.
```http
GET /result_get/{quiz_id}/
```
Parameters
```javascript
[
    {
        "quiz_id" : int,
        "user_id" : int,
        "user"    : string,
        "points"  : int
    },
    {
        "quiz_id" : int,
        "user_id" : int,
        "user"    : string,
        "points"  : int
    },
    ...
]
```
### **Rating Creation**
Creates a rating for a class for requesting user.
```http
POST /rating_create/
```
Parameters
```javascript
{
    "class_id" : int,
    "rating"  : int
}
```
### **Get Ratings**
Get all ratings for a class. Takes in class_id.
```http
GET /rating_get/{class_id}/
```
Parameters
```javascript
[
    {
        "class_id" : int,
        "user_id" : int,
        "rating" : int
    },
    {
        "class_id" : int,
        "user_id" : int,
        "rating" : int
    },
    ...
]
```
### **Highest Rated**
Returns a list of classes by the average rating. Sorted from highest to lowest. List of tuples containing class name, class id and average rating of each class.
```http
GET /class_highest_rated/
```
Parameters
```javascript
[
    (
        string, (class_name)
        int, (class_id)
        int, (avg_rating)
    ),
    (
        string, (class_name)
        int, (class_id)
        int, (avg_rating)
    ),
    ...
]
```
### **Most Popular**
Returns a list of classes by the number of students in them. Sorted from highest to lowest. List of tuples containing class name, class id and number of students in said class.
```http
GET /class_most_popular/
```
Parameters
```javascript
[
    (
        string, (class_name)
        int, (class_id)
        int, (student_count)
    ),
    (
        string, (class_name)
        int, (class_id)
        int, (student_count)
    ),
    ...
]
```

## References
Login and Logout:
 - https://learndjango.com/tutorials/django-login-and-logout-tutorial 
 - https://docs.djangoproject.com/en/4.2/topics/auth/default/ 
 
REST API:
 - https://blog.logrocket.com/django-rest-framework-create-api/
