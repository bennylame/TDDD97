/**
 * Created by bennylam on 2017-01-24.
 */

window.onload = function start() {


    //Choose what view to be seen when loading page
    /*   if (localStorage.getItem("token")) {
     document.getElementById("view").innerHTML = document.getElementById("profileview").innerHTML;
     } else {
     document.getElementById("view").innerHTML = document.getElementById("welcomeview").innerHTML;

     }*/
    if (localStorage.getItem("token") == null) {
        welcomeView();
    } else {
        profileView();
    }


    //Login Form
    document.getElementById("loginForm").onsubmit = validateLoginForm;

    //Sign Up Form
    document.getElementById("password").oninput = validateSignUpPassword;
    document.getElementById("repassword").oninput = validatePasswords;
    document.getElementById("signupForm").onsubmit = validateSignUpForm;

};

function profileView() {
    document.getElementById("view").innerHTML = document.getElementById("profileview").innerHTML;

    document.getElementsByClassName("")

    //Logout
    document.getElementById("signoutForm").onsubmit = logout;
   // document.getElementById("signout").onclick = logout;
}

function welcomeView() {
    document.getElementById("view").innerHTML = document.getElementById("welcomeview").innerHTML;
}

function validateLoginForm() {
    var email = document.forms["loginForm"]["loginmail"].value;
    var password = document.forms["loginForm"]["loginpass"].value;
    var text;

    if (password.length < 6) {
        text = "Password is too short.";
        document.getElementById("error").innerHTML = text;
        return false;
    } else {
       signIn(email, password); //SIGNS OUT WHEN I SIGN IN. WHY? remove return
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
    var x = document.forms["signupForm"]["password"].value;
    var text;

    if (x.length < 6) {
        text = "At least 6 characters please.";
        document.forms["signupForm"]["password"].style.borderColor = "#E34234";
        document.getElementById("short").innerHTML = text;
        document.getElementById("password").focus();
        return false;
    } else {
        text = "";
        validatePasswords();
        document.forms["signupForm"]["password"].style.borderColor = "initial";
        document.getElementById("short").innerHTML = text;
        return true;
    }
}

function validatePasswords() {
    var x = document.forms["signupForm"]["password"].value;
    var y = document.forms["signupForm"]["repassword"].value;
    var text;

    if (x == y) {
        text = "";
        document.forms["signupForm"]["password"].style.borderColor = "initial";
        document.forms["signupForm"]["repassword"].style.borderColor = "initial";
        document.getElementById("mismatch").innerHTML = text;
        return true;
    } else {
        text = "Both password must contain the same string.";
        document.forms["signupForm"]["password"].style.borderColor = "#E34234";
        document.forms["signupForm"]["repassword"].style.borderColor = "#E34234";
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

    if (x.success) {
        document.getElementById("result").innerHTML = x.message;
        return true;
    } else {
        document.getElementById("result").innerHTML = x.message;
        return false;
    }

}

function signIn(email, password) {
    var signIn = serverstub.signIn(email, password);

    if (signIn.success) {
        document.getElementById("error").innerHTML = signIn.message;
        localStorage.setItem("token", signIn.data);
        alert(localStorage.getItem("token")+"wazzaaaa");
    } else {
        document.getElementById("error").innerHTML = signIn.message;
        return false;
    }
}

function logout() {
    var signOut = serverstub.signOut(localStorage.getItem("token"));
    document.getElementById("status").innerHTML = signOut.message;
    alert(localStorage.getItem("token") + "neeeeeej");
    localStorage.removeItem("token");
    alert(localStorage.getItem("token")+"hej");
}