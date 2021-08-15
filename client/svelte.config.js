import vercel from '@sveltejs/adapter-vercel';

import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		replace: [
			['process.env.AWS_LAMBDA_FUNCTION_VERSION', JSON.stringify('haloo')],
			['process.env.TEST', JSON.stringify('haloo')]
		]
	}),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: vercel()
	}
};

export default config;
