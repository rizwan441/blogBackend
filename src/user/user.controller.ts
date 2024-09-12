import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserInterface, UserRole } from './model/userInterface';
import { Observable, from, map } from 'rxjs';
import { UserEntity } from './model/UserEntity';
import { hasRoles } from 'src/auth/decurator/roles.decurator';
import { RolesGuard } from 'src/auth/guards/roles.huards';
import { JwtAuthGuard } from 'src/auth/guards/jwtGuards.';

@Controller('user')
export class UserController {
  constructor(private UserService: UserService) {}

  @Post()
  createONe(@Body() user: UserInterface): Observable<UserInterface> {
    return from(this.UserService.createUser(user));
  }
  @Get(':id')
  findONe(@Param('id') id: number): Observable<UserInterface> {
    return from(this.UserService.findById(id));
  }

  @Delete(':id')
  async deleteONe(@Param('id') id: string): Promise<any> {
    return await this.UserService.deleteUserById(parseInt(id));
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAllUser() {
    const findAllUser = await this.UserService.findAllUser();
    return findAllUser;
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() user: Partial<UserInterface>,
  ): Promise<any> {
    return this.UserService.updateOne(parseInt(id), user);
  }

  @Post('login')
  login(@Body() user: UserInterface): Observable<Object> {
    return this.UserService.login(user).pipe(
      map((jwt: string) => {
        return { accessToken: jwt }; // Ensure the key is correctly spelled
      }),
    );
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() user: UserInterface,
  ): Observable<UserInterface> {
    return this.UserService.UpdateUserRole(Number(id), user);
  }
}
