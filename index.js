(function(){
  var canvas = document.getElementById('canvas');
  var unicornImage = document.getElementById('unicorn');
  var g = canvas.getContext('2d');
  g.fillStyle = '#ff0000';
  g.fillRect(300,300,100,100);
  g.drawImage(unicornImage,0,0,261,280);
})();