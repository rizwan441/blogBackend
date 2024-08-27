import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.huards';
import { JwtAuthGuard } from './guards/jwtGuards.';
import { JwtStrategy } from './guards/jwt-stratergy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule, 
  forwardRef(() => UserModule),
    // Ensure ConfigModule is imported
    JwtModule.registerAsync({
      imports: [ConfigModule], // Only ConfigModule should be imported here
      inject: [ConfigService], // Inject ConfigService for use in useFactory
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWTSECRET'), // Fetch JWT secret from config
        signOptions: { expiresIn: '1000s' }, // Set token expiration
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,RolesGuard,JwtAuthGuard,JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
