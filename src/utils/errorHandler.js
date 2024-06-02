export const errorHandler = (error, errorMessage, errorCode, errorLocation)=> {
    return {
        error, 
        errorMessage, 
        errorCode, 
        errorLocation
    }
}