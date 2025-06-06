import {BLC_INVALID} from "../reasons";
import {GET, HEAD} from "http-methods-constants";
import isURL from "isurl";
import got from "got";



const ERROR_EVENT = "error";
const REDIRECT_EVENT = "redirect";
const RESPONSE_EVENT = "response";



/**
 * Create an HTTP request.
 * @param {URL} url
 * @param {object} auth
 * @param {string} method
 * @param {object} options
 * @param {boolean} [isRetry]
 * @returns {Promise<object>}
 */
const createRequest = (url, auth, method, options, isRetry=false) => new Promise(async (resolve, reject) =>
{
	const redirects = [];
	const resp = await got(url, {
		auth: stringifyAuth(url, auth),
		headers: {
			"user-agent": options.userAgent,
		},
		method,
		rejectUnauthorized: false,
		// accept self-signed SSL certificates
		retry: 0,
		throwHttpErrors: false,
	});
	const response = simplifyResponse(resp, redirects);

	return resolve({
		response,
		stream: require("stream").Readable.from(resp.body),
	});
});



/**
 * Create a simple response object from that of the "http" module.
 * @param {object|Stream} response
 * @param {Array<object>} [redirects]
 * @returns {object}
 * @todo add response time -- https://github.com/sindresorhus/got/issues/874
 */
const simplifyResponse = ({headers, statusCode, statusMessage, url}, redirects) =>
({
	headers,
	status: statusCode,
	statusText: statusMessage,
	url: new URL(url),
	...(redirects && {redirects}) // only return/destructure object if value is truthy
});



/**
 * Convert an HTTP authentication URL or object into a string.
 * @param {URL} url
 * @param {object} auth
 * @returns {string}
 */
const stringifyAuth = (url, auth) =>
{
	if (url.password!=="" || url.username!=="")
	{
		return `${url.username}:${url.password}`;
	}
	else if (auth.password!=="" || auth.username!=="")
	{
		return `${auth.username}:${auth.password}`;
	}
};



/**
 * Create an HTTP request and optionally cache the response.
 * @param {URL} url
 * @param {object} auth
 * @param {string} method
 * @param {URLCache} cache
 * @param {object} options
 * @throws {TypeError} non-URL
 * @returns {Promise<object>}
 * @todo use `Promise.try()` instead of `async`
 */
export default async (url, auth, method, cache, options) =>
{
	if (!isURL(url))
	{
		throw new TypeError(BLC_INVALID);
	}
	else
	{
		const promise = createRequest(url, auth, method, options);

		if (options.cacheResponses)
		{
			const cachedPromise = promise
			.then(({response}) =>
			{
				// Replace cached promise
				// @todo store in a "response" key, so that we can also store a list of all element IDs in the document
				cache.set(url, response);

				// Any final redirect
				// @todo store in a "response" key, so that we can also store a list of all element IDs in the document
				cache.set(response.url, response);

				// Any intermediary redirects
				response.redirects.forEach((redirect, i) =>
				{
					const subsequentRedirects = response.redirects.slice(i + 1);

					// @todo store in a "response" key, so that we can also store a list of all element IDs in the document
					cache.set(redirect.url, {...response, redirects:subsequentRedirects});
				});

				return response;
			})
			.catch(error => error);  // pass-through

			// Make future response available to other requests before completion
			// Will always overwrite previous value
			// @todo store in a "response" key, so that we can also store a list of all element IDs in the document
			cache.set(url, cachedPromise);
		}

		return promise;
	}
};
