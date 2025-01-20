const validator = require("express-joi-validation").createValidator({});
const { createSchema, updateSchema } = require("./song");

const createValidator = validator.body(createSchema);
const updateValidator = validator.body(updateSchema);

module.exports = {
  createValidator,
  updateValidator,
};
