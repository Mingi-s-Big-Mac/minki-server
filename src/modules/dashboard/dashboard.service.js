import { createDashboardRepository } from './dashboard.repository.js';

export function createDashboardService(repository = createDashboardRepository()) {
  return {
    async get(userId) {
      const data = await repository.get(userId);
      return {
        profile: data.user,
        welcome: { nickname: data.user?.nickname },
        interestOccupations: data.interests.map((item) => item.occupation),
        recentSearches: data.recentSearches,
        recentActivities: data.activities,
        searchMetadata: { categories: data.categories },
      };
    },
  };
}
