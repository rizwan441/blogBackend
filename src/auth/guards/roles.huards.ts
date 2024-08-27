import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { UserInterface } from 'src/user/model/userInterface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> |Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user['user:'];
    console.log(user)
    console.log(user.id)

    return this.userService.findById(user.id).pipe(
        map((user:UserInterface)=>{
            const hasRoles =()=>roles.indexOf(user.role)>-1
            let hasPermisson :boolean=false;
            console.log(hasRoles)

            if(hasRoles()){
                console.log("has Role true")
                hasPermisson = true
            }

            return user && hasPermisson
        })
    )
   
  
  }
}


  
   
