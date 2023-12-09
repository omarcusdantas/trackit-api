import { historyRepository } from "@/repositories/history.repository";

async function getByUserId(userId: number) {
    const userHistory = await historyRepository.getByUserId(userId);
    return userHistory.history.reverse();
}

export const historyService = {
    getByUserId,
};
