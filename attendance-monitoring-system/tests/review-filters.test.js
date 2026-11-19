import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewQuerySchema } from '../src/controllers/review-center-controller.js';
test('review filters default to ten pending records and reject invalid query values',()=>{
  assert.deepEqual(reviewQuerySchema.parse({category:'attendance'}),{category:'attendance',state:'pending',search:'',page:1,page_size:10});
  for(const query of [{category:'unknown'},{category:'devices',page:'0'},{category:'devices',page_size:'51'},{category:'attendance',state:'bad'},{category:'notifications',search:'x'.repeat(101)}])assert.equal(reviewQuerySchema.safeParse(query).success,false);
});
