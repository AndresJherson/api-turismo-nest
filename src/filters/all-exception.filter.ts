import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prop } from '@turismo/modelos';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {

    catch(exception: T, host: ArgumentsHost) { 
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        console.log( 'Exception en filter:', exception );

        const status = exception instanceof HttpException
                            ? exception.getStatus()
                            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = Prop.setString( (exception as any).message ) !== undefined 
                            ? Prop.setString( (exception as any).message )
                            : 'Internal Server Error';


        response.status( status )
            .statusMessage = String( message );

        response.json({
            statusCode: status,
            message: String( message )
        });
    }
}
