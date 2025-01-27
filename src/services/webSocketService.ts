import { Observable } from 'rxjs';
import axios from 'axios';

export class WebsocketService {
  
  getClickConfig(): Observable<string> {
    return new Observable(observer => {
      axios.get('/config', {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getFlatConfig(): Observable<string> {
    return new Observable(observer => {
      axios.get('/flatconfig', {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  sendCommand(command: string): Observable<string> {
    return new Observable(observer => {
      axios.post('/command', { 
        command,
        headers: {
        'Content-Type': 'text/plain'
      } })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getHandlers(element: string, handler: string): Observable<string[]> {
    return new Observable(observer => {
      axios.get(`/${element}/${handler}`, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getAllHandlersFields(element: string): Observable<string[]> {
    return new Observable(observer => {
      axios.get(`/${element}`, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  postHandler(element: string , handler: string, data: any) {
    return new Observable(observer => {
      axios.post(`/${element}/${handler}`, {data}, {
        headers: { 'Content-Type': 'text/plain' }
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  updateClickConfig(newConfig: string): Observable<string> {
    return new Observable(observer => {
      axios.post('/hotconfig', newConfig, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }
  

}
