export interface ErrorResponse {
    error: string,
    errorMessage: string,
    errorCode: number,
    errorSource: string
}

export const handleError = ({error, errorMessage, errorCode, errorSource}: ErrorResponse)=> {
    return {
        error, 
        errorMessage, 
        errorCode, 
        errorSource
    }
}