declare function exitRoom():Promise<void>

function errorHandle(message: string): void {
    sessionStorage.setItem("error", message);
    exitRoom();
    window.location.href = "error.html";
}

function checkNullAndGet<T>(value: T | null, error_message: string): T {

    if (!value) {
        errorHandle(error_message);
        throw new Error("Redirecting to error page");
    }
    return value;
}

window.errorHandle = errorHandle;
window.checkNullAndGet = checkNullAndGet;

