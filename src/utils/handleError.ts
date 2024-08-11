export interface HandleError {
    error: string,
    errorMessage: string,
    errorCode: number,
    errorSource: string
}

export const handleError = ({error, errorMessage, errorCode, errorSource}: HandleError)=> {
    return {
        error, 
        errorMessage, 
        errorCode, 
        errorSource
    }
}