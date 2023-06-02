const socket = io();


function addToCart(productId) {
    socket.emit("client:addToCart", productId )    
}

function deleteToCart(productId) {
    socket.emit("client:deleteToCart", productId )    
}