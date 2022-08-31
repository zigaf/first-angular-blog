import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {FbAuthResponse, User} from "../../../shared/interfaces";
import {catchError, Observable, Subject, tap, throwError} from "rxjs";
import {environment} from "../../../../environments/environment";

@Injectable({providedIn: 'root'})
export class AuthService {

  public error$: Subject<any> = new Subject<any>()

  constructor(protected http: HttpClient) {
  }

  get token(): any {
    // @ts-ignore
    const expDate = new Date(localStorage.getItem('fb-token-exp'))
    if (new Date() > expDate) {
      this.logout()
      return null
    }
    return localStorage.getItem('fb-token');


  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this))

      )

  }

  logout() {
    this.setToken(null)

  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  private handleError(error:HttpErrorResponse): any{
    const {message} = error.error.error

    switch (message){
      case 'INVALID_EMAIL':
        this.error$.next('Not correct Email')
        break
      case 'INVALID_PASSWORD':
        this.error$.next('Not correct Password')
        break
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email not found')
        break
    }

  }

  private setToken(response: any) {
    if (response) {
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000)
      localStorage.setItem('fb-token', response.idToken)
      localStorage.setItem('fb-token-exp', expDate.toString())
    } else {
      localStorage.clear()
    }
  }
}
