import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserInterface, UserRole } from './model/userInterface';
import { Observable, from, map, of, pipe, tap } from 'rxjs';
import { UserEntity } from './model/UserEntity';
import { hasRoles } from 'src/auth/decurator/roles.decurator';
import { RolesGuard } from 'src/auth/guards/roles.huards';
import { JwtAuthGuard } from 'src/auth/guards/jwtGuards.';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { join } from 'path';





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
  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
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



  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profileimages',
      filename: (req, file, cb) => {
        // Correcting 'orignalname' to 'originalname'
        const fileName = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension = path.parse(file.originalname).ext;
        
        cb(null, `${fileName}${extension}`); 
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  
  @UseGuards(JwtAuthGuard)
  uploadFile(@UploadedFile() file,@Request() req): Observable<Object> {
    const user = req.user;
    console.log(user.name)

    // Convert the Promise to an Observable using 'from'
    return from(this.UserService.updateOne(user.id, {
      profileImage: file.filename,
    })).pipe(
      tap((user:UserInterface)=>console.log(user)),
      map((updatedUser: UserInterface) => {
        return { profileImage: updatedUser.profileImage };
      }),
    );
  }


  // @Get('profile-image/:imagename')
  // findProfileimage(@Param('imagename')imagename,@Res() res):Observable<object>{
  //   return of(res.sendFile(join(process.cwd(),'uploads/profileimages'+imagename)))
  // }

  @Get('profile-image/:imagename')
findProfileImage(@Param('imagename') imagename: string, @Res() res): Observable<object> {
  const filePath = join(process.cwd(), 'uploads/profileimages', imagename); // Full file path
  return  of(res.sendFile(filePath));

}
  
  // if (!existsSync(filePath)) {
  //   return throwError(() => new Error('Image not found')).pipe(
  //     catchError(err => {
  //       res.status(404).send({ message: 'Image not found' });
  //       return of(null); // Return an empty observable
  //     })
  //   );
  // }


   
 
  }



  // @UseGuards(JwtAuthGuard)
  // uploadFile(@UploadedFile() file,@Request() req): Observable<Object> {
  //   console.log(file);
  //   const user = req.user;
  //   console.log(user)
  //   return of({
  //     imagePath: file.filename,
  //   });
  // }
     
     
  
 


