interface ErrorHandler {
    error: string,
    errorMessage: string,
    errorCode: number,
    errorSource: string
}

export const errorHandler = ({error, errorMessage, errorCode, errorSource}: ErrorHandler)=> {
    return {
        error, 
        errorMessage, 
        errorCode, 
        errorSource
    }
}