import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthorizationSessionData } from './utils/interfaces';

@Injectable()
export class AppService {
    private routes: Record<string, Record<string, ( s: AuthorizationSessionData ) => Promise<any> > > = {};

    
    async resolve( s: AuthorizationSessionData )
    {
        const isService = Object.keys( this.routes ).includes( s.service );
        if ( !isService ) throw new NotFoundException( 'Servicio inexistente' );

        const isMethod = Object.keys( this.routes[s.service] ).includes( s.method );
        if ( !isMethod ) throw new NotFoundException( 'Metodo inexistente' );

        return await this.routes[s.service][s.method]( s );
    }


    register( service: AppService['routes'] )
    {
        this.routes = {
            ...this.routes,
            ...service
        };
    }
}