import { HttpService } from '@nestjs/axios';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import axios from 'axios';
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

  constructor(
    private httpService: HttpService,
    private http: HttpHealthIndicator,
  ) {
    setInterval(() => {
      this.arrayURLs.forEach(async (el) => {
        const answere = await axios.get(
          `${el.url.includes('http://') ? el.url : `http://${el.url}`}`,
        );
        if (answere.status > 499) el.socket.emit('dead', 'dead');

        el.socket.emit(
          'http-data',
          answere.status < 499
            ? {
                date: moment().format('LTS'),
                ms:
                  moment().valueOf() - answere.config['metadata']['startTime'],
              }
            : 'dead',
        );

        const updTime = moment().valueOf();
        const response = await this.http.pingCheck(
          el.url.replace('http://', ''),
          `${el.url.includes('http://') ? el.url : `http://${el.url}`}`,
        );

        el.socket.emit(
          'ping-data',
          response[el.url.replace('http://', '')]['status'] === 'up'
            ? {
                date: moment().format('LTS'),
                ms: moment().valueOf() - updTime,
              }
            : 'dead',
        );
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
  }
}
