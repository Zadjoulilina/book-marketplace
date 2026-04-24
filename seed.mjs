import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DB_URL);
console.log("✅ Connected to database");

// ─── 1. Seed a system seller user ────────────────────────────────────
await conn.execute(`
  INSERT IGNORE INTO users (openId, name, email, loginMethod, role, bio, createdAt, updatedAt, lastSignedIn)
  VALUES ('system-seller-001', 'BookHub Library', 'library@bookhub.com', 'system', 'admin',
          'Official BookHub library account managing the lending collection.', NOW(), NOW(), NOW())
`);
const [[sellerRow]] = await conn.execute(`SELECT id FROM users WHERE openId = 'system-seller-001' LIMIT 1`);
const SELLER_ID = sellerRow.id;
console.log(`✅ System seller ID: ${SELLER_ID}`);

// ─── 2. Seed Publishers ───────────────────────────────────────────────
const publishersData = [
  { name: "Penguin Random House", description: "One of the world's largest and most celebrated publishing groups, home to thousands of authors.", website: "https://www.penguinrandomhouse.com" },
  { name: "HarperCollins Publishers", description: "A global publisher with a broad portfolio of literary fiction, nonfiction, children's books, and more.", website: "https://www.harpercollins.com" },
  { name: "Oxford University Press", description: "The world's largest university press, publishing scholarly, educational, and reference works.", website: "https://global.oup.com" },
  { name: "MIT Press", description: "A leading publisher of books and journals at the intersection of science, technology, arts, and social science.", website: "https://mitpress.mit.edu" },
  { name: "O'Reilly Media", description: "Providing technology and business training, knowledge, and insight to help companies succeed.", website: "https://www.oreilly.com" },
  { name: "Wiley", description: "A global leader in research and education, publishing academic journals, encyclopedias, and textbooks.", website: "https://www.wiley.com" },
  { name: "Dar Al Shorouk", description: "A leading Arab publishing house specializing in literature, culture, and social sciences.", website: "https://www.shorouk.com" },
  { name: "No Starch Press", description: "Publisher of technical books on programming, security, hacking, and open source.", website: "https://nostarch.com" },
];

for (const p of publishersData) {
  await conn.execute(
    `INSERT IGNORE INTO publishers (name, description, website, createdAt) VALUES (?, ?, ?, NOW())`,
    [p.name, p.description, p.website]
  );
}
const [pubRows] = await conn.execute(`SELECT id, name FROM publishers`);
const pubMap = Object.fromEntries(pubRows.map(r => [r.name, r.id]));
console.log(`✅ Seeded ${pubRows.length} publishers`);

// ─── 3. Seed Authors ──────────────────────────────────────────────────
const authorsData = [
  { name: "George Orwell", bio: "Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist and critic. His work is characterised by lucid prose, social criticism, opposition to totalitarianism, and support of democratic socialism.", website: "https://www.orwellfoundation.com" },
  { name: "J.K. Rowling", bio: "Joanne Rowling, better known by her pen name J.K. Rowling, is a British author and philanthropist. She is best known for writing the Harry Potter fantasy series.", website: "https://www.jkrowling.com" },
  { name: "Yuval Noah Harari", bio: "Yuval Noah Harari is an Israeli public intellectual, historian and a professor in the Department of History at the Hebrew University of Jerusalem. He is the author of the popular science bestsellers Sapiens, Homo Deus, and 21 Lessons for the 21st Century.", website: "https://www.ynharari.com" },
  { name: "Agatha Christie", bio: "Dame Agatha Mary Clarissa Christie was an English writer known for her 66 detective novels and 14 short story collections. She is referred to as the Queen of Crime.", website: "https://www.agathachristie.com" },
  { name: "Malcolm Gladwell", bio: "Malcolm Timothy Gladwell is a Canadian journalist, author, and public speaker. He has been a staff writer for The New Yorker since 1996. He has written six books that have appeared on the New York Times Best Seller list.", website: "https://www.gladwellbooks.com" },
  { name: "Robert C. Martin", bio: "Robert Cecil Martin, colloquially known as Uncle Bob, is an American software engineer, instructor, and author. He is most recognized for developing many software design principles and for being a founder of the influential Agile Manifesto.", website: "https://cleancoder.com" },
  { name: "Andrew S. Tanenbaum", bio: "Andrew Stuart Tanenbaum is an American-Dutch computer scientist and professor emeritus of computer science at the Vrije Universiteit Amsterdam in the Netherlands.", website: null },
  { name: "Bruce Schneier", bio: "Bruce Schneier is an American cryptographer, computer security professional, privacy specialist, and writer. He is the author of several books on general security topics, computer security and cryptography.", website: "https://www.schneier.com" },
  { name: "Naguib Mahfouz", bio: "Naguib Mahfouz was an Egyptian writer who won the 1988 Nobel Prize in Literature. He is regarded as one of the first contemporary writers of Arabic literature, along with Tawfiq el-Hakim, to explore themes of existentialism.", website: null },
  { name: "Paulo Coelho", bio: "Paulo Coelho de Souza is a Brazilian lyricist and novelist, best known for his novel The Alchemist. In 2014, he uploaded his personal papers online to create a virtual Paulo Coelho Foundation.", website: "https://www.paulocoelho.com" },
  { name: "Nassim Nicholas Taleb", bio: "Nassim Nicholas Taleb is a Lebanese-American essayist, mathematical statistician, former option trader, risk analyst, and aphorist. His work concerns problems of randomness, probability, and uncertainty.", website: "https://www.fooledbyrandomness.com" },
  { name: "Daniel Kahneman", bio: "Daniel Kahneman is an Israeli-American psychologist and economist notable for his work on the psychology of judgment and decision-making, as well as behavioral economics.", website: null },
  { name: "William Gibson", bio: "William Ford Gibson is an American-Canadian speculative fiction writer and essayist widely credited with pioneering the science fiction subgenre known as cyberpunk.", website: null },
  { name: "Stuart Russell", bio: "Stuart Jonathan Russell is a British computer scientist known for his contributions to artificial intelligence. He is a professor of computer science at the University of California, Berkeley.", website: "https://people.eecs.berkeley.edu/~russell" },
  { name: "Fyodor Dostoevsky", bio: "Fyodor Mikhailovich Dostoevsky was a Russian novelist, short story writer, essayist and journalist. His literary works explore human psychology in the troubled political, social, and spiritual atmospheres of 19th-century Russia.", website: null },
];

for (const a of authorsData) {
  await conn.execute(
    `INSERT IGNORE INTO authors (name, bio, website, createdAt) VALUES (?, ?, ?, NOW())`,
    [a.name, a.bio, a.website]
  );
}
const [authorRows] = await conn.execute(`SELECT id, name FROM authors`);
const authorMap = Object.fromEntries(authorRows.map(r => [r.name, r.id]));
console.log(`✅ Seeded ${authorRows.length} authors`);

// ─── 4. Seed Books ────────────────────────────────────────────────────
const booksData = [
  // ── Fiction / Literature ──
  {
    title: "1984",
    description: "A dystopian social science fiction novel and cautionary tale. The novel is set in Airstrip One, a province of the superstate Oceania in a world of perpetual war, omnipresent government surveillance, and public manipulation.",
    isbn: "978-0451524935",
    price: "12.99", originalPrice: "18.00",
    condition: "like_new", category: "Literature", language: "English",
    pageCount: 328, publishYear: 1949,
    listingType: "both",
    authorName: "George Orwell", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
  },
  {
    title: "Animal Farm",
    description: "A satirical allegorical novella by George Orwell. The book tells the story of a group of farm animals who rebel against their human farmer, hoping to create a society where the animals can be equal, free, and happy.",
    isbn: "978-0451526342",
    price: "9.99", originalPrice: "14.00",
    condition: "good", category: "Literature", language: "English",
    pageCount: 112, publishYear: 1945,
    listingType: "sell",
    authorName: "George Orwell", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg",
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    description: "The first novel in the Harry Potter series. It follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday, when he receives a letter of acceptance to Hogwarts School of Witchcraft and Wizardry.",
    isbn: "978-0439708180",
    price: "14.99", originalPrice: "22.00",
    condition: "new", category: "Fiction", language: "English",
    pageCount: 309, publishYear: 1997,
    listingType: "both",
    authorName: "J.K. Rowling", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg",
  },
  {
    title: "The Alchemist",
    description: "A philosophical novel by Brazilian author Paulo Coelho. Originally written in Portuguese, it became a widely translated international bestseller. An Andalusian shepherd boy named Santiago travels from his homeland in Spain to the Egyptian desert in search of a treasure.",
    isbn: "978-0062315007",
    price: "11.99", originalPrice: "16.99",
    condition: "like_new", category: "Literature", language: "English",
    pageCount: 197, publishYear: 1988,
    listingType: "both",
    authorName: "Paulo Coelho", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
  },
  {
    title: "Crime and Punishment",
    description: "A novel by the Russian author Fyodor Dostoevsky. It was first published in the literary journal The Russian Messenger in twelve monthly installments during 1866. It was later published in a single volume.",
    isbn: "978-0486415871",
    price: "8.99", originalPrice: "13.00",
    condition: "good", category: "Literature", language: "English",
    pageCount: 551, publishYear: 1866,
    listingType: "lend",
    authorName: "Fyodor Dostoevsky", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780486415871-L.jpg",
  },
  {
    title: "Neuromancer",
    description: "A science fiction novel by American-Canadian writer William Gibson. It is one of the best-known works in the cyberpunk genre and the first novel to win the Nebula Award, the Philip K. Dick Award, and the Hugo Award.",
    isbn: "978-0441569595",
    price: "13.99", originalPrice: "18.00",
    condition: "good", category: "Fiction", language: "English",
    pageCount: 271, publishYear: 1984,
    listingType: "sell",
    authorName: "William Gibson", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg",
  },

  // ── Non-Fiction / History ──
  {
    title: "Sapiens: A Brief History of Humankind",
    description: "A book by Yuval Noah Harari first published in Hebrew in Israel in 2011. The book surveys the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.",
    isbn: "978-0062316097",
    price: "16.99", originalPrice: "24.99",
    condition: "new", category: "History", language: "English",
    pageCount: 443, publishYear: 2011,
    listingType: "both",
    authorName: "Yuval Noah Harari", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
  },
  {
    title: "Homo Deus: A Brief History of Tomorrow",
    description: "A book by the Israeli author Yuval Noah Harari, first published in Hebrew in 2015. The book examines what might happen to the world when new technologies such as artificial intelligence and genetic engineering transform the human species.",
    isbn: "978-0062464316",
    price: "15.99", originalPrice: "22.99",
    condition: "like_new", category: "History", language: "English",
    pageCount: 464, publishYear: 2015,
    listingType: "sell",
    authorName: "Yuval Noah Harari", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062464316-L.jpg",
  },

  // ── Business / Self-Help ──
  {
    title: "Outliers: The Story of Success",
    description: "In this stunning new book, Malcolm Gladwell takes us on an intellectual journey through the world of outliers–the best and the brightest, the most famous and the most successful.",
    isbn: "978-0316017930",
    price: "14.99", originalPrice: "19.99",
    condition: "good", category: "Business", language: "English",
    pageCount: 309, publishYear: 2008,
    listingType: "both",
    authorName: "Malcolm Gladwell", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780316017930-L.jpg",
  },
  {
    title: "The Black Swan: The Impact of the Highly Improbable",
    description: "A book by author and former options trader Nassim Nicholas Taleb. The book focuses on the extreme impact of rare and unpredictable outlier events—and the human tendency to find simplistic explanations for these events.",
    isbn: "978-0812973815",
    price: "13.99", originalPrice: "18.99",
    condition: "like_new", category: "Business", language: "English",
    pageCount: 444, publishYear: 2007,
    listingType: "sell",
    authorName: "Nassim Nicholas Taleb", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780812973815-L.jpg",
  },
  {
    title: "Thinking, Fast and Slow",
    description: "A book by psychologist Daniel Kahneman. The book's main thesis is a differentiation between two modes of thought: System 1 is fast, instinctive and emotional; System 2 is slower, more deliberative, and more logical.",
    isbn: "978-0374533557",
    price: "15.99", originalPrice: "20.99",
    condition: "new", category: "Business", language: "English",
    pageCount: 499, publishYear: 2011,
    listingType: "both",
    authorName: "Daniel Kahneman", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
  },

  // ── Computer Science ──
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
    isbn: "978-0132350884",
    price: "39.99", originalPrice: "54.99",
    condition: "new", category: "Computer Science", language: "English",
    pageCount: 431, publishYear: 2008,
    listingType: "sell",
    authorName: "Robert C. Martin", publisherName: "Wiley",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
  },
  {
    title: "The Clean Coder: A Code of Conduct for Professional Programmers",
    description: "In The Clean Coder: A Code of Conduct for Professional Programmers, legendary software expert Robert C. Martin introduces the disciplines, techniques, tools, and practices of true software craftsmanship.",
    isbn: "978-0137081073",
    price: "34.99", originalPrice: "49.99",
    condition: "like_new", category: "Computer Science", language: "English",
    pageCount: 256, publishYear: 2011,
    listingType: "both",
    authorName: "Robert C. Martin", publisherName: "Wiley",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780137081073-L.jpg",
  },
  {
    title: "Computer Networks",
    description: "This textbook is appropriate for graduate courses in Computer Networking. A well-known author, Tanenbaum brings his hallmark clarity and attention to detail to this explanation of networking concepts.",
    isbn: "978-0132126953",
    price: "45.99", originalPrice: "79.99",
    condition: "good", category: "Computer Science", language: "English",
    pageCount: 960, publishYear: 2010,
    listingType: "sell",
    authorName: "Andrew S. Tanenbaum", publisherName: "Wiley",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg",
  },

  // ── Artificial Intelligence ──
  {
    title: "Artificial Intelligence: A Modern Approach",
    description: "The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence. The long-anticipated revision of this #1 selling book offers the most comprehensive, state of the art introduction to the theory and practice of artificial intelligence.",
    isbn: "978-0134610993",
    price: "69.99", originalPrice: "99.99",
    condition: "new", category: "Artificial Intelligence", language: "English",
    pageCount: 1132, publishYear: 2020,
    listingType: "both",
    authorName: "Stuart Russell", publisherName: "MIT Press",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg",
  },
  {
    title: "Life 3.0: Being Human in the Age of Artificial Intelligence",
    description: "How will Artificial Intelligence affect crime, war, justice, jobs, society and our very sense of being human? The rise of AI has the potential to transform our future more than any other technology.",
    isbn: "978-1101970317",
    price: "16.99", originalPrice: "24.00",
    condition: "like_new", category: "Artificial Intelligence", language: "English",
    pageCount: 364, publishYear: 2017,
    listingType: "sell",
    authorName: "Yuval Noah Harari", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9781101970317-L.jpg",
  },

  // ── Cybersecurity ──
  {
    title: "Hacking: The Art of Exploitation",
    description: "While many security books merely show how to run existing exploits, Hacking: The Art of Exploitation is the only book that explains how hacking techniques actually work. Instead of just showing how to run existing exploits, author Jon Erickson explains how arcane hacking techniques actually work.",
    isbn: "978-1593271442",
    price: "29.99", originalPrice: "49.99",
    condition: "good", category: "Cybersecurity", language: "English",
    pageCount: 488, publishYear: 2008,
    listingType: "sell",
    authorName: "Bruce Schneier", publisherName: "No Starch Press",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9781593271442-L.jpg",
  },
  {
    title: "Secrets and Lies: Digital Security in a Networked World",
    description: "This book is a classic work on digital security that is still relevant today. Bruce Schneier, a world-renowned security technologist, provides a comprehensive overview of the security landscape.",
    isbn: "978-0471453802",
    price: "24.99", originalPrice: "39.99",
    condition: "like_new", category: "Cybersecurity", language: "English",
    pageCount: 432, publishYear: 2004,
    listingType: "both",
    authorName: "Bruce Schneier", publisherName: "Wiley",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780471453802-L.jpg",
  },

  // ── Networks ──
  {
    title: "TCP/IP Illustrated, Volume 1: The Protocols",
    description: "TCP/IP Illustrated, Volume 1: The Protocols is a detailed and visual guide to the protocols that drive the Internet. Fully updated for the newest innovations, it reflects the most recent protocol standards and shows how TCP/IP protocols function in real-world environments.",
    isbn: "978-0321336316",
    price: "49.99", originalPrice: "74.99",
    condition: "good", category: "Networks", language: "English",
    pageCount: 1024, publishYear: 2011,
    listingType: "sell",
    authorName: "Andrew S. Tanenbaum", publisherName: "Wiley",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780321336316-L.jpg",
  },

  // ── Religious ──
  {
    title: "The Bible: New International Version",
    description: "The New International Version (NIV) is an English translation of the Bible first published in 1978 by Biblica. It was produced by more than one hundred scholars working from the best available Hebrew, Aramaic, and Greek texts.",
    isbn: "978-0310448952",
    price: "19.99", originalPrice: "29.99",
    condition: "new", category: "Religious", language: "English",
    pageCount: 1280, publishYear: 2011,
    listingType: "both",
    authorName: "Naguib Mahfouz", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780310448952-L.jpg",
  },

  // ── Cultural ──
  {
    title: "Palace Walk (Cairo Trilogy, Vol. 1)",
    description: "Palace Walk is the first of three novels in Nobel Prize-winning author Naguib Mahfouz's Cairo Trilogy, considered one of the masterpieces of modern Arabic literature. Set in Cairo during the British occupation, it follows the lives of a traditional Muslim family.",
    isbn: "978-0385264662",
    price: "14.99", originalPrice: "19.99",
    condition: "like_new", category: "Cultural", language: "English",
    pageCount: 498, publishYear: 1956,
    listingType: "both",
    authorName: "Naguib Mahfouz", publisherName: "Dar Al Shorouk",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780385264662-L.jpg",
  },

  // ── Mystery / Detective ──
  {
    title: "Murder on the Orient Express",
    description: "Just after midnight, a snowdrift stops the Orient Express in its tracks. The luxurious train is surprisingly full for the time of year, but by the morning it is one passenger fewer. An American tycoon lies dead in his compartment, stabbed a dozen times.",
    isbn: "978-0062693662",
    price: "12.99", originalPrice: "17.99",
    condition: "new", category: "Fiction", language: "English",
    pageCount: 256, publishYear: 1934,
    listingType: "both",
    authorName: "Agatha Christie", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062693662-L.jpg",
  },
  {
    title: "And Then There Were None",
    description: "Ten strangers are lured to an isolated island mansion off the Devon coast by a mysterious U.N. Owen. At dinner, a record begins to play, and each guest is accused of a past crime. As the weekend progresses, the guests are murdered one by one.",
    isbn: "978-0062073488",
    price: "11.99", originalPrice: "16.99",
    condition: "good", category: "Fiction", language: "English",
    pageCount: 264, publishYear: 1939,
    listingType: "sell",
    authorName: "Agatha Christie", publisherName: "HarperCollins Publishers",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg",
  },

  // ── Science ──
  {
    title: "A Brief History of Time",
    description: "A landmark volume in science writing by one of the great minds of our time, Stephen Hawking's book explores such profound questions as: How did the universe begin—and what made its start possible?",
    isbn: "978-0553380163",
    price: "13.99", originalPrice: "18.99",
    condition: "like_new", category: "Science", language: "English",
    pageCount: 212, publishYear: 1988,
    listingType: "both",
    authorName: "Yuval Noah Harari", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
  },

  // ── Philosophy ──
  {
    title: "Meditations",
    description: "Written in Greek by the only Roman emperor who was also a philosopher, without any intention of publication, the Meditations of Marcus Aurelius offer a remarkable series of challenging spiritual reflections.",
    isbn: "978-0140449334",
    price: "10.99", originalPrice: "15.99",
    condition: "new", category: "Philosophy", language: "English",
    pageCount: 256, publishYear: 180,
    listingType: "lend",
    authorName: "Fyodor Dostoevsky", publisherName: "Penguin Random House",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg",
  },
];

let booksInserted = 0;
for (const b of booksData) {
  const authorId = authorMap[b.authorName] ?? null;
  const publisherId = b.publisherName ? (pubMap[b.publisherName] ?? null) : null;

  // Skip if book with same ISBN already exists
  if (b.isbn) {
    const [[existing]] = await conn.execute(`SELECT id FROM books WHERE isbn = ? LIMIT 1`, [b.isbn]);
    if (existing) { continue; }
  }

  await conn.execute(
    `INSERT INTO books
      (title, description, isbn, coverImageUrl, price, originalPrice, \`condition\`, category, language, pageCount, publishYear, status, listingType, sellerId, authorId, authorName, publisherId, publisherName, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      b.title, b.description, b.isbn, b.coverImageUrl,
      b.price, b.originalPrice ?? null,
      b.condition, b.category, b.language,
      b.pageCount ?? null, b.publishYear ?? null,
      b.listingType,
      SELLER_ID,
      authorId, b.authorName,
      publisherId, b.publisherName ?? null,
    ]
  );
  booksInserted++;
}
console.log(`✅ Seeded ${booksInserted} books`);

// ─── 5. Seed Reviews for the first few books ──────────────────────────
const [bookRows] = await conn.execute(`SELECT id FROM books LIMIT 10`);
const reviewComments = [
  "Absolutely loved this book! A must-read for everyone.",
  "Very insightful and well-written. Highly recommended.",
  "A classic that never gets old. The writing is superb.",
  "Thought-provoking and engaging from start to finish.",
  "One of the best books I have ever read. Life-changing.",
  "Great read! The author explains complex ideas very clearly.",
  "Fascinating content. I couldn't put it down.",
  "A timeless masterpiece. Every page is worth reading.",
];

for (const bookRow of bookRows) {
  const numReviews = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < numReviews; i++) {
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
    const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
    await conn.execute(
      `INSERT INTO reviews (bookId, userId, rating, comment, createdAt) VALUES (?, ?, ?, ?, NOW())`,
      [bookRow.id, SELLER_ID, rating, comment]
    );
  }
}
console.log(`✅ Seeded reviews for ${bookRows.length} books`);

await conn.end();
console.log("\n🎉 Seed completed successfully!");
console.log(`   - ${publishersData.length} publishers`);
console.log(`   - ${authorsData.length} authors`);
console.log(`   - ${booksInserted} books across 10 categories`);
console.log(`   - Reviews for ${bookRows.length} books`);
