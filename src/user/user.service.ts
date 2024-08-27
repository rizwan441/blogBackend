import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './model/UserEntity';
import { UserInterface, UserRole } from './model/userInterface';
import { Observable, from,pipe, throwError } from 'rxjs';
import { catchError, map, switchMap, } from 'rxjs/operators';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService:AuthService
  ) {}

  createUser(user: UserInterface): Observable<UserEntity> {
    return from(this.authService.hashPassword(user.password)).pipe( // Convert Promise to Observable
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.email = user.email;
        newUser.username = user.username;
        newUser.password = passwordHash;
        newUser.role = UserRole.USER

        return from(this.userRepository.save(newUser)).pipe(
          map((savedUser: UserEntity) => {
            const { password, ...result } = savedUser;
            console.log(password) // Exclude the password field
            return result as UserEntity; // Explicitly return the correct type
          }),
          catchError((err) => {
            console.error('Error saving user:', err);
            return throwError(() => new Error('Error saving user')); // Wrap the error in a new Error object
          }),
        );
      }),
    );
  }
   findAllUser(): Observable<UserInterface[]> {

      return from( this.userRepository.find()).pipe(map((user)=>{
        user.forEach(function(val){
            delete val.password

        })
        return user

    


      }));
    
  }

  async deleteUserById(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateOne(id: number, user: Partial<UserInterface>): Promise<UserEntity> {
 
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updatedUser = Object.assign(existingUser, user);

      return await this.userRepository.save(updatedUser);
    
  }


  findById(id: number): Observable<UserInterface> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user: UserEntity | undefined) => {
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        const {...result } = user;
        return result as UserInterface;
      }),
      catchError((err) => {
        console.error('Error finding user:', err);
        return throwError(() => new NotFoundException(`User with ID ${id} not found`));
      }),
    );
  }


  login(user: UserInterface): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((validatedUser: UserInterface) => {
        if (validatedUser) {
          // Convert the Promise from generateJWT to an Observable using from
          return from(this.authService.generateJWT(validatedUser)).pipe(
            map((jwt: string) => jwt)
          );
        } else {
          // Return an observable with an error message
          return throwError(() => new Error("Wrong Credentials"));
        }
      }),
      catchError(err => throwError(() => err)) // Handle errors from validateUser
    );
  }


  validateUser(email: string, password: string): Observable<any> {
    return from(this.findByEmail(email).pipe(
      switchMap((user: UserInterface) => 
        from(this.authService.comparePassword(password, user.password)).pipe(
          map((match: boolean) => {
            if (match) {
              return user;
            } else {
              // Properly return an observable that emits an error
              return throwError(() => new Error('Invalid credentials'));
            }
          }),
          catchError(err => throwError(() => err)) // Properly handle and propagate errors
        )
      ),
      catchError(err => throwError(() => err)) // Handle errors from findByEmail
    ));
  }

  findByEmail(email:string):Observable<UserInterface>{
    return from(this.userRepository.findOne({ where: { email } }))

  }


  UpdateUserRole(id:number,user:UserInterface):Observable<any>{
    return from(this.userRepository.update(id,user))

  }
}