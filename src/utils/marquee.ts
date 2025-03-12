import gsap from 'gsap';

export const initMarquee = (selector: string) => {
  console.log(`Initializing marquee for: ${selector}`);

  const marquee = document.querySelector(selector) as HTMLElement;
  if (!marquee) {
    console.warn(`Marquee element not found for selector: ${selector}`);
    return;
  }

  const duration = parseInt(marquee.getAttribute('duration') || '5', 10);
  console.log(`Marquee duration: ${duration}s`);

  const marqueeContent = marquee.firstElementChild as HTMLElement;
  if (!marqueeContent) {
    console.warn('No content found inside marquee.');
    return;
  }

  const marqueeContentClone = marqueeContent.cloneNode(true) as HTMLElement;
  marquee.append(marqueeContentClone);

  let tween: gsap.core.Tween;

  const playMarquee = () => {
    console.log('Running playMarquee function...');

    // Ensure width is properly retrieved
    requestAnimationFrame(() => {
      const width = marqueeContent.offsetWidth;
      if (!width) {
        console.warn('Marquee content width is 0, retrying...');
        requestAnimationFrame(playMarquee);
        return;
      }

      const gap = parseInt(getComputedStyle(marqueeContent).getPropertyValue('column-gap')) || 0;
      const distanceToTranslate = -1 * (gap + width);
      console.log(`Width: ${width}px, Gap: ${gap}px, Distance: ${distanceToTranslate}px`);

      // Kill previous animation
      if (tween) {
        tween.progress(0).kill();
      }

      // Start animation
      tween = gsap.fromTo(
        marquee.children,
        { x: 0 },
        { x: distanceToTranslate, duration, ease: 'none', repeat: -1 }
      );
    });
  };

  playMarquee();

  // Debounce function to prevent excessive calls during resize
  const debounce = (func: () => void, delay = 500) => {
    let timer: number;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func();
      }, delay);
    };
  };

  window.addEventListener('resize', debounce(playMarquee));
};
