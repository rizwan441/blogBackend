import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserInterface } from 'src/user/model/userInterface';
const bcrypt = require("bcrypt")

@Injectable()
export class AuthService {
    constructor(private readonly jwtService:JwtService){}


   async generateJWT(user:UserInterface):Promise<string>{
    return await this.jwtService.signAsync({user})
   }


   async hashPassword(password:string):Promise<string>{
    return await bcrypt.hash(password,12)
   }


   async comparePassword(newPassword: string, hashPassword: string): Promise<boolean> {
    return await bcrypt.compare(newPassword, hashPassword);
  }
}
