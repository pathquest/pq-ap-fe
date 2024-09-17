export const formatErrorMessage = (error: string, name: string) => {
    if (!error) return 'Something went wrong!';

    if (error.includes("BadRequest")) {
        return `${name} already exists. Please choose a different name for your ${name}`;
    } else if (error.includes("You do not have permission")) {
        return `You do not have permission for creating ${name}.`;
    } else if (error.includes("Index was outside the bounds of the array")) {
        return "Please Reconnect company";
    } else {
        return error;
    }
};