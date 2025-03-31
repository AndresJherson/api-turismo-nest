import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { Prop } from '@turismo/modelos';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { ConectorService } from 'src/services/conector.service';
import { AuthenticationSessionData } from 'src/utils/interfaces';

@Injectable()
export class AuthenticationInterceptor implements NestInterceptor 
{
    constructor(
        private conectorService: ConectorService
    )
    {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> 
    {

        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        return from( this.conectorService.beginTransaction() ).pipe(
            switchMap( t => {

                const sessionData: AuthenticationSessionData = {
                    req,
                    res,
                    transaction: t,
                    json: Prop.setObject( req.body )
                }

                req.sessionData = sessionData;

                return next.handle().pipe(
                    switchMap( response => from( t.commit() ).pipe(
                        map( () => response )
                    ) ),
                    catchError( error => {
                        return from( t.rollback() ).pipe(
                            switchMap( () => {
                                console.error( 'Error en interceptor auth: ', error )
                                return throwError( () => new InternalServerErrorException( error.message ) )
                            } )
                        )
                    } )
                )
            } )
        )
    }
}
