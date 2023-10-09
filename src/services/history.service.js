import historyRepository from "../repositories/history.repository.js";

async function getByUserId(userId) {
    const userHistory = await historyRepository.getByUserId(userId);
    return userHistory.history.reverse();
}

const historyService = {
    getByUserId,
};
export default historyService;
