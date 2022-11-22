var db = require("../config/connection");
var collection = require("../config/collections");
const collections = require("../config/collections");
var objectid = require("objectid");
const { data } = require("jquery");
const { request, response } = require("express");

module.exports = {
  addproducts: (products) => {
    console.log(products);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection("product")
        .insertOne(products)
        .then((data) => {
          resolve(data.insertedId);
          console.log(data.insertedId);
        });
    });
  },
  getallproducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find({isdelete:{$ne:true}})
        .toArray();
     
      resolve(products);
    });
  },

  getthenewarrival: () => {
    return new Promise(async (resolve, reject) => {
      let newarrival = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find({stock:{$gte:1}})
        .sort({ _id: -1 })
        .limit(4)
        .toArray();

      resolve(newarrival);
    });
  },
  getlowprice: () => {
    return new Promise(async (resolve, reject) => {
      let lowprice = db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find()
        .sort({ price: -1 })
        .limit(1)
        .toArray();
      resolve(lowprice);
    });
  },

  getallcatogory: () => {
    return new Promise(async (resolve, reject) => {
      let catogories = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .distinct("catogory");
      resolve(catogories);
      console.log(catogories);
    });
  },
  gettheproduct: (proid) => {
    console.log("from helper" + proid);

    return new Promise(async (resolve, reject) => {
      let productdetails = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .findOne({ _id: objectid(proid) });

      resolve(productdetails);
    });
  },

  addnewcategory: (catname, description) => {
    return new Promise(async (resolve, reject) => {
      let categoryexist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTIONS)
        .findOne({ category: catname });
      if (categoryexist) {
        reject("catogory already exist");
      } else {
        db.get()
          .collection(collection.CATEGORY_COLLECTIONS)
          .insertOne({ category: catname, description: description });
        resolve();
      }
    });
  },

  getallcategorylist: () => {
    return new Promise(async (resolve, reject) => {
      let categorylist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTIONS)
        .find()
        .toArray();
      resolve(categorylist);
    });
  },
  selectedcategory: (categoryname) => {
    console.log(categoryname + "helper");
    return new Promise(async (resolve, reject) => {
      let categoryproduct = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find({ catogory: categoryname })
        .toArray();

      resolve(categoryproduct);
      console.log(categoryproduct);
    });
  },

  addbanner: (bannerdetail) => {
    console.log();
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .insertOne(bannerdetail)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  getallbanner: () => {
    return new Promise(async (resolve, reject) => {
      let allbanners = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(allbanners);
    });
  },

  activate: (userid) => {
    console.log("hlo" + userid);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .updateOne({ _id: objectid(userid) }, { $set: { isactivate: true } });
      resolve();
    });
  },
  deactivate: (userid) => {
    console.log("hlo" + userid);

    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .updateOne({ _id: objectid(userid) }, { $set: { isactivate: false } });
      resolve();
    });
  },

  isactive: () => {
    console.log("akath keri");
    return new Promise(async (resolve, reject) => {
      console.log("hlo");
      let active = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find({ isactivate: true })
        .toArray();
      if (active) {
     
        resolve(active);
      } else {
        let err = "it is not active";
        reject(err);
      }
    });
  },
  getsumofallorders: () => {
    return new Promise(async (resolve, reject) => {
      totalsales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([{ $group: { _id: {}, total: { $sum: "$price" } } }])
        .toArray();
      resolve(totalsales[0].total);
    });
  },
  
  // getthecountoforderplaced: () => {
  //   console.log("hlo");
  //   return new Promise(async (resolve, reject) => {
  //     let orderplaced = await db
  //       .get()
  //       .collection(collection.ORDER_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { status: "placed" },
  //         },
  //         {
  //           $group: {
  //             _id: { month1: { $month: { $toDate: "$formatted" } } },
  //             count: { $sum: 1 },
  //           },
          
  //         },
  //         {
  //           $sort:{month1:1}
  //         },
  //       ]).toArray();
        

  //       console.log(orderplaced,"6787");
  //        resolve(orderplaced);

  //   });
  // },
    
  // getthecountoforderpacked: () => {
  //   console.log("hlo");
  //   return new Promise(async (resolve, reject) => {
  //     let orderpacked = await db
  //       .get()
  //       .collection(collection.ORDER_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { status: "Packed" },
  //         },
  //         {
  //           $group: {
  //             _id: { month1: { $month: { $toDate: "$formatted" } } },
  //             count: { $sum: 1 },
  //           },
  //         },
  //       ])
  //       sort({_id:-1}).toArray();
  //       console.log(orderpacked,"Orderpacked");

  //     resolve(orderpacked);
  //     reject()
  //   });
  // },
  // getthecountofordershipped: () => {
  //   console.log("hlo");
  //   return new Promise(async (resolve, reject) => {
  //     let ordershipped = await db
  //       .get()
  //       .collection(collection.ORDER_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { status: "Shipped" },
  //         },
  //         {
  //           $group: {
  //             _id: { month1: { $month: { $toDate: "$formatted" } } },
  //             count: { $sum: 1 },
  //           },
  //         },
  //       ])
  //       .toArray();

  //     resolve(ordershipped);
  //   });
  // },
  // getthecountoforderdeliverd: () => {
  //   console.log("hlo");
  //   return new Promise(async (resolve, reject) => {
  //     let orderdeliverd = await db
  //       .get()
  //       .collection(collection.ORDER_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { status: "Deliverd" },
  //         },
  //         {
  //           $group: {
  //             _id: { month1: { $month: { $toDate: "$formatted" } } },
  //             count: { $sum: 1 },
  //           },
  //         },
  //       ])
  //       .toArray();
  //     //  let i=orderdeliverd.length()
  //     resolve(orderdeliverd);
  //   });
  // },
  getthecountofstatus:(statustocheck)=>{
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match:{status:statustocheck}
          },
          {
            $group:{
              _id:{month1:{$month:{$toDate:"$formatted"}}},
              count:{$sum:1}
            }
          }

      ]).sort({_id:-1}).toArray().then((response)=>{
        
        resolve(response)
        reject()
      })
    })
  } ,


 



  gett: () => {
    console.log("678");
    return new Promise(async (resolve, reject) => {
      let monthNumber = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {},
          },
          {
            $group: {
              _id: { month: { $month: { $toDate: "$formatted" } } },
              total: { $sum: "$price" },
            },
          },
          {
            $sort: { _id: 1 },
          },
          {
            $project: { _id: 0, month: "$_id.month", total: 1 },
          },
        ])
        .toArray();

      // let monNumArray=[]
      monthNumber.forEach((element) => {
        //  monNumArray.push(element.month)
        //element.month="hai"

        function toMonthName(monthNumber) {
          const date = new Date();
          date.setMonth(monthNumber - 1);

          return date.toLocaleString("en-US", {
            month: "long",
          });
        }
        element.month = toMonthName(element.month);
      });
      // let salesarray=[monthNumber[0].total,monthNumber[1].total,monthNumber[2].total,monthNumber[3].total,monthNumber[4].total]

      

      resolve(monthNumber);
    });
  },

getyearlysalesrevenue:()=>{
    console.log("679");
      return new Promise(async(resolve,reject)=>{
        let yearlysalesrevenue= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
               $match:{}
            },{
               $group:{
                _id: { year: { $year: { $toDate: "$formatted" } } },
                total: { $sum: "$price" },
               }
            },
           {
            $project:{
                _id:0,year:"$_id.year",total:1
            }
           }
          ]).sort({year:1}).toArray()
          
          resolve(yearlysalesrevenue)
      }) 
},


getlastdayssale:()=>{
    return new Promise(async(resolve,reject)=>{
        let lastdays= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{}
            },
            {
                $group:{
                    _id:{day:{$dayOfMonth:{$toDate:"$formatted"}}},sales:{$sum:"$price"}
                }
            },
            {
                $project:{
                    _id:0,day:"$_id.day",sales:1
                }
            }
        ]).limit(10).sort({day:1}).toArray()
        
        resolve(lastdays)
    })
},



// coupen collection

addcoupen:(data)=>{
return new Promise(async(resolve,reject)=>{

db.get().collection(collection.COUPEN_COLLECTION).insertOne(data).then(()=>{
 
  resolve("coupen added successfully")
 
})


})


},

allcoupens:()=>{
  return new Promise(async(resolve,reject)=>{
   await db.get().collection(collection.COUPEN_COLLECTION).find().toArray().then((response)=>{
      resolve(response)
    })
  })

},
addnewofferforcategory:(data)=>{
  

console.log(data,"dat45");

  return new Promise(async(resolve,reject)=>{
     let offerexist= await db.get().collection(collection.OFFER_COLLECTION).findOne({category:data.category}) 
     
     if (offerexist){
      
    await db.get().collection(collection.OFFER_COLLECTION).updateOne({category:data.category},{$set:data}).then(async ()=>{

      let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({catogory:data.category}).toArray()
     
         console.log(products);
         for(let i=0;i<products.length;i++){
          let proid=products[i]._id
         let newofferprice= parseInt(products[i].price-(products[i].price*data.offer/100))
          console.log(newofferprice,"90877");

          await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectid(proid)},
            {
              $set:{offerprice:newofferprice,currentoffer:data.Offername}
            })
         }

//       ])
      resolve({success:true})
    })

     }else{

      await db.get().collection(collection.OFFER_COLLECTION).insertOne(data).then(async ()=>{

        let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({catogory:data.category}).toArray()
       
           console.log(products);
           for(let i=0;i<products.length;i++){
            let proid=products[i]._id
           let newofferprice= parseInt(products[i].price-(products[i].price*data.offer/100))
            console.log(newofferprice,"90877");
  
            await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectid(proid)},
              {
                $set:{offerprice:newofferprice,currentoffer:data.Offername}
              })
           }
  
  //       ])
        resolve({success:true})
      })
     }



  })
},
getallcategoryoffer:()=>{

  return new Promise(async(resolve,reject)=>{
    let alloffers=db.get().collection(collection.OFFER_COLLECTION).find({"offer-Type":"Category Offer"}).toArray()
        resolve(alloffers)
  
  })
  
},
addproductoffer:(data)=>{
return new Promise(async(resolve,reject)=>{
   let offerexist=await db.get().collection(collection.OFFER_COLLECTION).findOne({Offername:data.Offername})
   if(offerexist){
    console.log("909");
    response.offeradded=false
    reject(response)
   }else{
    console.log("876");
    db.get().collection(collection.OFFER_COLLECTION).insertOne(data)
    response.offeradded=true
    resolve(response)
   }
  
})
},
getallProductoffers:()=>{

  return new Promise(async(resolve,reject)=>{
    let alloffers=db.get().collection(collection.OFFER_COLLECTION).find({"offer-Type":"product-type"}).toArray()
        resolve(alloffers)
  
  })
  
},
getthespecificoffer:(name)=>{
  return new Promise(async(resolve,reject)=>{
    let selectedoffer=await db.get().collection(collection.OFFER_COLLECTION).find({
      $and:[{"offer-Type":"product-type"},{Offername:name}]
    }).toArray()
    console.log(selectedoffer,"9080");
    resolve(selectedoffer)
  })
},
applyingnewproductoffer:(product,selectedoffer)=>{
     return new Promise(async(resolve,reject)=>{
      let newofferprice=parseInt(product.price-(product.price*(selectedoffer[0].offer/100)))
    console.log(newofferprice);
           
      await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:product._id},{
        $set:{offerprice:newofferprice,currentoffer:selectedoffer[0].Offername}
       })
       resolve("Product offer applied")


     })
},deletefromproductoffers:(offerid)=>{
  return new Promise(async(resolve,reject)=>{
db.get().collection(collection.OFFER_COLLECTION).deleteOne({_id:objectid(offerid)}).then(()=>{
  resolve("successfully deleted")
})

  })
},
// <...........................delete product details............................>
deleteproductdetails:(proid)=>{
  return new Promise(async(resolve,reject)=>{
    db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectid(proid)},{
      $set:{isdelete:true}
    }).then(()=>{
      resolve({set:true})
    })
  })

},

// <...........................Edit product details............................>
editandsaveprodetails:(data,userid)=>{
  console.log(data);
  console.log(data,"90890");
  return new Promise(async(resolve,reject)=>{
    console.log(data.image1);
    db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectid(userid)},{
      $set:{
        Name:data.Name,
        price:data.price,
        description:data.description,
        stock:data.stock,
        offerprice:data.offerprice,
        catogory:data.catogory,
        image1:data.image1,
        image2:data.image2

      }
    }).then(()=>{
      resolve("success")
    })
  })
},

// <...........................delete banner details............................>
deletebanner:(bannerid)=>{
  return new Promise(async(resolve,reject)=>{
    db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectid(bannerid)})
    resolve({delete:true})
  })
},

// <...........................delete banner details............................>

finddeletedcategory:(catid)=>{
  return new Promise(async(resolve,response)=>{
    let category=await db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({_id:objectid(catid)})
     console.log(category,"9976");
    resolve(category)
  })

}
,
deletecategoryproducts:(Name)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(Name);
    await db.get().collection(collection.PRODUCT_COLLECTIONS).deleteMany({catogory:Name}).then(async (response)=>{
      console.log(response);
    
    })
  })
},
deletecategory:(catid)=>{
  return new Promise(async(resolve,reject)=>{
    await db.get().collection(collection.CATEGORY_COLLECTIONS).deleteOne({_id:objectid(catid)}).then((response)=>{
      resolve(response)
    })
  })

},

getProductCount: () => {
  return new Promise(async (resolve, reject) => {
      let count = await db.get().collection(collection.PRODUCT_COLLECTIONS).countDocuments()
      resolve(count)
      reject(count=0)
       })
    },
getPaginatedProducts: (skip, limit) => {
  return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().skip(skip).limit(limit).sort({_id:-1}).toArray()
      resolve(products)
       })
    },

getordercount:()=>{
  return new Promise(async(resolve,reject)=>{
    let count=await db.get().collection(collection.ORDER_COLLECTION).countDocuments()
    resolve(count)
  })
},getpaginatedorders:(skip,limit)=>{
  return new Promise(async(resolve,reject)=>{
    let orders=db.get().collection(collection.ORDER_COLLECTION).find().skip(skip).limit(limit).toArray()
    resolve(orders)
  })
},
getmyordercount:(userid)=>{
  return new Promise(async(resolve,reject)=>{
    let count=await db.get().collection(collection.ORDER_COLLECTION).find({userid:objectid(userid)}).count()
    console.log(count,"count");
    resolve(count)
    reject()

  })
},
savechangedcoupen:(data)=>{
console.log("980");
  return new Promise((resolve,reject)=>{

    db.get().collection(collection.COUPEN_COLLECTION).updateOne({_id:objectid(data.id)},{
      $set:{coupen:data.coupen,description:data.description,offer:data.offer,Min_Amount:data.Min_Amount}
    }).then((response)=>{
      console.log(response);
      resolve()
    })
  })
},
deletecoupen:(coupenid)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.COUPEN_COLLECTION).deleteOne({_id:objectid(coupenid)}).then((response)=>{
      resolve(response)
    })
  })
},
fetchImage1:(proid)=>{
  return new Promise(async(resolve,reject)=>{
    let detail=await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectid(proid)},{projection:{image1:true}})
    resolve(detail.image1)
  })
},
fetchImage2:(proid)=>{
  return new Promise(async(resolve,reject)=>{
    let detail=await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectid(proid)},{projection:{image2:true}})
    resolve(detail.image2)
  })
}


};



