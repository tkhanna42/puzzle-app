var initImage;

(function(){
  function offset(x, y, w, h){
    return (y*w + x) * 4;
  }
  function write(imageData, x, y, r, g, b, a){
    var dataOffset = offset(x,y,imageData.width);
    imageData.data[dataOffset] = r;
    imageData.data[dataOffset + 1] = g;
    imageData.data[dataOffset + 2] = b;
    imageData.data[dataOffset + 3] = a;
  }

  function copy(src,dest){
    for(var i=0;i<src.data.length;i++)dest.data[i] = src.data[i];
  }

  //w1 is the width of the src
  //w and h are the width of the dest
  function copyPixels(src,dest,x,y,w,h,w1){
    for(var px = 0; px<w ; px ++){
      for(var py = 0; py<h ; py ++){
        var destOffset = offset(px, py, w);
        var srcOffset = offset(x + px, y + py, w1);
        dest.data[destOffset] = src.data[srcOffset];
        dest.data[destOffset + 1] = src.data[srcOffset + 1];
        dest.data[destOffset + 2] = src.data[srcOffset + 2];
        dest.data[destOffset + 3] = src.data[srcOffset + 3];
      }
    }
  }

  //add an outline
  function outline(imageData, r, g, b, lw){
    var w = imageData.width;
    var h = imageData.height;
  //top
    for(var x=0; x<w; x++)
      for(var y=0; y<lw; y++)
        write(imageData,x, y, r, g, b, 255);
    //bottom
    for(var x=0; x<w; x++)
      for(var y=h-lw; y<h; y++)
        write(imageData,x, y, r, g, b, 255);
    //left
    for(var x=0; x<lw; x++)
      for(var y=0; y<h; y++)
        write(imageData,x, y, r, g, b, 255);
    //right
    for(var x=w-lw; x<w; x++)
      for(var y=0; y<h; y++)
        write(imageData,x, y, r, g, b, 255);

  }
  //copies with new alpha
  function setTransparency(src,dest,a){
    for(var i=0; i<=src.length; i+=4){
      dest[i] = src[i];
      dest[i+1] = src[i+1];
      dest[i+2] = src[i+2];
      dest[i+3] = a;
    }
  }
  
  function randomizer(x, y) {
    var maxWidth = canvas.width;
    var maxHeight = canvas.height;

    var newX = Math.floor(Math.random() * (maxWidth - imageWidth / gridSize));
    //newX = (newX > canvas.width/2) ? Math.floor(newX * 1/5) : (Math.floor(newX * 1/5) + (canvas.width * 4/5));

    var newY; 
    if(newX >= (w - imageWidth)/2 - imageWidth / gridSize && newX <= (w + imageWidth)/2){ 
      if(Math.random() > 0.5) newY = Math.floor(Math.random() * ((h - imageHeight)/2 - imageHeight / gridSize));
      else newY = Math.floor((h + imageHeight)/2 + Math.random() * ((h - imageHeight)/2 - imageHeight / gridSize));
    }
    else newY = Math.floor(Math.random() * (maxHeight - imageHeight / gridSize));

    return {x:newX, y:newY};
  }
  
  function getIdxs(piece){
    for(var x=0;x<gridSize;x++)
      for(var y=0;y<gridSize;y++)
        if(piece === pieces[x][y])
          return {x:x, y:y};
  }
  
  //returns whether or not the piece is in the right place
  function inPlace(piece){
    //maximum allowable suared distance
    var diff2 = 100;
    var idxs = getIdxs(piece); 
    var cx = (w - imageWidth)/2 + idxs.x*imageWidth/gridSize;
    var cy = (h - imageHeight)/2 + idxs.y * imageHeight / gridSize;
    var dx = cx - piece.pos.x;
    var dy = cy - piece.pos.y;
    return dx*dx + dy*dy < diff2;
  }
  
  function isComplete(){
    var complete = true;
    for(var x=0;x<gridSize;x++)
      for(var y=0;y<gridSize;y++)
        if(!pieces[x][y].locked) return false;
    return true;
  }
  
  function draw(invisible){
    g.fillStyle = '#fff';
    g.strokeStyle = '#000';
    g.lineWidth = 2;
    g.fillRect(0,0,w,h);
    g.putImageData(imageGhost, (w - imageWidth)/2, (h - imageHeight)/2);
    //vertical lines of grid
    for(var x=0; x <= gridSize; x++){
      g.beginPath();
      g.moveTo((w - imageWidth)/2 + x*imageWidth/gridSize, (h - imageHeight)/2);
      g.lineTo((w - imageWidth)/2 + x*imageWidth/gridSize, (h + imageHeight)/2);
      g.stroke();
    }
    //horizontal lines of grid
    for(var y=0; y <= gridSize; y++){
      g.beginPath();
      g.moveTo((w - imageWidth)/2, (h - imageHeight)/2 + y * imageHeight / gridSize);
      g.lineTo((w + imageWidth)/2, (h - imageHeight)/2 + y * imageHeight / gridSize);
      g.stroke();
    }
    
    //drawPieces
    for(var x = gridSize - 1;x>=0;x--){
      for(var y = gridSize - 1;y>=0;y--){
        if(invisible !== pieces[x][y])g.putImageData(pieces[x][y].imageData, pieces[x][y].pos.x, pieces[x][y].pos.y);
      }
    }
  }
  
  var canvas,w,h,unicornImage,imageWidth,imageHeight,gridSize,g,imageData,imageGhost,pieces;

  initImage = function(){
    canvas = document.getElementById('canvas');
    w = canvas.width;
    h = canvas.height;
    unicornImage = document.getElementById('unicorn');
    imageWidth = 260;
    imageHeight = 280;
    gridSize = 4;
    g = canvas.getContext('2d');
    g.fillStyle = '#ff0000';
    g.fillRect(0,0,w,h);
    g.drawImage(unicornImage,0,0,imageWidth,imageHeight);
    imageData = g.getImageData(0,0,imageWidth,imageHeight);
    imageGhost = g.createImageData(imageData);
    setTransparency(imageData.data, imageGhost.data, 127);

    pieces = new Array(gridSize);
    for(var i=0;i<gridSize;i++) pieces[i]=new Array(gridSize);

    for(var x=0;x<gridSize;x++){
      for(var y=0;y<gridSize;y++){
        var p = {};
        pieces[x][y] = p;
        p.imageData = g.createImageData(imageWidth/gridSize, imageHeight/gridSize);
        p.size = {x: p.imageData.width, y: p.imageData.height};
        p.pos = randomizer();
        copyPixels(imageData,p.imageData,x * p.size.x, y * p.size.y, p.size.x, p.size.y,
          imageWidth);
        outline(p.imageData,0,0,0,2);
        p.ghost = g.createImageData(p.imageData);
        setTransparency(p.imageData.data,p.ghost.data,50);
        p.locked = false;
      }
    }

    draw();

  }
  
  initImage();
  
  var startX,startY,endX,endY,activePiece,mouseDown;
  canvas.addEventListener("mousedown",function(e){
    //console.log('mouse down');
    mouseDown = true;
    startX = e.pageX - canvas.offsetLeft;
    startY = e.pageY - canvas.offsetTop;
    for(var x=0;x<gridSize;x++){
      for(var y=0;y<gridSize;y++){
        var r = pieces[x][y].pos;
        var s = pieces[x][y].size;
        if(!pieces[x][y].locked && startX >= r.x && startX <= r.x + s.x && startY >= r.y && startY <= r.y + s.y){
          activePiece = pieces[x][y];
          return;
        }
      }
    }
  });

  canvas.addEventListener("mouseup",function(e){
    mouseDown = false;
    endX = e.pageX - canvas.offsetLeft;
    endY = e.pageY - canvas.offsetTop;
    if(activePiece){
      activePiece.pos.x += endX - startX;
      activePiece.pos.y += endY - startY;
      if(inPlace(activePiece)){
        idxs = getIdxs(activePiece);
        activePiece.pos.x = (w - imageWidth)/2 + idxs.x*imageWidth/gridSize;
        activePiece.pos.y = (h - imageHeight)/2 + idxs.y * imageHeight / gridSize;
        activePiece.locked = true;
        if(isComplete()){
          document.getElementById('success').style.display = 'block';
          console.log('complete');
        }
      }
      draw();
      activePiece = null;
    }
  });

  canvas.addEventListener("mousemove",function(e){
    if(mouseDown && activePiece){
      endX = e.pageX - canvas.offsetLeft;
      endY = e.pageY - canvas.offsetTop;
      draw(activePiece);
      g.putImageData(activePiece.ghost, activePiece.pos.x + endX - startX, activePiece.pos.y + endY - startY);
    }
  });
  
  canvas.addEventListener("mouseleave",function(e){
    mouseDown = false;
    draw();
  });
})();