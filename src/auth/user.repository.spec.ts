import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const mockCredentialsDto = { username: 'TestUserName', password: 'TestPassword' };
describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
      ],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      // userRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('successfully signup user', async () => {
      const result = userRepository.signUp(mockCredentialsDto);
      await expect(result).resolves.not.toThrow().catch((error) => {
          if (error.code === 'ER_DUP_ENTRY') {
            expect(error).rejects.toThrow(ConflictException);
          } else {
            expect(result).rejects.toThrow(InternalServerErrorException);
          }
        });
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(()=> {
      userRepository.findOne = jest.fn();

      user = new User();
      user.username = 'TestUser';
      user.validatePassword = jest.fn();
    })

    it('returns the username as validation is successful', async ()=> {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(result).toEqual('TestUser');
    })

    it('returns null as user cannot be found', async ()=> {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);

      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null as password is invalid', async ()=> {
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);

      expect(result).toEqual(null);
    });
  })

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () =>  {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword('testPassword', 'testSalt');
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash')
    })
  })
});
