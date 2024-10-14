import React, { useState, useEffect } from 'react';
import NoteListItem, { NoteListItemProps } from './NoteListItem';

interface NoteListProps {
  onNoteClick: (note: NoteListItemProps) => void; // Pass handler to parent
  onCategoriesUpdate: (categories: Category[]) => void;
  refreshList: () => void;
  refreshtrigger: boolean;
  selectedCategory: Category;
}

interface NoteCategoryProp {
  id: number;
  note_id: number;
  category_id: number;
}
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

const NoteList: React.FC<NoteListProps> = ({ onNoteClick , onCategoriesUpdate, refreshList, refreshtrigger, selectedCategory}) => {
  const [filteredNotes, setFilteredNotes] = useState<NoteListItemProps[]>([])
  const [note_categories, setCategories] = useState<NoteCategoryProp[]>([]);
  const [categories, setCategoriesDetails] = useState<Category[]>([]);
  const [notes, setNotes] = useState<NoteListItemProps[]>([]); // Notes state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null); // Track selected note
  const [sortOption, setSortOption] = useState<string>('date-asc'); // Sort option state
  const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false); // Sort menu visibility
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false); // Search box visibility
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term state

  useEffect(() => {
    const fetchNotesAndCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/notes', {
          method: 'GET',
          credentials: 'include',
        });
  
        if (response.ok) {
          const { notes } = await response.json();
  
          const noteCategoriesPromises = notes.map((note: NoteListItemProps) =>
            fetch(`http://localhost:3001/notecat/note/${note.id}`, {
              method: 'GET',
              credentials: 'include',
            })
          );
  
          const noteCategoriesResponses = await Promise.all(noteCategoriesPromises);
  
          const categories = await Promise.all(
            noteCategoriesResponses.map((response) => response.json())
          );
  
          setNotes(notes);
          const mergedCategories = categories.flatMap(category => category.noteCategories || []);
          setCategories(mergedCategories);
  
          // Fetch category details for each category_id
          const categoryDetailsPromises = mergedCategories.map((noteCategory: NoteCategoryProp) =>
            fetch(`http://localhost:3001/categories/${noteCategory.category_id}`, {
              method: 'GET',
              credentials: 'include',
            }).then(response => response.json())
          );
  
          const categoryDetailsResponses = await Promise.all(categoryDetailsPromises);
          const uniqueCategoryDetails = categoryDetailsResponses.map(detail => detail.category).filter((value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
          );
          setCategoriesDetails(uniqueCategoryDetails);
          onCategoriesUpdate(uniqueCategoryDetails);
        } else {
          console.error('Failed to fetch notes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching notes and categories:', error);
      }
    };
    console.log("from notelist");
    fetchNotesAndCategories();
  }, [refreshtrigger]);

  useEffect(() => {
    console.log(selectedCategory);
    if (selectedCategory.name === "All") {
      // No filtering needed, use all notes
      setFilteredNotes(notes);
    } else {
      // Filter notes by selected category
      const noteIdsInCategory = note_categories
        .filter((nc) => nc.category_id === selectedCategory.id)
        .map((nc) => nc.note_id);
  
      const filteredNotes = notes.filter((note) => noteIdsInCategory.includes(Number(note.id)));
      setFilteredNotes(filteredNotes);
    }
  }, [selectedCategory, note_categories, notes]);

  const handleNoteClick = (note: NoteListItemProps, categories: Category[]) => {
    setSelectedNoteId(note.id); // Update selected note
    onNoteClick(note); // Trigger parent handler
    onCategoriesUpdate(categories);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setIsSortMenuOpen(false); // Close menu after selecting
  };

  const toggleSortMenu = () => {
    setIsSortMenuOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setSearchTerm(''); // Clear search term when closing
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const sortedAndFilteredNotes = filteredNotes
  .filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    const dateA = new Date(a.edited_at.replace(' ', 'T'));
    const dateB = new Date(b.edited_at.replace(' ', 'T'));

    if (sortOption === 'date-asc') {
      return dateA.getTime() - dateB.getTime();
    } else if (sortOption === 'date-desc') {
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  return (
    <section className="flex flex-col bg-gray-950/30 min-w-[280px] max-w-full overflow-hidden rounded-2xl h-full flex-grow transition-all duration-300">
      {/* Header with logo, title, search icon, and sort icon */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 bg-gray-950/50 sticky top-0 z-10 transition-all duration-300">
          {/* Title */}
          <h1 className="text-2xl font-bold text-white whitespace-nowrap">
            Work Notes
          </h1>
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="rounded hover:bg-gray-800/40  focus:outline-none transition-colors duration-200"
              aria-label="Toggle Search"
            >
              {/* Search Icon SVG */}
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>

            {/* Sort Icon */}
            <button
              onClick={toggleSortMenu}
              className="p-2 rounded hover:bg-gray-800/40 focus:outline-none transition-colors duration-200"
              aria-label="Toggle Sort Menu"
            >
              {/* Sort Icon SVG */}
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5h14a1 1 0 100-2H3a1 1 0 100 2zm0 6h14a1 1 0 100-2H3a1 1 0 100 2zm0 6h14a1 1 0 100-2H3a1 1 0 100 2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div
          className={`px-5 py-2 bg-gray-950/30 transition-all duration-300 overflow-hidden ${
            isSearchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search notes..."
            className="w-full px-3 py-2 bg-gray-800/40 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5953e0] transition-opacity duration-300"
          />
        </div>

        {/* Sort Menu */}
        <div
          className={`px-5 py-2 bg-gray-950/30 transition-all duration-300 overflow-hidden ${
            isSortMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleSortChange('date-asc')}
              className={`px-4 py-2 text-sm text-white w-full rounded-lg text-left ${
                sortOption === 'date-asc'
                  ? 'bg-gray-800/40'
                  : 'hover:bg-gray-800/30'
              } transition-colors duration-200`}
            >
              Date Ascending
            </button>
            <button
              onClick={() => handleSortChange('date-desc')}
              className={`px-4 py-2 text-sm text-white w-full rounded-lg text-left ${
                sortOption === 'date-desc'
                  ? 'bg-gray-800/40'
                  : 'hover:bg-gray-800/30'
              } transition-colors duration-200`}
            >
              Date Descending
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-5 w-full h-full overflow-y-auto">
        {/* Scrollable container */}
        {sortedAndFilteredNotes.length > 0 ? (
          sortedAndFilteredNotes.map((note) => (
            <NoteListItem
              key={note.id}
              {...note}
              isSelected={selectedNoteId === note.id} // Pass selected state
              onClick={() => handleNoteClick(note, categories)} // Call handler when a note is clicked
            />
          ))
        ) : (
          <p className="text-white mt-4">No notes found.</p>
        )}
      </div>
    </section>
  );
};

export default NoteList;
