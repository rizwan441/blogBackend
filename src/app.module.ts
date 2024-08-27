import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';





@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot({
      type:"postgres",
      autoLoadEntities:true,
      synchronize:true,
      host:process.env.DATABASE_HOST,
      port: 5432,
      username:'postgres',
      database:process.env.databaseName,
      password:process.env.Password
        }),
    UserModule,
    AuthModule, // Importing UserModule here

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
