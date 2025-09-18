import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(profile: any): Promise<User> {
    return this.usersService.findOrCreate(profile);
  }

  async login(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async validateUserById(userId: string): Promise<User | null> {
    const user = await this.usersService.findById(userId);
    return user || null;
  }
}
