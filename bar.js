const svg3 = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

svg3.append("g")
    .attr("fill", color)
  .selectAll("rect")
  .data(data)
  .join("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .attr("width", x.bandwidth());

svg3.append("g")
    .call(xAxis);

svg3.append("g")
    .call(yAxis);
