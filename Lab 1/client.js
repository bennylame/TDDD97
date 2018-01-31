/**
 * Created by bennylam on 2017-01-24.
 */

window.onload = function start() {
    //Choose what view to be seen when loading page
    if (localStorage.getItem("token") === null) {
        welcomeView();
    } else {
        loggedInPage();
    }
};

function loggedInPage() {
    profileView();
    //Open Home tab as default
    document.getElementById("homebtn").click();
}

function profileView() {
    document.getElementById("view").innerHTML = document.getElementById("profileview").innerHTML;
    clearTab(event);

    //Profile view
    document.getElementById("homebtn").onclick = home;
    document.getElementById("browsebtn").onclick = browse;
    document.getElementById("accountbtn").onclick = account;


    //Logout
    document.getElementById("signoutbtn").onclick = logout;
}

function clearTab(evt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    tablinks = document.getElementsByClassName("tablinks");

    //Gömmer alla divs
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    //Rensar klassen active
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    evt.currentTarget.className += " active";
}

function welcomeView() {
    document.getElementById("view").innerHTML = document.getElementById("welcomeview").innerHTML;

    //Login Form
    document.getElementById("loginForm").onsubmit = validateLoginForm;

    //Sign Up Form
    document.getElementById("password").oninput = validateSignUpPassword;
    document.getElementById("repassword").oninput = validatePasswords;
    document.getElementById("signupForm").onsubmit = validateSignUpForm;

}

function validateLoginForm() {
    var email = document.forms["loginForm"]["loginmail"].value;
    var password = document.forms["loginForm"]["loginpass"].value;
    var text = "";

    if (password.length < 6) {
        text = "Password is too short.";
        document.getElementById("error").innerHTML = text;
        return false;
    } else {
        return signIn(email, password);
    }
}

function validateSignUpForm() {
    if (!(validateSignUpPassword() && validatePasswords())) {
        return false;
    } else {
        return signUp();
    }
}

function validateSignUpPassword() {
    var x = document.getElementById("password").value;
    var text = "";

    if (x.length < 6) {
        text = "At least 6 characters please.";
        document.getElementById("password").style.borderColor = "#E34234";
        document.getElementById("short").innerHTML = text;
        document.getElementById("password").focus();
        return false;
    } else {
        text = "";
        validatePasswords();
        document.getElementById("password").style.borderColor = "initial";
        document.getElementById("short").innerHTML = text;
        return true;
    }
}

function validatePasswords() {
    var x = document.getElementById("password").value;
    var y = document.getElementById("repassword").value;
    var text = "";

    if (x == y) {
        text = "";
        document.getElementById("password").style.borderColor = "initial";
        document.getElementById("repassword").style.borderColor = "initial";
        document.getElementById("mismatch").innerHTML = text;
        return true;
    } else {
        text = "Both password must contain the same string.";
        document.getElementById("password").style.borderColor = "#E34234";
        document.getElementById("repassword").style.borderColor = "#E34234";
        document.getElementById("mismatch").innerHTML = text;
        return false;
    }
}

function signUp() {
    var user = {
        firstname: document.forms["signupForm"]["firstname"].value,
        familyname: document.forms["signupForm"]["familyname"].value,
        gender: document.forms["signupForm"]["gender"].value,
        city: document.forms["signupForm"]["city"].value,
        country: document.forms["signupForm"]["country"].value,
        email: document.forms["signupForm"]["email"].value,
        password: document.forms["signupForm"]["password"].value

    };

    var x = serverstub.signUp(user);
    localStorage.setItem("message", x.message);
    document.getElementById("result").innerHTML = localStorage.getItem("message");
    if (x.success) {
        document.forms["signupForm"].reset();
        return false;
    } else {
        return false;
    }

}

function signIn(email, password) {
    var signIn = serverstub.signIn(email, password);

    if (signIn.success) {
        document.getElementById("error").innerHTML = signIn.message;
        localStorage.setItem("token", signIn.data);
        return loggedInPage();
    } else {
        document.getElementById("error").innerHTML = signIn.message;
        return false;
    }
}

function logout() {
    var signOut = serverstub.signOut(localStorage.getItem("token"));
    // document.getElementById("status").innerHTML = signOut.message;
    localStorage.removeItem("token");
    welcomeView();
}


function home() {
    var token = localStorage.getItem("token");
    clearTab(event);
    document.getElementById("home").style.display = "block";
    document.getElementById("message").setAttribute("maxlength", 256);
    characterCounter();
    document.getElementById("message").onkeyup = characterCounter;

    var user = serverstub.getUserDataByToken(token).data;

    document.getElementById("nameandgender").innerHTML = user.firstname + " " + user.familyname + ", " + user.gender;
    document.getElementById("email").innerHTML = user.email;
    document.getElementById("country").innerHTML = user.country;
    document.getElementById("city").innerHTML = user.city;


    document.getElementById("post").onclick = function () {
        var content = document.getElementById("message").value;
        if (content.length != 0) {
            var post = serverstub.postMessage(token, content, user.email);
            if (post.success) {
                document.getElementById("message").value = null;
                document.getElementById("message").setAttribute("placeholder", post.message);
            } else {
            }
        }
    };
    updateWall();
    document.getElementById("update").onclick = updateWall;

    /*
     <li>3. A list of all posted messages forming a wall.</li>
     <li>4. A button to reload only the wall in order to see the newly posted messages by other users.
     </p>*/
}

function updateWall() {

    var result = serverstub.getUserMessagesByToken(localStorage.getItem("token"));
    var text = "";

    var entries = document.getElementById("entries");
    entries.innerHTML = "";

    for (i = 0; i < result.data.length; i++) {
        var p = document.createElement("p");
        p.innerText = result.data[i].writer + " says: " + result.data[i].content;
        entries.appendChild(p);
    }
}

function characterCounter() {
    var characters = document.getElementById("message").value.length;
    var maxlength = document.getElementById("message").getAttribute("maxlength");

    if (characters > maxlength) {
        return false;
    } else {
        text = maxlength - characters;
        document.getElementById("counter").innerHTML = "Remaining characters: " + text;
    }
}

function browse() {
    var token = localStorage.getItem("token");
    clearTab(event);
    // document.getElementById("nameandgenderB").innerHTML = null;
    // document.getElementById("emailB").innerHTML = null;
    // document.getElementById("countryB").innerHTML = null;
    // document.getElementById("cityB").innerHTML = null;
    // document.getElementById("entriesB").innerHTML = null;
    // document.getElementById("browseUser").value = null;
    // document.getElementById("messageB").value = null;

    document.getElementById("browse").style.display = "block";
    document.getElementById("messageB").setAttribute("maxlength", 256);
    document.getElementById("counterB").innerHTML = "Remaining characters: 256";
    document.getElementById("messageB").onkeyup = function () {
        var characters = document.getElementById("messageB").value.length;
        var maxlength = document.getElementById("messageB").getAttribute("maxlength");

        if (characters > maxlength) {
            return false;
        } else {
            text = maxlength - characters;
            document.getElementById("counterB").innerHTML = "Remaining characters: " + text;
        }
    };

    var findUser = document.getElementById("findUser");
    findUser.onclick = showUser;

}

function showUser() {
    var token = localStorage.getItem("token");
    var email = document.getElementById("browseUser").value;

    var user = serverstub.getUserDataByEmail(token, email);

    if (user.success) {
        document.getElementById("nameandgenderB").innerHTML = user.data.firstname + " " + user.data.familyname + ", " + user.data.gender;
        document.getElementById("emailB").innerHTML = user.data.email;
        document.getElementById("countryB").innerHTML = user.data.country;
        document.getElementById("cityB").innerHTML = user.data.city;


        document.getElementById("postB").onclick = function () {
            var content = document.getElementById("messageB").value;
            if (content.length != 0) {
                var post = serverstub.postMessage(token, content, email);
                if (post.success) {
                    document.getElementById("messageB").value = null;
                    document.getElementById("messageB").setAttribute("placeholder", post.message);
                } else {

                }
            }
        };

        //Update wall
        var result = serverstub.getUserMessagesByEmail(token, email);
        var text = "";

        for (i = 0; i < result.data.length; i++) {
            text += result.data[i].content;
            text += "<br>/" + result.data[i].writer + "<br><br>";
        }
        document.getElementById("entriesB").innerHTML = text;


        document.getElementById("updateB").onclick = function () {
            //Update wall
            var result = serverstub.getUserMessagesByEmail(token, email);
            var text = "";

            for (i = 0; i < result.data.length; i++) {
                text += result.data[i].content;
                text += "<br>/" + result.data[i].writer + "<br><br>";
            }
            document.getElementById("entriesB").innerHTML = text;

        }

    } else {
        document.getElementById("nameandgenderB").innerHTML = user.message;
        document.getElementById("emailB").innerHTML = null;
        document.getElementById("countryB").innerHTML = null;
        document.getElementById("cityB").innerHTML = null;
        document.getElementById("messageB").value = null;

    }
}

function account() {
    clearTab(event);
    document.getElementById("account").style.display = "block";
    document.getElementById("newpassword").style.display = "none";

    document.getElementById("changepassword").onclick = newPassword;
    document.getElementById("signout").onclick = logout;
    document.getElementById("short").innerHTML = null;

}

function newPassword() {
    document.getElementById("newpassword").style.display = "block";
    document.getElementById("save").onclick = save;

}

function save() {
    var oldpassword, newpassword, changePassword, text;

    oldpassword = document.getElementById("oldpassword").value;
    newpassword = document.getElementById("password").value;

    if (oldpassword != null && newpassword != null && validateSignUpPassword() && validatePasswords()) {
        changePassword = serverstub.changePassword(localStorage.getItem("token"), oldpassword, newpassword);
        text = changePassword.message;
    }

    if (changePassword.success) {
        document.getElementById("oldpassword").value = null;
        document.getElementById("password").value = null;
        document.getElementById("repassword").value = null;
    }

    document.getElementById("short").innerHTML = text;
}