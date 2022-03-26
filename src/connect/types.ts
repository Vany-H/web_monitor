import { IsUrl } from 'class-validator';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export class SocketOne {
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  url: string;
}

export class InSocket {
  @IsUrl()
  url: string;
}
