import httpStatus from "http-status";
import authService from "../services/auth.service.js";

async function signup(req, res) {
    const { name, email, password, utcOffset } = req.body;
    await authService.create(name, email, password, utcOffset);
    res.sendStatus(httpStatus.CREATED);
}

async function signin(req, res) {
    const { email, password } = req.body;
    const token = await authService.generateToken(email, password);
    res.status(httpStatus.OK).send(token);
}

const authController = {
    signup,
    signin,
};
export default authController;
