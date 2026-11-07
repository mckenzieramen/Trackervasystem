// Cloudflare Pages gateway; the existing Node backend remains the source of truth.
export async function onRequest(context) {
 const {request,env,next}=context;const url=new URL(request.url);
 if(!url.pathname.startsWith('/api/')&&!url.pathname.startsWith('/auth/'))return next();
 const reply=(error,status)=>Response.json({error,code:'BACKEND_UNAVAILABLE'},{status,headers:{'Cache-Control':'no-store'}});
 if(!env.VA_BACKEND_URL)return reply('The private backend is not connected yet. Configure VA_BACKEND_URL in Cloudflare Pages.',503);
 let upstream;try{upstream=new URL(env.VA_BACKEND_URL)}catch{return reply('The backend URL is not valid.',503)}
 if(upstream.protocol!=='https:'||upstream.origin===url.origin||upstream.pathname!=='/')return reply('Use the HTTPS origin of your Node backend for VA_BACKEND_URL.',503);
 if(!['GET','HEAD'].includes(request.method)&&request.headers.get('Origin')!==url.origin)return Response.json({error:'Request origin is not allowed.'},{status:403});
 upstream.pathname=url.pathname;upstream.search=url.search;
 const headers=new Headers(request.headers);headers.delete('host');headers.delete('cf-connecting-ip');
 // APP_URL on Node must be the public Pages origin, preserving origin/CSRF checks and OAuth callbacks.
 try{const response=await fetch(upstream,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual',signal:AbortSignal.timeout(30000)});const out=new Response(response.body,response);out.headers.set('Cache-Control','no-store');return out}catch{return reply('The private backend is currently unreachable. Please try again later.',502)}
}
