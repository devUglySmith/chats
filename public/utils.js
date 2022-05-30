const setAttribute =(el, attrs)=>{
    for(let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

// 메세지 가져오기
const drawMessage = (chatUserInfo, res)=>{
    console.log(res);

    let html = '';
    res.forEach(data=>{
        const now = new Date(data.messageDate);
        const date = now.toLocaleString();
        const format = "\\.(bmp|gif|jpg|jpeg|png)$";
        // 내 메세지



        if (chatUserInfo.id === data.id) {
            html += '<div class="outgoing_msg">';
            html += '<div class="sent_msg">';
            if(data.file){

                if (new RegExp(format).test(data.message)) {
                    html += `<p><img src='/media/files/${data.message}' alt="${data.message}"></p>`;
                }else{
                    html += `<p><a href='/media/files/${data.message}' download>${data.message}</a></p>`;
                }
            }else{
                html += '<p>' + data.message + '</p>';
            }
            html += '<span class="time_date"> ' + data.nickname + '    | ' +date+'</span>';
            html += '</div>';
            html += '</div>';
        } else {
            // 상대방 메세지
            html += '<div class="incoming_msg">';
            html += '<div class="received_msg">';
            html += '<div class="received_withd_msg">';
            if(data.file){
                if (new RegExp(format).test(data.message)) {
                    html += `<p><img src='/media/files/${data.message}' alt="${data.message}"></p>`;
                }else{
                    html += `<p><a href='/media/files/${data.message}' download>${data.message}</a></p>`;
                }
            }else{
                html += '<p>' + data.message + '</p>';
            }
            html += '<span class="time_date"> ' + data.nickname + '    | '+date +'</span>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }
    });



    chatDisplay.innerHTML += html;
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}