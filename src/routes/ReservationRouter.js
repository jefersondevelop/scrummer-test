const express = require('express');
const {verifyJWTToken} = require('../middlewares/Authentication')
const app = express();
const RoomController = require('../controllers/RoomController');

app.post(
  "/:type/reservation",
  [verifyJWTToken, RoomController.verifyRoomAvailability],
  RoomController.reserve
);

app.put(
  "/:type/reservation/:id",
  [verifyJWTToken, RoomController.roomExists, RoomController.reservationExists],
  RoomController.updateReserve
);

app.get(
  "/:type/availability",
  [verifyJWTToken, RoomController.verifyRoomAvailability],
  RoomController.availabilityRoom
);

app.delete(
  "/:type/reservation/:id",
  [verifyJWTToken, RoomController.reservationExists],
  RoomController.deleteReservation
);

module.exports = app;