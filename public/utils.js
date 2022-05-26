const setAttribute =(el, attrs)=>{
    for(let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}