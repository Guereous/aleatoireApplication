import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  async findOrCreate(profile: any): Promise<User> {
    let user = this.users.find(u => u.googleId === profile.id);
    
    if (!user) {
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos?.[0]?.value,
        createdAt: new Date(),
      };
      this.users.push(user);
    }
    
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    return this.users.find(u => u.googleId === googleId);
  }
}
