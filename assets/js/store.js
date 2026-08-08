(function(global){
  "use strict";
  const KEY="girosto-cart-v1";
  const ORDER_KEY="girosto-last-order-v1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(_){return[]}};
  const write=items=>{localStorage.setItem(KEY,JSON.stringify(items));updateCount();global.dispatchEvent(new CustomEvent("girosto:cart",{detail:items}))};
  const count=()=>read().reduce((sum,item)=>sum+Number(item.qty||0),0);
  const updateCount=()=>document.querySelectorAll("[data-cart-count]").forEach(node=>node.textContent=count());
  const money=value=>new Intl.NumberFormat("en-BD",{style:"currency",currency:"BDT",maximumFractionDigits:0}).format(Number(value||0)).replace("BDT","৳");
  const product=id=>(global.GIROSTO_CATALOG?.products||[]).find(item=>item.id===id);
  const availableVariant=item=>item?.variants.findIndex(variant=>variant.price!==null)??-1;
  const add=(id,variantIndex,qty=1)=>{
    const item=product(id);if(!item)return false;
    const index=Number.isInteger(Number(variantIndex))?Number(variantIndex):availableVariant(item);
    if(index<0||!item.variants[index]||item.variants[index].price===null)return false;
    const cart=read();const existing=cart.find(line=>line.id===id&&line.variantIndex===index);
    if(existing)existing.qty=Math.min(99,existing.qty+Math.max(1,Number(qty)||1));else cart.push({id,variantIndex:index,qty:Math.max(1,Number(qty)||1)});
    write(cart);toast(`${item.name} added to cart`);return true;
  };
  const remove=(id,variantIndex)=>write(read().filter(line=>!(line.id===id&&line.variantIndex===Number(variantIndex))));
  const quantity=(id,variantIndex,qty)=>{const cart=read(),line=cart.find(x=>x.id===id&&x.variantIndex===Number(variantIndex));if(!line)return;if(Number(qty)<=0)return remove(id,variantIndex);line.qty=Math.min(99,Math.max(1,Number(qty)||1));write(cart)};
  const clear=()=>write([]);
  const resolved=()=>read().map(line=>{const item=product(line.id),variant=item?.variants[line.variantIndex];return item&&variant?{...line,product:item,variant,lineTotal:variant.price*line.qty}:null}).filter(Boolean);
  const totals=(delivery=0)=>{const subtotal=resolved().reduce((sum,line)=>sum+line.lineTotal,0);return{subtotal,delivery:Number(delivery)||0,total:subtotal+(Number(delivery)||0)}};
  let toastTimer;function toast(message){let node=document.querySelector(".store-toast");if(!node){node=document.createElement("div");node.className="store-toast";node.setAttribute("role","status");document.body.appendChild(node)}node.textContent=message;node.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove("show"),2400)}
  document.addEventListener("click",event=>{const button=event.target.closest("[data-add-to-cart]");if(!button)return;event.preventDefault();const selectId=button.dataset.variantSelect;const qtyId=button.dataset.qtyInput;const variant=selectId?Number(document.getElementById(selectId)?.value):Number(button.dataset.variantIndex||0);const qty=qtyId?Number(document.getElementById(qtyId)?.value):1;add(button.dataset.productId,variant,qty)});
  document.addEventListener("DOMContentLoaded",updateCount);
  global.GirostoStore={KEY,ORDER_KEY,read,write,count,updateCount,money,product,availableVariant,add,remove,quantity,clear,resolved,totals,toast};
})(window);
