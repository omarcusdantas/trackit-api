// Checks if token matches update password
export function validateUpdateAuth(req, res, next) {
    const { authorization } = req.headers;
    const updatePass = authorization?.replace("Bearer ", "");

    if (!updatePass || updatePass !== process.env.UPDATE_SECRET) {
        return res.sendStatus(401);
    }
    next();
}
