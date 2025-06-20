// below function takes a string and capitilize the first letter of each word in it
export const titleCase = function (str: string) {
    let splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}


// Below capitilized only the first letter of the string.
export const capitalizeFirstLetter = (val: string | null | undefined) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}