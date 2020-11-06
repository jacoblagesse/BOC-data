const lineWidth = 750;
const lineHeight = 400;

const svg2 = d3.select("#svgContainer").append("svg")
  // .attr("viewBox", [0, 0, width, height])
  .attr('width', lineWidth)
  .attr('height', lineHeight)

function drawLine(data) {

  function groupYears(data) {
    var output = [];
    let parse = d3.timeParse("%m/%d/%Y");
    parsed = data.map(function(d) {
      return {
        ...d,
        amount: +d.amount,
        parsedDate: parse(d.date),
        partyAmount: 0
      }
    });

    function sortByDateAscending(a, b) {
      // Dates will be cast to numbers automagically:
      return a.parsedDate - b.parsedDate;
  }
  
    parsed = parsed.sort(sortByDateAscending);

    parsed.forEach(function(item) {

      // console.log(item.date + ' ' + item.amount)
      item.parsedDate.setDate(1)
      var existing = output.filter(d => d.parsedDate.getYear() === item.parsedDate.getYear());
      if (existing.length) {
        var existingIndex = output.indexOf(existing[0]);
        output[existingIndex].amount += +item.amount;
        output[existingIndex].partyAmount += (item.party === "d") ? item.amount : (item.party === "r") ? -1*item.amount : 0;
      } else {
          item.amount = +item.amount;
          item.partyAmount = (item.party === "d") ? item.amount : (item.party === "r") ? -1*item.amount : 0;
          output.push(item);
      }
    });
    return output
  }

  lineData = groupYears(data);
  console.log(lineData);

  const margin = ({top: 20, right: 20, bottom: 30, left: 40})

  const x = d3.scaleUtc()
    .domain(d3.extent(lineData, d => d3.timeParse("%m/%d/%Y")(d.date)))
    .rangeRound([margin.left, lineWidth - margin.right])

  const y = d3.scaleLinear()
    .domain(d3.extent(lineData, d => d.amount)).nice()
    .rangeRound([lineHeight - margin.bottom, margin.top])

  const color = d3.scaleOrdinal(
    lineData.conditions === undefined ? lineData.map(d => d.condition) : lineData.conditions, 
    lineData.colors === undefined ? d3.schemeCategory10 : lineData.colors
  ).unknown("black")

  const xAxis = g => g
    .attr("transform", `translate(0,${lineHeight - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(lineWidth / 80).tickSizeOuter(0))
    .call(g => g.select(".domain").remove())

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").append("tspan").text(data.y))

  const line = d3.line()
    //.curve(d3.curveStep)
    .x(d => x(d3.timeParse("%m/%d/%Y")(d.date)))
    .y(d => y(d.amount))
  
  svg2.append("g")
      .call(xAxis);

  svg2.append("g")
      .call(yAxis);

  // svg2.append("linearGradient")
  //     .attr("gradientUnits", "userSpaceOnUse")
  //     .attr("x1", 0)
  //     .attr("x2", lineWidth)
  //   .selectAll("stop")
  //   .data(data)
  //   .join("stop")
  //     .attr("offset", d => x(d.date) / lineWidth)
  //     //.attr("stop-color", d => color(d.condition));

  svg2.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);
}