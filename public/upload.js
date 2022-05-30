const MAX_UPLOAD_FILE = 3;
const REQUEST_URL = "http://192.168.0.37:3000/upload";
const fileButton = document.querySelector("#uploadButton");
const formData = new FormData();

const filesUpload = function (e) {
  if (this.files.length > MAX_UPLOAD_FILE) {
    alert(`업로드 개수는 ${MAX_UPLOAD_FILE} 개까지 입니다.`);
    return false;
  }

  // formData.append(`client`);
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
    .then((result) => console.log("upload success"))
    .catch((error) => alert(error));
};

fileButton.addEventListener("change", filesUpload);
