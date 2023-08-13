import { getImages } from './pixaby_api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  searchForm: document.querySelector(`.search-form`),
  gallery: document.querySelector(`.gallery`),
  loadMore: document.querySelector(`.load-more`),
};

const gallery = new SimpleLightbox('.gallery a');
let page = 1;
let currentSearch;
let totalHits;

elements.searchForm.addEventListener(`submit`, newSearch);
elements.loadMore.addEventListener(`click`, loadMoreImg);

async function createItems() {
  let galleryMarkup;

  await getImages(currentSearch, page)
    .then(response => {
      if (response.totalHits === 0) {
        throw error;
      }
      const galleryArr = response.hits;
      totalHits = response.totalHits;

      galleryMarkup = galleryArr
        .map(
          hit => `<li class="gallery-item">
        <a class="gallery-link" href="${hit.largeImageURL}">
  <img class ="gallery-image" src="${hit.webformatURL}" alt="${hit.tags}" height="240px" loading="lazy" /></a>
  <ul class="info-box">
    <li class="info-item">
      <p class="info-text">&#x1F44D ${hit.likes}</p>
    </li>
    <li class="info-text">
      <p class="info-views">&#x1F9D0 ${hit.views}</p>
    </li>
    <li class="info-text">
      <p class="info-text">&#x1F4AC ${hit.comments}</p>
    </li>
    <li class="info-item">
      <p class="info-text">&#x1F4E5 ${hit.downloads}</p>
    </li>
  </ul>
</li>`
        )
        .join(``);
      elements.gallery.insertAdjacentHTML(`beforeend`, galleryMarkup);
      elements.loadMore.classList.remove(`isHidden`);
    })
    .catch(error => {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    });
}

async function newSearch(e) {
  e.preventDefault();

  page = 1;
  currentSearch = e.currentTarget.firstElementChild.value;
  elements.gallery.innerHTML = '';
  elements.loadMore.classList.add(`isHidden`);

  createItems();
  smoothScroll();

  gallery.refresh();
  Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);

  page += 1;
  e.target.reset();
}

async function loadMoreImg() {
  createItems();
  smoothScroll();
  gallery.refresh();

  page += 1;
  const totalPages = totalHits / 40;
  if (page > totalPages) {
    elements.loadMore.classList.add(`isHidden`);
    Notiflix.Notify.success(`There all images for your request. Try another`);
  }
}

// async function smoothScroll() {
//   const { height: cardHeight } =
//     elements.gallery.firstElementChild.getBoundingClientRect();

//   window.scrollBy({
//     top: cardHeight * 2.28,
//     behavior: 'smooth',
//   });
// }
