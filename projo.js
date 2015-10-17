import d3 from "d3";
import {urls} from "./config.js";

var data;

var width = 420,
    barHeight = 20;

var x = d3.scale.linear()
        .range([0, width]);

var price = function(biere) {
  return biere.last_price.price;
};

d3.json(urls.last, (error, json) => {
  data = json;

  x.domain([0, d3.max(data, price)]);

  var chart = d3.select(".chart")
        .attr("width", width)
        .attr("height", barHeight * data.length);

  var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * barHeight + ")");

  bar.append("rect")
    .attr("width", d => x(price(d)))
    .attr("height", barHeight - 1);

  bar.append("text")
    .attr("x", d => x(price(d)) - 3)
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(d => d.name);

});

// d3.select("body").transition().duration(750).style("background-color", function() {
// return "hsl(" + Math.random() * 360 + ",100%,50%)";
// });
// d3.select("body").data(urls.history).style("background-color", "blue");
// var data = [4, 8, 150, 16, 23, 42];


/*d3.select(".chart").selectAll("div")
 .data(data)
 .enter().append("div")
 .style("width", d => x(d) + "px")
 .text(d => d);*/
