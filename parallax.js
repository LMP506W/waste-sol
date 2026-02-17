window.addEventListener("scroll",()=>{
  const info=document.querySelector(".info-container");
  const scrollY=window.scrollY;
  info.style.transform=`translateZ(${scrollY*-0.1}px) translateY(${scrollY*-0.05}px)`;
});
