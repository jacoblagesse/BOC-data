const width = 750;
const height = 750;

const svg = d3.select("#svgContainer").append("svg")
  // .attr("viewBox", [0, 0, width, height])
  .attr('class', 'bubbles')
  .attr('width', width)
  .attr('height', height)

const tooltip = d3.select("#svgContainer")
  .append("div")
    .style("position", "absolute")
    .style("left", -1000)
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")

function drawBubbles(data) {

  function combineRows(data) {
    var output = [];
      data.forEach(function(item) {
        var existing = output.filter(d => d.recipient === item.recipient);
        if (existing.length) {
          var existingIndex = output.indexOf(existing[0]);
          output[existingIndex].amount = +output[existingIndex].amount + +item.amount;
        } else {
            item.amount = +item.amount;
            output.push(item);
        }
      });
    return output
  }

  bubble_data = combineRows(data);
  //console.log(bubble_data)

  function createNodes(bubble_data) {
    const maxSize = d3.max(bubble_data, d => d.amount);

    const radiusScale = d3.scalePow()
      .exponent(1/3)
      .domain([0, maxSize*1.8])
      .range([0, 80])

    const myNodes = bubble_data.map(d => ({
      ...d,
      radius: radiusScale(+d.amount),
      value: +d.amount,
      x: Math.random() * 900,
      y: Math.random() * 800
    }))

    return myNodes;
  }

  const centre = { x: width/2, y: height/2 };

  let bubbles = null;
  let labels = null;
  let nodes = createNodes(bubble_data);

  function charge(d) {
    return Math.pow(d.radius, 2.0) * 0.01
  }
  
  const forceStrength = 0.01*Math.pow(nodes.length, 1/2);
  const rFactor = 1.5;

  const simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody().strength(charge))
    .force('center', d3.forceCenter(centre.x, centre.y))
    .force('x', d3.forceX().strength(forceStrength).x(centre.x))
    .force('y', d3.forceY().strength(forceStrength).y(centre.y))
    .force('collision', d3.forceCollide().radius(d => d.radius*rFactor));

  simulation.stop();
  
  var colorScale1 = d3.scaleLinear()
        .domain(d3.extent(nodes, d => d.radius))
        .range(["#EDEDED", "#808080"])
  
  var colorScale2 = d3.scaleLinear()
        .domain(d3.extent(nodes, d => d.radius))
        .range(["#80D8FF", "#01579B"])

  var colorScale3 = d3.scaleLinear()
        .domain(d3.extent(nodes, d => d.radius))
        .range(["#FF6961", "#FF0D00"])
  
  var showTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html(d.recipient)
      .style("left", (d3.pointer(event)[0]+10) + "px")
      .style("top", (d3.pointer(event)[1]+10) + "px")
    
  }
  var moveTooltip = function(event, d) {
    tooltip
      .style("left", (d3.pointer(event)[0]+10) + "px")
      .style("top", (d3.pointer(event)[1]+10) + "px")
  }
  var hideTooltip = function(d) {
    tooltip
      .style("left", -1000)
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  const elements = svg.selectAll('.bubble')
    .data(nodes)
    .enter().append('g')
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)

  bubbles = elements
    .append('circle')
    .classed('bubble', true)
    .attr('r', d => d.radius*rFactor)
    .attr('fill', function(d) {
      switch(d.party) {
        case "d":
          return colorScale2(d.radius);
          break;
        case "r":
          return colorScale3(d.radius);
          break;
        default:
          return colorScale1(d.radius);
          break;
      }
    })
    .on("mouseover", function(d) {
      d3.select(this).style("stroke", "black")
    })
    .on("mouseleave", function(d) {
      d3.select(this).style("stroke", "none")
    })

  labels = elements
    .append('text')
    .attr('dy', '.3em')
    .style('text-anchor', 'middle')
    .style('font-size', 12)
    .style('fill', 'white')
    .text(d => d3.format("($,")(Math.round(d.amount)))

  simulation.nodes(nodes)
    .on('tick', ticked)
    .restart();
  
  function ticked() {
    bubbles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    labels
      .attr('x', d => d.x)
      .attr('y', d => d.y)
  }
}