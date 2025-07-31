function Slidezy(select, option = {}) {
  this.container = document.querySelector(select);
  if (!this.container) {
    console.error(`Slider: ${this.container} dont next`);
    return;
  }

  this.opt = Object.assign(
    {
      items: 1,
      speed: 300,
      loop: false,
      nav: true,
      control: true,
      controlText: ["fa-solid fa-angle-left", "fa-solid fa-angle-right"],
      slideBy: 1,
      autoplay: false,
      autoplayTimeout: 3000,
      autoplayHoverPauseL: true,
    },
    option
  );
  this.originalSlides = Array.from(this.container.children);

  this.slides = this.originalSlides.slice(0);

  this.currentIndex = this.opt.loop ? this._getcloneCount() : 0;

  this._init();
  this._updatePosition();
}

Slidezy.prototype._init = function () {
  this.container.className = "slide-wrapper";

  this._createContent();
  this._creatTrack();

  this.showNav = this._getSlideCount() > this.opt.items;
  if (this.opt.control && this.showNav) {
    this._createControl();
  }

  if (this.opt.nav && this.showNav) {
    this._creatNav();
  }

  if (this.opt.autoplay) {
    this._startAutoplay();

    if (this.opt.autoplayHoverPauseL) {
      this.container.onmouseenter = () => {
        this._stopAutoplay();
      };
      this.container.onmouseleave = () => {
        this._startAutoplay();
      };
    }
  }
};

Slidezy.prototype._startAutoplay = function () {
  if (this.autoplayTimer) return;

  const slideBy = this._getSlideBy();

  this.autoplayTimer = setInterval(() => {
    this._moveSlide(slideBy);
  }, this.opt.autoplayTimeout);
};

Slidezy.prototype._stopAutoplay = function () {
  clearInterval(this.autoplayTimer);
  this.autoplayTimer = null;
};

Slidezy.prototype._createContent = function () {
  this.content = document.createElement("div");
  this.content.className = "slidezy-content";
  this.container.appendChild(this.content);
};

Slidezy.prototype._getcloneCount = function () {
  const slideCount = this._getSlideCount();

  if (slideCount <= this.opt.items) return 0;

  const slideBy = this._getSlideBy();
  const cloneCount = slideBy + this.opt.items;

  return cloneCount > slideCount ? slideCount : cloneCount;
};

Slidezy.prototype._creatTrack = function () {
  this.track = document.createElement("div");
  this.track.className = "slide-track";

  const cloneCount = this._getcloneCount();

  if (this.opt.loop && cloneCount > 0) {
    const cloneHead = this.slides
      .slice(-cloneCount)
      .map((node) => node.cloneNode(true));
    const cloneTail = this.slides
      .slice(0, cloneCount)
      .map((node) => node.cloneNode(true));

    this.slides = cloneHead.concat(this.slides.concat(cloneTail));
  }

  this.slides.forEach((slide) => {
    slide.className = "slide-item";
    slide.style.flexBasis = `calc(100% / ${this.opt.items})`;
    this.track.appendChild(slide);
  });
  this.content.appendChild(this.track);
};

Slidezy.prototype._getSlideBy = function () {
  return this.opt.slideBy === "page" ? this.opt.items : this.opt.slideBy;
};

Slidezy.prototype._createControl = function () {
  // Nút Prev Button
  this.preBtn = this.opt.prevButton
    ? document.querySelector(this.opt.prevButton)
    : document.createElement("button");
  // Nút Next Button
  this.nextBtn = this.opt.nextButton
    ? document.querySelector(this.opt.nextButton)
    : document.createElement("button");

  if (!this.opt.prevButton) {
    this.preBtn.className = "pre-slide";
    this.iconPre = document.createElement("i");
    this.iconPre.className = this.opt.controlText[0];
    this.preBtn.appendChild(this.iconPre);
    this.content.append(this.preBtn);
  }
  if (!this.opt.nextButton) {
    this.nextBtn.className = "next-slide";
    this.iconNext = document.createElement("i");
    this.iconNext.className = this.opt.controlText[1];
    this.nextBtn.appendChild(this.iconNext);
    this.content.append(this.nextBtn);
  }

  const slideBy = this._getSlideBy();
  this.preBtn.onclick = () => this._moveSlide(-slideBy);
  this.nextBtn.onclick = () => this._moveSlide(slideBy);
};

// Slidezy.prototype._moveSlide = function (step) {
//   // 1.nếu là true thì return
//   if (this._isAnimating) return;
  
//   // lưu slide cũ
//   const ondsilde = this.slides[this.currentIndex];
//   console.log(ondsilde);

//   this._isAnimating = true;
//   const maxIndex = this.slides.length - this.opt.items;
//   this.currentIndex = Math.min(Math.max(this.currentIndex + step, 0), maxIndex);
//  // 2.cập nhật hiệu ứng
//  this._updatePosition();

//  // 3.Chờ hiệu ứng trasition kết thúc
//  const ontrasitonEnd = () => {
//      if (this.opt.loop) {
//        const slideCouter = this._getSlideCount();
 
//        if (this.currentIndex <= this._getcloneCount()) {
//          this.currentIndex += slideCouter;
//          this._updatePosition(true);
//        } else if (this.currentIndex >= slideCouter) {
//          this.currentIndex -= slideCouter;
//          this._updatePosition(true);
//        }
//      }
//      this._isAnimating = false;
//  }

//   this._updatePosition();
// };
Slidezy.prototype._moveSlide = function (step) {
  if (this._isAnimating) return;

  this._isAnimating = true;

  // 1. Lưu slide cũ
  const oldSlide = this.slides[this.currentIndex];

  const maxIndex = this.slides.length - this.opt.items;
  this.currentIndex = Math.min(Math.max(this.currentIndex + step, 0), maxIndex);

  // 2. Cập nhật vị trí (có hiệu ứng)
  this._updatePosition();

  // 3. Chờ hiệu ứng transition kết thúc
  const onTransitionEnd = () => {
    // khi transition trên 1 slide chạy song gọi lại onTransitionEnd
    this.track.removeEventListener("transitionend", onTransitionEnd);

    // 4. Kiểm tra và xử lý loop
    if (this.opt.loop) {
      const slideCouter = this._getSlideCount();
      if (this.currentIndex <= this._getcloneCount()) {
        this.currentIndex += slideCouter;
        this._updatePosition(true); //  không hiệu ứng
      } else if (this.currentIndex >= slideCouter + this._getcloneCount()) {
        this.currentIndex -= slideCouter;
        this._updatePosition(true); //  không hiệu ứng
      }
    }

    // 5. Dispatch custom event
    const currentSlide = this.slides[this.currentIndex];
    const event = new CustomEvent("slideshow:change", {
      detail: {
        old: oldSlide,
        current: currentSlide,
      },
    });
    document.dispatchEvent(event);

    this._isAnimating = false;
  };

  this.track.addEventListener("transitionend", onTransitionEnd);
};


Slidezy.prototype._getSlideCount = function () {
  return this.originalSlides.length;
};

Slidezy.prototype._creatNav = function () {
  this.navWrapper = document.createElement("div");
  this.navWrapper.className = "slidezy-nav";
  // Nếu mà loop thì là số item * 2 mà khi loop (this.slides.length = 12)
  // lên trong đoạn này khi loop hay không loop thì đều là 6
  const slideCouter = this._getSlideCount();
  // số trang sẽ bằng số slide chia số item hiển thị thì ra số page
  // làm tròn trên
  const pageCount = Math.ceil(slideCouter / this.opt.items);

  for (let i = 0; i < pageCount; i++) {
    const dot = document.createElement("button");
    dot.className = "slidezy-dot";

    if (i === 0) {
      dot.classList.add("active");
    }

    dot.onclick = () => {
      this.currentIndex = this.opt.loop
        ? i * this.opt.items + this._getcloneCount()
        : i * this.opt.items;
      this._updatePosition();
    };

    this.navWrapper.appendChild(dot);
  }

  this.container.appendChild(this.navWrapper);
};

Slidezy.prototype._updateNav = function () {
  if (!this.showNav) return;

  let realIndex = this.currentIndex;

  if (this.opt.loop) {
    const slideBy = this._getSlideCount();
    realIndex = (this.currentIndex - this._getcloneCount() + slideBy) % slideBy;
  }

  const pageIndex = Math.floor(realIndex / this.opt.items);
  const dots = Array.from(this.navWrapper.children);
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === pageIndex);
  });
};

Slidezy.prototype._updatePosition = function (instant = false) {
  this.track.style.transition = instant
    ? "none"
    : `transform ${this.opt.speed}ms ease`;
  this.offset = `-${this.currentIndex * (100 / this.opt.items)}`;
  this.track.style.transform = `translateX(${this.offset}%)`;

  if (this.opt.nav && !instant) {
    this._updateNav();
  }
};

