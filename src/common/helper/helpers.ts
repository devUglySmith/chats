export class Helpers {
  public async makeRoomName(userData) {
    const userName: Array<string> = [];

    for (const data of userData) {
      userName.push(data.mbName);
    }
    return userName.join();
  }
}
