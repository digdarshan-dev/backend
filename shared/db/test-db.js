const supabase = require('./db');

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*');
    
    if (error) throw error;
    
    console.log('Users:', data);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

testConnection();
