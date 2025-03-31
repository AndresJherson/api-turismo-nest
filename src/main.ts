import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use( cookieParser() );
    app.enableCors({
        origin: true,
        methods: [ 'POST', 'GET', 'DELETE' ],
        credentials: true
    });

    app.useGlobalFilters( new AllExceptionFilter() );

    app.useStaticAssets( join( __dirname, '..', '..', 'images' ), { prefix: '/images' } );

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
