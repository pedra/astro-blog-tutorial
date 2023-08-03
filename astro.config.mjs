import { defineConfig } from 'astro/config';
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import serviceWorker from './src/serviceWorker/index'

export default defineConfig({
  compressHTML: true,
  site: 'https://astro-blog-cip.netlify.app',
  integrations: 
  	[
		image({ serviceEntryPoint: '@astrojs/image/sharp' }), 
		sitemap(), 
		serviceWorker(),
		compress(),
	]
});