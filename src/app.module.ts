import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TerminusModule } from '@nestjs/terminus';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllerGateway } from './connect/connect.gateway';
import { ConnectModule } from './connect/connect.module';

@Module({
  imports: [
    ConnectModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/monitor',
    }),
    HttpModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [AppService, ControllerGateway],
})
export class AppModule {}
