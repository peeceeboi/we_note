// NoteEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface NoteEditorProps {
  note: {
    id: string;
    title: string;
    content: string;
    created_at: string; // Add the created_at field to the note object
  };
  onChange: (note: any) => void;
  onSave: (note: any) => void;
  onDelete: () => void;
  onlineCollaberators: string[];
  socket: any;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange, onSave, onDelete, onlineCollaberators, socket }) => {
  
  const [tableRows, setTableRows] = useState<number>(0);
  const [tableCols, setTableCols] = useState<number>(0);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [currentFormat, setCurrentFormat] = useState("Paragraph"); // Add state for current format

  const customToastOptions: ToastOptions = {
    className: 'bg-gray-900 text-white',
    bodyClassName: 'text-sm font-medium',
    progressClassName: 'bg-purple-600',
    position: 'top-center',
    autoClose: 3000, // 3 seconds duration
  };

  // State to manage the main menu visibility
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State to manage the note content
  const [noteContent, setNoteContent] = useState('');

  // State to manage whether markdown is displayed or not
  const [isMarkdownView, setIsMarkdownView] = useState(false);

  // State to manage the note title
  const [noteTitle, setNoteTitle] = useState("");

  // State to manage the selected folder
  const [folder, setFolder] = useState("None");

  // State to manage the list of folders
  const [folders, setFolders] = useState<string[]>(["Personal"]);
  
  // State to manage new folder input visibility and value
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // State to manage collaborators and their dropdown visibility
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isCollaboratorsMenuOpen, setIsCollaboratorsMenuOpen] = useState(false);

  // State to manage invite input visibility and value
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Additional States for Toolbar Functionality
  const [isParagraphMenuOpen, setIsParagraphMenuOpen] = useState(false);
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(18); // Initialize currentFontSize state

  // Refs for menus to handle click outside
  const menuRef = useRef<HTMLDivElement>(null);
  const paragraphMenuRef = useRef<HTMLDivElement>(null);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const collaboratorsMenuRef = useRef<HTMLDivElement>(null);

  // Ref for the textarea to handle text selection
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/categories', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setCategories([{
          id: 0,
          name: "None",
          description: null as string | null // Add type assertion
        }].concat(data.categories) as Category[]); // Access the categories array
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchNoteCategory = async () => {
      console.log("Hello");
      const id = note.id;
      try {
        const response = await fetch(`http://localhost:3001/notecat/note/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          try {
            const response = await fetch(`http://localhost:3001/categories/${data.noteCategories[0].category_id}`, {
              method: 'Get',
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setFolder(data.category.name);
            }
          } catch (error) {
            console.error("Error fetching note category", error);
          }
        }
      } catch (error) {
        console.error('Error fetching relationship:', error);
      }
    };
    
    if (note) {
      setNoteId(note.id);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setIsCollaboratorsMenuOpen(false);
      setCollaborators([]);

      fetchNoteCategory();

    }
    fetchCategories();
    console.log(selectedCategoryId);

    socket.on('ContentChange', (note: any) =>{
      setNoteContent(note.content);
      setNoteTitle(note.title);
      setFolder(note.folder);
      console.log(note);
    });
  }, [note, selectedCategoryId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  // Handler for markdown view toggle
  const handleViewToggle = () => {
    setIsMarkdownView((prev) => !prev);
  };

  // Handler for main menu button click
  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Handler for note content change
  const handleContentChange = (content: string) => {
    setNoteContent(content);
    onChange({ ...note, content, folder }); // Ensure onChange is called with updated content
  };

  // Handler for adding a new collaborator
  const handleInviteCollaborator = async (noteId: string, userEmail: string) => {
    try {
      // Fetch the user by their email to get their UUID
      const userResponse = await fetch(`http://localhost:3001/users/email/${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // To include authentication cookie
      });
  
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        toast.error('Failed to find the user!', customToastOptions);
        return;
      }
  
      const { user } = await userResponse.json();
      const newUserId = user.id; // Get the UUID of the user
  
      // Share the note using the user's UUID
      const response = await fetch(`http://localhost:3001/notes/${noteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // To include authentication cookie
        body: JSON.stringify({ newUserId }), // Use the UUID here
      });
  
      if (response.ok) {
        setShowInviteInput(false);
        toast.success('Note has been shared.', customToastOptions);
        // Optionally, refresh collaborators list
        handleCollaboratorsMenuToggle();
      } else {
        const errorData = await response.json();
        toast.error('Failed to share the note.', customToastOptions);
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      toast.error('An error has occured sharing the note.', customToastOptions);
    }
  };

  // Handler for saving the note
  const handleSaveNote = async () => {
    const noteData = { title: noteTitle, content: noteContent };
    try {
      let response;
      if (noteId) {
        response = await fetch(`http://localhost:3001/notes/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });
      } else {
        response = await fetch('http://localhost:3001/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });
      }
      if (!response.ok) throw new Error('Failed to save note');
      
      // Get the note ID from the response
      const noteResponseData = await response.json();
      const currentNoteId = noteId || noteResponseData.id;
      
      // Check if note_category exists and create if not
      if (selectedCategoryId !== 0) {
        const noteCategoryResponse = await fetch(`http://localhost:3001/notecat/note/${currentNoteId}/category/${selectedCategoryId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (noteCategoryResponse.ok) {
          const existingNoteCategory = await noteCategoryResponse.json();
          
          if (existingNoteCategory && existingNoteCategory.noteCategory) {
            console.log('Note category already exists:', existingNoteCategory.noteCategory);
          } else {
            console.log('Note category does not exist. Creating a new one...');
            
            const createNoteCategoryResponse = await fetch('http://localhost:3001/notecat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ noteId: currentNoteId, categoryId: selectedCategoryId }),
            });
            
            if (createNoteCategoryResponse.ok) {
              const newNoteCategory = await createNoteCategoryResponse.json();
              console.log('Note category created:', newNoteCategory);
            } else {
              console.error('Failed to create note category:', createNoteCategoryResponse.statusText);
            }
          }
        } else if (noteCategoryResponse.status === 404) {
          console.log('Note category does not exist. Creating a new one...');
          
          const createNoteCategoryResponse = await fetch('http://localhost:3001/notecat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ noteId: currentNoteId, categoryId: selectedCategoryId }),
          });
          
          if (createNoteCategoryResponse.ok) {
            const newNoteCategory = await createNoteCategoryResponse.json();
            console.log('Note category created:', newNoteCategory);
          } else {
            console.error('Failed to create note category:', createNoteCategoryResponse.statusText);
          }
        } else {
          console.error('Failed to retrieve note category:', noteCategoryResponse.statusText);
        }
      }

      
      toast.success('Note was saved!', customToastOptions);
      onSave(note);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Note could not be saved!', customToastOptions);
    }
  };
  
  const handleCollaboratorsMenuToggle = async () => {
    setIsCollaboratorsMenuOpen((prev) => !prev);
    if (!isCollaboratorsMenuOpen && noteId) {
      try {
        const response = await fetch(`http://localhost:3001/notes/${noteId}/collaborators`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCollaborators(data.collaborators.map((collab: { username: string }) => collab.username));
        } else {
          const errorData = await response.json();
          toast.error(`Failed to fetch collaborators: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
        toast.error('An error occurred while fetching collaborators.');
      }
    }
  };

  // Handler for formatting text
  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = noteContent.substring(start, end);
      const before = noteContent.substring(0, start);
      const after = noteContent.substring(end);
      let newText = '';
      let cursorOffset = 0;

      switch (format) {
        case 'bold':
          newText = `${before}**${selectedText}**${after}`;
          cursorOffset = 2;
          break;
        case 'italic':
          newText = `${before}*${selectedText}*${after}`;
          cursorOffset = 1;
          break;
        case 'underline':
          newText = `${before}__${selectedText}__${after}`;
          cursorOffset = 2;
          break;
        default:
          return;
      }

      handleContentChange(newText);

      // Move cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + cursorOffset, end + cursorOffset); 
      }, 0);
    }
  };

  const handleTable = (rows: number, cols: number) => {
    if (rows <= 0 || cols <= 0) {
      alert("Please enter valid positive numbers for rows and columns.");
      return;
    }

    let tableMarkdown = "\n";
    // Header row
    tableMarkdown += "| " + Array(cols).fill("Header").join(" | ") + " |\n";
    tableMarkdown += "| " + Array(cols).fill("---").join(" | ") + " |\n";

    // Data rows
    for (let i = 0; i < rows; i++) {
      tableMarkdown += "| " + Array(cols).fill("Data").join(" | ") + " |\n";
    }

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = noteContent.substring(0, start);
      const after = noteContent.substring(end);
      const newText = `${before}${tableMarkdown}${after}`;
      handleContentChange(newText);

      // Reset table inputs
      setTableRows(0);
      setTableCols(0);

      // Move cursor and set focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tableMarkdown.length, start + tableMarkdown.length);
      }, 0);
    }
  };

  const handleLink = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = noteContent.substring(start, end);
      const before = noteContent.substring(0, start);
      const after = noteContent.substring(end);
      const newText = `${before}[${selectedText || "link text"}](url)${after}`;
      handleContentChange(newText);

      // Move cursor
      setTimeout(() => {
        textarea.focus();
        if (selectedText) {
          textarea.setSelectionRange(start + 1, end + 1);
        } else {
          textarea.setSelectionRange(start + 1, start + 10);
        }
      }, 0);
    }
  };


  const handleDeleteNote = async () => {
    try {
      const response = await fetch(`http://localhost:3001/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      if (!response.ok) throw new Error('Failed to delete note');
      
      toast.success('Note was deleted!', customToastOptions);
      onDelete();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Note could not be deleted!', customToastOptions);
    }
  };

  // Handler for paragraph formatting
  const handleParagraph = (option: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = noteContent.substring(start, end);
      const before = noteContent.substring(0, start);
      const after = noteContent.substring(end);
      let newText = '';

      switch (option) {
        case 'Title':
          newText = `${before}# ${selectedText }\n${after}`;
          break;
        case 'Heading 1':
          newText = `${before}## ${selectedText}\n${after}`;
          break;
        case 'Heading 2':
          newText = `${before}### ${selectedText}\n${after}`;
          break;
        default:
          return;
      }
      setCurrentFormat(option);
      handleContentChange(newText);

      // Move cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + newText.length, start + newText.length);
        
      }, 0);
    }
  };

  // Handler for font size change
  const handleFontSizeChange = (size: number) => {
    setCurrentFontSize(size); // Update state with the selected font size
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.fontSize = `${size}px`;
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);
      }
      if (
        paragraphMenuRef.current &&
        !paragraphMenuRef.current.contains(event.target as Node) &&
        isParagraphMenuOpen
      ) {
        setIsParagraphMenuOpen(false);
      }
      if (
        fontSizeMenuRef.current &&
        !fontSizeMenuRef.current.contains(event.target as Node) &&
        isFontSizeMenuOpen
      ) {
        setIsFontSizeMenuOpen(false);
      }
      if (
        tableMenuRef.current &&
        !tableMenuRef.current.contains(event.target as Node) &&
        isTableMenuOpen
      ) {
        setIsTableMenuOpen(false);
      }
      if (
        collaboratorsMenuRef.current &&
        !collaboratorsMenuRef.current.contains(event.target as Node) &&
        isCollaboratorsMenuOpen
      ) {
        setIsCollaboratorsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isParagraphMenuOpen, isFontSizeMenuOpen, isTableMenuOpen, isCollaboratorsMenuOpen]);

  return (
    <main
      className="flex flex-col h-full rounded-2xl p-6 bg-gray-950/50 min-w-[240px] max-md:px-5 max-md:max-w-full text-white"
    >
      {/* Header Section */}
      <header className="flex gap-10 justify-between items-center w-auto max-md:max-w-full">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="text-4xl font-bold text-white bg-transparent border-none focus:outline-none"
        />
        <button
          className="flex gap-2 justify-center items-center my-auto border border-white border-solid min-h-[30px] rounded-full w-[30px] 
           hover:bg-white hover:bg-opacity-10 active:bg-white active:bg-opacity-20 transition duration-200"
          onClick={handleMenuToggle}
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/15359a5bac6426cf4dc640d753abbdcb852222352e6988ddfeaddb76fe05e1f5?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
            alt="Menu"
            className="object-contain w-5 aspect-square"
          />
        </button>
      </header>

      {/* Conditionally Rendered Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="bg-gray-900 text-white rounded-2xl w-48 absolute right-0 mt-16 mr-10 z-50">
          <ul>
            <li
              className="cursor-pointer transition duration-200 hover:bg-gray-800 rounded-2xl p-2"
            >
             Favourite
            </li>
            <li
              className="cursor-pointer transition duration-200 hover:bg-gray-800 rounded-2xl p-2"
            >
              Archive
            </li>
             <li
              className="cursor-pointer transition duration-200 hover:bg-gray-800 rounded-2xl p-2"
              onClick={() => handleDeleteNote()}
            >
              Delete
            </li>
          </ul>
        </div>
      )}


      {/* Details Section */}
      <section className="flex flex-col items-start mt-8 w-full max-md:max-w-full">
        {/* Date Row */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-start w-[30px]">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c156ddc0210a1262e474a39026bc3a55eaa7cb2188b37bac4406e096f0b31cda?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Date Icon"
              className="object-contain aspect-square w-[18px]"
            />
          </div>
          <div className="text-sm font-semibold text-white text-opacity-60 w-[100px]">
            Date Created
          </div>
          <div className="text-sm font-semibold text-white">{formatDate(note.created_at)}</div>
        </div>
        {/* Divider */}
        <div className="flex self-stretch mt-4 w-full bg-white bg-opacity-10 min-h-[1px] max-md:max-w-full" />
        {/* Folder Row */}
        <div className="flex gap-2 items-center mt-4">
          <div className="flex gap-2 items-start w-[30px]">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/1d9afdebde753709bd32e24723525d4e096e6621dc653e811424ece5c0eb1b29?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Folder Icon"
              className="object-contain aspect-square w-[18px]"
            />
          </div>
          <div className="text-sm font-semibold text-white text-opacity-60 w-[91px]">
            Folder
          </div>
            <div className="flex items-center">
            <select
              className="bg-gray-900 text-sm font-semibold text-white rounded-2xl px-2 py-1"
              value={folder}
              onChange={(e) => {
              const selectedCategory = categories.find((category) => category.name === e.target.value);
              setFolder(e.target.value);
              setSelectedCategoryId(selectedCategory ? selectedCategory.id : 0); // Default to 1 if category not found
                }}
                style={{ backgroundColor: '#4a47c0' }} // Set the background color to a slightly darker shade of very dark blue
            >
              {categories.map((category) => (
              <option key={category.id} value={category.name} >
                {category.name}
              </option>
              ))}
            </select>
            </div>
        </div>
      </section>
      
      {/* Toolbar Section */}
      <section className="flex flex-col mt-4 w-full max-md:max-w-full">
        {/* Divider */}
        <div className="flex w-full bg-white bg-opacity-10 min-h-[1px] max-md:max-w-full" />
        {/* Toolbar Buttons */}
        <div className="flex flex-nowrap gap-4 items-center mt-2.5 w-full max-w-full">
          {/* Paragraph Dropdown */}
          <div className="relative inline-block text-left" ref={paragraphMenuRef}>
            <button
              className="flex gap-2 items-center text-base leading-7 text-white whitespace-nowrap 
              hover:bg-white hover:bg-opacity-10 active:bg-white active:bg-opacity-20 px-2 py-1 rounded-2xl transition duration-200"
              onClick={() => {
                setIsParagraphMenuOpen((prev) => !prev);
                setIsFontSizeMenuOpen(false); // Close font size menu
                setIsTableMenuOpen(false); // Close table menu
                setIsMenuOpen(false); // Close other menus
              }}
            >
              <div className="w-[105px]">Headings</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e335fae7a6136d821278cf13a608f002422813a819aa65fdad5c3aae9bfe8944?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
                alt="Paragraph Icon"
                className="object-contain w-5 aspect-square"
              />
            </button>
            {isParagraphMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  {["Title", "Heading 1", "Heading 2"].map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 text-sm text-white hover:bg-gray-800/50 rounded-xl cursor-pointer"
                      onClick={() => {
                        handleParagraph(option);
                        setIsParagraphMenuOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Font Size Dropdown */}
          <div className="relative inline-block text-left" ref={fontSizeMenuRef}>
            <button
              className="flex gap-2 items-center text-base leading-7 text-white whitespace-nowrap 
                      hover:bg-white hover:bg-opacity-10 active:bg-white active:bg-opacity-20 px-2 py-1 rounded-2xl transition duration-200"
              onClick={() => {
                setIsFontSizeMenuOpen((prev) => !prev);
                setIsParagraphMenuOpen(false); // Close paragraph menu
                setIsTableMenuOpen(false); // Close table menu
                setIsMenuOpen(false); // Close other menus
              }}
            >
                <div>{currentFontSize}</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e335fae7a6136d821278cf13a608f002422813a819aa65fdad5c3aae9bfe8944?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
                alt="Font Size Icon"
                className="object-contain w-5 aspect-square"
              />
            </button>
            {isFontSizeMenuOpen && (
              <div className="absolute left-0 mt-2 w-32 rounded-2xl shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  {[12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32].map((size) => (
                    <div
                      key={size}
                      className="px-4 py-2 text-sm text-white hover:bg-gray-800/50 rounded-xl cursor-pointer"
                      onClick={() => {
                        handleFontSizeChange(size);
                        setIsFontSizeMenuOpen(false);
                      }}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multiple Icons Group */}
          <div className="flex gap-2.5 items-start">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/becf7e93cc8281674c92bf719515b93b02f4525e980a4a3172d2da0e95e52f9f?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Bold Icon"
              className="object-contain w-5 aspect-square cursor-pointer hover:opacity-80 transition duration-200"
              onClick={() => formatText('bold')}
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e837eadcb4dca18583c8c218c249bc44bdeccbb7a837807c3b37fb941191e36f?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Italic Icon"
              className="object-contain w-5 aspect-square cursor-pointer hover:opacity-80 transition duration-200"
              onClick={() => formatText('italic')}
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/21f53672e8c51a176df85f80fe8626aa09af1e1844cef740979f9939bb98808f?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Underline Icon"
              className="object-contain w-5 aspect-square cursor-pointer hover:opacity-80 transition duration-200"
               onClick={() => formatText('underline')}
            />
          </div>

          {/* Another Multiple Icons Group */}
          <div className="flex gap-2.5 items-start">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/60d050cb55bdafb25b3af2669d5e1299256044ebb9f441b05ac86bdd4f06fbcd?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Link Icon"
              className="object-contain w-5 aspect-square cursor-pointer hover:opacity-80 transition duration-200"
              onClick={handleLink}
            />
          </div>

          {/* Table Icon */}
          <div className="relative inline-block text-left" ref={tableMenuRef}>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/68d3f7a9cf1ae95ccb73b3bd059e76f6d7c86fac967d9d020c8244f1e8366e21?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
              alt="Table Icon"
              className="object-contain w-5 aspect-square cursor-pointer hover:opacity-80 transition duration-200"
              onClick={() => {
                setIsTableMenuOpen((prev) => !prev);
                setIsParagraphMenuOpen(false); // Close paragraph menu
                setIsFontSizeMenuOpen(false); // Close font size menu
                setIsMenuOpen(false); // Close other menus
              }}
            />
            {isTableMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-2xl shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1 px-4">
                  <div className="text-white mb-2">Insert Table</div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Rows"
                      value={tableRows}
                      onChange={(e) => setTableRows(Number(e.target.value))}
                      className="w-1/2 bg-gray-800 text-white rounded px-2 py-1 focus:outline-none appearance-none"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Cols"
                      value={tableCols}
                      onChange={(e) => setTableCols(Number(e.target.value))}
                      className="w-1/2 bg-gray-800 text-white rounded px-2 py-1 focus:outline-none appearance-none"
                    />
                  </div>
                  <button
                    className="w-full bg-[#5953e0] text-white px-4 py-2 rounded-2xl hover:bg-[#5953e0]/90 transition duration-200"
                    onClick={() => {
                      handleTable(tableRows, tableCols);
                      setIsTableMenuOpen(false);
                    }}
                  >
                    Insert
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collaborators Dropdown */}
          <div className="relative inline-block text-left ml-auto" ref={collaboratorsMenuRef}>
            <button
              className="flex gap-2 items-center text-base leading-7 text-white whitespace-nowrap 
              hover:bg-white hover:bg-opacity-10 active:bg-white active:bg-opacity-20 px-2 py-1 rounded-2xl transition duration-200"
              onClick={handleCollaboratorsMenuToggle}
            >
              <div>Collaborators</div>
              <svg
              className="w-4 h-4 ml-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collaborators Dropdown Menu */}
            {isCollaboratorsMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-2 px-4 text-lg text-white rounded-t-2xl font-bold">Online</div>
              <div className="py-1">
                {onlineCollaberators.length > 0 ? (
                onlineCollaberators.map((collaborator, index) => (
                  <div key={index} className="px-4 py-2 text-sm text-white hover:bg-gray-800/50 rounded-xl cursor-pointer">
                  {collaborator}
                  </div>
                ))
                ) : (
                <div className="px-4 py-2 text-sm text-white">Loading...</div>
                )}
              </div>
              <div className="py-2 px-4 text-lg text-white rounded-t-2xl font-bold">All</div>
              <div className="py-1">
                {collaborators.length > 0 ? (
                collaborators.map((collaborator, index) => (
                  <div key={index} className="px-4 py-2 text-sm text-white hover:bg-gray-800/50 rounded-xl cursor-pointer">
                  {collaborator}
                  </div>
                ))
                ) : (
                <div className="px-4 py-2 text-sm text-white">Loading...</div>
                )}
              </div>
              </div>
            )}
          </div>

          {/* Invite Collaborator Button */}
          <button
            className="flex gap-2 items-center text-white hover:text-gray-300 transition duration-200"
            onClick={() => setShowInviteInput(true)}
          >
            {/* Plus Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="flex mt-2.5 w-full bg-white bg-opacity-10 min-h-[1px] max-md:max-w-full" />
      </section>

      {/* Invite Collaborator Input */}
      {showInviteInput && (
        <div className="mt-2 flex items-center">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite by email"
            className="bg-transparent text-sm font-semibold text-white border border-white border-opacity-20 rounded-2xl px-2 py-1 focus:outline-none"
          />
          {/* Tick Icon for Add */}
            <button
              className="ml-2 text-white hover:text-gray-300 transition duration-200"
              onClick={() => {
                handleInviteCollaborator(note.id, inviteEmail);
                setInviteEmail(""); // Clear input after inviting
              }} // Pass noteId and inviteEmail here
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
          {/* X Icon for Cancel */}
          <button
            className="ml-2 text-white hover:text-gray-300 transition duration-200"
            onClick={() => setShowInviteInput(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content and Buttons Section */}
      <div className="flex flex-col flex-1 overflow-hidden mt-4">
        <article className="flex-1 overflow-auto">
          {isMarkdownView ? (
            // Rendered Markdown View with contenteditable
            <div className="flex flex-col h-full">
              <div
                className="note-editor-content text-white p-4 flex-1 w-full bg-transparent border border-white border-opacity-20 p-4 rounded-2xl resize-none overflow-auto focus:outline-none focus:ring-2 focus:ring-[#5953e0] focus:ring-inset text-white scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                dangerouslySetInnerHTML={{ __html: marked(noteContent) }}
                style={{ boxSizing: "border-box" , fontSize: `${currentFontSize}px`}}
              />
            </div>
          ) : (
            // Raw Text Edit Mode
            <div className="flex flex-col h-full">
              <textarea
                ref={textareaRef} // Use useRef here
                value={noteContent} // Use state for controlling the textarea's value
                onChange={(e) => handleContentChange(e.target.value)} // Update state on change
                placeholder="Write your note here..."
                className=".note-content-textarea flex-1 w-full bg-transparent border border-[#5953e0] border-opacity-90 p-4 rounded-2xl resize-none overflow-auto focus:outline-none focus:ring-2 focus:ring-[#5953e0] focus:ring-inset text-white scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                style={{ boxSizing: "border-box", fontSize: `${currentFontSize}px` }}
              />
            </div>
          )}
        </article>
        {/* Buttons Section */}
        <div className="flex justify-end gap-4 mt-5">
          <button
            className="bg-gray-800/30 text-white px-4 py-2 rounded-2xl hover:bg-gray-800/50 active:bg-gray-900 transition duration-200"
            onClick={handleViewToggle}
          >
            {isMarkdownView ? "Switch to Edit Mode" : "Switch to Markdown View"}
          </button>
          <button
            className="bg-[#5953e0]/90 text-white px-4 py-2 rounded-2xl hover:bg-[#5953e0] active:bg-gray-300 transition duration-200"
            onClick={handleSaveNote}
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Toast Container */}
      {/* <ToastContainer /> */}
    </main>
  );
};

export default NoteEditor;
