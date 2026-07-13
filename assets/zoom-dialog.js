import { Component } from '@theme/component';
import {
  supportsViewTransitions,
  startViewTransition,
  onAnimationEnd,
  prefersReducedMotion,
  debounce,
  preloadImage,
  isLowPowerDevice,
} from '@theme/utilities';
import { scrollIntoView } from '@theme/scrolling';
import { ZoomMediaSelectedEvent } from '@theme/events';
import { DialogCloseEvent } from '@theme/dialog';
/**
 * A custom element that renders a zoom dialog.
 *
 * @typedef {object} Refs
 * @property {HTMLDialogElement} dialog - The dialog element.
 * @property {HTMLElement[]} media - The media elements.
 * @property {HTMLElement} thumbnails - The thumbnails elements.
 *
 * @extends Component<Refs>
 */
export class ZoomDialog extends Component {
  requiredRefs = ['dialog', 'media', 'thumbnails'];

  #highResImagesLoaded = /** @type {Set<string>} */ (new Set());
  #currentIndex = 0;

  /**
   * Scrollable gallery list inside the dialog (horizontal snap).
   * @returns {HTMLElement | null}
   */
  get #gallery() {
    return this.refs.dialog?.querySelector('.dialog-zoomed-gallery') ?? null;
  }

  connectedCallback() {
    super.connectedCallback();
    const gallery = this.#gallery;
    gallery?.addEventListener('scroll', this.handleScroll, { passive: true });
    this.refs.dialog.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const gallery = this.#gallery;
    gallery?.removeEventListener('scroll', this.handleScroll);
    this.refs.dialog.removeEventListener('scroll', this.handleScroll);
  }

  /**
   * Opens the zoom dialog.
   *
   * @param {number|string} index - The index of the media to zoom.
   * @param {PointerEvent} [event] - The pointer event.
   */
  async open(index, event) {
    event?.preventDefault?.();
    const targetIndex = Number(index) || 0;
    this.#currentIndex = targetIndex;

    const { dialog, media, thumbnails } = this.refs;
    const targetImage = media[targetIndex];
    const targetThumbnail = thumbnails?.children?.[targetIndex];

    const open = () => {
      dialog.showModal();

      requestAnimationFrame(() => {
        targetImage?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
        if (targetThumbnail instanceof HTMLElement) {
          targetThumbnail.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
        }
      });
    };

    /** @type {HTMLElement | null} */
    const sourceImage =
      event?.target instanceof Element ? event.target.closest('li,slideshow-slide') : null;

    if (!supportsViewTransitions() || isLowPowerDevice() || !sourceImage || !targetImage) {
      open();
      this.selectThumbnail(targetIndex, { behavior: 'instant' });
      return;
    }

    const itemTransitionName = `gallery-item-open`;
    sourceImage.style.setProperty('view-transition-name', itemTransitionName);

    const focalPoint = sourceImage.dataset.focalPoint;
    if (focalPoint) {
      document.documentElement.style.setProperty('--gallery-media-focal-point', focalPoint);
    }

    await startViewTransition(() => {
      open();
      sourceImage.style.removeProperty('view-transition-name');
      targetImage.style.setProperty('view-transition-name', itemTransitionName);
    });

    document.documentElement.style.removeProperty('--gallery-media-focal-point');
    targetImage.style.removeProperty('view-transition-name');

    this.selectThumbnail(targetIndex, { behavior: 'instant' });
  }

  /**
   * Loads a high-resolution image for a specific media container
   * @param {HTMLElement} mediaContainer - The media container element
   */
  loadHighResolutionImage(mediaContainer) {
    if (!mediaContainer.classList.contains('product-media-container--image')) return false;

    const image = mediaContainer.querySelector('img.product-media__image');
    if (!image || !(image instanceof HTMLImageElement)) return false;

    const highResolutionUrl = image.getAttribute('data_max_resolution');
    if (!highResolutionUrl || this.#highResImagesLoaded.has(highResolutionUrl)) return false;

    preloadImage(highResolutionUrl);

    const newImage = new Image();
    newImage.className = image.className;
    newImage.alt = image.alt;
    newImage.setAttribute('data_max_resolution', highResolutionUrl);
    newImage.setAttribute('ref', 'image');

    // When the high-resolution image loads, replace the existing image
    newImage.onload = () => {
      image.replaceWith(newImage);
      this.#highResImagesLoaded.add(highResolutionUrl);
    };

    newImage.src = highResolutionUrl;
  }

  /**
   * Handles the scroll event of the gallery, which is used to update the active thumbnail when the corresponding image is visible in the main view.
   * @param {Event} event - The scroll event.
   */
  handleScroll = debounce(async () => {
    const { media, thumbnails } = this.refs;
    if (!media?.length) return;

    const mostVisibleElement = await getMostVisibleElement(media);
    const activeIndex = media.indexOf(mostVisibleElement);
    if (activeIndex < 0) return;

    this.#currentIndex = activeIndex;
    const targetThumbnail = thumbnails?.children?.[activeIndex];

    if (!targetThumbnail || !(targetThumbnail instanceof HTMLElement)) return;

    Array.from(thumbnails.querySelectorAll('button')).forEach((button, i) => {
      button.setAttribute('aria-selected', `${i === activeIndex}`);
    });

    this.loadHighResolutionImage(mostVisibleElement);
    this.dispatchEvent(new ZoomMediaSelectedEvent(activeIndex));
  }, 50);

  /**
   * Closes the zoom dialog.
   */
  async close() {
    const { dialog, media } = this.refs;

    if (!supportsViewTransitions() || isLowPowerDevice()) return this.closeDialog();

    // Find the most visible image using IntersectionObserver
    const mostVisibleElement = await getMostVisibleElement(media);

    // Get the index and set up transition
    const activeIndex = media.indexOf(mostVisibleElement);
    const itemTransitionName = `gallery-item-close`;

    const mediaGallery = /** @type {import('./media-gallery').MediaGallery | undefined} */ (
      this.closest('media-gallery')
    );

    const slideshowActive = mediaGallery?.presentation === 'carousel';

    const slide = slideshowActive ? mediaGallery.slideshow?.slides?.[activeIndex] : mediaGallery?.media?.[activeIndex];

    if (!slide) return this.closeDialog();
    const focalPoint = slide.dataset.focalPoint;
    if (focalPoint) {
      document.documentElement.style.setProperty('--gallery-media-focal-point', focalPoint);
    }

    dialog.classList.add('dialog--closed');

    await onAnimationEnd(this.refs.thumbnails);

    mostVisibleElement.style.setProperty('view-transition-name', itemTransitionName);

    await startViewTransition(() => {
      mostVisibleElement.style.removeProperty('view-transition-name');
      slide.style.setProperty('view-transition-name', itemTransitionName);
      this.closeDialog();
    });

    slide.style.removeProperty('view-transition-name');
    dialog.classList.remove('dialog--closed');
    document.documentElement.style.removeProperty('--gallery-media-focal-point');
  }

  closeDialog() {
    const { dialog } = this.refs;
    dialog.close();
    window.dispatchEvent(new DialogCloseEvent());
  }

  /**
   * Closes the dialog when the user presses Escape, or navigates with arrows.
   *
   * @param {KeyboardEvent} event - The keyboard event.
   */
  handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.navigatePrevious(event);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.navigateNext(event);
    }
  }

  /**
   * @param {Event} [event]
   */
  navigatePrevious(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    this.#navigateBy(-1);
  }

  /**
   * @param {Event} [event]
   */
  navigateNext(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    this.#navigateBy(1);
  }

  /**
   * @param {number} delta
   */
  #navigateBy(delta) {
    const count = this.refs.media?.length || 0;
    if (count < 2) return;

    const nextIndex = (this.#currentIndex + delta + count) % count;
    const behavior = prefersReducedMotion() ? 'instant' : 'smooth';
    this.selectThumbnail(nextIndex, { behavior });
  }

  /**
   * Handles the click event of a thumbnail.
   * @param {number} index - The index of the thumbnail to select.
   */
  async handleThumbnailClick(index) {
    const behavior = prefersReducedMotion() ? 'instant' : 'smooth';
    this.selectThumbnail(Number(index), { behavior });
  }

  /**
   * Handles the pointer enter event of a thumbnail.
   * @param {number} index - The index of the thumbnail to load the high-resolution image for.
   */
  async handleThumbnailPointerEnter(index) {
    const { media } = this.refs;
    const i = Number(index);
    if (!media[i]) return;

    this.loadHighResolutionImage(media[i]);
  }

  /**
   * Handles the selection of a thumbnail.
   * @param {number} index - The index of the thumbnail to select.
   * @param {Object} options - The options for the selection.
   * @param {ScrollBehavior} options.behavior - The behavior of the scroll.
   */
  async selectThumbnail(index, options = { behavior: 'smooth' }) {
    const { media, thumbnails } = this.refs;
    const targetIndex = Number(index);
    if (!media?.[targetIndex]) return;
    if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= media.length) return;

    this.#currentIndex = targetIndex;

    if (thumbnails?.children?.length) {
      const targetThumbnail = thumbnails.children[targetIndex];

      if (targetThumbnail instanceof HTMLElement) {
        Array.from(thumbnails.querySelectorAll('button')).forEach((button, i) => {
          button.setAttribute('aria-selected', `${i === targetIndex}`);
        });

        scrollIntoView(targetThumbnail, {
          ancestor: thumbnails,
          behavior: options.behavior,
          block: 'center',
          inline: 'center',
        });
      }
    }

    const targetImage = media[targetIndex];

    if (targetImage) {
      targetImage.scrollIntoView({
        behavior: options.behavior,
        inline: 'center',
        block: 'nearest',
      });

      this.loadHighResolutionImage(targetImage);
    }
    this.dispatchEvent(new ZoomMediaSelectedEvent(targetIndex));
  }
}

if (!customElements.get('zoom-dialog')) {
  customElements.define('zoom-dialog', ZoomDialog);
}

/**
 * Get the most visible element from a list of elements.
 * @param {HTMLElement[]} elements - The elements to get the most visible element from.
 * @returns {Promise<HTMLElement>} A promise that resolves to the most visible element.
 */
function getMostVisibleElement(elements) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );
        observer.disconnect();
        resolve(/** @type {HTMLElement} */ (mostVisible.target));
      },
      {
        threshold: Array.from({ length: 100 }, (_, i) => i / 100),
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }
  });
}
