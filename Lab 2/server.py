from flask import Flask, g, request, jsonify, redirect
import database_helper
import os, binascii

app = Flask(__name__, static_url_path='')

logged_in_users = {}


@app.route('/')
def root():
    return app.send_static_file('client.html')


@app.cli.command('initdb')
def initdb_command():
    """Initializes the database."""
    database_helper.init_db(app)
    print('Initialized the database.')


@app.route('/sign-in', methods=['POST'])
def sign_in():
    email = request.form['email']
    password = request.form['password']
    is_valid = database_helper.is_valid_user(email, password)
    if is_valid:
        token = binascii.b2a_hex(os.urandom(15))
        logged_in_users[token] = email
        return jsonify(
            {"success": True, "message": "Successfully signed in.", "data": token, "kahpa": logged_in_users[token],
             "hoe": logged_in_users})
    else:
        return jsonify({"success": False, "message": "Wrong username or password."})


@app.route('/sign-up', methods=['POST'])
def sign_up():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']

    is_taken = database_helper.is_taken(email)
    if (is_taken):
        return jsonify({"success": False, "message": "User already exists."})
    else:
        database_helper.add_user(email, password, firstname, familyname, gender, city, country)
        return jsonify({"success": True, "message": "Successfully created a new user."})


@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.form['token']
    if token in logged_in_users:
        del logged_in_users[token]
        return jsonify({"success": True, "message": "Successfully signed out."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})



@app.route('/change-password', methods=['POST'])
def change_password():
    token = request.form['token']
    old_password = request.form['old_password']
    new_password = request.form['new_password']

    if token not in logged_in_users:
        return jsonify({"success": False, "message": "You are not logged in."})
    else:
        email = logged_in_users[token]
        is_valid = database_helper.is_valid_user(email,old_password)
        if (is_valid):
            database_helper.change_password(email,new_password)
            return jsonify({"success": True, "message": "Password changed."})
        else:
            return jsonify({"success": False, "message": "Wrong password."})




    #Shows logged in users
@app.route('/get-users', methods=['GET'])
def get_users():
    return jsonify(users=logged_in_users)

#
# @app.route('/get-user-data-by-token', methods=['GET'])
# def get_user_data_by_token(token):
#     return 'getuserdatabytoken'
#
#
# @app.route('/')
# def get_user_data_by_email(token, email):
#     return 'getuserdatabyemail'
#
#
# @app.route('/')
# def get_user_messages_by_token(token):
#     return 'getusermessagesbytoken'
#
#
# @app.route('/')
# def get_user_messages_by_email(token, email):
#     return 'getusermessagesbyemail'


if __name__ == '__main__':
    app.run()
