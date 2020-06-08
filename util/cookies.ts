export function deleteCookie(name) {
    let write = name + '=;path=/; domain=localhost:3000; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = write;
}