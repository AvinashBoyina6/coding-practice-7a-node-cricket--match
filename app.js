const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message} `);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
  };
};

const convertMatchDbObjectToResponseObject = (match) => {
  return {
    matchId: match.match_id,
    match: match.match,
    year: match.year,
  };
};

convertPlayerMatchDbObjectToResponseObject = (eachPlayerMatch) => {
  return {
    playerMatchId: eachPlayerMatch.player_match_id,
    matchId: eachPlayerMatch.match_id,
    score: eachPlayerMatch.score,
    fours: eachPlayerMatch.fours,
    sixes: eachPlayerMatch.sixes,
  };
};

app.get("/players/", async (request, response) => {
  getPlayersQuery = `
    SELECT * from player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  console.log(playersArray);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  getPlayerQuery = `
    SELECT * FROM player_details  where player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  console.log(player);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const { playerName } = request.body;
  console.log(playerName);
  updatePlayerQuery = `
      UPDATE player_details SET player_name=${playerName} WHERE player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  console.log(playerDetails);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  getMatchQuery = `
    SELECT * FROM match_details  where match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  console.log(match);
  response.send(convertMatchDbObjectToResponseObject(match));
});

app.get("/players/:playerId/matches", async (request, response) => {
  getPlayerMatchQuery = `
    SELECT * from player_match_score;`;
  const playerMatchArray = await db.all(getPlayerMatchQuery);
  console.log(playerMatchArray);
  response.send(
    playerMatchArray.map((eachPlayerMatch) =>
      convertPlayerMatchDbObjectToResponseObject(eachPlayerMatch)
    )
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  getPlayerMatchQuery = `
    SELECT player_id,player_name from player_match_score NATURAL JOIN player_details 
    WHERE match_Id=${matchId};`;
  const playerMatchArray = await db.all(getPlayerMatchQuery);
  console.log(playerMatchArray);
  response.send(
    playerMatchArray.map((eachPlayerMatch) =>
      convertDbObjectToResponseObject(eachPlayerMatch)
    )
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  getPlayerScoreQuery = `
    SELECT 
    player_id as playerId,player_name as playerName,SUM(score) as  totalScore,SUM(fours) as  totalFour,SUM(sixes) as totalSixes
from player_match_score NATURAL JOIN player_details
    WHERE player_id=${playerId};`;
  const playerScoreArray = await db.all(getPlayerScoreQuery);
  console.log(playerScoreArray);
  response.send(playerScoreArray);
});

module.exports = app;
