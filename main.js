function drawGraph(index, elem) {
  $('#options2 > .active').removeClass('active');
  $(elem).addClass('active');

  d3.selectAll("g > *, path").remove()

  d3.json("data.json").then(function(data){
    drawBubbles(data[index]);
  });

  d3.json("data.json").then(function(data){
    drawBars(data[index]);
  });
}

function switchGraph(newGraph, elem) {

  $('.active2').removeClass('active2');
  $(elem).addClass('active2');
  
  if (newGraph) {
    $('.bubbles').css('display', 'none');
    $('.bar').css('display', 'block');
  } else {
    $('.bar').css('display', 'none');
    $('.bubbles').css('display', 'block');
  }
}

drawGraph(0, $('#options2 > .r')[0]);