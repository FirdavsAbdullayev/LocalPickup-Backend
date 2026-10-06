const Joi = require('joi');

const objectId = Joi.string().uuid();

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80).required()
    .messages({ 'any.required': 'Ism familiya kiritilishi shart.' }),
  email: Joi.string().trim().email().required()
    .messages({ 'string.email': 'Email manzil noto\'g\'ri kiritilgan.' }),
  password: Joi.string().min(6).max(72).required()
    .messages({ 'string.min': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak.' }),
  phone: Joi.string().allow('', null).optional(),
  role: Joi.string().valid('CUSTOMER', 'VENDOR').default('CUSTOMER'),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const createShopSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required()
    .messages({ 'any.required': 'Do\'kon nomi kiritilishi shart.' }),
  description: Joi.string().allow('', null).max(1000).optional(),
  phone: Joi.string().allow('', null).max(30).optional(),
  address: Joi.string().allow('', null).max(255).optional(),
  logo: Joi.string().allow('', null).uri({ allowRelative: false }).optional(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
});

const createProductSchema = Joi.object({
  shopId: objectId.required()
    .messages({ 'any.required': 'shopId kiritilishi shart.' }),
  categoryId: objectId.allow(null, '').optional(),
  title: Joi.string().trim().min(2).max(160).required()
    .messages({ 'any.required': 'Mahsulot nomi kiritilishi shart.' }),
  description: Joi.string().allow('', null).max(2000).optional(),
  price: Joi.number().positive().required()
    .messages({ 'any.required': 'Narx kiritilishi shart.', 'number.positive': 'Narx musbat bo\'lishi kerak.' }),
  discountPrice: Joi.number().positive().allow(null).optional(),
  image: Joi.string().allow('', null).optional(),
  stockQuantity: Joi.number().integer().min(0).allow(null).optional(),
});

const createOrderSchema = Joi.object({
  shopId: objectId.required(),
  pickupTime: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().allow('', null).max(500).optional(),
  items: Joi.array().items(
    Joi.object({
      productId: objectId.required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required()
    .messages({ 'array.min': 'Buyurtmada kamida bitta mahsulot bo\'lishi kerak.' }),
});

module.exports = {
  registerSchema,
  loginSchema,
  createShopSchema,
  createProductSchema,
  createOrderSchema,
};
