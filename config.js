export var urls = {last: "http://92.222.5.101:8080/ws/api/last",
                   history: "http://92.222.5.101:8080/ws/api/history"
                  };
export var width = 1100,
    height = 700,
    transitionDuration = 1000,
    prixMax = 350,
    prixMin = 100,
    pointsAffiches = 6,
    minutesStep = 1,
    margin = {top: 30, right: 30, bottom: 30, left: 80},
    yIn = height + 1,
    yOut = -50,
    categories = {PRESSION: 11, BOUTEILLE: 10},
    nomCategories = {PRESSION: "Bières Pression", BOUTEILLE: "Bières Bouteille"},
    updateDelay = 10000,
    alterneDelay = 5000,
    couleurs = ["#19E1FF", "#FFFF40", "#FF81CB", "#65FF19", "#FF8300", "#F1E4F3", "#A30015", "#DEF6CA", "#C6A15B", "#DF10FA", "#6EEB83", "#FE621D"];

