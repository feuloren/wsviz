import d3 from "d3";
import {urls} from "./config.js";

// var data;

var width = 1100,
    height = 700,
    barHeight = 20,
    animDuration = 1500,
    transitionDuration = 1000;

var x = d3.scale.linear()
        .range([0, width]);

var price = biere => biere.last_price.price;
/*
d3.json(urls.last, (error, json) => {
  if (error !== null) {
    console.log(error);
  }

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
    .attr("height", barHeight - 1)
    .attr("width", 0)
    .transition()
    .duration(animDuration)
    .attr("width", d => x(price(d)));

  bar.append("text")
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(d => d.name)
    .attr("x", -3)
    .transition()
    .duration(animDuration)
    .attr("x", d => x(price(d)) - 3);

});*/

/*d3.select("body").transition().duration(750).style("background-color", function() {
  return "hsl(" + Math.random() * 360 + ",100%,50%)";
});
d3.select("body").data(urls.history).style("background-color", "blue");
var data = [4, 8, 150, 16, 23, 42];*/


/*d3.select(".chart").selectAll("div")
 .data(data)
 .enter().append("div")
 .style("width", d => x(d) + "px")
 .text(d => d);*/

var couleurs = ["red", "blue", "green", "black"];

var x = d3.scale.linear().range([width, 0]).domain([0, 10]);
var y = d3.scale.linear().range([height, 0]).domain([100, 300]);

var data = require("./history.js");
var data2 = require("./history2.js");
var data3 = require("./history3.js");

var graph = d3.select("#graph")
      .attr("width", width)
      .attr("height", height);

var data1 = [data[0], data[1]];

var beers = graph.selectAll("g")
      .data(data1, d => d.id)
      .enter().append("g");

var lines = beers.selectAll("line")
      .data(d => d.prices, p => p.date);

var enterLines = function(lines, data) {
  var len = data[0].prices.length - 1;
  lines.enter()
    .append("line")
    .attr("x1", (d, i, j) => x(len - i))
    .attr("x2", (d, i, j) => x(len == 0 ? len : len - i - 1))
    .attr("stroke", (d, i, j) => couleurs[j]) // couleur
    .attr("stroke-width", 2)
    .attr("y1", height + 1)
    .attr("y2", height + 1)
    .transition().duration(transitionDuration)
    .attr("y1", d => y(d.price))
    .attr("y2", (d, i, j) => y(data[j].prices[d3.min([i + 1, len])].price));
};

enterLines(lines, data1);

var tbody = d3.select("#prix tbody");
var tr = tbody.selectAll("tr").data(data).enter().append("tr");
var rows = function(biere) {
  var last = biere.prices[biere.prices.length - 1];
  return [biere.name, last.price, last.variation];
};
var td = tr.selectAll("td").data(rows)
      .enter().append("td")
      .html(d => d);

var nom = d3.select("#nom");

function formatPrice(price) {
  return (price / 100).toFixed(2).replace(".", ",");
}

function formatVariation(variation) {
  var sym;
  if (variation == 0) {
    sym = "=";
  } else if (variation > 0) {
    sym = "↗";
  } else {
    sym = "↙";
  }
  return sym + " (" + (variation >= 0 ? "+" : "") + variation.toFixed(2).replace(".", ",") + "%)";
}

var later = function(data, timeout) {
  window.setTimeout(() => {
    if (data.length == 1) {
      var last = data[0].prices[data[0].prices.length - 1];
      nom.html(data[0].name + " - " + formatPrice(last.price) + "€ - " + formatVariation(last.variation));
    } else {
      nom.html("Multiple");
    }

    var g = graph.selectAll("g").data(data, d => d.id);

    // creer un groupe pour les nouvelles bières
    g.enter().append("g");

    // supprimer les anciennes en faisant disparaitre chaque ligne vers le haut
    g.exit().transition().each(function(d, i) {
      d3.select(this).transition().duration(transitionDuration).selectAll("line").attr("y1", -1).attr("y2", -1);
    }).remove();

    // mise à jour des lignes
    var lines = g.selectAll("line")
          .data(d => d.prices, p => p.date);    

    // tracer les nouvelles lignes
    enterLines(lines, data);

    // mettre à jour les lignes existantes, qui vont se décaler vers la gauche en fonction des nouvelles données
    var len = data[0].prices.length - 1;
    lines.transition().duration(transitionDuration)
      .attr("x1", (d, i, j) => x(len - i))
      .attr("x2", (d, i, j) => x(len == 0 ? len : len - i - 1))
      .attr("y1", d => y(d.price))
      .attr("y2", (d, i, j) => y(data[j].prices[d3.min([i + 1, len])].price))
      .attr("stroke", (d, i, j) => couleurs[j]);

    console.log(timeout + " done");
  }, timeout);
};

var upTable = function(data, timeout) {
  window.setTimeout(() => {
    var tr = tbody.selectAll("tr").data(data);
    var td = tr.selectAll("td").data(rows)
          .html(d => d);
  }, timeout);
};

later([data[0], data[2]], 2000);

later([data2[0], data2[2]], 5000);
upTable(data2, 5500);

later([data3[0], data3[2]], 7000);
upTable(data3, 7500);

later([data3[1]],  9000);
later([data3[3]], 10500);
later([data3[2]], 13000);
later([data3[4]], 15500);

