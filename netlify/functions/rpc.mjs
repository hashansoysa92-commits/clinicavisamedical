import {getDatabase} from '@netlify/database';
import adapter from '../../server/netlify-handler.cjs';
const handle=adapter.createHandler({query:async(text,params)=>getDatabase().sql.unsafe(text,params)});
export default handle;
export const config={path:'/api/rpc'};
