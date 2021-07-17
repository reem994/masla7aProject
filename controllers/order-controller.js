const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require("lodash");
const Order = require("../models/order-model");
const Service = require("../models/service-model");
const { validateCreateOrder } = require("../validators/order-validator");


exports.getUserOrders = async (req, res) => {

  try {

    let status = req.query.status ?
      req.query.status : 'pending';

    let orders;

    if (req.user.role === "customer") {
      orders = await Order
        .find({
          customerId: req.user._id,
          status: status
        })
        .select({
          serviceName: true,
          price: true,
          status: true,
          startsAt: true,
          orderDate: true,
          serviceId: true,
          serviceProviderId: true
        })
        .populate('serviceProviderId', {
          name: true
        })
        .populate('serviceId', { serviceName: true });

    } else {
      orders = await Order
        .find({
          serviceProviderId: req.user._id,
          status: status
        })
        .select({
          serviceName: true,
          price: true,
          status: true,
          startsAt: true,
          orderDate: true,
          serviceId: true,
          customerId: true
        })
        .populate('customerId', {
          name: true
        })
        .populate('serviceId', { serviceName: true });
    }

    if (orders.length === 0)
      return res.status(200).json({
        message: "You Didn't Make Any Order Yet",
      });

    res.status(200).json({
      ordersCount: orders.length,
      orders: orders,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


exports.getOrder = async (req, res) => {

  if (!mongoose.isValidObjectId(req.params.orderId))
    return res.status(400).json({
      status: 'Failed',
      message: 'The Order ID is Invalid'
    });

  try {

    let order

    if (req.user.role === "customer") {
      order = await Order
        .aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(req.params.orderId)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'serviceProviderId',
              foreignField: '_id',
              as: 'serviceProviderId'
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'serviceId',
              foreignField: '_id',
              as: 'serviceId'
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'serviceId.categoryId',
              foreignField: '_id',
              as: 'serviceId.categoryId'
            }
          },
          {
            $project: {
              orderName: '$serviceName',
              price: true,
              status: true,
              startsAt: true,
              endsAt: true,
              orderDate: true,
              createdAt: true,
              address: true,
              serviceProvider: {
                _id: { $first: '$serviceProviderId._id' },
                name: { $first: '$serviceProviderId.name' },
              },
              serviceProvider: {
                _id: { $first: '$serviceProviderId._id' },
                name: { $first: '$serviceProviderId.name' },
              },
              category: {
                _id: { $first: '$serviceId.categoryId._id' },
                name: { $first: '$serviceId.categoryId.name' },
              }
            }
          }
        ]);

    } else {
      order = await Order
        .aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(req.params.orderId)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'customerId',
              foreignField: '_id',
              as: 'customerId'
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'serviceId',
              foreignField: '_id',
              as: 'serviceId'
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'serviceId.categoryId',
              foreignField: '_id',
              as: 'serviceId.categoryId'
            }
          },
          {
            $project: {
              orderName: '$serviceName',
              price: true,
              status: true,
              startsAt: true,
              endsAt: true,
              orderDate: true,
              createdAt: true,
              address: true,
              customer: {
                _id: { $first: '$customerId._id' },
                name: { $first: '$customerId.name' },
              },
              category: {
                _id: { $first: '$serviceId.categoryId._id' },
                name: { $first: '$serviceId.categoryId.name' },
              }
            }
          }
        ]);
    }


    if (!order[0])
      return res.status(200).json({
        message: "You Didn't Make Any Order Yet",
      });

    res.status(200).json({
      order: order[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  const { error } = validateCreateOrder(req.body);
  if (error)
    return res.status(400).json({ errorMessage: error.details[0].message });

  try {
    const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));

    if (!mongoose.isValidObjectId(token._id)) {
      return res.status(401).json({
        message: "Access Denied"
      });
    }

    if (token.role !== 'serviceProvider') {
      return res.status(401).json({
        message: 'Access Denied, Only Service Providers Can Access'
      });
    }

    req.body = _.pick(req.body, [
      "orderDate",
      "startsAt",
      "endsAt",
      "serviceName",
      "price",
      "address",
      "notes"
    ]);

    req.body.serviceProviderId = token._id;



    if ((new Date(req.body.startsAt) <= Date.now()) || (new Date(req.body.endsAt) <= Date.now))
      return res.status(400).json({
        message: 'you can\'t set your order date to a past date'
      });

    if (req.body.startsAt >= req.body.endsAt)
      return res.status(400).json({
        message: 'The Time To Start The Order Is Earlier Than The Time To End It'
      });


    const service = await Service.findOne({
      serviceProviderId: req.body.serviceProviderId,
    });

    if (!service)
      return res.status(400).json({
        message: 'Couldn\'t Find This Service Provider '
      });

    const checkSPOrders = await Order.findOne({
      serviceProviderId: req.body.serviceProviderId,
      orderDate: req.body.orderDate,
      $or: [
        {
          startsAt: {
            $gte: req.body.startsAt,
            $lte: req.body.endsAt,
          },
        },
        {
          endsAt: {
            $gte: req.body.startsAt,
            $lte: req.body.endsAt,
          },
        },
      ],
    });

    if (checkSPOrders)
      return res.status(400).json({
        message: "You Have Order At This Time",
      });

    req.body.serviceId = service._id;

    const order = new Order(req.body);

    res.status(201).json({
      orderInfo: _.pick(order, [
        "serviceProviderId",
        "serviceId",
        "serviceName",
        "orderDate",
        "startsAt",
        "endsAt",
        "price",
        "address",
        "status",
        "notes"
      ]),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


exports.confirmOrder = async (req, res, next) => {
  try {
    const token = jwt.verify(req.header('x-auth-token'), config.get('jwtPrivateKey'));

    req.body = _.pick(req.body, [
      "serviceProviderId",
      "serviceId",
      "serviceName",
      "orderDate",
      "startsAt",
      "endsAt",
      "price",
      "address",
      "status",
      "notes"
    ]);

    req.body.customerId = token._id;

    const service = await Service.findById(req.body.serviceId)

    const order = await Order.create(req.body);

    service.ordersList.push(order._id);

    await service.save();

    res.status(201).json({
      orderInfo: order
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
};


exports.canceleOrder = async (req, res) => {

  if (!mongoose.isValidObjectId(req.params.orderId))
    return res.status(400).json({
      status: 'Failed',
      message: 'The Order ID is Invalid'
    });


  try {

    const order = await Order
      .findByIdAndUpdate(
        req.params.orderId,
        { $set: { status: 'canceled' } });

    if (!order)
      return res.status(400).json({
        status: 'Failed',
        message: 'No Order With Such ID.'
      });

    const service = await Service
      .findById(order.serviceId);


    const index = service.ordersList.indexOf(order._id);

    service.ordersList.splice(index, 1);

    await service.save();

    res.status(200).json({
      status: 'Succsess',
      message: 'Order Canceled Successfully'
    });


  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};