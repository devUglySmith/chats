import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatRoomService } from "./chatRoom.service";
import { setInitDTO } from "./dto/chatBackEnd.dto";

@WebSocketGateway(8080, {
  cors: {
    // origin: 'http://chattalk.uglysmith.co.kr',
    credentials: true,
    allowEI03: true,
  },
})
export class ChatBackEndGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly ChatRoomService: ChatRoomService) {}
  @WebSocketServer()
  server: Server;

  public handleConnection(client: Socket) {
    console.log("connected", client.id);
    client.leave(client.id);
    client.data.roomId = `room:lobby`;
    client.join("room:lobby");
  }

  public handleDisconnect(client: Socket) {
    const { roomId } = client.data;
    if (
      roomId != "room:lobby" &&
      !this.server.sockets.adapter.rooms.get(roomId)
    ) {
      this.ChatRoomService.deleteChatRoom(roomId);
      this.server.emit(
        "getChatRoomList",
        this.ChatRoomService.getChatRoomList(client.data.no)
      );
    }
    console.log("disonnected", client.id);
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(client: Socket, sendInfo) {
    await this.ChatRoomService.createChatMessage(client, sendInfo);
  }

  @SubscribeMessage("setInit")
  async setInit(client: Socket, data: setInitDTO) {
    if (client.data.isInit) {
      return;
    }

    const user = await this.ChatRoomService.getMemberList(data.userId);

    if (!user) return false;

    client.data.no = user.mbNo;
    client.data.id = user.mbId;
    client.data.nickname = user.mbName;
    client.data.isInit = true;

    const roomList = await this.ChatRoomService.getChatRoomList(client.data.no);

    client.join(client.data.no);

    return {
      no: user.mbNo,
      name: user.mbName,
      id: user.mbId,
      room: roomList,
    };
  }

  @SubscribeMessage("getChatRoomList")
  async getChatRoomList(client: Socket) {
    client.emit(
      "getChatRoomList",
      await this.ChatRoomService.getChatRoomList(client.data.no)
    );
  }

  @SubscribeMessage("createChatRoom")
  async createChatRoom(client: Socket, userList) {
    await this.ChatRoomService.createChatRoom(client, { userList });
    return await this.ChatRoomService.getChatRoomList(client.data.no);
  }

  @SubscribeMessage("enterChatRoom")
  async enterChatRoom(client: Socket, roomId: string) {
    if (client.rooms.has(roomId)) {
      return;
    }

    return await this.ChatRoomService.enterChatRoom(client, roomId);
  }

  @SubscribeMessage("inviteUsers")
  selectInviteUser(client: Socket) {
    return this.ChatRoomService.getAllMemberList(client.data.id);
  }
}
