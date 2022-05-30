import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../common/utils/multer.options";
import * as path from "path";
import fs from "fs";

@Controller("upload")
export class ChatBackEndController {
  @Post()
  @UseInterceptors(FilesInterceptor("files", 3, multerOptions("files")))
  async chatFilesUpload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() userData: any
  ) {
    fs.mkdirSync(path.join(__dirname, "..", `uploads`));
    console.log(userData);
    console.log(files);
  }
}
