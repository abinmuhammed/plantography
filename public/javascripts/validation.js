
//validateform
var NameError = document.getElementById("usernameempty");  //span id
var mobileError = document.getElementById("mobile-error");
var emailError = document.getElementById("emailempty")
var passwordError = document.getElementById("passwordempty")
var submitError = document.getElementById("submit-error");

function validateName() {

  var fname=document.myform.username.value;
    
    if (fname.length == 0) {
     NameError .innerHTML = 'First Name required....!';
        return false;
    }
    if (!fname.match(/(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/)) {

      NameError .innerHTML = 'First Name required not numbers...!';
        return false;
    }
    else {
      NameError .innerHTML = '';
        return true;
    }
}

function validateEmail() {
    
    var email = document.myform.Email.value
    console.log(email)
    if (email.length == 0) {
        emailError.innerHTML = "Email required....!";
        return false;
    }
    if (!email.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)) {

        emailError.innerHTML = 'Email Invalid.....!';
        return false;

    }
    emailError.innerHTML = "";
    return true;
}

function validatePassword() {
    console.log("validate")
    var password=document.myform.Password.value;
    if (password.length == 0) {
        passwordError.innerHTML = "Password required....!";
        return false;
    } else if (password.length <= 4) {
        passwordError.innerHTML = "Minimum four Characters Required....!";
        return false;
    }
    passwordError.innerHTML = "";
    return true;

}


function validateMobile() {
    var mobile = document.getElementById("contact-mobile").value;
    if (mobile.length == 0) {
        mobileError.innerHTML = "Mobile can't be empty";
        return false;
    }
    if (!mobile.match(/^([+]\d{2})?\d{10}$/)) {

        mobileError.innerHTML = 'Invalid Mobile';
        return false;

    }else{
        mobileError.innerHTML = '';
        return true;
    }
    
}


