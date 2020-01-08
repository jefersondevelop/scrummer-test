const ApplicationRouter = require('./ApplicationRouter');
const ReservationRouter = require("./ReservationRouter");

exports.load = app => {

  app.use('', ApplicationRouter);
  app.use('/room', ReservationRouter);
  
  return app;
};
