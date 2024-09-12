import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { UserInterface } from 'src/user/model/userInterface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserISUserGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(()=>UserService))
        private userService:UserService
    ){

    }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const user:UserInterface = request.user;
    return this.userService.findById(user.id).pipe(
        map((user:UserInterface)=>{
            let haspermision = false;
            if(user.id===parseInt(params.id)){
                haspermision = true
            }
            if(haspermision==true){
                console.log(user,"dajsdk")
            }
            return user && haspermision
        })
    )
  
    // console.log(request)

    return true
  }
}