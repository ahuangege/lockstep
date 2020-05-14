


export function removeFromArr<T>(arr: T[], one: T) {
    let index = arr.indexOf(one);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}