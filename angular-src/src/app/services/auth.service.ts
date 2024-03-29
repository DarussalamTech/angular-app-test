import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from "@angular/http";
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';
import {environment} from '../../environments/environment';

const BASE_URL = environment.backendUrl;

@Injectable()
export class AuthService {
  private authToken: string;
  private user: string;

  private apiUrl: string = `${BASE_URL}/users`;

  constructor(private http: Http) { }

  registerUser(user): any {
    let url: string = this.apiUrl + "/register";
    // prepare the request
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = user;
    // POST
    let observableReq = this.http.post(url, reqBody, options).map(this.extractData);
    return observableReq;
  }

  getOnlineBuyers(): any {
    let url: string = this.apiUrl + "/getOnlineBuyers";
    // prepare the request
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    // POST
    let observableReq = this.http.post(url, options).map(this.extractData);
    return observableReq;
  }

  authenticateUser(user): any {
    let url: string = this.apiUrl + "/authenticate";
    // prepare the request
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = user;
    // POST
    let observableReq = this.http.post(url, reqBody, options).map(this.extractData);
    return observableReq;
  }

  storeUserData(token, user): void {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  getUserData(): any {
    this.loadCredentials();
    let jUser = JSON.parse(this.user);
    let jData = {token: this.authToken, user: jUser};
    return jData;
  }

  loadCredentials(): void {
    let token = localStorage.getItem("token");
    let user = localStorage.getItem("user");
    this.authToken = token;
    this.user = user;
  }

  loggedIn(): boolean {
    return tokenNotExpired();
  }

  logout(userID : number): any {

    this.authToken = null;
    this.user = null;
    localStorage.clear();

    // prepare the request for changing status online of offline
    let url: string = this.apiUrl + "/logout";
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = {id:userID};
    let observableReq = this.http.post(url, reqBody, options).map(this.extractData);
    return observableReq;
  }


  extractData(res: Response): any {
    let body = res.json();
    return body || { };
  }

}
