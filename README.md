command to run the project
for Windows:
1-python -m venv venv
2-venv\Scripts\activate
3-pip install -r requirements.txt
4-npm install


command to clean sessions 
PS .... Backend> sqlite3 database.db
sqlite> DELETE FROM sessions;