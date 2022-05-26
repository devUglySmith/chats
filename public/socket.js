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
    room: {
        roomId: null,
        roomName: null
    }
}

<<<<<<< HEAD
const socket = io('http://192.168.0.92:8080');
=======
let members;
const userList = [];
>>>>>>> c7d565e (feat 채팅방 초대 및 초대한 멤버 리스트 저장)

const socket = io('http://localhost:8080');
// const socket = io('http://chattalk.uglysmith.co.kr:5000');
/*
* 소켓서버 연결
 */
const handleSocketConnection = () => {
<<<<<<< HEAD
            // const socket = io('http://chattalk.uglysmith.co.kr:5000');
=======
>>>>>>> c7d565e (feat 채팅방 초대 및 초대한 멤버 리스트 저장)
    const userId = prompt('아이디를 입력해주세요');

    if (userId) {
        socket.on('connect', function () {
            try {
                console.log('connected')
                socket.emit('setInit', {userId}, response => {
                        if (response){
                            chatUserInfo.nickname = response.name;
                            chatUserInfo.id = response.id;
                            chatUserInfo.room = response.room;
                        }else{
                            alert('아이디를 확인해주세요.');
                            location.reload();
                        }
                    }
                );
                socket.emit('getChatRoomList', null);

            } catch (e) {
                console.log(e)
            }
        });
    } else {
        alert('아이디를 입력해주세요.');
        location.reload();
    }
}

/*
* 메세지 전송
*/
const handleSocketSendMessage = () => {
    sendButton.addEventListener("click", () => {
        if (writeBox.value) {
            socket.emit('sendMessage', writeBox.value);
            writeBox.value = '';
        }
    })

    writeBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (writeBox.value) {
                socket.emit('sendMessage', writeBox.value);
                writeBox.value = '';
            }
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
        // for (const {roomId, roomName} of Object.values(response)) {
        //     html += '<div class="chat_list ' + (chatUserInfo.room.roomId === roomId ? 'active_chat' : 'enterChatRoom') + '" data-roomId="' + roomId + '">';
        //     html += '<div class="chat_people">';
        //     html += '<div class="chat_ib">';
        //     html += '<h5>' + roomName + '</h5>';
        //     html += '</div>';
        //     html += '</div>';
        //     html += '</div>';
        // }
        // chatRoomList.innerHTML += html;
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
        ul.innerHTML = '';
        inviteModal.classList.add("invite");
        socket.emit('inviteUsers', null, (response) => {
            response.forEach((user, i) => {
                const li = document.createElement("li");
                const label = document.createElement("label");
                const input = document.createElement("input");

                setAttribute(input, {
                    'id': `user${i}`,
                    'class' : 'user-checkbox',
                    'type': 'checkbox',
                    'data-no': `${response[i].mbNo}`,
                })

                li.setAttribute('class', 'user-list')
                label.setAttribute('for', `user${i}`)
                label.innerText = response[i].mbName;

                li.appendChild(label);
                li.appendChild(input);
                ul.appendChild(li);

                members = document.querySelectorAll(".user-checkbox");

                members[i].addEventListener('click', function(){
                    let userNo = parseInt(this.getAttribute('data-no'));
                    if (!this.checked){
                        let index = userList.indexOf(userNo);
                        if (index > -1){
                            userList.splice(index, 1);
                        }
                    }else{
                        userList.push(userNo);
                    }
                })
            })
        })
    })

    inviteJoinButton.addEventListener("click", ()=>{
        console.log(userList);
        socket.emit('createChatRoom', userList);
    })

    inviteCloseButton.addEventListener("click", () => {
        inviteModal.classList.remove("invite");
    })
}


handleSocketEvent();
handleInviteEvent();