$(document).ready(function() {
    $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
    $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});
    
    const baseUrl = "http://engros.kogs.websrv01.smartpage.dk/services/";
    $.ajaxSetup({ cache: false });
    const data = {
        "ApiKey": "",
        "UserName":"smart",
        "Password":"udviklertest",
        "ClientCustomerNo":"",
        "customerGuid":"",
        "LineIds": [],
        "ProductQuantities": [],
        "Order": null
    };





    if ($("#products")[0]) {

        GetAllProducts();

        $("#products").on("click","[data-product-id]", (e, elm)=>{
            let id = $(e.currentTarget).data("product-id");
            console.log(id);
           
            AddProductsToCart(id, 1);
            e.preventDefault();
        })
    }

    if ($("#cart")[0]) {
        GetCart();


        $("#cart").on("click", "[data-trash]", (e, elm) => {
            const id = $(e.currentTarget).parents("tr").data("line-id");
            console.log(id);
            RemoveLines([id]);
            e.preventDefault();
        })

        $("#cart").on("click", "[data-refresh]", (e, elm) => {
            const headerguid = $(e.currentTarget).parents("tr").data("header-guid");
            UpdateCart(headerguid);
            e.preventDefault();
        })


        $("#checkout").on("click", (e, elm) => {
            Checkout();
            e.preventDefault();
        })


        








    }








    // helper
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // api methods 

    function GetAllProducts() {
        $.ajax({
            url: baseUrl + 'getallproducts',
            type: "POST",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function(content) {
                $.each(content, function(index, obj) { 
                     if ((index % 3) === 0) {
                        $('#products').append(`<div class="col-xs-12 col-lg-12"></div>`)
                    }
                    $('#products').append(
                        `<div class="item  col-xs-4 col-lg-4">
                            <div class="thumbnail">
                                
                                <div class="caption">
                                    <h4 class="group inner list-group-item-heading">
                                        ${obj.ProductName}
                                    </h4>
                                    <p class="group inner list-group-item-text">
                                    ${obj.Description}  
                                    </p>
                                    <div class="row">
                                    <div class="col-xs-12 col-md-6">
                                        <p class="lead">
                                            kr. 244,00
                                        </p>
                                    </div>
                                    <div class="col-xs-12 col-md-6">
                                        <a class="btn btn-success pull-right" href="#" data-product-id="${obj.ProductGuid}" >Add to cart</a>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>`
                    );
                  
                });
            }
        })

    }


    function AddProductsToCart(id, quantity) {
        let newData = clone(data);
        newData.ProductQuantities = [{ "ProductId": id+"", "Quantity": quantity }]
        
        $.ajax({
            url: baseUrl + 'addproductstocart',
            type: "POST",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data:JSON.stringify(newData),
            success: function(content) {
                // gets OrderLines
                //
                alert("Product added to cart")
            }
        });
    }
    function AppendCartUi(content){
        $('#cart').find("tbody").html("");
        let total = 0;
        $.each(content.OrderLines, function(index, obj) { 
            total += obj.LineTotal;
            $('#cart').find("tbody").append(
            `<tr data-line-id="${obj.LineGuid}" data-header-guid="${obj.HeaderGuid}">
                <td data-th="Product">
                    <div class="row">
                        <div class="col-sm-2 hidden-xs"><img src="http://placehold.it/100x100" alt="..." class="img-responsive"/>
                        </div>
                        <div class="col-sm-10">
                            <h4 class="nomargin">${obj.ProductName}</h4>
                        </div>
                    </div>
                </td>
                <td data-th="Price">${obj.ListPrice.toFixed(2)}</td>
                <td data-th="Quantity">
                    <input type="number" class="form-control text-center" value="${obj.Quantity}">
                </td>
                <td data-th="Subtotal" class="text-center">kr ${obj.LineTotal.toFixed(2)}</td>
                <td class="actions" data-th="">
                    <button data-refresh class="btn btn-info btn-sm"><i class="fa fa-refresh"></i></button>
                    <button data-trash class="btn btn-danger btn-sm"  ><i class="fa fa-trash-o"></i></button>
                </td>
            </tr>`
        );
    });
    $('#cart').find("tfoot").find("strong").text("Total kr " + total.toFixed(2) );

    }

    function GetCart() {
        // gets OrderLines
        $.ajax({
            url: baseUrl + 'getcart',
            type: "POST",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function(content) {
                         AppendCartUi(content);
            }
        })
        // throw  arguments.callee.name + " not implemented";

    }

    function RemoveLines(ids) {

        console.log(ids)

        let newData = clone(data);
         newData.LineIds = ids
        // let item$ =  $("#cart").find(`[data-line-id='${id}']` )
        // item$.fadeOut()

        $.ajax({
                url: baseUrl + "removelines",
                type: "POST",
                dataType : "json",
                contentType: "application/json; charset=utf-8",
                data:  JSON.stringify(newData),
                success: function(content) {
                    AppendCartUi(content)
                    // gets OrderLines
                      //  $("#cart").find(`tbody tr [data-line-id]=${id}` )
                    }
                });
                
        // throw  arguments.callee.name + " not implemented";
                
    }
      




    

    function UpdateCart(HeaderGuid) {
        console.log(HeaderGuid)

         let OrderLines = [];
        $.each($('#cart').find("tbody tr"), function(index, obj) { 
            
            var tr = $(obj);
            var lineGuid = tr.data("line-id");
            let quantity =  $(obj).find("input")[0].value;
            console.log(quantity)
           if(quantity > 0){
                let newOrderLine = {"LineGuid":lineGuid, "Quantity": quantity  }
                OrderLines = [...OrderLines, newOrderLine]
           }
        })

        let newData = clone(data);
        
        newData.Order = {
            "HeaderGuid" : HeaderGuid,
            "OrderLines": OrderLines
        }
        
        console.log(newData)
       
        $.ajax({
            url: baseUrl + 'updatecart',
            type: "POST",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
           data: JSON.stringify(newData),
            success: function(content) {
                console.log("updatecart: " + content)

                AppendCartUi(content)
            }
        });
        // throw  arguments.callee.name + " not implemented";

    }
    
});
