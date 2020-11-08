const barWidth = 750;
const barHeight = 650;
const margin = ({top: 20, right: 75, bottom: 20, left: 75});

const svg3 = d3.select("#svgContainer").append("svg")
  .attr('class', 'bar')
  .attr('width', barWidth)
  .attr('height', barHeight)

function drawBars(raw_data) {

  data = groupYears(raw_data)

  console.log(data);
  
  const x = d3.scaleBand()
    .domain(d3.range(data.length))//d3.extent(data, d => d.date))
    .rangeRound([margin.left, barWidth-margin.right])
    .padding(0.1)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.amount)]).nice()
    .range([barHeight - margin.bottom, margin.top])

  const xAxis = g => g
    .attr("transform", `translate(0,${barHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(function(d,i) {
      if (data.length > 20) return i%2 !== 0 ? " ": data[i].date;
      else return data[i].date;
     }).tickSizeOuter(0))

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start"));
        //.text(data.y))
  
  var colorScale2 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.partyAmount)])
        .range(["#80D8FF", "#01579B"])

  var colorScale3 = d3.scaleLinear()
        .domain([0, d3.min(data, d => d.partyAmount)])
        .range(["#FF6961", "#FF0D00"])

  svg3.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("fill", d => color(d))
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d.amount))
      .attr("height", d => y(0) - y(d.amount))
      .attr("width", x.bandwidth());

  function color(d) {
    if (d.partyAmount > 0) {
      return colorScale2(d.partyAmount);
    } else if (d.partyAmount < 0) {
      return colorScale3(d.partyAmount);
    } else {
      return "#EDEDED";
    }
  }
    
  svg3.append("g")
    .call(xAxis);
  
  svg3.append("g")
    .call(yAxis);

}

parseDate = (d) => d3.timeParse("%m/%d/%Y")(d);

function groupYears(data) {
  var output = [];
  parsed = data.map(function(d) {
    temp = parseDate(d.date);
    return {
      ...d,
      amount: +d.amount,
      date: temp.getFullYear(),
      partyAmount: 0
    }
  });

  function sortByDateAscending(a, b) {
    return a.parsedDate - b.parsedDate;
}

  parsed = parsed.sort(sortByDateAscending);

  parsed.forEach(function(item) {

    var existing = output.filter(d => d.date === item.date);
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
  output = output.reverse();
  fillEmpty(output);
  return output
}

function fillEmpty(data) {
  data.forEach(function(d, i) {
    if (data[i+1] && data[i+1].date - d.date > 1) {
      item = {
        amount: 0,
        date: d.date + 1,
        partyAmount: 0
      }
      data.splice(i+1, 0, item);
    }
  });
}