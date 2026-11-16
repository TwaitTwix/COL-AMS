import { authenticateUser } from "../middleware/authenticate-user.js";
import { env } from "../config/env.js";
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';
import { validate } from '../utils/validate.js';
import { recordSession } from '../services/security-service.js';

export function getPublicAuthConfig(_req, res) {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    res.status(503).json({ error: { message: "Browser sign-in is not configured", details: [] } });
    return;
  }
  res.set("Cache-Control", "no-store").json({
    supabaseUrl: env.SUPABASE_URL,
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
  });
}

export const getCurrentUser = [authenticateUser, async (req, res, next) => {
  try {
  const device = await recordSession(req, res, req.get('authorization').replace(/^Bearer\s+/i, ''));
  res.set('Cache-Control','no-store').status(200).json({
    user: { id: req.authUser.id, email: req.authUser.email },
    profile: req.userProfile,
    device,
  });
  } catch(error) { next(error); }
}];

export async function register(req,res,next) {
  try {
    if(!supabase || !env.SUPABASE_PUBLISHABLE_KEY)throw Object.assign(new Error('Registration is not configured'),{status:503});
    const input=validate(z.object({full_name:z.string().trim().min(1).max(120),personal_id:z.string().trim().min(1).max(40),email:z.string().email().max(254),password:z.string().min(10).max(128),institution:z.enum(['MCNP','ISAP']),college:z.string().trim().min(1).max(100)}),req.body);
    const {data:college,error:collegeError}=await supabase.from('colleges').select('name').eq('institution',input.institution).eq('name',input.college).maybeSingle();
    if(collegeError)throw Object.assign(new Error('Unable to validate your college'),{status:503});
    if(!college)throw Object.assign(new Error('Choose a registered institution and college'),{status:400});
    const client=createClient(env.SUPABASE_URL,env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await client.auth.signUp({email:input.email,password:input.password,options:{emailRedirectTo:env.PUBLIC_APP_URL,data:{full_name:input.full_name}}});
    if(error)throw Object.assign(new Error(error.message),{status:error.status===429?429:400});
    // Supabase may return an obfuscated user for an already-registered email.
    // Never overwrite an existing profile or trust its returned identity.
    if(data.user?.identities?.length){
      const {error:profileError}=await supabase.from('user_profiles').upsert({user_id:data.user.id,email:input.email,full_name:input.full_name,personal_id:input.personal_id,institution:input.institution,college:input.college,role:'pending',approval_status:'pending'},{onConflict:'user_id',ignoreDuplicates:true});
      if(profileError){
        // Never delete an Auth identity from a registration retry. Existing
        // unconfirmed identities may be returned by the Auth service as well.
        throw Object.assign(new Error(profileError.code==='23505'?'This personal ID is already registered. Verify your email, sign in, and correct your registration details.':'Verify your email and sign in to complete your registration details.'),{status:profileError.code==='23505'?409:503});
      }
    }
    res.status(202).json({message:'Check your email to verify your address. An administrator must approve your personal ID before you can record attendance.'});
  }catch(e){next(e);}
}
