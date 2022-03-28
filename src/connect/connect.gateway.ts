import { HttpService } from '@nestjs/axios';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import axios, { AxiosResponse } from 'axios';
import { Server, Socket } from 'socket.io';
import { InSocket, SocketOne } from './types';

import * as moment from 'moment';
import { HttpHealthIndicator } from '@nestjs/terminus';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ControllerGateway implements OnGatewayConnection {
  private arrayURLs: SocketOne[] = [];

  private readonly regexp = /http:\/\/|https:\/\//gm;

  constructor(
    private httpService: HttpService,
    private http: HttpHealthIndicator,
  ) {
    setInterval(() => {
      this.arrayURLs.forEach(async (el) => {
        let answere: AxiosResponse<any, any> | undefined;

        try {
          answere = await axios.get(
            `${
              el.url.includes('http://') || el.url.includes('https://')
                ? el.url
                : `http://${el.url}`
            }`,
          );

          if (answere.status > 499) el.socket.emit('http-dead');

          el.socket.emit('http-data', {
            date: moment().format('LTS'),
            ms: moment().valueOf() - answere.config['metadata']['startTime'],
          });
        } catch {
          el.socket.emit('http-error');
        }

        try {
          const updTime = moment().valueOf();
          const response = await this.http.pingCheck(
            el.url.replace(this.regexp, ''),
            `${
              el.url.includes('http://') || el.url.includes('https://')
                ? el.url
                : `http://${el.url}`
            }`,
          );

          if (response[el.url.replace(this.regexp, '')]['status'] !== 'up')
            el.socket.emit('ping-dead');

          el.socket.emit('ping-data', {
            date: moment().format('LTS'),
            ms: moment().valueOf() - updTime,
          });
        } catch {
          el.socket.emit('ping-error');
        }
      });
    }, 10000);
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    socket.emit('connection', 'Hello world!');
  }

  handleDisconnect(socket: Socket) {
    if (!!this.arrayURLs.filter((el) => socket.id === el.socket.id).length)
      this.arrayURLs.forEach((el, index) => {
        if (socket.id === el.socket.id) this.arrayURLs.splice(index, 1);
      });
  }

  @SubscribeMessage('connection-ip')
  async setEevent(
    @MessageBody() { url }: InSocket,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!!this.arrayURLs.filter((el) => socket.id === el.socket.id).length) {
      this.arrayURLs.forEach((el, index) => {
        if (socket.id === el.socket.id) this.arrayURLs[index].url = url;
      });
      socket.emit('clear');
    } else this.arrayURLs.push({ socket, url });

    socket.emit('done');
  }
}
