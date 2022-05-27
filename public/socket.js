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

let members;
let chatList;
const userList = [];

const socket = io('http://192.168.0.92:8080');
// const socket = io('http://chattalk.uglysmith.co.kr:5000');

/*
* 소켓서버 연결
 */
const handleSocketConnection = () => {
    const userId = prompt('아이디를 입력해주세요');

    if (userId) {
        socket.on('connect', function () {
            try {
                console.log('connected')
                socket.emit('setInit', {userId}, response => {
                    console.log(response);
                        if (response){
                            chatUserInfo.nickname = response.name;
                            chatUserInfo.id = response.id;
                            chatUserInfo.room = response.room;
                            handleSocketGetRoomList();
                        }else{
                            alert('아이디를 확인해주세요.');
                            location.reload();
                        }
                    }
                );


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
        if (!chatUserInfo.room.roomId) {
            alert('방에 입장해주세요.');
            return false;
        }
        if (writeBox.value) {
            const sendInfo = {'chatNo':chatUserInfo.room.roomId,'message':writeBox.value};

            socket.emit('sendMessage', sendInfo);
            writeBox.value = '';


        }
    })

    writeBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!chatUserInfo.room.roomId) {
                alert('방에 입장해주세요.');
                return false;
            }
            if (chatUserInfo.room.roomId && writeBox.value) {
                const sendInfo = {'chatNo':chatUserInfo.room.roomId,'message':writeBox.value};

                socket.emit('sendMessage', sendInfo);
                writeBox.value = '';

            }
        }
    })
}

/*
* 메세지 읽어오기
 */
const handleSocketGetMessage = () => {
    socket.on('getMessage', (res) => {
        drawMessage(chatUserInfo, res);
    })
}

/*
 * 참여하고 있는 채팅방 리스트 가져오기
 * */
const handleSocketGetRoomList = () => {
        let html = '';
        console.log(chatUserInfo.room);
        for (const {chatNo, chatRoom} of Object.values(chatUserInfo.room)) {
            html += '<div class="chat_list enterChatRoom' + '" data-roomId="' + chatNo + '">';
            html += '<div class="chat_people">';
            html += '<div class="chat_ib">';
            html += '<h5>' + chatRoom + '</h5>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }
        chatRoomList.innerHTML += html

        chatList = document.querySelectorAll('.enterChatRoom');

    chatList.forEach(room=>{
        room.addEventListener('click', handleSocketJoinRoom);
    })

}

/*
 * 채팅방 초대 (방 생성)
 */
const handleSocketInviteRoom = () => {
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
const handleSocketJoinRoom = (e) => {
    const thisRoomId = e.currentTarget.getAttribute('data-roomId');
    const thisRoom = e.currentTarget;
    socket.emit('enterChatRoom', thisRoomId, (res) => {
        if (!res) return;
        chatDisplay.innerHTML = '';
        chatUserInfo.room.roomId = thisRoomId;
        chatList.forEach(data=>{
            data.classList.remove('active_chat');
        })
        thisRoom.classList.add('active_chat');

        drawMessage(chatUserInfo,res)
    });
}

const handleSocketEvent = () => {

    handleSocketConnection();
    handleSocketSendMessage();
    handleSocketGetMessage();

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
        if (userList.length !== 0){
            socket.emit('createChatRoom', userList);

            alert('초대를 완료했습니다.');
            inviteModal.classList.remove("invite");
        }else{
            alert('초대할 멤버를 체크해주세요.');
            return false;
        }

    })

    inviteCloseButton.addEventListener("click", () => {
        inviteModal.classList.remove("invite");
    })
}


handleSocketEvent();
handleInviteEvent();