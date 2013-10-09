import os
basedir = os.path.abspath(os.path.dirname(__file__))

CSRF_ENABLED = True
SECRET_KEY = 'you-will-never-guess'

if os.environ.get('SERVER_NAME') is not None:
    SERVER_NAME = os.environ.get('SERVER_NAME')
