import 'swiper/css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import SplitType from 'split-type';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

import { initMarquee } from './utils/marquee';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Utility function to create text blur animation without SplitText plugin
const text = new SplitType('.hero_title', { types: 'words, chars' });

// Utility function for scroll triggered animations
const createScrollTriggerAnimation = (selector, options = {}) => {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  elements.forEach((element) => {
    const animationName = element.getAttribute('data-motion') || 'fadeIn';
    const duration = parseFloat(element.getAttribute('data-duration') || 0.8);
    const stagger = parseFloat(element.getAttribute('data-stagger') || 0.1);

    let animation;

    switch (animationName) {
      case 'slideUp':
        animation = {
          y: 24,
          opacity: 0,
          duration,
          ease: 'power2.out',
        };
        break;
      case 'fadeIn':
      default:
        animation = {
          opacity: 0,
          duration,
          ease: 'power2.out',
        };
        break;
    }

    // Check if targeting children elements
    const childSelector = element.getAttribute('data-child-selector');
    const targets = childSelector ? element.querySelectorAll(childSelector) : element;

    // Add stagger if targeting multiple elements
    if (childSelector && element.querySelectorAll(childSelector).length > 1) {
      animation.stagger = stagger;
    }

    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        // Use from instead of fromTo
        gsap.from(targets, {
          opacity: animation.opacity,
          y: animation.y || 0,
          duration: animation.duration,
          ease: animation.ease,
          stagger: animation.stagger,
          clearProps: 'all', // Important: clear properties when animation completes
        });
      },
    });
  });
};

// Function to initialize list animations with stagger
const initListAnimations = (options = {}) => {
  // Default options
  const defaults = {
    y: 30, // Initial y-offset
    duration: 0.8, // Animation duration
    stagger: 0.1, // Time between each item's animation
    ease: 'power3.out', // Animation easing
    startPosition: '80%', // ScrollTrigger start position
    delay: 0, // Delay before animation starts
    from: 'bottom', // Direction ('bottom', 'top', 'left', 'right')
  };

  // Merge defaults with provided options
  const settings = { ...defaults, ...options };

  // Select all list components
  const listComponents = document.querySelectorAll('[data-component="list"]');

  if (!listComponents.length) return;

  listComponents.forEach((listComponent) => {
    // Get component-specific settings from data attributes
    const componentStagger =
      parseFloat(listComponent.getAttribute('data-stagger')) || settings.stagger;
    const componentDuration =
      parseFloat(listComponent.getAttribute('data-duration')) || settings.duration;
    const componentFrom = listComponent.getAttribute('data-from') || settings.from;

    // Select all li elements
    const listItems = listComponent.querySelectorAll('[data-component="list-item"]');

    if (!listItems.length) return;

    // Initial props based on direction
    const initialProps = { opacity: 0 };

    switch (componentFrom) {
      case 'bottom':
        initialProps.y = settings.y;
        break;
      case 'top':
        initialProps.y = -settings.y;
        break;
      case 'left':
        initialProps.x = -settings.y; // Reusing y value for consistency
        break;
      case 'right':
        initialProps.x = settings.y; // Reusing y value for consistency
        break;
    }

    // Create ScrollTrigger
    ScrollTrigger.create({
      trigger: listComponent,
      start: `top ${settings.startPosition}`,
      once: true,
      onEnter: () => {
        // Use from instead of set/to pattern
        gsap.from(listItems, {
          ...initialProps,
          duration: componentDuration,
          stagger: componentStagger,
          ease: settings.ease,
          delay: settings.delay,
          clearProps: 'all', // Important: clear properties when animation completes
        });
      },
    });
  });
};

// Initial page load animations
const initPageLoadAnimations = () => {
  const pageWrapper = document.querySelector('.page-wrapper');
  if (!pageWrapper) return;

  // Master timeline for intro animations
  const masterTl = gsap.timeline({
    onComplete: () => {
      // Initialize scroll animations after intro is complete
      initScrollAnimations();

      // FIX: Explicitly set navbar opacity to 1 after all intro animations
      gsap.set('.navbar.w-nav', { opacity: 1, clearProps: 'transform' });
    },
  });

  // Initial page reveal
  masterTl.to('.page-wrapper', {
    visibility: 'visible',
    duration: 0.1,
  });

  // Hero background animation - fromTo is necessary here due to complex starting state
  masterTl.fromTo(
    '.hero_bg-wrap',
    {
      rotation: 45,
      scale: 0.01,
      opacity: 0.075,
    },
    {
      rotation: 0,
      scale: 1,
      opacity: 0.015,
      duration: 1.2,
      ease: 'power2.inOut',
      clearProps: 'opacity', // Clear only opacity to prevent unwanted behavior
    },
    0.5
  );

  // Hero title with text blur
  masterTl.from(
    text.words,
    {
      filter: 'blur(10px)',
      opacity: 0,
      x: 20,
      y: 10,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
    },
    1.8
  );
  // Hero content animation - Use from instead of fromTo
  masterTl.from(
    '.hero_content',
    {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      clearProps: 'all',
    },
    2.5
  );

  // Hero reel animation - Use from instead of fromTo
  // Modified to better isolate the animation and prevent conflicts
  masterTl.from(
    '.hero_reel',
    {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'opacity,y',
    },
    2.8
  );

  // Hero logos animation - Use from instead of fromTo
  masterTl.from(
    '.hero_logos',
    {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'all',
    },
    3.2
  );

  // FIX: Add a specific override to prevent navbar opacity issues at the end of all animations
  masterTl.call(() => {
    gsap.set('.navbar.w-nav', { opacity: 1 });
  });
};

// Scroll triggered animations
const initScrollAnimations = () => {
  // Hero reel expansion on scroll - reimplemented on a separate timeline
  // to prevent conflicts with navbar animations
  const heroReelElement = document.querySelector('.hero_reel');
  const reelWrapElement = document.querySelector('.reel_wrap');

  if (heroReelElement && reelWrapElement) {
    // FIX: Force navbar opacity to 1 before creating any ScrollTrigger
    gsap.set('.navbar.w-nav', { opacity: 1 });

    // Create a dedicated timeline that's controlled by ScrollTrigger
    // This isolates these animations from affecting other elements
    const reelTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero_reel',
        start: 'top 40%',
        end: '+=300',
        scrub: 0.3,
        onEnter: () => {
          // FIX: Force navbar opacity to 1
          gsap.set('.navbar.w-nav', { opacity: 1 });
        },
        onLeave: () => {
          // FIX: Ensure navbar opacity stays at 1
          gsap.set('.navbar.w-nav', { opacity: 1 });
        },
        onEnterBack: () => {
          // FIX: Also handle scrolling back up
          gsap.set('.navbar.w-nav', { opacity: 1 });
        },
        onUpdate: (self) => {
          // FIX: Continuously ensure navbar opacity is 1 during scroll
          if (self.isActive) {
            gsap.set('.navbar.w-nav', { opacity: 1 });
          }
        },
      },
    });

    // Store initial values to prevent conflicts
    const initialWidth = window.getComputedStyle(heroReelElement).width;
    const initialPadding = window.getComputedStyle(reelWrapElement).padding;

    // Add animations to the isolated timeline
    reelTimeline
      .to(
        heroReelElement,
        {
          width: '100%', // Target end value
          ease: 'power1.inOut',
          // Using a specific ID helps GSAP manage this animation separately
          id: 'reelWidthAnimation',
        },
        0
      )
      .to(
        reelWrapElement,
        {
          padding: '0rem',
          ease: 'power1.inOut',
          // Using a specific ID helps GSAP manage this animation separately
          id: 'reelPaddingAnimation',
        },
        0
      );
  }

  // Initialize all elements with data attributes for scroll animations
  createScrollTriggerAnimation('[data-motion]');

  // Initialize list animations
  initListAnimations();

  // Footer animations

  ScrollTrigger.create({
    trigger: 'footer',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      // Footer type animation - Use from instead of fromTo
      gsap.from('.footer_type', {
        y: '100%',
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
      });

      // Footer logo animation - Use from instead of fromTo
      gsap.from('.footer_logo', {
        y: '100%',
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        clearProps: 'opacity',
      });

      // Footer menu items animation - Use from instead of fromTo
      gsap.from('.footer_menu .footer_item .footer_link', {
        y: '100%',
        opacity: 0,
        stagger: 0.3,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all',
      });
    },
  });

  // FIX: Add a global ScrollTrigger listener to maintain navbar opacity
  ScrollTrigger.addEventListener('refresh', () => {
    gsap.set('.navbar.w-nav', { opacity: 1 });
  });
};

const handleTabClick = (event) => {
  const tabMenu = event.currentTarget;
  const tabList = tabMenu.querySelector('.work_tab-list');

  if (!tabList) return;

  // Check if the tab has the class 'w--current'
  if (tabMenu.classList.contains('w--current')) {
    gsap.set(tabList, { visibility: 'visible', display: 'flex' });

    gsap.fromTo(
      tabList.children,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
  } else {
    gsap.set(tabList, { visibility: 'hidden', display: 'none' });
  }
};

// Add event listener to all .work_tab-menu elements
document.querySelectorAll('.work_tab-menu').forEach((tab) => {
  // Create a MutationObserver to watch for class changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        handleTabClick({ currentTarget: tab });
      }
    });
  });

  // Start observing the tab element for class changes
  observer.observe(tab, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
  // FIX: Set navbar opacity to 1 on page load
  gsap.set('.navbar.w-nav', { opacity: 1 });

  // Initialize marquee if present
  const marqueeElement = document.querySelector('[wb-data="marquee"]');
  if (marqueeElement) {
    initMarquee('[wb-data="marquee"]');
  } else {
    console.warn('No marquee element found on page load.');
  }

  // Hide page-wrapper by default
  const pageWrapper = document.querySelector('.page-wrapper');
  if (pageWrapper) {
    gsap.set(pageWrapper, { visibility: 'hidden' });
  }

  // Wait for images and resources to load
  window.addEventListener('load', () => {
    // FIX: Ensure navbar opacity is 1 after load
    gsap.set('.navbar.w-nav', { opacity: 1 });

    // Initialize Swiper
    const swiper = new Swiper('.swiper', {
      modules: [Pagination],
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        bulletClass: 'bullet',
        bulletActiveClass: 'cc-active',
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    });

    // Start initial animations
    initPageLoadAnimations();
  });

  // FIX: Add a window scroll event listener as a final failsafe
  window.addEventListener(
    'scroll',
    () => {
      // Ensure navbar opacity is always 1 during scroll
      gsap.set('.navbar.w-nav', { opacity: 1 });
    },
    { passive: true }
  );
});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.ft-review_media');
  const image = container.querySelector('.ft-review_img');

  container.addEventListener('mousemove', (event) => {
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5; // Normalize (-0.5 to 0.5)
    const y = (event.clientY - top) / height - 0.5;

    gsap.to(image, {
      rotationY: x * 15, // Rotate left/right
      rotationX: -y * 15, // Rotate up/down
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  container.addEventListener('mouseleave', () => {
    gsap.to(image, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const footerImages = document.querySelectorAll('.footer_image');

  const moveImages = (event) => {
    const { innerWidth, innerHeight } = window;
    const xMovement = (event.clientX / innerWidth - 0.5) * 10; // Move 5% left/right
    const yMovement = (event.clientY / innerHeight - 0.5) * 10; // Move 2.5% up/down

    footerImages.forEach((image) => {
      gsap.to(image, {
        xPercent: xMovement,
        yPercent: yMovement,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  };

  // Attach the mousemove event to the window
  window.addEventListener('mousemove', moveImages);
});
