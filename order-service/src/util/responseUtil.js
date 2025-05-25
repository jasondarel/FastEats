export const responseSuccess = (res, status, message="Success", key="data", data={}) => {
    res.status(status).json({
        success: true,
        message: message,
        [key]: data
    });
}

export const responseError = (res, status, message="Error", error=null) => {
    res.status(status).json({
        success: false,
        message: message,
        error: error
    });
}