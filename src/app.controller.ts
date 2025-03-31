import { Controller, Get, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { TransactionInterceptor } from './interceptors/transaction.interceptor';
import { SessionDecorator } from './decorators/session.decorator';
import { AuthorizationSessionData } from './utils/interfaces';

@UseInterceptors(TransactionInterceptor)
@Controller()
export class AppController {
    
    constructor(
        private readonly appService: AppService
    ) { }

    @Post()
    @HttpCode( 200 )
    async resolve(
        @SessionDecorator() sessionData: AuthorizationSessionData
    )
    {
        return await this.appService.resolve( sessionData );
    }
}

