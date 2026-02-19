import { http, HttpResponse } from 'msw';
import { API_URL } from '../../constants.ts';

/** Default mock joke for tests */
export const MOCK_JOKE = {
  id: 'test-joke-1',
  joke: 'Why did the scarecrow win an award? He was outstanding in his field.',
  status: 200,
};

/** Track the last request for header verification in tests */
export let lastRequest: Request | null = null;

export const handlers = [
  http.get(API_URL, ({ request }) => {
    lastRequest = request;
    return HttpResponse.json(MOCK_JOKE);
  }),
];
