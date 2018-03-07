from flask import Flask, request, jsonify
import database_helper
import os, binascii
import json

app = Flask(__name__, static_url_path='')

logged_in_users = {}
open_sockets = {}


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
        database_helper.add_active_user(email, token)
        return jsonify(
            {"success": True, "message": "Successfully signed in.", "data": token})
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

    is_taken = database_helper.user_exist(email)
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
        if token in open_sockets:
            open_sockets[token].close()
            del open_sockets[token]
            database_helper.remove_active_user(token)
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
        is_valid = database_helper.is_valid_user(email, old_password)
        if (is_valid):
            database_helper.change_password(email, new_password)
            return jsonify({"success": True, "message": "Password changed."})
        else:
            return jsonify({"success": False, "message": "Wrong password."})


# Shows logged in users


@app.route('/get-users', methods=['GET'])
def get_users():
    return jsonify(users=logged_in_users)


@app.route('/get-user-data-by-token/<token>', methods=['GET'])
def get_user_data_by_token(token):
    email = logged_in_users[token]
    return get_user_data_by_email(token, email)


@app.route('/get-user-data-by-email/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token, email):
    if token in logged_in_users:
        user_data = database_helper.get_user_data(email)
        if user_data:
            return jsonify({"success": True, "message": "User data retrieved.", "data": user_data})
        else:
            return jsonify({"success": False, "message": "No such user."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})



@app.route('/get-user-messages-by-token/<token>', methods=['GET'])
def get_user_messages_by_token(token):
    email = logged_in_users[token]
    return get_user_messages_by_email(token, email);



@app.route('/get-user-messages-by-email/<token>/<email>', methods=['GET'])
def get_user_messages_by_email(token, email):
    if token in logged_in_users:
        messages = database_helper.get_messages(email)
        user_exist = database_helper.user_exist(email)
        if user_exist:
            return jsonify({"success": True, "message": "User messages retrieved.", "data": messages})
        else:
            return jsonify({"success": False, "message": "No such user."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})

@app.route('/post-message', methods=['POST'])
def post_message():
    message = request.form['message']
    token = request.form['token']
    toUser = request.form['toUser']

    user_exist = database_helper.user_exist(toUser)
    if token in logged_in_users:
        fromUser = logged_in_users[token]
        if (user_exist):
            database_helper.add_message(message, fromUser, toUser)
            return jsonify({"success": True, "message": "Message posted"})
        else:
            return jsonify({"success": False, "message": "No such user."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})

@app.route('/connect-socket')
def auto_logout():
    if request.environ.get('wsgi.websocket'):

        ws = request.environ['wsgi.websocket']

        message = json.loads(ws.receive())
        token = message['token']
        email = message['email']

        if database_helper.validate_token(email, token):
            for key in logged_in_users.keys():
                if logged_in_users[key] == email and key != token:
                    open_sockets[key].send(jsonify({"success": False, "message": "You're logged in somewhere else."}))
                    open_sockets[key].close()
                    del open_sockets[key]
                    database_helper.remove_active_user(key)

            open_sockets[token] = ws

            while True:
                message = ws.receive()
                ws.send(message)

    return ''



if __name__ == '__main__':
    app.run()
