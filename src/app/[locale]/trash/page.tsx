"use client"
import "./page.module.css"
import React, { useRef, useEffect } from 'react';

interface MagnifyProps {
  imgSrc: string;
  zoom: number;
  altText?: string;
  link?: string;
}

const Magnify: React.FC<MagnifyProps> = ({ imgSrc, zoom, altText = "Magnified Image", link }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const glass = glassRef.current;

    if (!img || !glass) return;

    glass.style.backgroundImage = `url('${img.src}')`;
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`;

    const bw = 3;
    const w = glass.offsetWidth / 2;
    const h = glass.offsetHeight / 2;

    const moveMagnifier = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const pos = getCursorPos(e, img);
      let x = pos.x;
      let y = pos.y;

      if (x > img.width - (w / zoom)) {
        x = img.width - (w / zoom);
      }
      if (x < w / zoom) {
        x = w / zoom;
      }
      if (y > img.height - (h / zoom)) {
        y = img.height - (h / zoom);
      }
      if (y < h / zoom) {
        y = h / zoom;
      }

      if(glass){
        glass.style.left = `${x - w}px`;
        glass.style.top = `${y - h}px`;
        glass.style.backgroundPosition = `-${(x * zoom) - w + bw}px -${(y * zoom) - h + bw}px`;
      }
    };

    const getCursorPos = (e: MouseEvent | TouchEvent, img: HTMLImageElement) => {
      let x = 0, y = 0;
      let clientX = 0;
      let clientY = 0;

      if (e instanceof MouseEvent) {
        clientX = e.pageX;
        clientY = e.pageY;
      } else if (e instanceof TouchEvent) {
        if(e.touches.length > 0) {
          clientX = e.touches[0].pageX;
          clientY = e.touches[0].pageY;
        }
      }

      const a = img.getBoundingClientRect();
      x = clientX - a.left - window.pageXOffset;
      y = clientY - a.top - window.pageYOffset;
      return { x, y };
    };

    if(glass && img){
      glass.addEventListener("mousemove", moveMagnifier);
      img.addEventListener("mousemove", moveMagnifier);
      glass.addEventListener("touchmove", moveMagnifier);
      img.addEventListener("touchmove", moveMagnifier);
    }

    return () => {
      if(glass && img){
        glass.removeEventListener("mousemove", moveMagnifier);
        img.removeEventListener("mousemove", moveMagnifier);
        glass.removeEventListener("touchmove", moveMagnifier);
        img.removeEventListener("touchmove", moveMagnifier);
      }
    };
  }, [imgSrc, zoom]);

  return (
    <div className="img-magnifier-container" style={{ display: 'inline-block' }}>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img ref={imgRef} src={"/media/products/embroidered_sheer_curtain_fabrics/1798T_G31.webp"} alt={altText} style={{ width: '115px', height: '133px' }} />
      </a>
      <div ref={glassRef} className="img-magnifier-glass" />
      <center><input type="checkbox" name="movieboxes" value="Logan" style={{ width: '15px', height: '15px', margin: '0px' }} /></center>
    </div>
  );
};

export default Magnify;