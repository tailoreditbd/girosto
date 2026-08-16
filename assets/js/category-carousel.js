(()=>{
  document.querySelectorAll("[data-category-carousel]").forEach(carousel=>{
    const viewport=carousel.querySelector(".category-carousel-viewport");
    const track=carousel.querySelector(".category-grid");
    const previous=carousel.querySelector("[data-category-prev]");
    const next=carousel.querySelector("[data-category-next]");
    if(!viewport||!track||!previous||!next||track.children.length<2)return;
    const originals=[...track.children];
    originals.forEach(card=>{
      const clone=card.cloneNode(true);
      clone.setAttribute("aria-hidden","true");
      clone.tabIndex=-1;
      clone.querySelectorAll("a,button").forEach(control=>control.tabIndex=-1);
      track.appendChild(clone);
    });
    let cycleWidth=0,step=0,timer,paused=false;
    const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure=()=>{
      const first=track.children[0],duplicate=track.children[originals.length];
      cycleWidth=duplicate.offsetLeft-first.offsetLeft;
      step=first.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||0);
    };
    const normalize=()=>{if(cycleWidth&&viewport.scrollLeft>=cycleWidth)viewport.scrollLeft-=cycleWidth;};
    const move=direction=>{
      measure();
      if(direction<0&&viewport.scrollLeft<step)viewport.scrollLeft+=cycleWidth;
      viewport.scrollBy({left:direction*step,behavior:reducedMotion?"auto":"smooth"});
    };
    const stop=()=>{if(timer)clearInterval(timer);timer=undefined;};
    const start=()=>{stop();if(!reducedMotion&&!paused)timer=setInterval(()=>move(1),2800);};
    previous.addEventListener("click",()=>{move(-1);start();});
    next.addEventListener("click",()=>{move(1);start();});
    viewport.addEventListener("scroll",normalize,{passive:true});
    carousel.addEventListener("mouseenter",()=>{paused=true;stop();});
    carousel.addEventListener("mouseleave",()=>{paused=false;start();});
    carousel.addEventListener("focusin",()=>{paused=true;stop();});
    carousel.addEventListener("focusout",event=>{if(!carousel.contains(event.relatedTarget)){paused=false;start();}});
    document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
    addEventListener("resize",measure,{passive:true});
    measure();
    start();
  });
})();