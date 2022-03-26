import { NestFactory } from '@nestjs/core';
import axios from 'axios';
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
  //

  await app.listen(8080);
}
bootstrap();
