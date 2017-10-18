import * as bcrypt from 'bcrypt';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserIncorrectPassword, UserNotFound } from '../../exception/exceptions';
import { UserEntity } from './User.model';

@Service()
export class UserService {
  @OrmRepository(UserEntity)
  private repository: Repository<UserEntity>;

  public addNew(user: Partial<UserEntity>) {
    const userEntity = this.repository.create(user);
    return this.repository.save(userEntity);
  }

  public removeAll() {
    return this.repository.clear();
  }

  public findAll() {
    return this.repository.find();
  }

  // public async verifyCredentials(emailAddress: string, password: string): Promise<UserEntity> {
  //   const user = await this.repository.findOne({ emailAddress });
  //   if (!user) {
  //     throw new UserNotFound();
  //   }

  //   const comparison = await bcrypt.compare(password, user.password);
  //   if (!comparison) {
  //     throw new UserIncorrectPassword();
  //   }

  //   return user;
  // }

  public verifyCredentials(emailAddress: string, password: string): Promise<UserEntity> {
    return this.repository.findOne({ emailAddress })
      .then<UserEntity>((user) => {
        if (!user) {
          throw new UserNotFound();
        }
        return bcrypt.compare(password, user.password).then((comparison) => {
          if (!comparison) {
            throw new UserIncorrectPassword();
          }
          return user;
        });
      });
  }
}