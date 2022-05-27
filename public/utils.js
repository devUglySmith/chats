const setAttribute =(el, attrs)=>{
    for(let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

const drawMessage = (chatUserInfo, res)=>{
    console.log(res);
    const date = new Date(res.cmRegdate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let html = '';
    // 내 메세지
    if (chatUserInfo.id === res.id) {
        html += '<div class="outgoing_msg">';
        html += '<div class="sent_msg">';
        html += '<p>' + res.message + '</p>';
        html += '<span class="time_date"> ' + res.nickname + '    | ' +date+'</span>';
        html += '</div>';
        html += '</div>';
    } else {
        // 상대방 메세지
        html += '<div class="incoming_msg">';
        html += '<div class="received_msg">';
        html += '<div class="received_withd_msg">';
        html += '<p>' + res.message + '</p>';
        html += '<span class="time_date"> ' + res.nickname + '    | '+date +'</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    chatDisplay.innerHTML += html;
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}