const MAX_UPLOAD_FILE = 3;
const REQUEST_URL = "http://192.168.0.37:3000/upload";
const fileButton = document.querySelector("#uploadButton");
let formData = new FormData();

const filesUpload = function (e) {
  // 클라이언트단에서 업로드 개수 제한
  if (this.files.length > MAX_UPLOAD_FILE) {
    alert(`업로드 개수는 ${MAX_UPLOAD_FILE} 개까지 입니다.`);
    return false;
  }

  // 업로드 한 사람 데이터베이스에 등록하기 위해 formData 에 추가
  formData.append(`client`, userHiddenId.value);
  formData.append(`client`, userHiddenNo.value);

  for (let i = 0; i < this.files.length; i++) {
    formData.append(`files`, this.files[i]);
  }

  for (let key of formData.keys()) {
    console.log(key, ":", formData.get(key));
  }
  fetch(REQUEST_URL, {
    method: "POST",
    body: formData,
  })
    .then((response) => response)
    .then((result) => {
      console.log(result);
      formData = new FormData();
    })
    .catch((error) => alert(error));
};

fileButton.addEventListener("change", filesUpload);
