import { getImages } from './pixaby_api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  searchForm: document.querySelector(`.search-form`),
  gallery: document.querySelector(`.gallery`),
  loadMore: document.querySelector(`.load-more`),
  target: document.querySelector(`.js-guard`),
};

let gallery = null;
let page = 1;
let currentSearch;
let totalHits = 0;
let totalPages = 0;

const options = {
  root: null,
  rootMargin: `1000px`,
};
const observer = new IntersectionObserver(createItems, options);

elements.searchForm.addEventListener(`submit`, newSearch);
elements.loadMore.addEventListener(`click`, loadMoreImg);

async function createItems() {
  await getImages(currentSearch, page)
    .then(response => {
      if (!response.hits.length) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      const galleryArr = response.hits;
      totalHits = response.totalHits;
      totalPages = Math.ceil(totalHits / 40);

      elements.gallery.insertAdjacentHTML(
        `beforeend`,
        galleryArr
          .map(
            hit => `<div class="gallery-item">
        <a class="gallery-link" href="${hit.largeImageURL}">
  <img class ="gallery-image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
  <div class="info-box">
      <p class="info-text">&#x1F44D ${hit.likes}</p>
      <p class="info-views">&#x1F9D0 ${hit.views}</p>
      <p class="info-text">&#x1F4AC ${hit.comments}</p>
      <p class="info-text">&#x1F4E5 ${hit.downloads}</p>
  </div>
</div>`
          )
          .join(``)
      );

      if (page > 1) {
        gallery.refresh();
      }

      page += 1;

      if (page > totalPages) {
        observer.unobserve(elements.target);
        Notiflix.Notify.success(
          `There all images for your request. Try another`
        );
      }
    })
    .catch(({ code, message }) => {
      Notiflix.Report.failure(
        `${message}. Code: ${code} `,
        'Oops! Something went wrong! Try reloading the page!',
        'OK'
      );
    });
}
async function newSearch(e) {
  e.preventDefault();
  observer.unobserve(elements.target);
  totalHits = 0;

  page = 1;
  currentSearch = e.currentTarget.firstElementChild.value.trim();

  if (currentSearch === '') {
    Notiflix.Notify.warning('Please, enter search request.');
    return;
  }

  elements.gallery.innerHTML = ``;

  elements.loadMore.classList.add(`isHidden`);

  await createItems();

  if (totalHits === 0) {
    return;
  }

  gallery = new SimpleLightbox('.gallery-link', {
    captionsData: 'alt',
    captionDelay: 250,
  });

  Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);

  const { height: cardHeight } =
    elements.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 0.5,
    behavior: 'smooth',
  });

  if (totalPages > page) {
    elements.loadMore.classList.remove(`isHidden`);
  }

  e.target.reset();
}

async function loadMoreImg() {
  observer.observe(elements.target);
  elements.loadMore.classList.add(`isHidden`);
}
