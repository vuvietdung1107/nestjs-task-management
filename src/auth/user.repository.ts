import { EntityRepository, Repository } from 'typeorm';
import { User } from './usser.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

}