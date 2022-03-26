import { Module } from '@nestjs/common';
import { ConnectController } from './connect.controller';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [HttpModule, TerminusModule],
  controllers: [ConnectController],
})
export class ConnectModule {}
