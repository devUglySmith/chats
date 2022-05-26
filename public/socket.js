const inviteButton = document.querySelector("#inviteButton");
const inviteModal = document.querySelector("#inviteModal");
const inviteCloseButton = document.querySelector("#closeButton");
const inviteUserList = document.querySelectorAll(".user-list");
const chatDisplay = document.querySelector("#chatDisplay");
const chatRoomList =document.querySelector("#chatRoomList");
const sendButton = document.querySelector("#sendButton");
const writeBox = document.querySelector("#writeBox");

let chatUserInfo = {
    nickname: null,
    id: null,
    room: {
        roomId: null,
        roomName: null
    }
}

const socket = io('http://192.168.0.92:8080');

/*
* 소켓서버 연결
 */
const handleSocketConnection = () => {
            // const socket = io('http://chattalk.uglysmith.co.kr:5000');
    const userId = prompt('아이디를 입력해주세요');

    if (userId){
        socket.on('connect', function () {
            try {
                console.log('connected')
                socket.emit('setInit', {userId}, response => {
                        chatUserInfo.nickname = response.name;
                        chatUserInfo.id = response.id;
                        chatUserInfo.room = response.room;
                    }
                );
                socket.emit('getChatRoomList', null);

            }catch (e){
                console.log(e)
            }
        });
    }else{
        alert('아이디를 입력해주세요.');
        location.reload();
    }
}

/*
* 메세지 전송
*/
const handleSocketSendMessage =  ()=>{
    sendButton.addEventListener("click", ()=>{
        socket.emit('sendMessage', writeBox.value);
        writeBox.value = '';
    })

    writeBox.addEventListener('keypress', (e)=>{
        if (e.key === 'Enter'){
            socket.emit('sendMessage', writeBox.value);
            writeBox.value = '';
        }
    })
}

/*
* 메세지 읽어오기
 */
const handleSocketGetMessage = () => {
    socket.on('getMessage', function ({id, nickname, message}) {
        let html = '';
        // 내 메세지
        if (chatUserInfo.id === id) {
            html += '<div class="outgoing_msg">';
            html += '<div class="sent_msg">';
            html += '<p>' + message + '</p>';
            html += '<span class="time_date"> ' + nickname + '    | 11:01 AM    |    June 9</span>';
            html += '</div>';
            html += '</div>';
        } else {
            // 상대방 메세지
            html += '<div class="incoming_msg">';
            html += '<div class="received_msg">';
            html += '<div class="received_withd_msg">';
            html += '<p>' + message + '</p>';
            html += '<span class="time_date"> ' + nickname + '    | 11:01 AM    |    June 9</span>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }
        chatDisplay.innerHTML += html;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

    });
}

/*
 * 참여하고 있는 채팅방 리스트 가져오기
 * */
const handleSocketGetRoomList = () => {
    socket.on('getChatRoomList', function (response) {
        let html = '';
        for (const {roomId, roomName} of Object.values(response)) {
            html += '<div class="chat_list ' + (chatUserInfo.room.roomId === roomId ? 'active_chat' : 'enterChatRoom') + '" data-roomId="' + roomId + '">';
            html += '<div class="chat_people">';
            html += '<div class="chat_ib">';
            html += '<h5>' + roomName + '</h5>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }
        chatRoomList.innerHTML += html;
    });
}

/*
 * 채팅방 초대 (방 생성)
 */
const handleSocketInviteRoom = () => {
    chatDisplay.innerHTML = '';
    socket.emit('createChatRoom', userList, (res) => {
        if (!res) return;
        chatUserInfo.room = res;
        chatDisplay.innerHTML = '';
    });
    socket.emit('getChatRoomList', null);
}


/*
 * 채팅방 입장
 */
const handleSocketJoinRoom = () => {
    const thisRoomId = $(this).attr('data-roomId');
    socket.emit('enterChatRoom', thisRoomId, (res) => {
        if (!res) return;
        chatUserInfo.room = res;
        // $('.roomName').text(chatUserInfo.room.roomName);
        chatDisplay.innerHTML = '';
    });
    socket.emit('getChatRoomList', null);
}

const handleSocketEvent = () => {

    handleSocketConnection();
    handleSocketGetMessage();
    handleSocketGetRoomList();

    handleSocketSendMessage();

    socket.on('disconnect', function () {
        chatRoomList.innerHTML = '';
        console.log('Disconnected');
    });

}

/*
* 채팅 초대 이벤트
 */
const handleInviteEvent = () => {
    inviteButton.addEventListener("click", () => {
        inviteModal.classList.add("invite");
    })

    inviteCloseButton.addEventListener("click", () => {
        inviteModal.classList.remove("invite");
        inviteUserList.forEach(list => {
            list.checked = false;
        })
    })
}


handleSocketEvent();
handleInviteEvent();