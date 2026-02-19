import { Menu, Search, X, ChevronRight, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BookIndex {
  name: string;
  slug: string;
  chapters: number;
}

interface SidebarProps {
  onChapterDataLoaded: (verses: Record<string, string>, bookName: string, chapterNum: number, slug: string) => void;
  currentChapterId?: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Sidebar({ onChapterDataLoaded, currentChapterId, isDarkMode, toggleTheme }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [books, setBooks] = useState<BookIndex[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/bible/books.json')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Could not load bible index", err));
  }, []);

  const handleChapterSelect = async (bookSlug: string, chapterNum: number, bookName: string) => {
    try {
      const response = await fetch(`/data/bible/${bookSlug}/${chapterNum}.json`);
      const data = await response.json();
      onChapterDataLoaded(data, bookName, chapterNum, bookSlug); 
      if (window.innerWidth < 1024) setIsOpen(false);
    } catch (err) {
      console.error("Error loading chapter data:", err);
    }
  };

  const filteredBooks = books.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-card text-card-foreground rounded-md shadow-md border border-border"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Use bg-sidebar and border-sidebar-border */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:relative lg:translate-x-0 border-r border-sidebar-border ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            <h2 className="font-bold text-xl tracking-tight">Holy Bible: King James 1611</h2>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2"><X /></button>
          </div>

          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search books..." 
                /* bg-input-background from theme.css */
                className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border-none focus:ring-2 focus:ring-primary outline-none text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {filteredBooks.map((book) => (
              <div key={book.slug} className="mb-1">
                <button
                  onClick={() => setExpandedBook(expandedBook === book.slug ? null : book.slug)}
                  className={`w-full flex items-center justify-between p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors ${expandedBook === book.slug ? 'bg-sidebar-accent' : ''}`}
                >
                  <span className="font-medium text-sm">{book.name}</span>
                  {expandedBook === book.slug ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
                
                {expandedBook === book.slug && (
                  <div className="grid grid-cols-5 gap-1 p-2 bg-sidebar-accent/50 rounded-lg mt-1 mx-1">
                    {Array.from({ length: book.chapters }, (_, i) => i + 1).map(num => {
                      const isActive = currentChapterId === `${book.slug}-${num}`;
                      return (
                        <button
                          key={num}
                          onClick={() => handleChapterSelect(book.slug, num, book.name)}
                          className={`aspect-square flex items-center justify-center text-xs rounded border transition-all ${
                            isActive 
                              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm' 
                              : 'bg-background border-border hover:border-primary text-foreground'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-sidebar-border">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full p-2.5 hover:bg-sidebar-accent rounded-xl transition-colors text-sm font-medium"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-primary" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}