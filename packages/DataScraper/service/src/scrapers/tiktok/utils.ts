// A way to block the exection of the program, think like a timeout
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}