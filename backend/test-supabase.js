const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const supabase = require('./config/supabase');

async function testFetch() {
  console.log("Checking Supabase connection and fetching from 'applications' table...");
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*');

    if (error) {
      console.error("Supabase returned an error:", error.message || error);
    } else {
      console.log("Fetched records successfully:", data);
    }
  } catch (err) {
    console.error("Execution error:", err.message || err);
  }
}

testFetch();
