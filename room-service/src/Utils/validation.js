const Joi = require('joi');

// validates room creation input
exports.roomSchema = Joi.object({
    name: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    isPrivate: Joi.boolean().default(false),
});

// validates user information input
exports.userSchema = Joi.object({
    username: Joi.string().required(),
    userId: Joi.number().required(),
    adminStatus: Joi.boolean().default(false)
});

// Validates room search filter input

