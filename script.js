// Girosto — static site interactions
(function(){
  const categories = [
    ["Rice","🌾"],["Mustard Oil","🫙"],["Cooking Oils","🥥"],["Lentils & Pulses","🫘"],
    ["Ground Spices","🌶️"],["Whole Spices","🧂"],["Sugar","🍬"],["Jaggery","🟤"],
    ["Homemade Pickles","🥒"],["Seeds","🌱"],["Hair & Skin Care","🌿"],["Dairy & Poultry","🥚"],
    ["Daily Needs","🛒"],["Girosto Special","✨"],["Honey","🍯"],["Dates & Dry Fruits","🌴"],
    ["Nuts","🥜"],["Herb Powders","🍵"],["Health Items","💚"],["Fresh Fruits","🍎"]
  ];
  const bestSellers = [
    {n:"Chinigura Aromatic Rice",p:"৳ 320 / kg",t:"Best Seller",e:"🌾"},
    {n:"Cold-Pressed Mustard Oil",p:"৳ 480 / L",t:"Traditional",e:"🫙"},
    {n:"Sundarban Wild Honey",p:"৳ 950 / 500g",t:"Wild Harvest",e:"🍯"},
    {n:"Red Masoor Dal",p:"৳ 180 / kg",t:"Pantry",e:"🫘"}
  ];
  const faqs = [
    ["Is organic food healthier than regular food?","Organic food may help reduce exposure to certain artificial additives and farming chemicals. Overall health also depends on food variety, portion size, and nutritional balance."],
    ["How can I identify genuine organic products?","Check the product label, ingredients, source information, packaging, and available certifications. Buying from a trusted organic food shop with transparent product information reduces risk."],
    ["Where can I buy organic food in Bangladesh?","You can purchase organic food from trusted physical stores, farms, and online shops. Girosto offers a convenient selection of organic groceries and daily essentials nationwide."],
    ["Why is organic food more expensive?","Organic products may cost more because of smaller production volumes, natural farming methods, careful processing, and higher quality-control requirements."],
    ["Does Girosto deliver across Bangladesh?","Girosto delivers within its available service areas across Bangladesh. Delivery time, cost, and product availability may vary depending on your location."]
  ];

  const catGrid = document.getElementById('categoryGrid');
  if (catGrid) {
    catGrid.innerHTML = categories.map(([name,emoji]) => `
      <div class="col">
        <a class="cat-card" href="#bestsellers" aria-label="Shop ${name}">
          <span class="cat-emoji" aria-hidden="true">${emoji}</span>
          <span class="fw-medium small">${name}</span>
        </a>
      </div>`).join('');
  }

  const bsGrid = document.getElementById('bestSellerGrid');
  if (bsGrid) {
    bsGrid.innerHTML = bestSellers.map(p => `
      <div class="col-sm-6 col-lg-3">
        <article class="product-card">
          <div class="product-media">
            <span aria-hidden="true">${p.e}</span>
            <span class="tag">${p.t}</span>
          </div>
          <div class="product-body">
            <h3>${p.n}</h3>
            <p class="price">${p.p}</p>
            <a href="https://wa.me/8801860963171?text=${encodeURIComponent('Hi Girosto, I would like to order: '+p.n)}" class="btn" rel="noopener">Order on WhatsApp</a>
          </div>
        </article>
      </div>`).join('');
  }

  const acc = document.getElementById('faqAcc');
  if (acc) {
    acc.innerHTML = faqs.map(([q,a],i)=>`
      <div class="accordion-item">
        <h3 class="accordion-header" id="fh${i}">
          <button class="accordion-button ${i===0?'':'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#fc${i}" aria-expanded="${i===0}" aria-controls="fc${i}">${q}</button>
        </h3>
        <div id="fc${i}" class="accordion-collapse collapse ${i===0?'show':''}" aria-labelledby="fh${i}" data-bs-parent="#faqAcc">
          <div class="accordion-body text-muted">${a}</div>
        </div>
      </div>`).join('');
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
