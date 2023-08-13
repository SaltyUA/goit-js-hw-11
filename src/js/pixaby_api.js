import axios from 'axios';

export async function getImages(input, page) {
  const config = {
    url: 'https://pixabay.com/api/',
    params: {
      key: '38645785-6e0112a930fc9fb3ed87273a1',
      q: input,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: page,
    },
  };
  const response = await axios(config);
  return response.data;
}
