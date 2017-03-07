from flask import Flask, g, request, jsonify, redirect
import database_helper

app = Flask(__name__, static_url_path='')


@app.route('/')
def root():
    return app.send_static_file('client.html')


@app.cli.command()
def init_db():
    """Initialize the database."""
    database_helper.init_db(app)


@app.route('/sign-in', methods=['POST'])
def sign_in(email, password):
    email = request.form['email']
    password = request.form['password']

    return redirect('twidder/client.html')


@app.route('/sign-up', methods=['POST'])
def sign_up(email, password, firstname, familyname, gender, city,
            country):
    return 'sign up'


@app.route('/sign-out', methods=['POST'])
def sign_out(token):
    return 'signout'


@app.route('/')
def change_password(token, old_password, new_password):
    return 'change password'


@app.route('/get-user-data-by-token', methods=['GET'])
def get_user_data_by_token(token):
    return 'getuserdatabytoken'


@app.route('/')
def get_user_data_by_email(token, email):
    return 'getuserdatabyemail'


@app.route('/')
def get_user_messages_by_token(token):
    return 'getusermessagesbytoken'


@app.route('/')
def get_user_messages_by_email(token, email):
    return 'getusermessagesbyemail'


if __name__ == '__main__':
    app.run()
