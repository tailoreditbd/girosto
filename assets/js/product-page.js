(function(){
  const select=document.getElementById("productVariant"),price=document.getElementById("productPrice"),button=document.getElementById("productAdd");
  if(!select||!price||!button)return;
  function sync(){const option=select.options[select.selectedIndex];if(!option){price.textContent="Currently unavailable";button.disabled=true;return}price.textContent=option.dataset.price?GirostoStore.money(option.dataset.price):"Currently unavailable";button.disabled=!option.dataset.price}
  const buy=document.getElementById("productBuy");
  if(buy)buy.addEventListener("click",function(){if(GirostoStore.add(button.dataset.productId,Number(select.value),Number(document.getElementById("productQty")?.value||1)))location.href="../../cart.html"});
  select.addEventListener("change",sync);sync();
})();


