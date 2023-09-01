import { getHistoryByUserId } from "../repositories/history.repository.js";

// Gets user's history
export async function getHistory(req, res) {
    const { userId } = res.locals.user;

    try {
        const userHistory = await getHistoryByUserId(userId);
        const recentHistory = userHistory.history.reverse();
        return res.send(recentHistory);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
