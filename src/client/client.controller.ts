import { Controller, Get, Render } from "@nestjs/common";

@Controller()
export class ClientController {
  @Get()
  @Render("index")
  root() {
    return { message: "Hello world!" };
  }
}
