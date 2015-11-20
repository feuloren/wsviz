import d3 from "d3";
import {urls} from "./config.js";
import {guid, formatPrice, formatVariation} from "./utils.js";

var width = 1100,
    height = 700,
    barHeight = 20,
    animDuration = 1500,
    transitionDuration = 1000,
    prixMax = 350,
    prixMin = 100,
    pointsAffiches = 6,
    strokeWidthBars = 2,
    minutesStep = 1,
    margin = {top: 30, right: 30, bottom: 30, left: 80},
    yIn = height + 1,
    yOut = -50,
    categories = {PRESSION: 11, BOUTEILLE: 10},
    nomCategories = {PRESSION: "Bières Pression", BOUTEILLE: "Bières Bouteille"},
    updateDelay = 10000;

var couleurs = ["#19E1FF", "#FFFF40", "#FF81CB", "#65FF19", "#FF8300", "#F1E4F3", "#A30015", "#DEF6CA", "#C6A15B", "#DF10FA", "#6EEB83", "#FE621D"];

var x = d3.scale.linear().range([width - margin.right, margin.left]).domain([0, pointsAffiches]);
var y = d3.scale.linear().range([height - margin.top, margin.bottom]).domain([prixMin, prixMax]);

var data = require("./history.js");
var data2 = require("./history2.js");
var data3 = require("./history3.js");

// graphique
var graph = d3.select("#graph")
      .attr("width", width)
      .attr("height", height);

var beers = graph.selectAll("g.bar");

var enterLines = function(lines, data) {
  var len = data[0].prices.length - 1;
  lines.enter()
    .append("line")
    .attr("x1", (d, i, j) => x(len - i))
    .attr("x2", (d, i, j) => x(len == 0 ? len : len - i - 1))
    .attr("stroke", (d, i, j) => couleurs[j]) // couleur
    .attr("stroke-width", 0)
    .attr("y1", yIn)
    .attr("y2", yIn);
};

var nom = d3.select("#nom");

var upGraph = function(data, titre, forceColorIndex) {
  if (forceColorIndex === undefined) {
    nom.html(titre).style("color", "white");
  } else {
    nom.html(titre).style("color", couleurs[forceColorIndex]);
  }
  /*if (data.length == 1) {
    var last = data[0].prices[data[0].prices.length - 1];
    nom.html(data[0].name + " - " + formatPrice(last.price) + "€ - " + formatVariation(last.variation))
      .style("color", couleurs[0]);
  } else {
    nom.html("Multiple").style("color", "white");
  }*/

  var g = graph.selectAll("g.bar").data(data, d => d.id);

  // creer un groupe pour les nouvelles bières
  g.enter().append("g").classed("bar", true);

  // supprimer les anciennes en faisant disparaitre chaque ligne vers le haut
  g.exit().transition().each(function(d, i) {
    d3.select(this).transition().duration(transitionDuration).selectAll("line").attr("y1", yOut).attr("y2", yOut);
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
    .attr("stroke", (d, i, j) => couleurs[forceColorIndex === undefined ? j : forceColorIndex])
    .attr("stroke-width", (d, i) => ((len - i) > pointsAffiches || i == len) ? 0 : strokeWidthBars);
};

var later = function(data, timeout, titre) {
  window.setTimeout(() => upGraph(data, titre), timeout);
};

// création des axes
var vAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks((prixMax - prixMin) / 10);

var verticalGuide = graph.append('g');
vAxis(verticalGuide);
verticalGuide.attr('transform', 'translate(' + margin.left + ')');
verticalGuide.selectAll('path')
    .style({fill: 'none', stroke: "#f0f0f0"});
verticalGuide.selectAll('line')
    .style({stroke: "#f0f0f0"});
verticalGuide.selectAll('text')
  .text(d => formatPrice(d) + "€")
  .style({stroke: "#f0f0f0", "stroke-width": 0.5});

var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(pointsAffiches);

var horizontalGuide = graph.append('g');
xAxis(horizontalGuide);
horizontalGuide.attr('transform', 'translate(0, ' + (height - margin.bottom) + ')');
horizontalGuide.selectAll('path')
    .style({fill: 'none', stroke: "#f0f0f0"});
horizontalGuide.selectAll('line')
    .style({stroke: "#f0f0f0"});
horizontalGuide.selectAll('text')
  .text(d => d == 0 ? "Now" : ("-" + d * minutesStep + " m"))
  .style({stroke: "#f0f0f0", "stroke-width": 0.5});

// tableau des prix
var tbody = d3.select("#prix tbody");
var rows = function(biere) {
  var last = biere.prices[biere.prices.length - 1];
  return [biere.name, formatPrice(last.price), formatPrice(biere.prices[0].price), formatVariation(last.variation)];
};

var creerTable = function(data) {
  var tr = tbody.selectAll("tr").data(data, d => d.id);
  tr.enter().append("tr");
  tr.exit().remove();
  var td = tr.selectAll("td").data(rows)
        .enter().append("td")
        .html(d => d);
};

var upTable = function(data, timeout) {
  creerTable(data);
  window.setTimeout(() => {
    var tr = tbody.selectAll("tr").data(data);
    tr.style("color", (d, i) => couleurs[i]);

    var td = tr.selectAll("td").data(rows)
          .html(d => d);
  }, timeout);
};

var initialData;
var lastUpdateTime = "";
var currentCategory = "BOUTEILLE";
var displayOneIndex = 0;
var currentTick = 0;

var selectOnly = (data, categorie) => data.filter(b => b.category == categorie);

// principe de l'alternance des pages:
// chaque tick fait 5 secondes
// à chaque mise à jour, currentTick = 0
// pendant 2 ticks après une mise à jour (càd ticks 0 et 1) on affiche bouteilles ou pressions
// après on affiche une seule bière à la fois pendant en changeant tous les ticks
// 2 ticks avant la mise à jour (càd ticks 10 et 11) on affiche bouteilles ou pression

var alternerPage = function(duration) {
  console.log("tick " + currentTick);

  if (currentTick == 2) {
    if (currentCategory == "PRESSION") {
      currentCategory = "BOUTEILLE";
    } else {
      currentCategory = "PRESSION";
    }
  }

  if (currentTick < 2 || currentTick >= 10) {
    var data = selectOnly(initialData, categories[currentCategory]);
    upGraph(data, nomCategories[currentCategory]);
    upTable(data, 300);
  } else {
    var biere = initialData[displayOneIndex];
    var data = selectOnly(initialData, biere.category);

    upGraph([biere], biere.name, data.indexOf(biere));
    upTable(data, 300);

    displayOneIndex = (displayOneIndex + 1) % initialData.length;
  }

  currentTick = (currentTick + 1) % 12;
};

var firstTimeout;
d3.json(urls.history + "?r=" + guid(), (error, json) => {
  if (error !== null) {
    console.log(error);
    return;
  }
  initialData = json;

  var data = selectOnly(initialData, categories[currentCategory]);
  upGraph(data, nomCategories[currentCategory]);
  upTable(data, 300);
  firstTimeout = window.setTimeout(() => alternerPage(30000), 20000);

  if (initialData.length > 0) {
    var prices = initialData[0].prices;
    lastUpdateTime = prices[prices.length - 1].date;
  }

  window.setInterval(doUpdates, updateDelay);
});

var firstUpdate = true;
var doUpdates = function() {
  d3.json(urls.last + "?r=" + guid(), (error, json) => {
    if (error != null) {
      console.log(error);
      return;
    }

    if (json.length > 0) {
      // check if last data is actually new
      var date = json[0].last_price.date;

      if (date != lastUpdateTime) {
        lastUpdateTime = date;

        console.log("update");

        // je suppose que les bières sont toujours à la même position
        // on ajoute le last price dans initialData
        for (var i = 0; i < json.length; i++) {
          initialData[i].prices.push(json[i].last_price);
        }

        // mise à jour
        currentTick = 0;
        var data = selectOnly(initialData, categories[currentCategory]);
        upGraph(data, nomCategories[currentCategory]);
        upTable(data, 300);

        if (firstUpdate) {
          console.log("début alternance");
          firstUpdate = false;
          window.clearTimeout(firstTimeout);
          window.setInterval(alternerPage, 5000);
        }
      }
    }
  });
};
