import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import axios from 'axios';
import { exec } from 'child_process';
import { AppModule } from './app.module';
import * as moment from 'moment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  axios.interceptors.request.use(
    function (config) {
      config['metadata'] = { startTime: moment().valueOf() };
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );

  ConfigModule.forRoot();

  await app.listen(5000);
}
bootstrap();
