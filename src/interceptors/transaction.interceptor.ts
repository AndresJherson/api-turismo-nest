import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common';
import { Prop, Usuario } from '@turismo/modelos';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { UsuarioService } from 'src/models/Usuario/usuario.service';
import { AuthService } from 'src/services/auth.service';
import { ConectorService } from 'src/services/conector.service';
import { AuthorizationSessionData } from 'src/utils/interfaces';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {

    constructor(
        private conectorService: ConectorService,
        private usuarioService: UsuarioService,
        private authService: AuthService
    )
    {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> 
    {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        return from( this.conectorService.beginTransaction() ).pipe(
            switchMap( t => {

                const usuarioPayload = this.authService.verifyToken( req );
                
                return from( this.usuarioService.getItem( t, usuarioPayload ) ).pipe(
                    switchMap( usuario => {
                        
                        console.log( 'usuario de sesion', usuario )

                        const sessionData: AuthorizationSessionData = {
                            req,
                            res,
                            transaction: t,
                            usuario,
                            service: Prop.setString( req.body?.service ) ?? '',
                            method: Prop.setString( req.body?.method ) ?? '',
                            json: Prop.setObject( req.body?.values )
                        }
        
                        req.sessionData = sessionData;
                        
                        return next.handle().pipe(
                            switchMap( response => from( t.commit() ).pipe(
                                map( () => response )
                            ) ),
                            catchError( error => {
                                return from( t.rollback() ).pipe(
                                    switchMap( () => {
                                        console.error( 'Error en interceptor transacción: ', error )
                                        return throwError( () => new InternalServerErrorException( error.message ) )
                                    } )
                                )
                            } )
                        )
                    } )
                )
            } )
        )
    }
}
