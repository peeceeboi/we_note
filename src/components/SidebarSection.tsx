import React, { useState } from "react";
import SidebarItem, { SidebarItemProps } from "./SidebarItem";

interface SidebarSectionProps {
  title: string;
  items: SidebarItemProps[];
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, items }) => {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false); // Toggle search box
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term state
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false); // Toggle add folder input
  const [newFolderName, setNewFolderName] = useState<string>(''); // New folder name state
  const [newFolderDescription, setNewFolderDescription] = useState<string>(''); // New folder description state

  // Toggle the search box visibility
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setSearchTerm(''); // Clear search term when closing
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Toggle the add folder input visibility
  const toggleAddFolder = () => {
    setIsAddingFolder((prev) => !prev);
    if (isAddingFolder) {
      setNewFolderName(''); // Clear folder name when canceling
      setNewFolderDescription(''); // Clear folder description when canceling
    }
  };

  // Handle new folder name input change
  const handleNewFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFolderName(e.target.value);
  };

  // Handle new folder description input change
  const handleNewFolderDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFolderDescription(e.target.value);
  };

  // Handle adding a new folder
  const handleAddFolder = async () => {
    if (newFolderName.trim() !== "") {
      try {
        const response = await fetch('http://localhost:3001/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include the session cookie
          body: JSON.stringify({
            name: newFolderName.trim(),
            description: newFolderDescription.trim(),
          }),
        });
        const data = await response.json();
        // onAddFolder(newFolderName.trim());
        setNewFolderName('');
        setNewFolderDescription('');
        setIsAddingFolder(false);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Foldername empty")
    }
  };

  // Handle canceling adding a new folder
  const handleCancelAddFolder = () => {
    setNewFolderName('');
    setNewFolderDescription('');
    setIsAddingFolder(false);
  };


  // Filtered items based on search term
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="flex flex-col mt-8 w-full transition-all duration-300">
      <div className="flex gap-4 justify-between items-center px-5 w-full text-sm">
        <h2 className="text-white">{title}</h2>
        {title === "Folders" && (
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="p-1 rounded hover:bg-neutral-700 focus:outline-none transition-colors duration-200"
              aria-label="Toggle Search"
            >
              <svg
                className="w-5 h-5 text-white"
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

            {/* Add Folder Icon */}
            <button
              onClick={toggleAddFolder}
              className="p-1 rounded hover:bg-neutral-700 focus:outline-none transition-colors duration-200"
              aria-label="Add Folder"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div
        className={`px-5 py-2 overflow-hidden transition-all duration-300 ${
          isSearchOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search folders..."
          className="w-full px-3 py-2 bg-gray-800/40 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5953e0] transition-opacity duration-300"
        />
      </div>

      {/* Add Folder Input */}
      <div
        className={`px-5 py-2 overflow-hidden transition-all duration-300 ${
          isAddingFolder ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        } flex items-center`}
      >
        <input
          type="text"
          value={newFolderName}
          onChange={handleNewFolderNameChange}
          placeholder="New folder name"
          className="w-full px-3 py-2 bg-gray-800/40 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5953e0] transition-opacity duration-300"
        />
        <input
          type="text"
          value={newFolderDescription}
          onChange={handleNewFolderDescriptionChange}
          placeholder="Add description (optional)"
          className="w-full px-3 py-2 bg-gray-800/40 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5953e0] transition-opacity duration-300"
        />
        {/* Tick Icon */}
        <button
          onClick={handleAddFolder}
          className={`ml-2 p-1 rounded hover:bg-gray-800 focus:outline-none transition-colors duration-200 ${
        newFolderName.trim() === "" ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          disabled={newFolderName.trim() === ""}
          aria-label="Confirm Add Folder"
        >
          <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
          >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
          </svg>
        </button>
      </div>

      <div className="flex flex-col mt-2 w-full text-base">
        {/* Scrollable container */}
        {filteredItems.map((item, index) => (
          <SidebarItem key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default SidebarSection;