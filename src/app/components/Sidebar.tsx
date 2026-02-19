import { Menu, Search, X, ChevronRight, ChevronDown, Contrast } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChapterReference } from '../data/bible-books';

interface SidebarProps {
  chapters: ChapterReference[];
  onChapterClick: (chapterId: string) => void;
  currentChapterId?: string;
  highContrast: boolean;
  onHighContrastChange: (value: boolean) => void;
}

interface BookGroup {
  bookName: string;
  chapters: ChapterReference[];
}

export function Sidebar({ 
  chapters = [], 
  onChapterClick, 
  currentChapterId, 
  highContrast, 
  onHighContrastChange 
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());

  // 1. Memoized grouping of chapters by book name
  const bookGroups = useMemo(() => {
    const bookMap = new Map<string, ChapterReference[]>();
    
    chapters.forEach((chapter) => {
      const name = chapter.bookName || "Unknown Book";
      if (!bookMap.has(name)) {
        bookMap.set(name, []);
      }
      bookMap.get(name)!.push(chapter);
    });

    return Array.from(bookMap.entries()).map(([bookName, chapters]) => ({
      bookName,
      chapters
    }));
  }, [chapters]);

  // 2. Filter logic for search - FIXED TO PREVENT TOSTRING ERRORS
  const filteredBookGroups = useMemo(() => {
    if (!searchQuery.trim()) return bookGroups;

    const query = searchQuery.toLowerCase();
    return bookGroups
      .map((group) => ({
        ...group,
        chapters: group.chapters.filter((chapter) => {
          // Check for both 'chapterNumber' and 'chapter' to be safe
          const cNum = chapter.chapterNumber ?? (chapter as any).chapter;
          
          const bookNameStr = (chapter.bookName || "").toLowerCase();
          const chapterNumStr = (cNum ?? "").toString();
          const combinedStr = `${bookNameStr} ${chapterNumStr}`;

          return (
            bookNameStr.includes(query) ||
            chapterNumStr.includes(query) ||
            combinedStr.includes(query)
          );
        }),
      }))
      .filter((group) => group.chapters.length > 0);
  }, [bookGroups, searchQuery]);

  // Auto-expand books when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allBookNames = new Set(filteredBookGroups.map((g) => g.bookName));
      setExpandedBooks(allBookNames);
    }
  }, [searchQuery, filteredBookGroups]);

  const toggleBook = (bookName: string) => {
    setExpandedBooks((prev) => {
      const next = new Set(prev);
      if (next.has(bookName)) {
        next.delete(bookName);
      } else {
        next.add(bookName);
      }
      return next;
    });
  };

  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId);
    setIsOpen(false);
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    onHighContrastChange(newValue);
    localStorage.setItem('bibleHighContrast', String(newValue));
  };

  const hcStyles = highContrast
    ? {
        bg: 'bg-black',
        text: 'text-white',
        border: 'border-white',
        buttonBg: 'bg-black',
        buttonHover: 'hover:bg-gray-900',
        activeBg: 'bg-yellow-400 text-black',
        hoverBg: 'hover:bg-gray-800',
        inputBg: 'bg-black',
        inputBorder: 'border-white',
        inputText: 'text-white',
        secondaryText: 'text-gray-300',
      }
    : {
        bg: 'bg-white',
        text: 'text-gray-800',
        border: 'border-gray-200',
        buttonBg: 'bg-white',
        buttonHover: 'hover:bg-gray-50',
        activeBg: 'bg-blue-100 text-blue-700',
        hoverBg: 'hover:bg-blue-50',
        inputBg: 'bg-white',
        inputBorder: 'border-gray-300',
        inputText: 'text-gray-700',
        secondaryText: 'text-gray-600',
      };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-40 ${hcStyles.buttonBg} rounded-lg shadow-lg p-3 ${hcStyles.buttonHover} transition-colors ${
          highContrast ? 'border-2 border-white' : ''
        }`}
      >
        <Menu className={`w-6 h-6 ${highContrast ? 'text-white' : 'text-gray-700'}`} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-80 ${hcStyles.bg} shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className={`flex items-center justify-between p-4 border-b ${hcStyles.border}`}>
            <h2 className={`text-lg font-semibold ${hcStyles.text}`}>Holy Bible KJV</h2>
            <button onClick={() => setIsOpen(false)} className={`p-2 ${hcStyles.hoverBg} rounded-lg`}>
              <X className={`w-5 h-5 ${hcStyles.secondaryText}`} />
            </button>
          </div>

          {/* High Contrast Toggle */}
          <div className={`p-4 border-b ${hcStyles.border}`}>
            <button onClick={toggleHighContrast} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg ${hcStyles.hoverBg} border ${highContrast ? 'border-yellow-400' : 'border-gray-300'}`}>
              <div className="flex items-center gap-2">
                <Contrast className={`w-4 h-4 ${hcStyles.text}`} />
                <span className={`text-sm font-medium ${hcStyles.text}`}>High Contrast</span>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${highContrast ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${highContrast ? 'left-4' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Search Input */}
          <div className={`p-4 border-b ${hcStyles.border}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${hcStyles.secondaryText}`} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${hcStyles.inputBorder} ${hcStyles.inputBg} ${hcStyles.inputText} rounded-lg focus:outline-none`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* VIRTUALIZED BOOK LIST */}
            <Virtuoso
              style={{ height: '100%' }}
              data={filteredBookGroups}
              itemContent={(index, group) => (
                <div key={group.bookName} className="p-2">
                  <button
                    onClick={() => toggleBook(group.bookName)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${hcStyles.hoverBg} ${highContrast ? 'border border-white' : ''}`}
                  >
                    <span className={`font-semibold text-left ${hcStyles.text}`}>{group.bookName}</span>
                    {expandedBooks.has(group.bookName) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {expandedBooks.has(group.bookName) && (
                    <div className="ml-4 mt-2 grid grid-cols-4 gap-1">
                      {group.chapters.map((chapter) => {
                         const displayNum = chapter.chapterNumber ?? (chapter as any).chapter;
                         return (
                          <button
                            key={chapter.id}
                            onClick={() => handleChapterClick(chapter.id)}
                            className={`text-center py-2 rounded-lg text-xs transition-colors ${
                              currentChapterId === chapter.id ? hcStyles.activeBg : hcStyles.inputText
                            } ${hcStyles.hoverBg}`}
                          >
                            {displayNum}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </aside>
    </>
  );
}