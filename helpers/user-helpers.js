var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const userhelpers = require("../helpers/user-helpers");
var objectid = require("objectid");
const collections = require("../config/collections");
const { Collection } = require("mongodb");
const { response } = require("express");
const { ObjectID } = require("bson");
const { parse } = require("handlebars");
let dateTime = require("node-datetime");
var { uid } = require("uid");
const Razorpay = require("razorpay");
const { resolve } = require("node:path");
const { count } = require("node:console");
var paypal = require("paypal-rest-sdk");
require('dotenv').config()

var instance = new Razorpay({
  key_id: "rzp_test_wdsDxzRwb6eQj9",
  key_secret: "juaYpXr4lxA88tWYxArOq4iU",
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARbMZjTTRpemtZdjmy4tdb1glPA3BlT1Q9Tr5s0nSIe14MopaMRs0m-v8FiEm-ZiyumpNTsP7cCkoMhM", // please provide your client id here
  client_secret:
    "EFSxX6Dw_2xUGeNO22CsNdo2SZS0Ow3NTU8UbWcdRvtIgHj1WmVFfJlKn0NdI_ESrJe3wqz4F99T0wlO", // provide your client secret here
});

module.exports = {
  dosignup: (userData) => {
    userData.addonaddress = [];
    userData.referralused = false;

    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ $or: [{ Email:userData.Email}, { mobile:userData.mobile }] })
      if (user) {
        reject("user already exists");
      } else {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            console.log(data, "insertedid");
            db.get()
              .collection(collection.WALLET_COLLECTION)
              .insertOne({
                user: objectid(data.insertedId),
                transactionHistory: [],
                amount:0
              });
            resolve(userData);
          });
      }
    });
  },
  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },

  getallusers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  blockuser: (userid) => {
    console.log("hlo" + userid);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectid(userid) }, { $set: { isblocked: true } });
      resolve();
    });
  },

  unblockuser: (userid) => {
    console.log("hoo" + userid);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectid(userid) }, { $set: { isblocked: false } });
      resolve();
    });
  },

  isblocked: (userid) => {
    return new Promise(async (resolve, reject) => {
      let Blocked = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ $and: [{ _id: objectid(userid) }, { isblocked: true }] });
      if (Blocked) {
        let error = "Sorry, user is blocked by Authorized ";
        reject(error);
      } else {
        resolve();
      }
    });
  },
  addtocart: (proid, userid) => {
    let proObj = {
      item: objectid(proid),
      quantity: 1,
    };
    console.log("iivide ethi");
    return new Promise(async (resolve, reject) => {
      console.log("hlo here");
      let usercart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectid(userid) });
      if (usercart) {
        let proexist = usercart.products.findIndex(
          (product) => product.item == proid
        );
        console.log(proexist,"prodetails");
        if (proexist != -1) {
         
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectid(userid), "products.item": objectid(proid) },
              {
                $inc: { "products.$.quantity": 0 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectid(userid) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then(() => {
              resolve();
            });
        }
      } else {
        console.log("ividem ethi");
        let cartobj = {
          user: objectid(userid),
          products: [proObj],
        };

        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartobj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  getcartproducts: (userid) => {
    return new Promise(async (resolve, reject) => {
      let cartitems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectid(userid) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      //  console.log("cart items is this"+ cartitems[0].products);
      console.log(cartitems);
      if (cartitems.length === 0) {
        resolve();
      } else {
        resolve(cartitems);
      }
    });
  },
  getcartcount: (userid) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectid(userid) });
      console.log(cart);
      let cartcount = 0;
      if (cart) {
        cartcount = cart.products.length;
      }
      resolve(cartcount);
    });
  },

  // to change product quantity in cart page

  changeproductquantity: (details) => {
    console.log(details,"908");
    details.count = parseInt(details.count);
    console.log("cq 2");
    console.log(details.cart);

    return new Promise(async (resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectid(details.cart) },
            {
              $pull: { products: { item: objectid(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeproduct: true });
          });
      } else {
         if(details.count==1){
          console.log("876");
          let stockcheck=await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectid(details.product)})
           stockcheck.stock=parseInt(stockcheck.stock)
      
          if(details.quantity>=stockcheck.stock){
            resolve({stockerr:true})
          }else{
            db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                _id: objectid(details.cart),
                "products.item": objectid(details.product),
              },
              {
                $inc: { "products.$.quantity": details.count },
              }
            )
            .then((response) => {
              response.status=true
              resolve(response);
            });
          }

         }else{
          db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectid(details.cart),
              "products.item": objectid(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            stockerr:false
            resolve({ status: true });
          });

         }
        
    
      }
    });
  },

  //   to delete product

  deleteproduct: (details) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectid(details.cart) },
          {
            $pull: { products: { item: objectid(details.product) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },

  getsum: (userid) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectid(userid) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$products.offerprice"] } },
            },
          },
        ])
        .toArray();
      //  console.log("cart items is this"+ cartitems[0].products);
      if (total.length === 0) {
        resolve();
      } else {
        console.log(total[0].total,"7861");
        resolve(total[0].total);
      }
    });
  },

  placeOrder: (order, products, totalprice) => {
    return new Promise(async (resolve, reject) => {
      console.log(order, products, totalprice);
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      var dt = dateTime.create();
      let orderobj = {
        deliverydetails: {
          firstname: order.firstname,
          lastname: order.lastname,
          address: order.address,
          city: order.city,
          state: order.state,
          zip: order.zip,
          mobile: order.mobile,
        },
        userid: objectid(order.userid),
        paymentmethod: order["payment-method"],
        products: products,
        status: status,
        formatted: dt.format("Y-m-d "),
        price: totalprice,
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderobj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectid(order.userid) });
          resolve(response);
        });
    });
  },
  getheorderdproduct: (userid) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectid(userid) });
      resolve(cart.products);
    });
  },
  gettheorderdetails: (userid) => {
    return new Promise(async (resolve, reject) => {
      let details = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ userid: objectid(userid) });

      resolve(details);
    });
  },
  cartcheck: (user) => {
    return new Promise(async (resolve, reject) => {
      let cartexist = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectid(user) });

      resolve(cartexist);
    });
  },
  getproducttoorderpage: (itemid) => {
    console.log(itemid);
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectid(itemid) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      console.log(products);
      resolve(products);
    });
  },

  cancelorder: (orderid) => {
    return new Promise(async (resolve, reject) => {
      var dt = dateTime.create();
      let obj = { iscancel: "true", cancelleddate: dt.format("Y-m-d ") };
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectid(orderid) }, { $set: obj })
        .then(() => {
         console.log("9867");
          resolve(response);
        });
    });
  },

  getallorderes: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      console.log(orders, "ki");
      resolve(orders);
    });
  },
  changestatus: (details) => {
    return new Promise(async (resolve, reject) => {
      if(details.status=='Deliverd'){
        await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectid(details.cartid) },
          { $set: { status: details.status,isdeliverd:true} }
        )
        .then(() => {
          resolve("success");
        });
      }else{
        await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectid(details.cartid) },
          { $set: { status: details.status} }
        )
        .then(() => {
          resolve("success");
        });
      }
    
    });
  },

  updateProfile: (userid, details) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectid(userid) },
          {
            $set: {
              Firstname: details.Firstname,
              Lastname: details.Lastname,
              Mobile: details.Mobile,
              zip: details.Zip,
              Address: details.fulladdress,
              country: details.country,
              State: details.State,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getprofiledetails: (userid) => {
    console.log(userid, "userid vannu");
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectid(userid) });

      resolve(users);
    });
  },

  changepassword: (userid, details) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectid(userid) });
      console.log(user);
      if (user) {
        bcrypt.compare(details.oldpass, user.Password).then(async (result) => {
          if (result) {
            console.log("ullil keri");
            details.newpass = await bcrypt.hash(details.newpass, 10);
            await db
              .get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectid(userid) },
                { $set: { Password: details.newpass } }
              )
              .then(() => {
                console.log("over");
                let response = true;

                resolve(response);
              });
          } else {
            resolve();
          }
        });
      }
    });
  },
  addonaddress: (userid, details) => {
    return new Promise(async (resolve, reject) => {
      let addressid = uid();
      let newaddress = {
        id: addressid,
        firstname: details.firstname,
        lastname: details.lastname,
        city: details.city,

        zip: details.zip,
        address: details.address,
        email: details.email,
        mobile: details.mobile,
      };
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectid(userid) },
          {
            $push: {
              addonaddress: newaddress,
            },
          }
        )
        .then(() => {
          resolve("success");
        });
    });
  },

  getalladdress: (userid) => {
    return new Promise(async (resolve, reject) => {
      let addressOne = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectid(userid) },
          },
          {
            $unwind: "$addonaddress",
          },
          {
            $project: {
              id: "$addonaddress.id",
              firstname: "$addonaddress.firstname",
              lastname: "$addonaddress.lastname",
              city: "$addonaddress.city",
              zip: "$addonaddress.zip",
              address: "$addonaddress.address",
              email: "$addonaddress.email",
              mobile: "$addonaddress.mobile",
            },
          },
        ])
        .toArray();
      if (addressOne.length == 0) {
        resolve();
      } else {
        resolve(addressOne);
      }
    });
  },
  getoneaddress: (userid, sid) => {
    return new Promise(async (resolve, reject) => {
      let addressOne = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectid(userid) },
          },
          {
            $unwind: "$addonaddress",
          },
          {
            $project: {
              id: "$addonaddress.id",
              firstname: "$addonaddress.firstname",
              lastname: "$addonaddress.lastname",
              city: "$addonaddress.city",
              zip: "$addonaddress.zip",
              address: "$addonaddress.address",
              email: "$addonaddress.email",
              mobile: "$addonaddress.mobile",
            },
          },
          {
            $match: { id: sid },
          },
        ])
        .toArray();
      if (addressOne.length == 0) {
        resolve();
      } else {
        resolve(addressOne);
      }
    });
  },

  placeOrderbyselectingaddress: (details, order, products, totalprice) => {
    return new Promise(async (resolve, reject) => {
      console.log(products,"productsdetails");
      let status = details.paymentmethod === "COD" ? "placed" : "pending";
      var dt = dateTime.create();
      let orderobj = {
        deliverydetails: {
          firstname: order[0].firstname,
          lastname: order[0].lastname,
          address: order[0].address,
          city: order[0].city,
          state: order[0].state,
          zip: order[0].zip,
          mobile: order[0].mobile,
        },
        userid: objectid(order[0]._id),
        paymentmethod: details.paymentmethod,
        products: products,
        status: status,
        formatted: dt.format("Y-m-d "),
        price: totalprice,
      };

      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderobj)
        .then(async (response) => {
          for (let i = 0; i < products.length; i++) {
            
          await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectid(products[i].item)},{
            $inc:{stock:-products[i].quantity}
          }).then((response)=>{
            console.log(response);
          })



          } 




          console.log(response, "lake2");
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectid(order[0]._id) });
          resolve(response);
        });
    });
  },

  generaterazorpay: (orderid, price) => {
    console.log("razerpay function worked");
    return new Promise(async (resolve, reject) => {
      let order = await instance.orders.create({
        amount: price,
        currency: "INR",
        receipt: "" + orderid,
        notes: {
          key1: "value3",
          key2: "value2",
        },
      });
      console.log(order);

      resolve(order);
    });
  },
  verifyPayment: (details) => {
    console.log("verifypayment userHelper inte ullil");
    return new Promise(async (resolve, reject) => {
      const { createHmac } = await import("node:crypto");
      let hmac = createHmac("sha256", "juaYpXr4lxA88tWYxArOq4iU");
      console.log("978");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        console.log("p1000");
        resolve();
      } else {
        console.log("p9000");
        reject();
      }
    });
  },
  changepaymentstatus: (orderid) => {
    console.log(orderid, "p987");
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectid(orderid) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then((response) => {
          console.log(response, "status changed");
          resolve();
        });
    });
  },
  getmyorder: (userid,skip,limit) => {
    return new Promise(async (resolve, reject) => {
      details = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userid: objectid(userid) })
        .sort({ _id: -1 }).skip(skip).limit(limit)
        .toArray();
      resolve(details);
    });
  },
  deleteaddress: (uid, userid) => {
    console.log(uid.id, userid);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectid(userid) },
          {
            $pull: {
              addonaddress: { id: uid.id },
            },
          }
        )
        .then(() => {
          resolve("success");
        });
    });
  },

  //  add to wishlist

  addtowishlist: (proid, userid) => {
    let proObj = {
      item: objectid(proid),
    };
    return new Promise(async (resolve, reject) => {
      let wishlistexist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectid(userid) });
      if (wishlistexist) {
        let proexist = wishlistexist.products.findIndex(
          (product) => product.item == proid
        );
        console.log(proexist);
        if (proexist != -1) {
          resolve({ status: true });
          console.log(response);
        } else {
          await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectid(userid) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then(() => {
              resolve("success...");
            });
        }
      } else {
        let wishlistObj = {
          user: objectid(userid),
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishlistObj)
          .then(() => {
            resolve("success");
          });
      }
    });
  },

  // get wishlist products

  getwishlistproduct: (user) => {
    console.log("79");
    return new Promise(async (resolve, reject) => {
      let wishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectid(user) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,

              products: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log(wishlist);
      resolve(wishlist);
    });
  },

  // <----------------------------delete from wishlist---------------------------------------------------------> */


  deletefromwishlist: (proid, userid) => {
    console.log(proid, userid);
    return new Promise(async (resolve, reject) => {
      console.log("66");
      await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { user: objectid(userid) },
          {
            $pull: { products: { item: objectid(proid) } },
          }
        )
        .then(() => {
          resolve("product deleted from wishlist");
        });
    });
  },

  createPay: (payment) => {
    console.log("764");
    return new Promise((resolve, reject) => {
      console.log("765");
      paypal.payment.create(payment, function (err, payment) {
        if (err) {
          reject(err);
        } else {
          resolve(payment);
        }
      });
    });
  },

  createrefferal: (refferalcode, userid) => {
    console.log("908");
    console.log(refferalcode);
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile:refferalcode.referralcode});
      console.log(user);
      let referralused = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectid(userid), referralused: true });
      console.log(referralused);
      if (!referralused) {
        console.log("876");
        if (user) {
          console.log("875");
          console.log("909");
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: objectid(userid) },
              {
                $set: { referralused: true },
              }
            );
          var dt = dateTime.create();
          let transaction = {
            Description: "Refferal claimed",
            credit: "100",
            DateTime: dt.format("Y-m-d "),
          };
          let transaction2 = {
            Description: "Refferal claimed",
            credit: "70",
            DateTime: dt.format("Y-m-d "),
          };

          db.get()
            .collection(collection.WALLET_COLLECTION)
            .updateOne(
              { user: objectid(user._id) },
              {
                $inc: {
                  amount: 100,
                },
                $push: {
                  transactionHistory: transaction,
                },
              }
            );
            db.get()
            .collection(collection.WALLET_COLLECTION)
            .updateOne(
              { user: objectid(userid) },
              {
                $inc: {
                  amount: 70,
                },
                $push: {
                  transactionHistory: transaction2,
                },
              }
            );
          resolve("Amount has been Credited to Wallet,Successfully!");
        } else {
          resolve("invalid refferal code");
        }
      } else {
        resolve("sorry the code is already used");
      }
    });
  },


  getwalletinformation:(userid)=>{
      return new Promise(async(resolve,reject)=>{
        console.log("566");
        let wallet= await db.get().collection(collection.WALLET_COLLECTION).aggregate([
           {
            $match:{user:objectid(userid)}
           },
           { 
             $unwind :"$transactionHistory",
           },
           {
            $project:{
              Description: "$transactionHistory.Description",
              credit: "$transactionHistory.credit",
              Date:"$transactionHistory.DateTime",
              Amount:'$amount'
            }
           }
           

        ]).toArray()
                 console.log(wallet,"wallet");
                 resolve(wallet[0])
      })
  },
  usewallet:(userid,totalprice)=>{
    console.log(totalprice,"price");
    return new Promise(async(resolve,reject)=>{
      var dt = dateTime.create();
      let transaction={
        Description:'wallet used for purchasing',
        debit:totalprice,
        DateTime: dt.format("Y-m-d "),

      }
      await db.get().collection(collection.WALLET_COLLECTION).updateOne(
        { user: objectid(userid) },
          {
            $inc: {
              amount:-totalprice,
            },
            $set: {
              transactionHistory:transaction ,
            }
          }

      )
      resolve(response)
    })

  },

  coupenfinder:(coupenid)=>{
    return new Promise(async(resolve,reject)=>{
      let appliedcoupen= await db.get().collection(collection.COUPEN_COLLECTION).findOne({_id:objectid(coupenid)})
      resolve(appliedcoupen)
    })
  },

  coupenapplied:(coupen,total)=>{
     return new Promise(async(resolve,reject)=>{
        console.log(coupen.Min_Amount,"min price"); 


       
      if(coupen.Min_Amount<total){
        let Retotal=parseInt(total-( total * (coupen.offer/100)))
        Offerrprice=parseInt(total*(coupen.offer/100))
        console.log(Retotal); 
      

       let coupenObj={
        Retotal:Retotal,
        offerprice:Offerrprice,
          coupenid:coupen._id}
       resolve(coupenObj)

      }else{
      coupenObj={
        Retotal:total,
        offerprice:"Minimum Purchase Required...!"
      }
      resolve(coupenObj)
      }


     })


  },
  checkUser: (userData) => {
    let response = {}
    return new Promise(async (resolve, reject) => {
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.number })
        if (user) {
            console.log(`user is ${user}`);
            response.user = user
            resolve(response)
        } else {
            console.log("user not found");
            resolve(response)
        }
       })
    },
gettheorderdetails2: (orderid) => {
  return new Promise(async(resolve, reject) => {
    let details = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .findOne({ _id: objectid(orderid)});

    resolve(details);
  });
},
changereturnstatus:(orderid)=>{
return new Promise(async(resolve,reject)=>{
  db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderid)},{
    $set:{productreturn:true}
  }).then(()=>{
    resolve(response)
  })
})
},
changereturnstatus:(orderid)=>{
return new Promise(async(resolve,reject)=>{
  db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderid)},{
    $set:{productreturn:true}
  }).then(()=>{
    resolve(response)
  })
})
},
refundtowallet:(userid,price)=>{
return new Promise(async(resolve,reject)=>{
  console.log(price,"789");
  var dt = dateTime.create();
  let transaction = {
    Description: "Refund Amount credited",
    credit: price,
    DateTime: dt.format("Y-m-d "),
  };
  db.get().collection(collection.WALLET_COLLECTION).updateOne({user:objectid(userid)},{
    $inc:{amount:price},$set:{transactionHistory:transaction}
  }).then(()=>{
     
    resolve("Amount Refunded succssfully..")
  })
})
},

searchproduct:(searchvalue)=>{
  return new Promise(async(resolve,reject)=>{
   let product=await db.get().collection(collection.PRODUCT_COLLECTIONS).find({
      Name:{ $regex: ".*" + searchvalue + ".*", $options: "i" }
  },
  {
      catogory: { $regex: ".*" + searchvalue + ".*", $options: "i" }
               }).toArray()
console.log(product);
resolve(product)
  })
},

stockresetoncancel:(products)=>{
   console.log(products.item,"908 ");
  return new Promise(async(resolve,reject)=>{
    for (let i = 0; i < products.length; i++) {
       db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectid(products[i].item)},{
        $inc:{stock:products[i].quantity}
       }).then((response)=>{
        console.log("08998");
        console.log(response);
       })     
    }
    resolve()
  })

  
},
generateinvoice:()=>{
  return new Promise((resolve,reject)=>{
    
  })
}


};



