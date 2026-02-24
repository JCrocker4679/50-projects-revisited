import { http, HttpResponse } from 'msw';
import { API_URL } from '../../constants.ts';

/** Default mock joke for tests */
export const MOCK_JOKE = {
  id: 'test-joke-1',
  joke: 'Why did the scarecrow win an award? He was outstanding in his field.',
  status: 200,
};

/** Mock search results for tests */
export const MOCK_SEARCH_RESULTS = [
  { id: 'search-1', joke: 'Why do cats always get what they want? They are very purr-suasive.' },
  { id: 'search-2', joke: 'What do you call a cat that gets everything it wants? Purr-suasive.' },
];

export const MOCK_SEARCH_RESPONSE = {
  current_page: 1,
  limit: 20,
  next_page: 2,
  previous_page: 1,
  results: MOCK_SEARCH_RESULTS,
  search_term: 'cat',
  status: 200,
  total_jokes: 2,
  total_pages: 1,
};

/** Track the last request for header verification in tests */
export let lastRequest: Request | null = null;

export const handlers = [
  http.get(API_URL, ({ request }) => {
    lastRequest = request;
    return HttpResponse.json(MOCK_JOKE);
  }),
  http.get(`${API_URL}/search`, ({ request }) => {
    lastRequest = request;
    return HttpResponse.json(MOCK_SEARCH_RESPONSE);
  }),
];
