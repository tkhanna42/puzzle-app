function updateImage() {
    var img = document.getElementById("puzzleImage");
    var url = document.getElementsByName('url')[0].value;
    img.src = url;
    img.crossOrigin = "Anonymous";
}
