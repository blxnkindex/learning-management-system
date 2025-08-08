# capstone-project-3900w14btbd
Team TBD COMP3900 project - Learning Management System


# Development Setup

First have Node js and npm package manager installed. These can be installed via
`sudo apt-get update`
`sudo apt-get install nodejs`
`sudo apt-get install npm`

In the backend folder, create a venv using `python -m venv .venv`. Ensure the venv is running by `source .venv/bin/activate`  and install the requirements by `pip install -r requirements.txt`. Next setup the database by running `python3 manage.py migrate` and `python3 manage.py runserver`

Then in the frontend folder run `npm install` and then `npm start`. This may take up to a few minutes to open the page.

The current tech stack is 
Frontend
- Reactjs

Backend
- Django

Database
- SQLite