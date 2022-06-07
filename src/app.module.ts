import { Module } from "@nestjs/common";
import { ChatBackEndModule } from "./chatBackEnd/chatBackEnd.module";
import { ChatFrontEndModule } from "./chatFrontEnd/chatFrontEnd.module";
import { DatabaseModule } from "./providers/database/database.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseService } from "./providers/database/database.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { Connection } from "typeorm";

@Module({
  imports: [
    ChatBackEndModule,
    ChatFrontEndModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot(
      new DatabaseService(new ConfigService()).getTypeOrmConfig()
    ),
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
