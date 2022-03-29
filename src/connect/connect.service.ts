import { Injectable } from '@nestjs/common';
import { HttpHealthIndicator } from '@nestjs/terminus';
import axios from 'axios';
import * as moment from 'moment';
import { Socket } from 'socket.io';

@Injectable()
export class ConnectService {
  private readonly regexp = /http:\/\/|https:\/\//gm;

  constructor(private http: HttpHealthIndicator) {}

  async checkHostHttp(
    url: string,
    nodes: string[] = ['ru1.node.check-host.net', 'ru2.node.check-host.net'],
  ) {
    const request = await axios.get(
      `https://check-host.net/check-http?host=${url}&max_nodes=22${nodes
        .map((el) => '&node=' + el)
        .join('')}`,
      { headers: { Accept: 'application/json' } },
    );

    let flag = true;
    let response;

    while (flag) {
      response = (
        await axios.get(
          `https://check-host.net/check-result/${request.data.request_id}`,
        )
      ).data;

      flag = false;
      Object.entries(response).forEach(([, value]) => {
        if (!value) flag = true;
      });
    }

    return Object.entries(response).map(([key, value]) => ({
      key,
      time: value[0][1],
      message: value[0][2],
    }));
  }

  async sendHttpData(url: string, socket: Socket) {
    try {
      const answere = await axios.get(
        `${
          url.includes('http://') || url.includes('https://')
            ? url
            : `http://${url}`
        }`,
      );

      if (answere.status > 499) socket.emit('http-dead');

      socket.emit('http-data', {
        date: moment().format('LTS'),
        ms: moment().valueOf() - answere.config['metadata']['startTime'],
      });
    } catch {
      socket.emit('http-error');
    }
  }

  async pingHost(url: string, socket: Socket) {
    try {
      const updTime = moment().valueOf();
      const response = await this.http.pingCheck(
        url.replace(this.regexp, ''),
        `${
          url.includes('http://') || url.includes('https://')
            ? url
            : `http://${url}`
        }`,
      );

      if (response[url.replace(this.regexp, '')]['status'] !== 'up')
        socket.emit('ping-dead');

      socket.emit('ping-data', {
        date: moment().format('LTS'),
        ms: moment().valueOf() - updTime,
      });
    } catch {
      socket.emit('ping-error');
    }
  }
}
