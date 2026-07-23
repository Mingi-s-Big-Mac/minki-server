import { AppError } from '../../common/errors/app-error.js';
import { hashPassword, verifyPassword } from '../../common/security/password.js';
import { createUsersRepository } from './users.repository.js';

export function createUsersService(repository = createUsersRepository()) {
  return {
    async getMe(userId) {
      const user = await repository.findPublicById(userId);
      if (!user)
        throw new AppError('사용자를 찾을 수 없습니다.', {
          statusCode: 404,
          code: 'USER_NOT_FOUND',
        });
      return user;
    },
    updateMe(userId, input) {
      return repository.updateMe(userId, input);
    },
    async changePassword(userId, { currentPassword, newPassword }) {
      const user = await repository.findById(userId);
      if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
        throw new AppError('기존 비밀번호가 올바르지 않습니다.', {
          statusCode: 400,
          code: 'CURRENT_PASSWORD_INVALID',
        });
      }
      await repository.changePassword(userId, await hashPassword(newPassword));
      return { changed: true };
    },
    async deleteMe(userId) {
      await repository.deleteUser(userId);
      return { deleted: true };
    },
    stats(userId) {
      return repository.stats(userId);
    },
    activities(userId) {
      return repository.activities(userId);
    },
  };
}
