(function(){
  document.querySelectorAll('.current-year').forEach(function(node){node.textContent=new Date().getFullYear();});
})();
