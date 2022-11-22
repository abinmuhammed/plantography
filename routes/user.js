const { response } = require("express");
var express = require("express");
const { Db } = require("mongodb");
const collections = require("../config/collections");
const product_helpers = require("../helpers/product_helpers");
const userHelpers = require("../helpers/user-helpers");
const userhelpers = require("../helpers/user-helpers");
var router = express.Router();
let swal = require("sweetalert");
var paypal = require("paypal-rest-sdk");

var Handlebars = require('handlebars');


// require('dotenv');
// var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_TOKEN);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.verify.v2.services
                .create({friendlyName: 'My First Verify Service'})
                .then(service => console.log(service.sid));


const varifylogin = (req, res, next) => {
  let user = req.session.user;
  if (req.session.user) {
    next();
  } else {
    res.redirect("/usersignin");
  }
};

// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARbMZjTTRpemtZdjmy4tdb1glPA3BlT1Q9Tr5s0nSIe14MopaMRs0m-v8FiEm-ZiyumpNTsP7cCkoMhM", // please provide your client id here
  client_secret:
    "EFSxX6Dw_2xUGeNO22CsNdo2SZS0Ow3NTU8UbWcdRvtIgHj1WmVFfJlKn0NdI_ESrJe3wqz4F99T0wlO", // provide your client secret here
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  let user = req.session.user;
  console.log("hlo bro0ooooo");
  let cartcount = null;
  if (req.session.user) {
    cartcount = await userHelpers.getcartcount(req.session.user._id);
  }

  product_helpers.getthenewarrival().then((newarrival) => {
    
    product_helpers.getallcategorylist().then((catogories) => {
      if (user) {
        product_helpers.getlowprice().then((lowprice) => {
          product_helpers.isactive().then((active) => {
            let active1 = active[0]._id;
            let active2 = active[1]._id;
            console.log(active, "banner");
          
            res.render("userhome", {
              user,
              newarrival,
              lowprice,
              catogories,
              active,
              cartcount,
              active1,
              active2,
            });
          });
        });
      } else {

        
        product_helpers.getlowprice().then((lowprice) => {
          product_helpers.isactive().then((active) => {
            let active1 = active[0]._id;
            let active2 = active[1]._id;
            res.render("userhome", {
              newarrival,
              lowprice,
              catogories,
              active1,
              active2,
            });
          });
        });
      }
    });
  });
});

router.get("/usersignin", function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  let user = req.session.user;
  if (user) {
    res.redirect("/");
  } else {
    res.render("usersignin2", {
      loginerr: req.session.loginer,
      noheader: true,
      blocked: req.session.blocked,
    });
    req.session.loginer = null;
    req.session.blocked = null;
  }
});

router.get("/usersignup", function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  let user = req.session.user;

  if (user) {
    res.redirect("/");
  } else {
    res.render("usersignin2", { emailerr: req.session.err, noheader: true });
    req.session.err = null;
  }
});

router.post("/created", (req, res) => {
  console.log(req.body);

  userhelpers
    .dosignup(req.body)
    .then((response) => {
      console.log(response);
      res.redirect("/usersignin");
    })
    .catch((err) => {
      req.session.err = err;
      res.redirect("/usersignup");
    });
});

router.post("/userlogin", (req, res) => {
  console.log(req.body);
  userHelpers.dologin(req.body).then((response) => {
    if (response.status) {
      userhelpers
        .isblocked(response.user._id)
        .then(() => {
          if (response.status) {
            console.log("user logged in after cheking the block ");
            req.session.user = true;
            req.session.loggedind = true;
            req.session.user = response.user;
            res.redirect("/");
          }
        })
        .catch((error) => {
          req.session.blocked = error;

          res.redirect("/usersignin");
        });
    } else {
      req.session.loginer = "invalid credentials";
      res.redirect("/usersignin");
    }
  });
});

router.get("/userlogout", (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  req.session.user = null;

  req.session.loggedind = false;

  res.redirect("/");
});

router.get("/productdetails/:id", varifylogin, (req, res) => {
  let user = req.session.user;
  console.log(req.params.id);
  product_helpers.gettheproduct(req.params.id).then((productdetails) => {
    product_helpers.getallcategorylist().then((catogories) => {
      console.log(productdetails);
      res.render("users/product-description", {
        user,
        productdetails,
        catogories,
      });
    });
  });
});

router.get("/categoryselected/:category", varifylogin, (req, res) => {
  let user = req.session.user;
  console.log(req.params.category);
  let b = req.params.category;

  product_helpers.selectedcategory(req.params.category).then((data) => {
    product_helpers.getallcategorylist().then((catogories) => {
      console.log(data + "from");
      res.render("users/catogorypage", { user, data, b, catogories });
    });
  });
});

router.get("/cart", varifylogin, async (req, res) => {
  let user = req.session.user;

  if (user) {
    let products = await userHelpers.getcartproducts(req.session.user._id);
    let total = await userHelpers.getsum(req.session.user._id);
    console.log(products,"908");
    res.render("users/cartpage", { products, user, total });
  } else {
    res.redirect("/usersignin");
  }
});

router.get("/addtocart/:id", async (req, res) => {
  console.log("apicall");
  let user=req.session.user
  if (user){
    let cartitems= await userhelpers.getcartproducts(req.session.user._id)
    userHelpers.addtocart(req.params.id, req.session.user._id,cartitems).then((response) => {
      console.log("success");
      
      res.json(response);
    });   
  }else{
    res.redirect("/usersignin")
  }
 
});

router.post("/change-product-quantity", (req, res) => {
  console.log("api calling...");
  
  
  userHelpers.changeproductquantity(req.body).then(async (response) => {
    response.total = await userHelpers.getsum(req.session.user._id);
    res.json(response);
  });
});

router.post("/deleteproduct", (req, res) => {
  console.log("api callinmg....");
  userHelpers.deleteproduct(req.body).then((response) => {
    res.json(response);
  });
});


// coupen collection

router.post('/applycoupen',async(req,res)=>{
  console.log("0907");
  console.log(req.body);
  let user=req.session.user
  if(user){
    console.log('098')
    let totalprice= await userhelpers.getsum(req.session.user._id)
    let applied= await userhelpers.coupenfinder(req.body.coupenid)
    console.log(applied);
   userhelpers.coupenapplied(applied,totalprice).then((price)=>{
    console.log(price); 
        res.json(price)
      })
  //  console.log(applied);
 
  }
 
})


// orderpage

router.get("/orderpage", varifylogin, async (req, res) => {
  let user = req.session.user;

console.log(req.session.coupenprice,"8989");
let newprice=req.session.coupenprice

console.log(newprice,"retotal2");


console.log(newprice,"98776");
// req.session.coupenprice=null
console.log(newprice,"99997");
  if (req.session.user) {
    let addresscame = await userHelpers.getalladdress(req.session.user._id);

    let walletbalance = await userHelpers.getwalletinformation(
      req.session.user._id
    );

    console.log(walletbalance, "654");
   let coupens= await product_helpers.allcoupens()
    await userHelpers.getsum(req.session.user._id).then((total) => {
     
     
  req.session.coupen
         



      if (walletbalance == null){
        console.log("908");
        if(newprice){
          res.render("users/orderpage", { user, total, addresscame,coupens,newprice });
        }else{
          res.render("users/orderpage", { user, total, addresscame,coupens });
        }
        
      } else {
        if (walletbalance.Amount > total) {
          res.render("users/orderpage", {
            user,
            total,
            addresscame,
            walletbalance,
            coupens
          });
        } else {
          console.log("909");
          if(newprice){
            res.render("users/orderpage", { user, total, addresscame,coupens });
          }else{
            res.render("users/orderpage", { user, total, addresscame,coupens });
          }
          
        }
      }
    });
  } else {
    res.redirect("/usersignin");
  }
});

// place order

router.post("/placeorder", async (req, res) => {
  console.log(req.body);
  let products = await userhelpers.getheorderdproduct(req.body.userid);
  let totalprice = await userhelpers.getsum(req.body.userid);
  userhelpers.placeOrder(req.body, products, totalprice).then((response) => {
    if (req.body["payment-method"] == "COD") {
      res.json({ codSuccess: true });
    } else {
      userhelpers
        .generaterazorpay(response.insertedId, totalprice)
        .then((response) => {
          res.json(response);
        });
    }
  });
});

router.get("/ordersuccess", async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  let user = req.session.user;
  if (user) {
    let details = await userHelpers.gettheorderdetails(req.session.user._id);
    console.log(details, "SHDGKAHJH");
    res.render("users/ordersuccess", { user, details });
  } else res.redirect("/");
});

router.get("/myorders", async (req, res) => {
  let user = req.session.user;
  if(user){

  
  const perPage = 4;
  let pageNum;
  let skip;
  let orderCount;
  let pages;
  pageNum = parseInt(req.query.page);
  console.log(typeof (pageNum))
  skip = (pageNum - 1) * perPage
  await product_helpers.getmyordercount(req.session.user._id).then((count) => {
    orderCount = count;
  })
  pages = Math.ceil(orderCount / perPage)

  Handlebars.registerHelper('ifCond', function (v1, v2, options) {
    if (v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    for (var i = from; i <= to; i += incr)
      accum += block.fn(i);
    return accum;
  });

  // let orders=await product_helpers.getpaginatedmyorders(skip, perPage)
 
    let details = await userHelpers.getmyorder(req.session.user._id,skip,perPage);
 
    

    res.render("users/myorders", { details, user,totalDoc: orderCount, currentPage: pageNum, pages: pages});
    console.log(details, "vannno?");
   
  } else {
    res.redirect("/");
  }
});

router.get("/viewproducts/:id", async (req, res) => {
  let user = req.session.user;
  console.log(req.params.id,"987");
  if (user) {

    let details = await userHelpers.gettheorderdetails2(req.params.id);
    let products = await userHelpers.getproducttoorderpage(req.params.id);
   
   
    console.log(details,'9879867');
    res.render("users/viewproducts", { user, products, details });  
  }
});

// cancel order

router.get("/cancelorder/:id", async (req, res) => {
  console.log("78");
  console.log(req.params.id);
  let user = req.session.user;
  let order=await userHelpers.gettheorderdetails2(req.params.id)
  
  let products = await userHelpers.getproducttoorderpage(req.params.id);
  console.log(products,"987");
  if (user) {
    userHelpers.stockresetoncancel(products).then((response)=>{
      console.log(response);
      
    })
    userHelpers.cancelorder(req.params.id).then(() => {
   
      if(order.paymentmethod!='COD'){
        userHelpers.refundtowallet(req.session.user._id,order.price)
      }
      res.json(response);
     
     
      
    });
  }
});

router.post("/update-order-status", (req, res) => {
  console.log(req.body, "hloooo");
  userhelpers.changestatus(req.body).then(() => {
    res.json("success");
  });
});

router.get("/myaccount",varifylogin, (req, res) => {
 let user=req.session.user
  res.render("users/myaccount",{user});
});

router.get("/myprofile", async (req, res) => {
  let user = req.session.user;
  if (user) {
    let userdetails = await userHelpers.getprofiledetails(req.session.user._id);
    let changesuccess = req.session.changepassword;
    let wallet = await userHelpers.getwalletinformation(req.session.user._id);
    if (wallet == null) {
      wallet = { Amount: 0, Description: "Nil", credit: 0, Date: "Nil" };
      res.render("users/myprofile", {
        userdetails,
        user,
        changesuccess,
        wallet,
      });
    } else {
      res.render("users/myprofile", {
        userdetails,
        user,
        changesuccess,
        wallet,
      });
    }

    req.session.changepassword = null;
    console.log(userdetails);
  } else {
    res.redirect("/");
  }
});

router.post("/profileupdated", (req, res) => {
  console.log(req.body);
  let userid = req.session.user._id;
  userhelpers.updateProfile(userid, req.body).then((response) => {
    res.redirect("/myprofile");
  });
});

// add new address page

router.get("/myaddress", varifylogin, async (req, res) => {
  let user = req.session.user;
  if (user) {
    let addresscame = await userHelpers.getalladdress(req.session.user._id);

    res.render("users/myaddress", { user, addresscame });
  } else {
    res.redirect("/");
  }
});

// change password

router.post("/changepassword", async (req, res) => {
  console.log(req.body);

  let user = req.session.user;
  if (user) {
    userHelpers
      .changepassword(req.session.user._id, req.body)
      .then((response) => {
        if (response) {
          req.session.changepassword = "Password changed successfully";
          res.json("password changed succesfully");
        } else {
          req.session.changepassword = "Please confirm your old password";
          res.json("failed");
        }
      });
  }
});

// add new address
router.post("/addnewaddress", (req, res) => {
  console.log(req.body, "order confirm aayi");

  userHelpers.addonaddress(req.session.user._id, req.body).then((response) => {
    res.redirect("myaddress");
  });
});

//get All address

router.post("/placeorderbyselectingaddress", async (req, res) => {
  console.log(req.body,"987798 ");
  console.log("1");
  let user = req.session.user;
  if (user) {
    let address = await userHelpers.getoneaddress(
      req.session.user._id,
      req.body.addressradio
    );
    let products = await userhelpers.getheorderdproduct(req.session.user._id);

    let orderprice = await userhelpers.getsum(req.session.user._id);
    let totalprice;   
    if(req.body.coupenid){
        
       
          console.log('098')
          let totalsum= await userhelpers.getsum(req.session.user._id)
          let applied= await userhelpers.coupenfinder(req.body.coupenid)
          console.log(applied);
        await userhelpers.coupenapplied(applied,totalsum).then((price)=>{
          console.log(price); 
          totalprice=(price.Retotal)

            })
        }else{
         totalprice=orderprice
       }
   console.log(totalprice,876);
    userhelpers
      .placeOrderbyselectingaddress(req.body, address, products, totalprice)
      .then((response) => {
        console.log(response, "lake");

        if (req.body.paymentmethod == "COD") {
          console.log("345");
          res.json({ codSuccess: true });
        } else if (req.body.paymentmethod == "WALLET") {
          console.log(totalprice, "ty67");
          userHelpers
            .usewallet(req.session.user._id, totalprice)
            .then((response) => {
              response.walletused = true;

              console.log("wallet success");
              res.json(response);
            });
        } else if (req.body.paymentmethod == "RAZERPAY") {
          userhelpers
            .generaterazorpay(response.insertedId, totalprice)
            .then((response) => {
              response.razorpaysuccess = true;
              res.json(response);
            });
        } else if (req.body.paymentmethod == "PAYPAL") {
          // create payment object
          var payment = {
            intent: "authorize",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: "http://localhost:3000/ordersuccess",
              cancel_url: "http://127.0.0.1:3000/err",
            },
            transactions: [
              {
                amount: {
                  total: 39.0,
                  currency: "USD",
                },
                description: "  ",
              },
            ],
          };
          userhelpers
            .createPay(payment)
            .then((transaction) => {
              console.log("763");
              console.log(transaction);
              var id = transaction.id;
              var links = transaction.links;
              var counter = links.length;
              while (counter--) {
                if (links[counter].rel === "approval_url") {
                  // redirect to paypal where user approves the transaction
                  transaction.paypalsuccess = true;
                  transaction.directionlink = links[counter].href;
                  // transaction.orderid=orderid
                  // return res.redirect( links[counter].href )
                  res.json(transaction);
                }
              }
            })
            .catch((err) => {
              console.log(err);
              res.send("/err");
            });
        }
      });
  } else {
    res.redirect("/");
  }
});

router.post("/verify-payment", (req, res) => {
  console.log("verify payment vannu");
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changepaymentstatus(req.body["order[receipt]"]).then(() => {
        console.log("pay success");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: "payment failed" });
    });
});

router.post("/delete-address", (req, res) => {
  console.log(req.body);
  let user = req.session.user;
  if (user) {
    userHelpers
      .deleteaddress(req.body, req.session.user._id)
      .then((response) => {
        console.log(response);
        res.json(response);
      });
  }
});

router.get("/wishlist", (req, res) => {
  console.log("78");
  let user = req.session.user;
  if (user) {
    userhelpers.getwishlistproduct(req.session.user._id).then((wishlist) => {
      let count = wishlist.length;
      // let profile=userHelpers.getprofiledetails(req.session.user._id)
      res.render("users/wishlist", { wishlist, user, count });
    });
  } else {
    res.redirect("/usersignin");
  }
});

// add to wish list cart

router.get("/addtowishlist/:id", (req, res) => {
  console.log("91");
  let user = req.session.user._id;
  console.log(user);
  console.log(req.params.id);
  userhelpers
    .addtowishlist(req.params.id, req.session.user._id)
    .then((response) => {
      console.log(response);
      res.json(response);
    });
});

// delete from wishlist

router.post("/deletefromwishlist/", (req, res) => {
  console.log("63");

  let user = req.session.user;
  if (user) {
    console.log(req.body, user);
    userhelpers
      .deletefromwishlist(req.body.proid, req.session.user._id)
      .then((response) => {
        res.json(response);
      });
  }
});

// wallet creation

router.post("/refferal-creation", (req, res) => {
  console.log("8768 ");
  let user = req.session.user;
  if (user) {
    console.log("8787");
    userHelpers
      .createrefferal(req.body, req.session.user._id)
      .then((response) => {
        console.log(response);
        res.json(response);
      });
  }
});
router.get('/otplogin',(req,res)=>{
  console.log("9809");
  
  res.render('users/otppage',{otpSended:req.session.otpSended,noheader: true})
})



// Get Otp login Page


//POST Send Otp To Twilio 
router.post('/sendotp', (req, res) => {
  console.log(req.body);
  req.session.otpSended = true;
  userHelpers.checkUser(req.body).then((response) => {
    console.log(response,"877");
    if (response.user) {
      console.log("9876z");
      let ph_no = (`+91${req.body.number}`)
      req.session.number = ph_no;
      console.log("456");
      client.verify.v2.services('VA77cf0d1f5b82e0357bf810d15d193c22')
        .verifications
        .create({ to: ph_no, channel: 'sms' })
        .then(verification => {
          console.log("4567");
          console.log(verification.status,"8978")
          //  req.session.preuser=response.user
          req.session.user = response.user
          res.render('users/OTPverificationpage', {noheader:true})
        })
    } else {
      console.log("9876");
      res.render('users/otppage', { noaccount: true,noheader:true })
    }
  })
})

router.post('/verifyotp', (req, res) => {
  // console.log(`session phone number is ${req.session.phonenumber} and otp is ${req.body}`);\
  console.log("90989");
  console.log(req.session.number);
  let ph_no = req.session.number
  let otp = req.body.otp
  client.verify.v2.services('VA77cf0d1f5b82e0357bf810d15d193c22')
    .verificationChecks
    .create({ to: ph_no, code: otp })
    .then(verification_check => {
      console.log(verification_check.status)
      console.log("9070 ");
      if (verification_check.status == 'approved') {
        // user=req.session.user
        // console.log('lo');
        // req.session.user=req.session.preuser

        res.redirect('/')
      }else{
       console.log("invalid OTP");
        res.render('users/OTPverificationpage', {otpErr: true })
      }
    });

})

// return the product

router.post('/return-the-product',(req,res)=>{
  console.log(req.body)
  let user=req.session.user
  if(user){
    userHelpers.changereturnstatus(req.body.orderid).then(async ()=>{
    let price= await userHelpers.gettheorderdetails2(req.body.orderid)
    console.log(price.price);
    userhelpers.refundtowallet(req.session.user._id,price.price).then((response)=>{
    res.json(response)
    })
  })}
  

})

// search products

// router.get('/searchpage',(req,res)=>{
//   res.render('users/searchpage')
// })

router.post('/searchproduct',varifylogin,(req,res)=>{
  console.log(req.body.searchvalue);

  let user=req.session.user
  if(user){
    userhelpers.searchproduct(req.body.searchvalue).then((data)=>{
      console.log(data,"90898");
     res.render('users/searchpage',{data,user})
})

  }

})


router.get('/testpage',(req,res)=>{
  console.log("89");
  res.render('users/new1',{noheader:true})
})



module.exports = router;
