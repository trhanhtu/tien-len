export function errorHandle(message) {
    sessionStorage.setItem("error", message);
    window.location.href = "error.html";
}
export function checkNullAndGet(value, error_message) {
    if (!value) {
        errorHandle(error_message);
        throw new Error("Redirecting to error page");
    }
    return value;
}
