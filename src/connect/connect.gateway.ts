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
import { ConnectService } from './connect.service';

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
    private readonly connectService: ConnectService,
  ) {
    setInterval(() => {
      this.arrayURLs.forEach(async (el) => {
        let answere: AxiosResponse<any, any> | undefined;

        this.connectService.sendHttpData(el.url, el.socket);

        this.connectService.pingHost(el.url, el.socket);

        try {
          const [resp] = await this.connectService.checkHostHttp(el.url);

          if (resp.message === 'Connection timed out')
            el.socket.emit('HvSS-dead');

          el.socket.emit('HvSS-data', {
            date: moment().format('LTS'),
            ms: resp.time * 1000,
          });
        } catch {
          el.socket.emit('HvSS-error');
        }
      });
    }, 15000);
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
        if (socket.id === el.socket.id) this.arrayURLs.splice(index, 1);
      });
      this.arrayURLs.push({ socket, url });
      socket.emit('clear');
    } else this.arrayURLs.push({ socket, url });

    socket.emit('done');
  }
}
