export const errorHandler = (error, errorMessage, errorCode, errorSource)=> {
    return {
        error, 
        errorMessage, 
        errorCode, 
        errorSource
    }
}