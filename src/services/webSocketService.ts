import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export class WebsocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  getClickConfig(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.emit('getConfig');
      this.socket.on('clickConfig', (data: string) => {
        observer.next(data);
      });
    });
  }

  getFlatConfig(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.emit('getFlatConfig');
      this.socket.on('clickFlatConfig', (data: string) => {
        observer.next(data);
      });
    });
  }

  sendCommand(command: string): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.emit('command', command);
      this.socket.on('commandResult', (data: string) => {
        observer.next(data);
      });
    });
  }

  getHandlers(element: string): Observable<string[]> {
    return new Observable<string[]>(observer => {
      this.socket.emit('getHandlers', element);
      this.socket.on('handlers', (data: string[]) => {
        observer.next(data);
      });
    });
  }

  getAllHandlersFields(element: string): Observable<string[]> {
    return new Observable<string[]>(observer => {
      this.socket.emit('getHandlers', element);
      this.socket.on('handlers', (data: string[]) => {
        observer.next(data);
      });
    });
  }
}