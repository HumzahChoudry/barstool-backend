const Game = require("../models/game.model.js");
const axios = require("axios");
// Create and Save a new Game
exports.create = (req, res) => {
  // Validate request
  console.log("hello from create");
  if (!req.params.gameId) {
    return res.status(400).send({
      message: "ID can not be empty"
    });
  }
  // Create a Game
  axios
    .get(
      `https://chumley.barstoolsports.com/dev/data/games/${
        req.params.gameId
      }.json`
    )
    .then(gameData => {
      const game = new Game({ _id: req.params.gameId, ...gameData.data });
      // Save Note in the database
      game
        .save()
        .then(data => {
          console.log("sending data");
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Game."
          });
        });
    });
};

// Find a single game with a gameId
exports.findOne = (req, res) => {
  // console.log("req game ID", req.params.gameId);
  Game.findById(req.params.gameId)
    .then(game => {
      console.log("game", game);
      if (!game) {
        // if covers no game data yet
        console.log("in if");
        exports.create(req, res);
      } else if ((new Date() - game.updatedAt) / 1000 > 15) {
        // else if convers 15 second update
        console.log("in else if");
        axios
          .get(
            "https://chumley.barstoolsports.com/dev/data/games/eed38457-db28-4658-ae4f-4d4d38e9e212.json"
          )
          .then(
            axios.spread(response => {
              Game.findByIdAndUpdate(
                req.params.gameId,
                {
                  response
                },
                { new: true }
              )
                .then(game => {
                  if (!game) {
                    return res.status(404).send({
                      message: "Game not found with id " + req.params.gameId
                    });
                  }
                  res.send(game);
                })
                .catch(err => {
                  if (err.kind === "ObjectId") {
                    return res.status(404).send({
                      message: "Game not found with id " + req.params.gameId
                    });
                  }
                  return res.status(500).send({
                    message: "Error updating game with id " + req.params.gameId
                  });
                });
            })
          )
          .catch(error => {
            console.log(error);
          });
      } else res.send(game); // else just send the stored data
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        exports.create(req, res);
      }
    });
};

// Update a game identified by the gameId in the request
// Update a game identified by the gameId in the request
// exports.update = (req, res) => {
//   // Validate Request
//   if (!req.body.gameId) {
//     return res.status(400).send({
//       message: "Game ID can not be empty"
//     });
//   }
//
//   // Find game and update it with the request body
//   //need to find first, then if the timestamp is more than 15 seconds old, update
//
//   //can probably stop updating if the game status is "completed"
//   Game.findByIdAndUpdate(
//     req.params.gameId,
//     {
//       title: req.body.title || "Untitled Game",
//       content: req.body.content
//     },
//     { new: true }
//   )
//     .then(game => {
//       if (!game) {
//         return res.status(404).send({
//           message: "Game not found with id " + req.params.gameId
//         });
//       }
//       res.send(game);
//     })
//     .catch(err => {
//       if (err.kind === "ObjectId") {
//         return res.status(404).send({
//           message: "Game not found with id " + req.params.gameId
//         });
//       }
//       return res.status(500).send({
//         message: "Error updating game with id " + req.params.gameId
//       });
//     });
// };

// Delete a game with the specified gameId in the request
// exports.delete = (req, res) => {};
