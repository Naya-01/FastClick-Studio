import { Observable } from 'rxjs';
import axios from 'axios';


const getApiUrl = () => localStorage.getItem('apiUrl');

export class WebsocketService {
  
  getClickConfig(): Observable<string> {
    return new Observable(observer => {
      axios.get(`${getApiUrl()}/config`, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
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
      axios.get(`${getApiUrl()}/flatconfig`, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
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
      axios.post(`${getApiUrl()}/command`, { 
        command,
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getHandlers(element: string, handler: string): Observable<string[]> {
    return new Observable(observer => {
      axios.get(`${getApiUrl()}/${element}/${handler}`, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getHandlersRouter(): Observable<string[]> {
    return new Observable(observer => {
      axios.get(`${getApiUrl()}/handlers`, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getElementMap(): Observable<string> {
    return new Observable(observer => {
      axios.get(`${getApiUrl()}/element_map`, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
      })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getAllHandlersFields(element: string): Observable<string> {
    return new Observable(observer => {
      axios.get(`${getApiUrl()}/${element}`, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
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
      axios.post(`${getApiUrl()}/${element}/${handler}`, data, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
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
      axios.post(`${getApiUrl()}/hotconfig`, newConfig, {
        headers: {
          'Content-Type': 'text/plain',
        },
        responseType: 'text',
    })
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }
  

}
