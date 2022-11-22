var express = require("express");
const userHelpers = require("../helpers/user-helpers");
const { getallusers } = require("../helpers/user-helpers");
var router = express.Router();
var Producthelper = require("../helpers/product_helpers");
const product_helpers = require("../helpers/product_helpers");
const Id = require("objectid");
const { response } = require("express");
const { Db } = require("mongodb");
var Handlebars = require('handlebars');
const multer  = require('multer')
let dateTime = require("node-datetime");

/* GET users listing. */
const adminname = "abin";
const prepass = 123456;
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/product_images')
    },
    filename: function (req, file, cb) {
      var dt = dateTime.create();
      cb(null,Date.now() + '-' +file.originalname)

    }
  })
const upload = multer({ storage: multerStorage })


async function getPaginatedProducts(){
  const perPage = 16;
  let pageNum;
  let skip;
  let productCount;
  let pages;
  pageNum = parseInt(req.query.page);
  console.log(typeof (pageNum))
  skip = (pageNum - 1) * perPage
  await product_helpers.getProductCount().then((count) => {
    productCount = count;
  })
  pages = Math.ceil(productCount / perPage)

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

  let products=await product_helpers.getPaginatedProducts(skip, perPage)
  
}




router.get("/", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  let admin = req.session.admin;
  if (admin) {
    res.redirect("/admin/adminhome");
  } else {
    res.render("admin/new1", { noheader: true });
  }
});

router.get("/adminhome",async function  (req, res) {
  let admin = req.session.admin;
  if (admin) {
    let orders=await userHelpers.getallorderes()
   
    let totalsales=await product_helpers.getsumofallorders()



     let orderplacedcount;
     await product_helpers.getthecountofstatus("placed").then((response)=>{
        console.log(response,"response");
        orderplacedcount=response[0].count
      }).catch(()=>{
        orderplacedcount=0

      })
        //  orderpackedCount

      let orderpackedcount;
      await product_helpers.getthecountofstatus('Packed').then((response)=>{
        
        console.log(response);
        orderpackedcount=response[0].count
      }).catch(()=>{
        orderpackedcount=0
      })
      let ordershippedcount;
     
      await product_helpers.getthecountofstatus('Shipped').then((response)=>{
        
        console.log(response);
        ordershippedcount=response[0].count
      }).catch(()=>{
        ordershippedcount=0
      })
        
      let orderdeliverdcount=0;
      await product_helpers.getthecountofstatus('Deliverd').then((response)=>{
        console.log(response[0].count);
        orderdeliverdcount=response[0].count
      }).catch(()=>{
        orderdeliverdcount=0
      })


    // let orderplacedcount;
    // await product_helpers.getthecountoforderplaced().then(async(data)=>{
    //   orderplacedcount=data;
    // }).catch((err)=>{
    //   orderplacedcount=0;
    // })
    // let orderpackedcount;
    // await product_helpers.getthecountoforderpacked().then((Packed)=>{
    //      orderpackedcount=Packed
    // }).catch((err)=>{
    //   orderpackedcount=0;
    // })
   
    //  let ordershipped=await product_helpers.getthecountofordershipped()
    //  let orderdeliverd=await product_helpers.getthecountoforderdeliverd()

     let monthlysalesrevenue =await product_helpers.gett()
     let yearlysalesrevenue=await Producthelper.getyearlysalesrevenue()
    let lastdaysale =await product_helpers.getlastdayssale()

    // let todaysale= lastdaysale[4].sales
    userHelpers.getallusers().then((users) => {
      let count=users.length;
   
      res.render("adminhome", { admin: true,orders,orderplacedcount,orderpackedcount,ordershippedcount,orderdeliverdcount, dashboardActive:true, count,totalsales,monthlysalesrevenue,yearlysalesrevenue,lastdaysale});
    });
  } else {
    res.redirect("/admin/");
  }
});

router.post("/gotoadminhome", (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  let admindata = ({ username, password } = req.body);
  console.log(admindata);
  if (username == adminname && password == prepass) {
    req.session.admin = admindata;
    req.session.loggedIn = true;

    res.redirect("/admin/adminhome");
  } else {
    res.redirect("/admin/");
  }
});

router.get("/userblock/:id", (req, res) => {
  console.log(req.params.id);
  userHelpers.blockuser(req.params.id).then(() => {
    console.log(req.params.id);
    req.session.BError = true;
    req.session.user = null;
    res.redirect("/admin/adminhome");
  });
});

router.get("/userunblock/:id", (req, res) => {
  userHelpers.unblockuser(req.params.id).then(() => {
    res.redirect("/admin/adminhome");
  });
});

router.get("/productdetails", async (req, res) => {
// let product= product_helpers.gettheproduct(proid)


const perPage = 4;
let pageNum;
let skip;
let productCount;
let pages;
pageNum = parseInt(req.query.page);
console.log(typeof (pageNum))
skip = (pageNum - 1) * perPage
await product_helpers.getProductCount().then((count) => {
  productCount = count;
}).catch((count)=>{
  productcount = count
})

pages = Math.ceil(productCount / perPage)

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

let data=await product_helpers.getPaginatedProducts(skip, perPage)

  product_helpers.getallproducts().then(() => {
    res.render("admin/products", { admin: true,productActive:true, data, datatotalDoc: productCount, currentPage: pageNum, pages: pages });
  });
});

router.get("/addproducts", (req, res) => {
  product_helpers.getallcategorylist().then((data) => {
    res.render("admin/add_product", { admin: true, data });
  });
});

router.post("/addoneproduct",upload.fields([{name:'image1',maxCount: 1},{name:'image2',maxCount: 1}]), (req, res) => {
 console.log("907");
  req.body.price = parseInt(req.body.price);
  req.body.offerprice=parseInt(req.body.offerprice); 
  req.body.stock=parseInt(req.body.stock)
  req.body.image1=req.files.image1[0].filename
  req.body.image2=req.files.image2[0].filename
console.log("890");
  product_helpers.addproducts(req.body).then((id) => {
    res.redirect("/admin/productdetails");
    // let Image = req.files.image;
    // Image.mv("./public/product_images/" + id + ".jpg", (err, done) => {
    //   if (!err) {
    //     res.redirect("/admin/productdetails");
    //   } else {
        
    //   }
    // });
  });
});

router.post("/logoutadmin", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );

  res.clearCookie("preadmin");
  res.clearCookie("prepass");
  req.session.admin = null;
  req.session.loggedIn = false;
  res.redirect("/admin/");
});

router.post("/addcategory", (req, res) => {


  product_helpers
    .addnewcategory(req.body.category, req.body.description)
    .then(() => {
      res.redirect("/admin/addcategory");
    })
    .catch((exists) => {
      console.log(exists);
      req.session.categoryerr="exist"
      res.redirect("/admin/addcategory");
    });
});

router.get("/banner", (req, res) => {
  product_helpers.getallbanner().then((allbanners) => {
    res.render("admin/banner", { admin: true,bannerActive:true, allbanners });
  });
});

router.get("/addbanner", (req, res) => {
  res.render("admin/add-banner");
});

router.post("/addonebanner", (req, res) => {

  product_helpers.addbanner(req.body).then((id) => {
    let Bannerimage = req.files.bannerimage;
    Bannerimage.mv("./public/banner_image/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin/banner")
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/activatebanner/:id", (req, res) => {
  

  product_helpers.activate(req.params.id).then(() => {
 
    res.redirect("/admin/banner");
  });
});

router.get("/deactivatebanner/:id", (req, res) => {


  product_helpers.deactivate(req.params.id).then(() => {
   
    res.redirect("/admin/banner");
  });
});

router.get("/addcategory", (req, res) => {
  product_helpers.getallcategorylist().then((data) => {
    let categoryerr=req.session.categoryerr
    res.render("admin/add-category", { admin: true,categoryActive:true, data,categoryerr });
    req.session.categoryerr=null
  });
});

router.get("/orders",async(req,res)=>{
  let admin=req.session.admin
 
  const perPage = 6;
  let pageNum;
  let skip;
  let orderCount;
  let pages;
  pageNum = parseInt(req.query.page);
  console.log(typeof (pageNum))
  skip = (pageNum - 1) * perPage
  await product_helpers.getordercount().then((count) => {
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

  let orders=await product_helpers.getpaginatedorders(skip, perPage)
  if (admin){

    // let orders=await userHelpers.getallorderes()

    res.render('admin/orders',{orders,admin:true,totalDoc: orderCount, currentPage: pageNum, pages: pages})
  }else{
    res.redirect('/admin/')
  } 
  

})


router.get('/userdetails',async (req,res)=>{
   let admin=req.session.admin
    if(admin){
       await userHelpers.getallusers().then((users)=>{
        res.render('admin/userdetails', {admin:true,users} )
      })
     
      
    }
else{
  res.redirect('/admin/')
}
    
})

router.get("/coupenmanagement",async(req,res)=>{

  let coupens=await product_helpers.allcoupens()

  res.render("admin/coupen-manage",{admin:true,coupens})
})


router.post('/addcoupen',(req,res)=>{
  
  product_helpers.addcoupen(req.body).then((response)=>{
    req.session.coupens=response
    res.redirect('/admin/coupenmanagement')
  })



})


router.get('/offermanagement',async(req,res)=>{
 let Data=await product_helpers.getallcategorylist()

 let categoryoffers= await product_helpers.getallcategoryoffer()
 let productoffers=await product_helpers.getallProductoffers()
 let  products=await product_helpers.getallproducts()

  res.render('admin/offermanagement',{admin:true ,Data,categoryoffers,productoffers,products})
})

// addnew category offer 

router.post('/addnewcategoryoffer',(req,res)=>{
  product_helpers.addnewofferforcategory (req.body).then(async (response)=>{
    // product_helpers.applycategoryoffer()
    res.json(response)
  })
  
})


router.post('/addnewproductoffer',(req,res)=>{
console.log(req.body);
  product_helpers.addproductoffer(req.body).then((response)=>{
    
    res.json(response)
  }).catch((response)=>{
    res.json(response)

  })

})


router.post('/changeoffer',async (req,res)=>{

  let product= await product_helpers.gettheproduct(req.body.proid)
  let selectedoffer= await product_helpers.getthespecificoffer(req.body.status)

  product_helpers.applyingnewproductoffer(product,selectedoffer).then((response)=>{
    res.json(response)
  })

})



router.post('/deletefromproductoffers',(req,res)=>{
  product_helpers.deletefromproductoffers(req.body.offerid).then((response)=>{
    res.json(response)
  })
})


router.post('/deleteproductdetails',(req,res)=>{

  product_helpers.deleteproductdetails(req.body.proid).then((response)=>{
    res.json(response)
  })
  
})

router.get('/editproductdetails/:id',upload.fields([{name:'image1',maxCount: 1},{name:'image2',maxCount: 1}]),async(req,res)=>{



  let product=await product_helpers.gettheproduct(req.params.id)  

res.render('admin/editprodetails',{admin:true,product})

})

router.post('/savechanges/:id',upload.fields([{name:'image1',maxCount: 1},{name:'image2',maxCount: 1}]),async(req,res)=>{
  console.log(req.files);
  if(req.files.image1==null){
    Image1=await product_helpers.fetchImage1(req.params.id)
  }else{
    Image1=req.files.image1[0].filename
  }
  
  if(req.files.image2==null){
    Image2=await product_helpers.fetchImage2(req.params.id)
  }else{
    Image2=req.files.image2[0].filename 
  }
  
  req.body.image1=Image1
  req.body.image2=Image2

  console.log( req.body.image1);
  console.log( req.body.image2);

Producthelper.editandsaveprodetails(req.body,req.params.id).then((response)=>{

  res.redirect('/admin/productdetails')
})
// let id=req.body._id
// if(req.files.image){
//   let Image = req.files.image;
//   Image.mv("./public/product_images/" + id + ".jpg") 
//   }
})




// deletebannr


router.post('/deletebanner',(req,res)=>{

product_helpers.deletebanner(req.body.bannerid).then((response)=>{
  res.json(response)
})
})




// delete category


router.post('/deletecategory',async (req,res)=>{
 await product_helpers.finddeletedcategory(req.body.catid).then((response)=>{
    product_helpers.deletecategoryproducts(response.category)
    product_helpers.deletecategory(req.body.catid).then((response)=>{
      res.json(response)
    })

  })
})


router.get('/editcoupendetails/:id',async (req,res)=>{
  console.log(req.params.id,"908");
  let coupen=await userHelpers.coupenfinder(req.params.id)
  
  res.render('admin/editcoupen',{admin:true,coupen})
})

router.post('/savechangescoupen',(req,res)=>{
  console.log(req.body,"98967");
  product_helpers.savechangedcoupen(req.body).then((response)=>{
    res.redirect('/admin/coupenmanagement')
  })
})


// deletecoupen

router.post('/deletecoupen',(req,res)=>{
  console.log(req.body);
  product_helpers.deletecoupen(req.body.coupenid).then(()=>{
    res.json({status:true})
  })
})


module.exports = router;
