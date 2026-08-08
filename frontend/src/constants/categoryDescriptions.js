/**
 * Category descriptions and metadata for SEO
 */

export const CATEGORY_DESCRIPTIONS = {
  'Fiction': {
    title: 'Fiction Books',
    description: 'Explore our vast collection of fiction books featuring novels, short stories, and literary fiction from renowned authors worldwide. From contemporary fiction to classic literature, discover captivating stories that transport you to different worlds.',
    keywords: 'fiction books, novels, literary fiction, contemporary fiction, classic literature, storytelling, narrative fiction',
    longDescription: 'Fiction books offer readers an escape into imaginative worlds filled with compelling characters and engaging storylines. Our fiction collection spans multiple genres and time periods, featuring works from both established and emerging authors. Whether you prefer contemporary novels, historical fiction, or timeless classics, you\'ll find books that challenge, entertain, and inspire.',
    relatedCategories: ['Romance', 'Mystery', 'Sci-Fi', 'Fantasy', 'Drama'],
    popularAuthors: ['Stephen King', 'J.K. Rowling', 'Agatha Christie', 'George Orwell', 'Jane Austen']
  },
  
  'Non-Fiction': {
    title: 'Non-Fiction Books',
    description: 'Discover our comprehensive collection of non-fiction books covering real-world topics, factual accounts, and educational content. From biographies to self-help, expand your knowledge with books based on true events and expert insights.',
    keywords: 'non-fiction books, biography, memoir, true stories, educational books, factual books, real life stories',
    longDescription: 'Non-fiction books provide readers with factual information, real-life stories, and expert knowledge across various subjects. Our non-fiction collection includes biographies, memoirs, historical accounts, scientific discoveries, and educational materials that inform and enlighten readers about the world around them.',
    relatedCategories: ['Biography', 'History', 'Self-Help', 'Science', 'Education'],
    popularAuthors: ['Malcolm Gladwell', 'Bill Bryson', 'Michelle Obama', 'Yuval Noah Harari', 'Atul Gawande']
  },
  
  'Mystery': {
    title: 'Mystery Books',
    description: 'Dive into our thrilling collection of mystery books featuring detective stories, crime fiction, and suspenseful thrillers. Solve puzzles alongside brilliant detectives and uncover secrets in these page-turning mysteries.',
    keywords: 'mystery books, detective fiction, crime novels, thriller books, suspense, murder mystery, detective stories',
    longDescription: 'Mystery books captivate readers with intricate plots, clever detectives, and puzzling crimes that need solving. Our mystery collection features classic whodunits, modern crime fiction, psychological thrillers, and cozy mysteries that will keep you guessing until the final page.',
    relatedCategories: ['Fiction', 'Drama', 'Biography'],
    popularAuthors: ['Agatha Christie', 'Arthur Conan Doyle', 'Gillian Flynn', 'Tana French', 'Louise Penny']
  },
  
  'Romance': {
    title: 'Romance Books',
    description: 'Fall in love with our extensive romance book collection featuring love stories, romantic fiction, and heartwarming tales. From contemporary romance to historical love stories, find your next romantic read.',
    keywords: 'romance books, love stories, romantic fiction, contemporary romance, historical romance, romantic novels',
    longDescription: 'Romance books celebrate love in all its forms, offering readers heartwarming stories of connection, passion, and happily-ever-afters. Our romance collection spans contemporary settings, historical periods, and various subgenres to satisfy every romantic reading preference.',
    relatedCategories: ['Fiction', 'Drama', 'History'],
    popularAuthors: ['Nicholas Sparks', 'Nora Roberts', 'Julia Quinn', 'Colleen Hoover', 'Jane Austen']
  },
  
  'Business': {
    title: 'Business Books',
    description: 'Advance your career with our comprehensive business book collection covering entrepreneurship, management, leadership, and professional development. Learn from successful business leaders and industry experts.',
    keywords: 'business books, entrepreneurship, management, leadership, professional development, business strategy, career growth',
    longDescription: 'Business books provide valuable insights into entrepreneurship, management strategies, leadership principles, and professional development. Our business collection features works by successful entrepreneurs, industry leaders, and business experts who share their knowledge and experience to help readers succeed in their careers.',
    relatedCategories: ['Self-Help', 'Technology', 'Education', 'Non-Fiction'],
    popularAuthors: ['Jim Collins', 'Simon Sinek', 'Malcolm Gladwell', 'Seth Godin', 'Tim Ferriss']
  },
  
  'Self-Help': {
    title: 'Self-Help Books',
    description: 'Transform your life with our inspiring self-help book collection featuring personal development, motivation, and life improvement guides. Discover practical strategies for success and happiness.',
    keywords: 'self-help books, personal development, motivation, life improvement, success, happiness, self-improvement',
    longDescription: 'Self-help books empower readers to improve their lives through practical advice, motivational insights, and proven strategies for personal growth. Our self-help collection covers topics like productivity, relationships, mental health, and achieving personal goals.',
    relatedCategories: ['Business', 'Health', 'Non-Fiction', 'Education'],
    popularAuthors: ['Tony Robbins', 'Dale Carnegie', 'Stephen Covey', 'Brené Brown', 'James Clear']
  },
  
  'Technology': {
    title: 'Technology Books',
    description: 'Stay current with our technology book collection covering programming, software development, artificial intelligence, and digital innovation. Learn from tech experts and industry professionals.',
    keywords: 'technology books, programming, software development, AI, computer science, tech innovation, coding',
    longDescription: 'Technology books keep readers informed about the latest developments in computing, programming, artificial intelligence, and digital innovation. Our technology collection features guides for beginners and advanced practitioners in various tech fields.',
    relatedCategories: ['Business', 'Education', 'Science', 'Non-Fiction'],
    popularAuthors: ['Robert C. Martin', 'Steve McConnell', 'Eric Evans', 'Martin Fowler', 'Kathy Sierra']
  },
  
  'Science': {
    title: 'Science Books',
    description: 'Explore the wonders of science with our comprehensive collection covering physics, biology, chemistry, and scientific discoveries. Learn about the natural world from leading scientists and researchers.',
    keywords: 'science books, physics, biology, chemistry, scientific discoveries, natural world, research',
    longDescription: 'Science books make complex scientific concepts accessible to readers of all levels, covering everything from basic principles to cutting-edge research. Our science collection features works by renowned scientists, researchers, and science communicators.',
    relatedCategories: ['Technology', 'Education', 'Non-Fiction', 'Health'],
    popularAuthors: ['Neil deGrasse Tyson', 'Bill Nye', 'Mary Roach', 'Brian Cox', 'Michio Kaku']
  },
  
  'History': {
    title: 'History Books',
    description: 'Journey through time with our extensive history book collection covering world history, historical events, and civilizations. Learn from the past with engaging historical narratives and scholarly works.',
    keywords: 'history books, world history, historical events, civilizations, historical narratives, past events',
    longDescription: 'History books bring the past to life through engaging narratives, scholarly research, and detailed accounts of significant events and civilizations. Our history collection spans all time periods and geographical regions.',
    relatedCategories: ['Non-Fiction', 'Biography', 'Education'],
    popularAuthors: ['David McCullough', 'Doris Kearns Goodwin', 'Erik Larson', 'Antony Beevor', 'Barbara Tuchman']
  },
  
  'Biography': {
    title: 'Biography Books',
    description: 'Discover inspiring life stories with our biography collection featuring memoirs, autobiographies, and biographical accounts of remarkable individuals who shaped history and culture.',
    keywords: 'biography books, memoirs, autobiographies, life stories, famous people, inspiring lives',
    longDescription: 'Biography books offer intimate glimpses into the lives of extraordinary individuals, from historical figures to contemporary leaders. Our biography collection includes memoirs, autobiographies, and biographical accounts that inspire and educate.',
    relatedCategories: ['Non-Fiction', 'History', 'Self-Help'],
    popularAuthors: ['Walter Isaacson', 'Ron Chernow', 'Doris Kearns Goodwin', 'Robert Caro', 'Tara Westover']
  }
};

/**
 * Get category information by name
 * @param {string} categoryName - Name of the category
 * @returns {Object} - Category information object
 */
export const getCategoryInfo = (categoryName) => {
  return CATEGORY_DESCRIPTIONS[categoryName] || {
    title: `${categoryName} Books`,
    description: `Explore our collection of ${categoryName.toLowerCase()} books with great prices and fast delivery.`,
    keywords: `${categoryName.toLowerCase()} books, buy ${categoryName.toLowerCase()} online`,
    longDescription: `Discover a wide selection of ${categoryName.toLowerCase()} books in our online bookstore.`,
    relatedCategories: [],
    popularAuthors: []
  };
};