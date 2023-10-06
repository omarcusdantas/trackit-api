export default function validateUpdateAuth(req, res, next) {
    const { authorization } = req.headers;
    const updatePass = authorization?.replace("Bearer ", "");

    if (!updatePass || updatePass !== process.env.UPDATE_SECRET) {
        throw { type: "unauthorized", message: "Invalid token" };
    }
    next();
}
