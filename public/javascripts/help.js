// ADDTO CCART

const { response } = require("express");

function addtocart(proid){
    console.log("jaijavan");
    $.ajax({
        url:'/addtocart/'+proid,
        method:'get',
        success:(response)=>{
            if(response){
             
              console.log("908");
                    let count=$('#cartcount').html()
                    count=parseInt(count)+1
                    $("#cartcount").html(count)
            }
            
        }
    })
}  
// CHANGE QUANTITY IN CART

function changeQuantity(cartid,proid,userid,count ){
  let quantity=parseInt(document.getElementById(proid).innerHTML)
count=parseInt(count)   
    $.ajax({
      url:'/change-product-quantity/',
      data:{
        cart:cartid,
        product:proid,
        count:count,
        quantity:quantity
      },
        method:'post',
      success:(response)=>{
        if(response.removeproduct){
          
          swal({
            title: " ALERT",
            text: "Product is being removed from cart",
            icon: "warning",
            button: "OK",
          });
          location.reload()
        }else if(response.stockerr){
          stockalert()
        }
        else{
          console.log(response);
          document.getElementById(proid).innerHTML=quantity+count
           document.getElementById('total').innerHTML=response.total
        }
  
      }
    })
  }
 
  function stockalert(){
    swal({
      title: "STOCK ALERT",
      text: "Product is out of stock",
      icon: "warning",
      button: "OK",
    });
  }
 

// DELTE PRODUCT FROM CART

  function deleteproduct(cartid,proid){
    console.log("vannu ");
    $.ajax({
      url:'/deleteproduct',
      data:{
        cart:cartid,
        product:proid
      },
      method:"post",
      success:(response)=>{
      
        location.reload()
      }

    })

  }

  // change status

function changestatus(orderid,status){
  let st=document.getElementById(orderid);
  let stat=st.options[st.selectedIndex].text
  $.ajax({
   url:"/update-order-status",
   data:{
    cartid:orderid,
    status:stat
   },
   method:"post",
   success:(response)=>{
  
    location.reload()
   }



  })
}

// add to wishlist

function ADDTOWISHLIST(proid){
  console.log("90");
  $.ajax({

    url:'/addtowishlist/'+proid,
    method:"get",
    success:(response)=>{
      if(response.status){
        swal("", "Product already exist in the wishlist", "info");
    
        
      }else{
        swal("", "Product Added To wishlist", "success");
    
      }
      
    }
  })

}


//swal function

function swalo(proid){
  addtocart(proid)
  swal({

title: "HURRAAAY..!",
text: "Product Added To Cart",
icon: "success",
button: "Aww yiss!",
});
}





function deletefromwishlist(proid){
  console.log('90');
  $.ajax({
    
    url:('/deletefromwishlist/'),
    data:{
      proid:proid
    },
    method:"post",
    success:(response)=>{
    
      swal("", "Product removed from Wishlist", "success");
      location.reload()
    }

  })
}



