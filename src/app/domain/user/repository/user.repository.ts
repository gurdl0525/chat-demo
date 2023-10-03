import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async existByAccountId(accountId: string) {
    return !!(await this.findOne({ where: { accountId } }));
  }
}
