import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { validate } from '../utils/validate.js';
export const directoryQuerySchema=z.object({search:z.string().trim().max(100).default(''),state:z.enum(['active','archived','all']).default('active'),page:z.coerce.number().int().min(1).max(100000).default(1),page_size:z.coerce.number().int().min(1).max(50).default(10)});
export async function studentDirectory(req,res,next){
  try{
    const input=validate(directoryQuerySchema,req.query);
    const {data,error}=await supabase.rpc('list_student_records',{p_search:input.search,p_state:input.state,p_page:input.page,p_size:input.page_size});
    if(error){console.error('Student directory failed:',error.message);throw Object.assign(new Error('Unable to load student records. Please retry.'),{status:503});}
    res.set('Cache-Control','no-store').json(data);
  }catch(e){next(e);}
}
