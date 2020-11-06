function drawGraph(index, elem) {
  $('.active').removeClass('active');
  $(elem).addClass('active');

  d3.selectAll("g > *, path").remove()

  d3.json("data.json").then(function(data){
    drawBubbles(data[index]);
  });

  d3.json("data.json").then(function(data){
    drawBars(data[index]);
  });
}

drawGraph(0, $('.r')[0]);