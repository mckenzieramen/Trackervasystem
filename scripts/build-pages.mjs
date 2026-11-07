import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});
cpSync('public','dist',{recursive:true});
console.log('Cloudflare Pages frontend ready in dist/. Pages Functions are compiled from functions/.');
