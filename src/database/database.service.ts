import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {TypeOrmModuleOptions} from "@nestjs/typeorm";

@Injectable()
export class DatabaseService {
    constructor(private readonly config:ConfigService) {}

    public getTypeOrmConfig(): TypeOrmModuleOptions{
        return {
            type: 'mysql',
            host: this.config.get('DATABASE_HOST'),
            port: +this.config.get('DATABASE_PORT'),
            username: this.config.get('DATABASE_USER'),
            password: this.config.get('DATABASE_PASSWORD'),
            database: this.config.get('DATABASE_NAME'),
            entities: [__dirname + '/**/*.entity{.ts,.js}', 'dist/**/*.entity{.ts,.js}'],
            synchronize: false,
            autoLoadEntities: true,
            logging:false,
        }

    }
}

