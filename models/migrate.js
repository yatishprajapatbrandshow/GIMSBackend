const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const Slug = require('./slug.model'); // path to your slug model

// ----------------- 1. MongoDB Connect -----------------
mongoose.connect('mongodb+srv://brandshow:xS36OgTIDikH3V4Q@cluster0.k22pflm.mongodb.net/GIMS?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// ----------------- 2. MySQL Connect -----------------
async function getWPData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',        // MySQL username
        password: 'root',    // MySQL password
        database: 'gims' // WordPress DB name
    });

    const [rows] = await connection.execute('SELECT * FROM wpi6_posts'); // adjust table prefix if needed
    await connection.end();
    return rows;
}

// ----------------- Helper Function: Parse WP Dates -----------------
function parseWPDate(dateStr) {
    if (!dateStr || dateStr === '0000-00-00 00:00:00') return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
}
function sanitizeGuid(item) {
    let url = item.guid || "";

    // 1. Remove domain
    const domain = "https://gims.net.in";
    if (url.startsWith(domain)) {
        url = url.replace(domain, "");
    }

    // 2. Remove query params
    url = url.split("?")[0];

    // 3. Remove starting slash if exists
    if (url.startsWith("/")) {
        url = url.slice(1);
    }

    // 4. Ensure it ends with a single slash
    if (!url.endsWith("/")) {
        url = url + "/";
    }

    // 5. Append post_name at the end and add leading slash back
    url = "/" + url + item.post_name;

    return url;
}


// ----------------- 3. Migration Function -----------------
async function migrateData() {
    const failedMigrations = [];
    let successCount = 0;

    try {
        const wpPosts = await getWPData();
        console.log(`Found ${wpPosts.length} posts in WordPress DB`);

        for (const item of wpPosts) {
            const sanitizedpath = sanitizeGuid(item);
            console.log(sanitizedpath);
            try {
                const slugDoc = new Slug({
                    page_id: Number(item.ID),
                    post_author: Number(item.post_author) || 0,
                    post_date: parseWPDate(item.post_date) || new Date(),
                    post_date_gmt: parseWPDate(item.post_date_gmt),
                    description: item.post_content || '',
                    post_title: item.post_title || '',
                    post_excerpt: item.post_excerpt || '',
                    post_status: item.post_status || 'draft',
                    comment_status: item.comment_status || 'open',
                    ping_status: item.ping_status || 'open',
                    post_password: item.post_password || null,
                    post_name: item.post_name || `page-${item.ID}`,
                    to_ping: item.to_ping || null,
                    pinged: item.pinged || null,
                    post_modified: parseWPDate(item.post_modified) || new Date(),
                    post_modified_gmt: parseWPDate(item.post_modified_gmt),
                    post_content_filtered: item.post_content_filtered || null,
                    post_parent: Number(item.post_parent) || 0,
                    guid: item.guid || '',
                    menu_order: Number(item.menu_order) || 0,
                    post_type: item.post_type || 'Page',
                    type: item.post_type || 'Page',
                    post_mime_type: item.post_mime_type || null,
                    comment_count: Number(item.comment_count) || 0,
                    // Slug specific fields
                    slug: item.post_name || `page-${item.ID}`,
                    name: item.post_title || `Page ${item.ID}`,
                    path: sanitizedpath || `/${item.post_name}`,
                    id_path: `/${item.ID}`,
                    status: item.post_status === 'publish',
                    post_status: item.post_status,
                    addedon: new Date(),
                    addedby: 'Admin',
                });

                await slugDoc.save();
                successCount++;
                console.log(`✅ Migrated ID: ${item.ID} -> ${slugDoc.slug}`);
            } catch (err) {
                failedMigrations.push({ id: item.ID, error: err.message });
                console.error(`❌ Error migrating ID ${item.ID}: ${err.message}`);
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`Total Posts Found: ${wpPosts.length}`);
        console.log(`Successfully Migrated: ${successCount}`);
        console.log(`Failed Migrations: ${failedMigrations.length}`);
        if (failedMigrations.length > 0) {
            console.log('Failed IDs:', failedMigrations.map(f => f.id).join(', '));
        }

        mongoose.disconnect();
    } catch (err) {
        console.error('Migration failed:', err.message);
        mongoose.disconnect();
    }
}

// ----------------- 4. Run Migration -----------------
migrateData();
