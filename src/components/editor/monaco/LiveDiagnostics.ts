let timer: NodeJS.Timeout;

export function debounceCompile(
    callback: () => void,
    delay = 700
) {
    clearTimeout(timer);

    timer = setTimeout(() => {
        callback();
    }, delay);
}