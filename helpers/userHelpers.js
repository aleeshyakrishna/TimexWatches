const bcrypt = require("bcrypt");
const { isObjectIdOrHexString } = require("mongoose");
const { user, cart } = require("../model/connection");
const db = require("../model/connection");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

var instance = new Razorpay({
  key_id: "rzp_test_D8YlCeAgArP4IA",
  key_secret: "pVNA7ImyxnRLRazFqdsRmcJZ",
});

module.exports = {
  doSignUp: (userData) => {
    //console.log(db);
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await db.user.findOne({ email: email });
        if (existingUser) {
          response = { status: false };
          return resolve(response);
        } else {
          var hashPassword = await bcrypt.hash(userData.password, 10);
          const data = {
            username: userData.username,
            Password: hashPassword,
            email: userData.email,
            phoneNumber: userData.phonenumber,
          };
          console.log(data);
          await db.user.create(data).then((data) => {
            resolve({ data, status: true });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  //kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk

  // generateNewCoupon:(req,res)=>{
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let couponCode = voucher_codes.generate({
  //         length: 6,
  //         count: 1,
  //         charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  //         prefix: "WHITE-",
  //       });
  //       resolve({ status: true, couponCode: couponCode[0] });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     console.log(coupenCode,"kkkkkkkkkkkkkkkkkkkkkkkkkk");
  //   });
  // },

  //kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await db.user.findOne({ email: userData.email });
        //console.log(users);
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  response.user = users;
                  resolve({ response, status: true });
                } else {
                  resolve({ blockedStatus: false, status: false });
                }
              });
          } else {
            resolve({ blockedStatus: true, status: false });
          }
        } else {
          resolve({ blockedStatus: false, status: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  zoomlistProductShop: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  listProductShop: (pageNum) => {
    // let perPage = 6
    // return new Promise(async (resolve, reject) => {



    //     await db.product.find().skip((pageNum - 1) * perPage).limit(perPage).then((response) => {

    //         resolve(response)
    //     })


    // })


    let perPage = 3

    return new Promise(async (resolve, reject) => {


      await db.products
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .then((response) => {
          resolve(response);
        });
    });
  },
 
  categorySearch:(categoryId)=>{
      return new Promise(async(resolve,reject)=>{
        let cate= await db.category.find({_id:ObjectId(categoryId)})
        resolve(cate)
      })
  },

  getCat: (category) => {
    return new Promise(async (resolve, reject) => {

      
      let cateProd= await db.products.find({category:category})
      resolve(cateProd)
      
    });
  },
  //newwwwwwwwwwwwwwwwwwwww

  findUser :(mobile) =>{
    return new Promise((resolve, reject) =>{
        db.user.findOne({phoneNumber : mobile}).then((user) =>{
            if(user){
                resolve(user)
            }else{
                resolve(null);
            }
        })
    })
},
  //newwwwwwwwwwwwwwwwwwwww

  //sandeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

  // otpverification: (otpvariable) => {
  //   return new Promise(async (resolve, reject) => {
  //     await db.products
  //       .findOne({
  //         phoneNumber: otpvariable,
  //       })
  //       .then((response) => {
  //         resolve(response);
  //       });
  //   });
  // },

  addToCarts: (proId, userId) => {
    
    return new Promise(async (resolve, reject) => {
      let proobj = {
        product: ObjectId(proId),
        quantity: 1,
      };
      let obj = {
        userid: userId,
        products: proobj,
      };
      let usercart = await db.cart.find({ userid: userId });
      if (usercart.length < 1) {
        db.cart.create(obj);
        resolve();
      } else {
        let proExist = await db.cart.findOne({
          userid: userId,
          "products.product": ObjectId(proId),
        });
        // console.log(proExist + "PRO EXIST TTT TTT");
        if (proExist) {
          db.cart.findOneAndUpdate(
            { userid: userId, "products.product": ObjectId(proId) },
            { $inc: { "products.$.quantity": 1 } },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        } else {
          db.cart.findOneAndUpdate(
            { userid: userId },
            { $push: { products: proobj } },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      }
      resolve();
    });
  },

  

  //cart display
  displayProducts: (usersId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userId = new ObjectId(usersId);
        let cartItems = await db.cart.aggregate([
          {

            $match: {
              userid: userId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": "$products.quantity",
              product: "$products.product",
              sample: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              product: 1,
              proDetails: 1,
              "products.quantity": 1,
              price: "$sample.Price",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": 1,
              _id: 1,
              subtotal: {
                $multiply: [
                  {
                    $toInt: "$products.quantity",
                  },
                  {
                    $toInt: "$price",
                  },
                ],
              },
            },
           
          },{

            $unwind: {
              path: '$proDetails',
              includeArrayIndex: 'string',
             
            }
          }
        ]);
        // console.log(cartItems,"hihihilhihihihihihih");
        resolve(cartItems);
        
      } catch {
        resolve(null);
      }
    });
  },

  getCartCount: async (userId) => {
    let count = 0;
    return new Promise(async (resolve, reject) => {
      let cart = await db.cart.findOne({ userid: userId });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  removeItem: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.cart
        .updateOne(
          { userid: userId, "products.product": ObjectId(proId) },
          { $pull: { products: { product: ObjectId(proId) } } }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  //change quantity
  // change_Quantity: (details) => {

  //   console.log(details,"this is details..............");
  //   let count = parseInt(details.count);
  //  let  quantity = parseInt(details.quantity);

  //   return new Promise((resolve, reject) => {
  //     if (count == -1 && quantity == 1) {
  //       db.cart
  //         .findOneAndUpdate(
  //           { _id: details.cart },
  //           {
  //             $pull: { products: { product: ObjectId(details.product) } },
  //           }
  //         )
  //         .then((response) => {
  //           resolve({ removeProduct: true });
  //         });
  //     } else {
  //       db.cart
  //         .findOneAndUpdate(
  //           {
  //             _id: details.cart,
  //             "products.product": ObjectId(details.product),
  //           },
  //           { $inc: { "products.$.quantity": count } }
  //         )
  //         .then((response) => {
  //           resolve(response);
  //         });
  //     }
  //   });
  // },

  change_Quantity : (details) => {

    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise((resolve, reject) => {
        if (details.count == -1 && details.quantity == 1) {
            db.cart.findOneAndUpdate({
                _id: details.cart
            }, {
                $pull: {
                    products: {
                        product: ObjectId(details.product)
                    }
                }
            }).then((response) => {
                resolve({removeProduct: true})
            }).catch((error) => {
                reject()
            })
        } else {

            db.cart.findOneAndUpdate({
                _id: details.cart,
                "products.product": ObjectId(details.product)
            }, {
                $inc: {
                    "products.$.quantity": details.count
                }
            }).then((response) => {
                resolve({status: true})
            }).catch((error) => {
                reject()
            })
        }


    })

},

getsubTotal: (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(userId);
      // let uId = ObjectId(userId);
      let subtotal = await db.cart.aggregate([
        {
          $match: {
            userid: ObjectId(userId),
          },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $project: {
            _id: 0,
            cart: "$products.product",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "cart",
            foreignField: "_id",
            as: "proDetails",
          },
        },
        {
          $project: {
            quantity: 1,
            prod: {
              $arrayElemAt: ["$proDetails", 0],
            },
          },
        },
        {
          $project: {
         
            price: "$prod.Price",
            quantity: 1,
          },
        },
        {
          '$project': {
            'result': {
              '$multiply': [
                '$quantity', '$price'
              ]
            }
          }
        }
      ]);
      console.log(subtotal,"<------>");
      resolve(subtotal);
    } catch {
      resolve(null);
    }
  });
},


  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userId);
        // let uId = ObjectId(userId);
        let total = await db.cart.aggregate([
          {
            $match: {
              userid: ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $project: {
              _id: 0,
              cart: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "cart",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              quantity: 1,
              prod: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
           
              price: "$prod.Price",
              quantity: 1,
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
          },
        ]);
        console.log(total,"++************++");
        resolve(total);
      } catch {
        resolve(null);
      }
    });
  },

  //   postAddresses:(userId,newaddress)=>{
  //     return new Promise((resolve,reject)=>{
  //       db.user.updateOne({_id:userId},{$push:{address:newaddress.address}}).then((toAddress)=>{
  //         console.log(toAddress,'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqw')
  //         resolve(toAddress)
  //       })
  //       .catch((error)=>{
  //         reject(error)
  //       })
  //     })
  // },

  saveaddress: (email, data, id) => {
    const newaddress = {
      id: id,
      name: data.name,
      contactNumber: data.contactNumber,
      firstLine: data.firstLine,
      secondLine: data.secondLine,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      email: email,
    };

    return new Promise(async (resolve, reject) => {
      const addressDetails = await db.user.updateMany(
        { email: email },
        {
          $push: {
            address: newaddress,
          },
        }
      );
      resolve();
    });
  },
  //kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  // countCoupon: (user) => {
  //   db.coupon.countDocuments({}, function (err, count) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       const randomIndex = Math.floor(Math.random() * count);

  //       db.coupon
  //         .findOne()
  //         .skip(randomIndex)
  //         .exec(function (err, result) {
  //           if (err) {
  //             console.log(err);
  //           }

  //           console.log(result,"this is result")

  //           const codeLength = 4;
  //           const code = crypto
  //             .randomBytes(codeLength)
  //             .toString("hex")
  //             .toUpperCase();
  //           // console.log(
  //           //   code,
  //           //   "this is crypto codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  //           // );

  //           const createDate = Date.now();
  //           let exp = new Date(createDate);
  //           exp.setDate(exp.getDate() + 10);

        

  //           db.userCoupon.create({
  //             couponId: result._id,
  //             userId: user,
  //             couponCode: result.couponName,
  //             discount: result.discount,
  //             used: false,
  //             code: code,
  //             createDate: createDate.toLocaleString(),
  //             exp: exp.toLocaleString(),
  //           });
  //         });
  //     }
  //   });
  // },

  countCoupon: (user) => {
    try {
      db.coupon.countDocuments({}, function (err, count) {
        if (err) {
          console.log(err);
        } else {
          if (count === 0) {
            console.log('No coupons found in the collection');
            return;
          }
  
          const randomIndex = Math.floor(Math.random() * count);
  
          db.coupon
            .findOne()
            .skip(randomIndex)
            .exec(function (err, result) {
              if (err) {
                console.log(err);
              } else {
                if (!result) {
                  console.log('No coupon found');
                  return;
                }
  
                console.log(result, "this is result");
  
                const codeLength = 4;
                const code = crypto
                  .randomBytes(codeLength)
                  .toString("hex")
                  .toUpperCase();
                // console.log(
                //   code,
                //   "this is crypto codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                // );
  
                const createDate = Date.now();
                let exp = new Date(createDate);
                exp.setDate(exp.getDate() + 10);
  
                db.userCoupon.create({
                  couponId: result._id,
                  userId: user,
                  couponCode: result.couponName,
                  discount: result.discount,
                  used: false,
                  code: code,
                  createDate: createDate.toLocaleString(),
                  exp: exp.toLocaleString(),
                });
              }
            });
        }
      });
    } catch (error) {
      console.log(error);
      // Handle the error here (e.g., return an error response, throw an exception, etc.)
    }
  },
  
  

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.cart
          .aggregate([
            {
              $match: {
                userid: ObjectId(userId),
              },
            },
            {
              $unwind: {
                path: "$products",
                includeArrayIndex: "string",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "proDetails",
              },
            },
            {
              $unwind: {
                path: "$proDetails",
                includeArrayIndex: "string",
              },
            },
            {
              $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                  _id: 1,
                  proId:"$proDetails._id",
                  Name: "$proDetails.Productname",
                  Discription: "$proDetails.ProductDescription",
                  Quantity: "$products.quantity",
                  Image: "$proDetails.Image",
                  Price: "$proDetails.Price",
                  Category: "$proDetails.category",
                },
            },
          ])
          .then((cart) => {
            console.log(cart,"this is aggregation result.........")
            resolve(cart);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  addToWishList: (proId, userId) => {
    let proObj = {
      productId: proId,
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await db.wishlist.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishitems.findIndex(
          (item) => item.productId == proId
        );
        if (productExist == -1) {
          db.wishlist
            .updateOne(
              { user: userId },
              {
                $addToSet: {
                  wishitems: proObj,
                },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      } else {
        const newWishlist = new db.wishlist({
          user: userId,
          wishitems: proObj,
        });

        await newWishlist.save().then(() => {
          resolve({ status: true });
        });
      }
      resolve();
    });
  },

  ListWishList: (userId) => {
    console.log(userId, "this is user Id view wishlist");
    return new Promise(async (resolve, reject) => {
      await db.wishlist
        .aggregate([
          {
            $match: {
              // user: ObjectId(userId)
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$wishitems",
              includeArrayIndex: "string",
            },
          },
          {
            $project: {
              // item: '$wishitems.productId',
              item: "$wishitems.productId",
            },
          },
          {
            $lookup: {
              // from: 'product',
              // localField: "item",
              // foreignField: "_id",
              // as: 'wishlist'

              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "wishlist",
            },
          },
          {
            $unwind: "$wishlist",
          },

          {
            $project: {
              item: 1,
              //  wishlist: { $arrayElemAt: ['$wishlist', 0] }

              Productname: "$wishlist.Productname",
              Price: "$wishlist.Price",
              Image: "$wishlist.Image",
              Quantity:"$wishlist.Quantity"
            },
          },

          //this is my aggregation
          // {
          //   '$match': {
          //     'user': new ObjectId('userId')
          //   }
          // }, {
          //   '$unwind': {
          // 'path': '$wishitems',
          // 'includeArrayIndex': 'string'

          // }, {
          //   '$project': {
          //     'item': '$wishitems.productId'
          //   }
          // }, {
          //   '$lookup': {
          //     'from': 'products',
          //     'localField': 'item',
          //     'foreignField': '_id',
          //     'as': 'wishlist'
          //   }
          // }, {
          //   '$unwind':
          //      '$wishlist'

          // }, {
          //   '$project': {
          //     'item': 1,
          //     'wishlist': [
          //       {
          //         'Productname': '$wishlist.Productname',
          //         'Price': '$wishlist.Price',
          //         'Image': '$wishlist.Image'
          //       }
          //     ]
          //   }
          // }
        ])
        .then((wishlist) => {
          console.log(wishlist,"hhhhhhhhhhhhhh");
          console.log("hhhhhhhhhhhhhhhhh");
          resolve(wishlist);
        });
    });
  },

  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db.wishlist.findOne({ user: userId });
      if (wishlist) {
        count = wishlist.wishitems.length;
      }

      resolve(count);
    });
  },

  getDeleteWishList: (body) => {
    console.log(body);

    return new Promise(async (resolve, reject) => {
      await db.wishlist
        .updateOne(
          { _id: body.wishlistId },
          {
            $pull: { wishitems: { productId: body.productId } },
          }
        )
        .then(() => {
          resolve({ removeProduct: true });
        });
    });
  },

  // placeOrder: (order, carts, total, userId) => {
   
  //   return new Promise((resolve, reject) => {

  //     const cartId = order.flexRadioDefault;

  //     db.user
  //       .findById(userId)
  //       .select("address")
  //       .then((user) => {
  //         var cartAddress = user.address.find(
  //           (a) => a._id.toString() === cartId
  //         );
  //         let status = order["paymentMethod"] === "COD" ? "placed" : "pending";
  //         db.order
  //           .create({
  //             deliveryDetails: {
  //               name:cartAddress.name,
  //               address: cartAddress.firstLine,
  //               post:cartAddress.secondLine,
  //               city:cartAddress.city,
  //               mobile: cartAddress.contactNumber,
  //               pincode: cartAddress.pincode


  //             },
  //             userId: ObjectId(userId),
  //             paymentMethod: order["paymentMethod"],
  //             products: carts,

  //             status: status,
  //             totalAmount: total,
  //             date: new Date(),
  //           })
  //           .then(async (response) => {
  //             console.log(response,"this is the response.........");
  //             if (response.status=='placed') {
  //               console.log(userId,"this is user id")
  //               await db.cart.deleteMany({ userid: ObjectId(userId) });
  //             }

  //             resolve(response._id);
  //           });
  //       });
  //   });
  // },

  placeOrder: (order, carts, total, userId) => {
    return new Promise((resolve, reject) => {
      const cartId = order.flexRadioDefault;
  
      db.user
        .findById(userId)
        .select("address")
        .then((user) => {
          if (!user) {
            throw new Error("User not found");
          }
  
          const cartAddress = user.address.find(
            (a) => a._id.toString() === cartId
          );
          if (!cartAddress) {
            // let AddErr="Cart address not found";
            // return AddErr;
            throw new Error("Cart address not found");
          }
  
          const status = order["paymentMethod"] === "COD" ? "placed" : "pending";
          db.order
            .create({
              deliveryDetails: {
                name: cartAddress.name,
                address: cartAddress.firstLine,
                post: cartAddress.secondLine,
                city: cartAddress.city,
                mobile: cartAddress.contactNumber,
                pincode: cartAddress.pincode,
              },
              userId: ObjectId(userId),
              paymentMethod: order["paymentMethod"],
              products: carts,
              status: status,
              totalAmount: total,
              date: new Date(),
            })
            .then(async (response) => {
              // console.log(response, "this is the response.........");
              if (response) {

                console.log(userId, "this is user id");
                await db.cart.deleteMany({ userid: ObjectId(userId) });
               await carts.forEach( async element => {
                  const proId = element.proId
                  const stock = element.Quantity
                  await db.products.updateOne({_id:proId},{$inc:{Quantity:-stock}})
                });
              }
              resolve(response._id);
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
  

  

  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },

  viewUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      if (!mongoose.isValidObjectId(userId)) {
        return reject(new Error("Invalid userId parameter"));
      }
      // console.log(mongoose.Types.ObjectId(userId),";;;;;;;;;;;;;'''''''");
      let orders = await db.order.find({
        userId: mongoose.Types.ObjectId(userId),
      });
      if (orders) {
        resolve(orders);
      } else {
        res.render("/");
      }
    });
  },

  getUsercoupen: (user) => {
    return new Promise(async (resolve, reject) => {
      let coupenList = await db.userCoupon.find({
        userId: ObjectId(user),
      });
      resolve(coupenList);
    });
  },

  coupenValidate: (user, code, amount) => {
    return new Promise(async (resolve, reject) => {
      let result = await db.userCoupon.find({ userId: user, code: code });
      console.log(result);
      const moment = require("moment");
      const currentDate = moment();

      const specifiedDate = moment(result[0].exp, "DD/M/YYYY, h:mm:ss a");
      if (!result) {
        resolve({
          status: false,
          Message: "Invalid coupon",
        });
      }
      if (result[0].used) {
        resolve({
          status: false,
          Message: "Coupon is already used",
        });
      } else if (currentDate.isAfter(specifiedDate)) {
        resolve({
          status: false,
          Message: "Coupon is expired",
        });
      } else {
        const discountPercentage = result[0]?.discount;
        const total = amount[0]?.totalRevenue;
        const discountPrice = (total / 100) * discountPercentage;
        const priceAfterDiscount = total - discountPrice;
        resolve({
          status: true,
          total,
          discountPrice,
          priceAfterDiscount,
          Message: "Coupon applied successffully....!",
        });
      }
    });
  },

  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db.user.findOne({ _id: ObjectId(userId) });
      resolve(userDetails);
    });
  },

  validCoupens: (userId) => {
    return new Promise(async (resolve, reject) => {
      let validCoupens = await db.userCoupon.find({ userId: userId });
      resolve(validCoupens);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.order.find({ _id: ObjectId(orderId) });
      resolve(orders);
    });
  },

 
  CancelOrderItem: async (orderId, orderStatus) => {
    try {
      const updatedOrder = await db.order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: orderStatus } },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error("Order not found");
      }
      console.log("Order cancelled successfully");

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getOneProduct: async (Id) => {
    try {
      const productDetails = await db.products.findOne({
        _id: Id,
      });
      return productDetails;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getAddress: (user) => {
    return new Promise(async (resolve, reject) => {
     let address= await db.user.find({ _id: user });
      // console.log(address, "lllyyyuuuu");

      resolve (address);
    });
  },

  postSort: (sortOption) => {
    return new Promise(async (resolve, reject) => {
      let products;
      if (sortOption === 'price-low-to-high') {

        products = await db.products.find().sort({ Price: 1 }).exec();
      } else if (sortOption === 'price-high-to-low') {

        products = await db.products.find().sort({ Price: -1 }).exec();
      } else {
        products = await db.products.find().exec();
      }
      resolve(products)
    })

  },

  documentCount: () => {
    return new Promise(async (resolve, reject) => {
      await db.products.find().countDocuments().then((documents) => {

        resolve(documents);
      })
    })
  },

  categoryCount:()=>{
    return new Promise(async(resolve,reject)=>{
      await db.category.find().countDocuments().then((documents)=>{
        resolve(documents)
      })
    })
  },
  orderCount:(req,res)=>{
    return new Promise(async(resolve,reject)=>{
      await db.order.find().countDocuments().then((documents)=>{
        resolve(documents)
      })
    })
  },

  search: (details) => {

   

    return new Promise(async(resolve, reject) => {
      try {
        const searchValue = details.search;
        let Products = await db.products.find({
          'Productname': { $regex: `.*${searchValue}.*`, $options: 'i' }
        });
       
        resolve(Products);
        // console.log(Products,"oioioioiuhgfghnbvv");
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  updateStock:(proName,stock)=>{
    return new Promise(async(resolve,reject)=>{
      try{
        let products = await db.products.updateOne({Productname:proName},{$inc:{Quantity:stock}})
        resolve(products)
      }catch(err){
        console.error(err);
        reject(err);
      }
    })
  },

  shopListProduct: (pageNum) => {

    let perPage = 3
    return new Promise(async (resolve, reject) => {



        await db.products.find().skip((pageNum - 1) * perPage).limit(perPage).then((response) => {

            resolve(response)
        })


    })
},



  

};


