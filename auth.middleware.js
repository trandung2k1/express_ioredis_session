class IError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
const authenticate = (req, res, next) => {
    if (!req.session.user || !req.cookies.sessionId) {
        const error = new IError("You're not allowed to do that.");
        error.statusCode = 401;
        next(error);
    }
    next();
};
module.exports = authenticate;
