(function(){
  const input=document.getElementById("catalogFilter"),select=document.getElementById("catalogCategory"),cards=[...document.querySelectorAll("[data-product-card]")],count=document.getElementById("catalogCount");if(!input||!cards.length)return;
  function render(){const q=input.value.trim().toLocaleLowerCase(),category=select?.value||"";let visible=0;cards.forEach(card=>{const show=(!q||card.dataset.search.includes(q))&&(!category||card.dataset.category===category);card.hidden=!show;if(show)visible++});if(count)count.textContent=`${visible} product${visible===1?"":"s"}`}
  input.addEventListener("input",render);select?.addEventListener("change",render);render();
})();
