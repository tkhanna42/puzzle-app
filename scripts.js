
function updateImage() {
    var img = document.getElementById("unicorn");
    var url = document.getElementsByName('url')[0].value;
    img.src = url;
    initImage();
}

