import { Controller, Get, Query, Res } from '@nestjs/common';
import { exec } from 'child_process';
import { Response } from 'express';
import { UrlConnectDto } from './dto/search.dto';

@Controller('connect')
export class ConnectController {
  @Get('info')
  async getInfoOfIp(
    @Query() { url }: UrlConnectDto,
    @Res() response: Response,
  ) {
    exec(
      `nslookup ${url.replace(/http:\/\/|https:\/\//gm, '')}`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }

        const arrayForObject = stdout.split('\n');

        const objOfData = arrayForObject.reduce((accum, el) => {
          const regexp = /\:(\t+|\s+)/gm;
          const str = el.replace(regexp, '|');

          if (!str.includes('|')) return accum;

          const [key, value] = str.split('|');

          let i = 1;
          let objKey = key;
          while (!!accum[objKey]) {
            objKey = `${key}-${i++}`;
          }
          accum[objKey] = value;

          return accum;
        }, {});
        response.send(objOfData);
      },
    );
  }
}
