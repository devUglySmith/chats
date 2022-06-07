import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ChatRoomService } from "./chatRoom.service";
import { multerOptions } from "../common/utils/multer.options";
import { ChatBackEndGateway } from "./chatBackEnd.gateway";

@Controller("upload")
export class ChatBackEndController {
  constructor(
    private readonly ChatRoomService: ChatRoomService,
    private readonly ChatBackEndGateway: ChatBackEndGateway
  ) {}
  @Post()
  @UseInterceptors(FilesInterceptor("files", 3, multerOptions("files")))
  async chatFilesUpload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() userData: any
  ) {
    const fileData = await this.ChatRoomService.createUploadFiles(
      files,
      userData.client
    );

    for (let data of fileData) {
      this.ChatBackEndGateway.server.to(data.chatNo).emit("getMessage", [
        {
          id: userData.client[0],
          nickname: userData.client[2],
          message: data.cfFile,
          messageDate: data.cfRegdate,
          file: true,
        },
      ]);
    }
  }
}
