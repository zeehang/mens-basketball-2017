// get the player data from sheet
var allTeams = [];

var bracket = {"round1": [], "round2": [], "round3": [], "round4": [], "round5": [], "round6": []};

class Team {
  constructor(name, record, offense, defense, players) {
    this.name = name;
    this.record = record;
    this.offense = offense;
    this.defense = defense;
    this.players = players;
  }
}

$.ajax({
  dataType: "json",
  url: "https://spreadsheets.google.com/feeds/list/1PiA5WDTFc4rOwlTR7uJyFZOnWRwRUxMPRXi98nG48uc/od6/public/values?alt=json"
}).done(function (data) {
  function isSafe(variable) {
    return variable !== undefined;
  }
  var map = {};

  data = data.feed.entry;
  console.log(data);
  for (var obj in data) {
    obj = data[obj];
    var name = obj.gsx$team.$t;
    var info = obj.gsx$infoasbulletpointsundertheteamslogoasof31017.$t;
    var record = isSafe(info.split("Record: ")[1]) ? info.split("Record: ")[1].substr(4) : "";
    var offense = isSafe(info.split("Offensive efficiency: ")[1]) ? info.split("Offensive efficiency: ")[1].substr(1) : "";
    var defense = isSafe(info.split("Defensive efficiency: ")[1]) ? info.split("Defensive efficiency: ")[1].substr(1) : "";
    var players = isSafe(info.split("Players to Watch: ")[1]) ? info.split("Players to Watch: ")[1].replace(" ", "").split(" ") : [];
    map[name] = new Team(name, record, offense, defense, players);
    
    var num_rounds = 6;
    for (var i = 1; i <= num_rounds; i++) {
      var round_str = "gsx$round" + i;
      var round_str_score = "gsx$round" + i + "scores";
      if (!isSafe(obj[round_str].$t))
        break;
      var round_and_score = {team: obj[round_str].$t, score: obj[round_str_score].$t};
      if (round_and_score.team != ""){
        bracket["round"+i].push(round_and_score);
      }
    }
  }

  console.log(map);

  for (var i = 1; i <= num_rounds; i++) {
    var new_compressed_data = [];
    for (var j = 0; j < bracket["round"+i].length; j += 2) {
      var pairs = {team1: "", score_team1: "", info_team1: "", team2: "", score_team2: "", info_team2: ""};
      pairs.team1 = bracket["round"+i][j].team;
      pairs.score_team1 = bracket["round"+i][j].score
      pairs.info_team1 = map[pairs.team1];
      pairs.team2 = bracket["round"+i][j+1].team;
      pairs.score_team2 = bracket["round"+i][j+1].score;
      pairs.info_team2 = map[pairs.team2];
      new_compressed_data.push(pairs);
    }
    bracket["round"+i] = new_compressed_data;
  }
  console.log(bracket["round"+1]);
  console.log(bracket["round"+2]);

  //use handlebars to fill in the bracket template
  var source   = $("#bracket-template").html();
  var template = Handlebars.compile(source);
  var html    = template(bracket);
  $("#bracket-placeholder").replaceWith(html);

  init();

});