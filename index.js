(function(){
  var offset = function(x, y, w, h){
    return (y*w + x) * 4;
  }
  var write = function(imageData, x, y, r, g, b, a){
    var dataOffset = offset(x,y,imageData.width);
    imageData.data[dataOffset] = r;
    imageData.data[dataOffset + 1] = g;
    imageData.data[dataOffset + 2] = b;
    imageData.data[dataOffset + 3] = a;
  }
  //w1 is the width of the src
  //w and h are the width of the dest
  var copyPixels = function(src,dest,x,y,w,h,w1){
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
  var outline = function(imageData, r, g, b, lw){
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
  
  var canvas = document.getElementById('canvas');
  var unicornImage = document.getElementById('unicorn');
  var imageWidth = 260;
  var imageHeight = 280;
  var gridSize = 4;
  var g = canvas.getContext('2d');
  g.drawImage(unicornImage,0,0,imageWidth,imageHeight);
  var imageData = g.getImageData(0,0,imageWidth,imageHeight);
  var grid = new Array(gridSize);
  for(var i=0;i<gridSize;i++) grid[i]=new Array(gridSize);

  for(var x=0;x<gridSize;x++){
    for(var y=0;y<gridSize;y++){
      grid[x][y] = g.getImageData(0, 0, imageWidth/gridSize, imageHeight/gridSize);
      copyPixels(imageData,grid[x][y],x * grid[x][y].width, y * grid[x][y].height, grid[x][y].width, grid[x][y].height,
        imageWidth);
      outline(grid[x][y],0,0,0,2);
    }
  }
  
  var pieces = new Array(gridSize);
  for(var i=0;i<gridSize;i++) pieces[i]=new Array(gridSize);
  for(var x=0;x<gridSize;x++){
    for(var y=0;y<gridSize;y++){
      var p = {};
      pieces[x][y] = p;
      p.imageData = grid[x][y];
      p.size = {x: grid[x][y].width, y: grid[x][y].height};
      p.pos = {x: (p.size.x+10)*x, y: (p.size.x+10)*y};
    }
  }
  
  //move piece 1,1 out of grid formation
  pieces[1][1].pos = {x: 300,y: 300};
  
  var draw = function(){
    g.fillStyle = '#fff';
    g.fillRect(0,0,canvas.width,canvas.height);
    
    for(var x = gridSize - 1;x>=0;x--){
      for(var y = gridSize - 1;y>=0;y--){
        g.putImageData(pieces[x][y].imageData, pieces[x][y].pos.x, pieces[x][y].pos.y);
      }
    }
  }
  
  draw();
  
  var startX,startY,endX,endY,activeElement;
  canvas.addEventListener("mousedown",function(e){
    console.log('mouse down');
    startX = e.pageX - canvas.offsetLeft;
    startY = e.pageY - canvas.offsetTop;
    for(var x=0;x<gridSize;x++){
      for(var y=0;y<gridSize;y++){
        var r = pieces[x][y].pos;
        var s = pieces[x][y].size;
        if(startX >= r.x && startX <= r.x + s.x && startY >= r.y && startY <= r.y + s.y){
          activeElement = pieces[x][y];
          return;
        }
      }
    }
  });
  
  canvas.addEventListener("mouseup",function(e){
    console.log('mouse up');    
    endX = e.pageX - canvas.offsetLeft;
    endY = e.pageY - canvas.offsetTop;
    if(activeElement){
      activeElement.pos.x += endX - startX;
      activeElement.pos.y += endY - startY;
      draw();
      activeElement = null;
    }
  });
})();