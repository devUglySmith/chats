import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './adapters/socket-io.adapters';
import * as path from "path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useWebSocketAdapter(new SocketIoAdapter(app));
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');

    app.useStaticAssets(path.join(__dirname, './common', 'uploads'), {
        prefix: '/media',
    });

    app.enableCors();
    await app.listen(3000);
}
bootstrap();