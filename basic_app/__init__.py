from flask import Flask

app = Flask(__name__, static_folder='..', static_url_path='')
app.config.from_object('config')

if not app.debug:
    import logging
    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler(
        '/tmp/bubble.log',
        'a',
        1 * 1024 * 1024,
        10)
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s %(levelname)s: %(message)s [%(pathname)s:%(lineno)d]'))
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('bubble startup')

from basic_app import routes

if __name__ == '__main__':
    app.run()
