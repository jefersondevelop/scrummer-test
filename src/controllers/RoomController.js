const Connection = require("../../config/mysql");

class RoomController {
  constructor() {
    this.connection = Connection();
    this.reserve = this.reserve.bind(this);
    this.verifyRoomAvailability = this.verifyRoomAvailability.bind(this);
    this.updateReserve = this.updateReserve.bind(this);
    this.roomExists = this.roomExists.bind(this);
    this.reservationExists = this.reservationExists.bind(this);
    this.availabilityRoom = this.availabilityRoom.bind(this);
    this.deleteReservation = this.deleteReservation.bind(this);
    this.reservationExists = this.reservationExists.bind(this);
  }

  async roomExists(req, res, next) {
    let type_id = req.params.type;

    if (type_id === null || type_id === undefined) {
      return res.json({
        status: 500,
        message: "Sorry, room type is needed."
      });
    }

    this.connection.query(
      `SELECT * FROM room WHERE type = ${parseInt(type_id, 10)}`,
      (err, result) => {
        if (err)
          return res.json({
            status: 500,
            err
          });

        console.log(result[0]);

        if (result.length === 0) {
          return res.json({
            status: 500,
            message: "The room of that type is not available."
          });
        }

        req.room_id = result[0].id;

        next();
      }
    );
  }

  async reservationExists(req, res, next) {
    let reserv_id = req.params.id;

    if (reserv_id === null || reserv_id === undefined) {
      return res.json({
        status: 500,
        message: "Sorry, room type is needed."
      });
    }

    this.connection.query(
      `SELECT * FROM reservation WHERE id = ${parseInt(reserv_id, 10)}`,
      (err, result) => {
        if (err)
          return res.json({
            status: 500,
            err
          });

        console.log(result[0]);

        if (result.length === 0) {
          return res.json({
            status: 500,
            message: "Reservation does not exist."
          });
        }

        next();
      }
    );
  }

  async verifyRoomAvailability(req, res, next) {
    let type_id = req.params.type;
    let {checkin, checkout} = req.body;

    if (type_id === null || type_id === undefined) {
      return res.json({
        status: 500,
        message: "Sorry, room type is needed."
      });
    }

    if (
      checkin === null ||
      checkin === undefined ||
      checkout === null ||
      checkout === undefined
    ) {
      return res.json({
        status: 500,
        message:
          "Sorry, checkin and checkout are needed."
      });
    }

    if (new Date(checkin) > new Date(checkout)) {
      return res.json({
        status: 500,
        message: "Sorry, checkout date must be greater than checkin date."
      });
    }

    this.connection.query(
      `SELECT * FROM room WHERE type = ${parseInt(type_id, 10)}`,
      (err, result) => {
        if (err)
          return res.json({
            status: 500,
            err
          });


        if (result.length === 0) {
          return res.json({
            status: 500,
            message: "The room of that type is not available."
          });
        }

        this.connection.query(
          `SELECT count(*) as number FROM reservation WHERE checkin >= '${checkin}' AND checkout <= '${checkout}' AND room_id = ${parseInt(
            result[0].id,
            10
          )}`,
          (err, resultReservation) => {
            if (err)
              return res.json({
                status: 500,
                err
              });

            console.log(resultReservation[0].number);

            if (resultReservation[0].number === 5) {
              return res.json({
                status: 500,
                message: `There is no available rooms of type ${result[0].name}.`
              });
            }

            req.room = result[0]
            req.number_of_bussy = resultReservation[0].number;
            req.room_id = result[0].id;
            next();
          }
        );
      }
    );
  }

  async availabilityRoom(req, res){
    console.log(req)
    let number_of_bussy = req.number_of_bussy

    return res.json({
      status: 200,
      message: `There is ${5 - parseInt(number_of_bussy, 10)} rooms available of the type ${req.room.name}`
    });
    

  }

  async reserve(req, res) {
    let room_id = req.room_id;
    let { checkin, checkout, user_id } = req.body;

    if (
      checkin === null ||
      checkin === undefined ||
      checkout === null ||
      checkout === undefined ||
      user_id === null ||
      user_id === undefined
    ) {
      return res.json({
        status: 500,
        message:
          "Sorry, user, checkin and checkout are needed."
      });
    }

    if (new Date(checkin) < new Date()) {
      return res.json({
        status: 500,
        message: "Sorry, checkin date must be greater than today."
      });
    }

    if (new Date(checkin) > new Date(checkout)) {
      return res.json({
        status: 500,
        message: "Sorry, checkout date must be greater than checkin date."
      });
    }

    this.connection.query(
      `INSERT reservation(room_id,checkin, checkout, user_id) values(${parseInt(
        room_id,
        10
      )}, '${checkin}', '${checkout}', ${parseInt(user_id, 10)})`,
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err });
        }

        res.status(200).json({
          status: 200,
          massage: "Reservation made succesfully"
        });
      }
    );
  }

  async updateReserve(req, res) {
    let room_id = req.room_id;
    let reservation_id = req.params.id;
    let { checkin, checkout } = req.body;

    if (
      checkin === null ||
      checkin === undefined ||
      checkout === null ||
      checkout === undefined
    ) {
      return res.json({
        status: 500,
        message: "Sorry, checkin and checkout are needed."
      });
    }

    if (new Date(checkin) < new Date()) {
      return res.json({
        status: 500,
        message: "Sorry, checkin date must be greater than today."
      });
    }

    if (new Date(checkin) > new Date(checkout)) {
      return res.json({
        status: 500,
        message: "Sorry, checkout date must be greater than checkin date."
      });
    }

    this.connection.query(
      `UPDATE reservation SET checkin = '${checkin}', checkout = '${checkout}' where id = ${parseInt(
        reservation_id,
        10
      )}`,
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err });
        }

        res.status(200).json({
          status: 200,
          massage: "Dates of the reservation updated succesfully"
        });
      }
    );
  }

  async reservationExists(req,res, next) {
    let reservation_id = req.params.id;

    this.connection.query(
      `SELECT * from reservation where id = ${reservation_id}`,
      (err, result) => {
        if (err)
          return res.json({
            status: 500,
            err
          });

        if(result.length === 0){
          return res.json({
            status: 500,
            message: 'Reservation does not exist.'
          })
        }

        next();
      }
    );

  }

  async deleteReservation(req, res) {
    let reservation_id = req.params.id;

    this.connection.query(`DELETE from reservation where id = ${reservation_id}`, (err ,result) => {
      if(err)
        return res.json({
          status: 500,
          err
        })

      return res.json({
        status: 200,
        message: 'Reservation has been deleted succefully.'
      })

    })
  }

}

module.exports = new RoomController();
