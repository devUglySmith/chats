const inviteButton = document.querySelector("#inviteButton");
const inviteJoinButton = document.querySelector("#inviteRequestButton");
const inviteModal = document.querySelector("#inviteModal");
const inviteCloseButton = document.querySelector("#closeButton");
const chatDisplay = document.querySelector("#chatDisplay");
const chatRoomList = document.querySelector("#chatRoomList");
const sendButton = document.querySelector("#sendButton");
const writeBox = document.querySelector("#writeBox");

const ul = document.querySelector("#userListWrapper");

let chatUserInfo = {
  nickname: null,
  id: null,
  no: null,
  room: {
    roomId: null,
    roomName: null,
  },
};

let userId;
let members;
let chatList;
let userList = [];

const socket = io('http://localhost:8080');
// const socket = io('http://192.168.0.92:8080');
// const socket = io("http://192.168.0.37:8080");
// const socket = io('http://chattalk.uglysmith.co.kr:8080');

/*
 * 소켓서버 연결
 */
const handleSocketConnection = () => {
  userId = prompt("아이디를 입력해주세요");

  if (userId) {
    socket.on("connect", function () {
      try {
        console.log("connected");
        // 로그인 후 초기 세팅
        socket.emit("setInit", { userId }, (response) => {
          if (response) {
            // 유저 정보 가져와서 초기 세팅
            chatUserInfo.nickname = response.name;
            chatUserInfo.id = response.id;
            chatUserInfo.room = response.room;
            chatUserInfo.no = response.no;

            // 내가 속한 모든 방 가져오기
            handleSocketGetRoomList();
          } else {
            alert("아이디를 확인해주세요.");
            location.reload();
          }
        });
      } catch (e) {
        console.log(e);
      }
    });
  } else {
    alert("아이디를 입력해주세요.");
    location.reload();
  }
};

/*
 * 메세지 전송
 */
const handleSocketSendMessage = () => {
  sendButton.addEventListener("click", () => {
    if (!chatUserInfo.room.roomId) {
      alert("방에 입장해주세요.");
      return false;
    }
    if (writeBox.value) {
      const sendInfo = {
        chatNo: chatUserInfo.room.roomId,
        message: writeBox.value,
      };

      socket.emit("sendMessage", sendInfo);
      writeBox.value = "";
    }
  });

  writeBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      if (!chatUserInfo.room.roomId) {
        alert("방에 입장해주세요.");
        return false;
      }
      if (chatUserInfo.room.roomId && writeBox.value) {
        const sendInfo = {
          chatNo: chatUserInfo.room.roomId,
          message: writeBox.value,
        };

        socket.emit("sendMessage", sendInfo);
        writeBox.value = "";
      }
    }
  });
};

/*
 * 메세지 읽어오기
 */
const handleSocketGetMessage = () => {
  socket.on("getMessage", (res) => {
    //메세지 가져오기
    drawMessage(chatUserInfo, res);
  });
};

/*
 * 참여하고 있는 채팅방 리스트 가져오기
 * */
const handleSocketGetRoomList = () => {
  chatRoomList.innerHTML = "";
  let html = "";
  //채팅방 가져오기
  for (const { chatNo, chatRoom } of Object.values(chatUserInfo.room)) {
    html +=
      '<div class="chat_list enterChatRoom' + '" data-roomId="' + chatNo + '">';
    html += '<div class="chat_people">';
    html += '<div class="chat_ib">';
    html += "<h5>" + chatRoom + "</h5>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
  }
  chatRoomList.innerHTML += html;
  chatList = document.querySelectorAll(".enterChatRoom");
  //채팅방 입장
  chatList.forEach((room) => {
    room.addEventListener("click", handleSocketJoinRoom);
  });
};

/*
 * 채팅방 초대 (방 생성)
 */
const handleSocketInviteRoom = () => {
  socket.on("createChatRoom", userList);
};

/*
 * 채팅방 입장
 */
const handleSocketJoinRoom = (e) => {
  const thisRoomId = e.currentTarget.getAttribute("data-roomId");
  const thisRoom = e.currentTarget;
  socket.emit("enterChatRoom", thisRoomId, (res) => {
    if (!res) return;
    chatDisplay.innerHTML = "";
    chatUserInfo.room.roomId = thisRoomId;
    chatList.forEach((data) => {
      data.classList.remove("active_chat");
    });
    thisRoom.classList.add("active_chat");
    //메세지 가져오기
    drawMessage(chatUserInfo, res);
  });
};

const handleSocketEvent = () => {
  handleSocketConnection();
  handleSocketSendMessage();
  handleSocketGetMessage();

  // 실시간 초대된 채팅방 가져오기
  socket.on("getNewChatList", (res) => {
    console.log(res);
    chatUserInfo.room = res;
    handleSocketGetRoomList();
  });
  socket.on("disconnect", function () {
    chatRoomList.innerHTML = "";
    console.log("Disconnected");
  });
};

/*
 * 채팅 초대 이벤트
 */
const handleInviteEvent = () => {
  inviteButton.addEventListener("click", () => {
    ul.innerHTML = "";
    inviteModal.classList.add("invite");

    //초대할 유저 리스트 생성
    socket.emit("inviteUsers", null, (response) => {
      response.forEach((user, i) => {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const input = document.createElement("input");

        setAttribute(input, {
          id: `user${i}`,
          class: "user-checkbox",
          type: "checkbox",
          "data-no": `${response[i].mbNo}`,
        });

        li.setAttribute("class", "user-list");
        label.setAttribute("for", `user${i}`);
        label.innerText = response[i].mbName;

        li.appendChild(label);
        li.appendChild(input);
        ul.appendChild(li);

        members = document.querySelectorAll(".user-checkbox");

        // 유저 클릭 체크 확인 이벤트
        members[i].addEventListener("click", function () {
          let userNo = parseInt(this.getAttribute("data-no"));
          if (!this.checked) {
            let index = userList.indexOf(userNo);
            if (index > -1) {
              userList.splice(index, 1);
            }
          } else {
            userList.push(userNo);
          }
        });
      });
    });
  });

  // 유저 초대하기
  inviteJoinButton.addEventListener("click", () => {
    console.log(userList);
    if (userList.length !== 0) {
      socket.emit("createChatRoom", userList);

      alert("초대를 완료했습니다.");
      inviteModal.classList.remove("invite");

      // 채팅방 생성 및 초대
      handleSocketInviteRoom();
      userList = [];
    } else {
      alert("초대할 멤버를 체크해주세요.");
      return false;
    }
  });

  // 초대창 닫기
  inviteCloseButton.addEventListener("click", () => {
    inviteModal.classList.remove("invite");
  });
};

// 이벤트 호출
handleSocketEvent();
handleInviteEvent();
