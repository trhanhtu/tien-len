"use strict";
function errorHandle(message) {
    sessionStorage.setItem("error", message);
    exitRoom();
    window.location.href = "error.html";
}
function checkNullAndGet(value, error_message) {
    if (!value) {
        errorHandle(error_message);
        throw new Error("Redirecting to error page");
    }
    return value;
}
window.errorHandle = errorHandle;
window.checkNullAndGet = checkNullAndGet;
