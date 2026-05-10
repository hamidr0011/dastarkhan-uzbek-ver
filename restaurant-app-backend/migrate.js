import pool from './src/config/db.js';

const uzbekMenuItems = [
  ['Achichuk Salad', 'Starters', 'Tomato, cucumber, onion, herbs, and light vinegar dressing', 28000, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', true, false],
  ['Suzma with Lepeshka', 'Starters', 'Thick strained yogurt with fresh herbs and Uzbek bread', 32000, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d', true, false],
  ['Manti', 'Starters', 'Steamed dumplings filled with lamb, onion, and cumin', 54000, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c', true, true],
  ['Tashkent Plov', 'Main Course', 'Rice cooked with lamb, carrots, chickpeas, raisins, and quail egg', 78000, 'https://images.unsplash.com/photo-1633945274309-2c16c9682a8c', true, true],
  ['Samsa', 'Main Course', 'Clay-oven pastry filled with diced lamb and onion', 26000, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec', true, true],
  ['Lagman', 'Main Course', 'Hand-pulled noodles with beef, vegetables, and rich tomato broth', 68000, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624', true, false],
  ['Shurpa', 'Main Course', 'Slow simmered lamb soup with potatoes, carrots, chickpeas, and herbs', 62000, 'https://images.unsplash.com/photo-1547592166-23ac45744acd', true, false],
  ['Kazan Kabob', 'Main Course', 'Crisp lamb and potatoes finished in kazan with cumin and coriander', 92000, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', true, false],
  ['Lepeshka', 'Breads', 'Traditional Uzbek round bread baked in a tandoor', 12000, 'https://images.unsplash.com/photo-1509440159596-0249088772ff', true, false],
  ['Patyr Non', 'Breads', 'Layered festive Uzbek bread with sesame and nigella seeds', 18000, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec', true, false],
  ['Nisholda', 'Desserts', 'Whipped Uzbek sweet served chilled with subtle spice notes', 30000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777', true, false],
  ['Halva', 'Desserts', 'Nutty sesame halva with pistachio and tea pairing', 34000, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e', true, true],
  ['Green Tea', 'Drinks', 'Uzbek-style hot green tea served in a piala', 9000, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574', true, false],
  ['Kompot', 'Drinks', 'House fruit drink with apricot, cherry, and apple', 18000, 'https://images.unsplash.com/photo-1544145945-f90425340c7e', true, false],
];

const createTables = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('Skipping migrations: DATABASE_URL is not configured.');
      process.exit(0);
    }

    console.log('Creating Supabase/PostgreSQL tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'manager')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        image VARCHAR(500),
        available BOOLEAN DEFAULT true,
        is_special BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(30) DEFAULT 'Placed',
        table_number INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(20) NOT NULL,
        guests INTEGER NOT NULL,
        table_number INTEGER,
        special_requests TEXT,
        status VARCHAR(30) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
    await pool.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(30);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE;');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0;');
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UZS';");
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(30) DEFAULT 'Dine In';");
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_count INTEGER;');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_name VARCHAR(100);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(40);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(40);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(40);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(150);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_request TEXT;');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
    await pool.query("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'Placed';");
    await pool.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM menu_items;');
    const { rows: oldMenuRows } = await pool.query(
      "SELECT id FROM menu_items WHERE name IN ('Karahi Chicken', 'Biryani (Chicken)', 'Nihari', 'Gulab Jamun (4 pcs)', 'Lassi (Sweet)') LIMIT 1;"
    );
    if (rows[0].count === 0 || oldMenuRows.length > 0) {
      if (oldMenuRows.length > 0) {
        await pool.query('DELETE FROM menu_items;');
      }
      for (const item of uzbekMenuItems) {
        await pool.query(
          'INSERT INTO menu_items (name, category, description, price, image, available, is_special) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          item
        );
      }
      console.log('Seeded Uzbek menu items.');
    }

    console.log('All tables ready.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

createTables();
