import React, { useState } from "react";
import SidebarSection from "./SidebarSection";
import { FolderItem, MoreItem } from "./SidebarItem";
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
//import { Category } from './NoteList';

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface SidebarProps {
  categories: Category[];
  onItemClick: (category: Category) => void;
  onNewNote: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories = [] , onItemClick, onNewNote}) => {
  const [selectedItem, setSelectedItem] = useState<string>(categories.length > 0 ? categories[0].name : '');
  const navigate = useNavigate();

  const handleItemClick = (category: Category, name: string) => {
    setSelectedItem(name);
    onItemClick(category)
    // Perform navigation or other actions here
  };

  const customToastOptions: ToastOptions = {
    className: 'bg-gray-900 text-white',
    bodyClassName: 'text-sm font-medium',
    progressClassName: 'bg-purple-600',
    position: 'top-center',
    autoClose: 3000, // 3 seconds duration
  };

  const selectedIcon = "https://cdn.builder.io/api/v1/image/assets/TEMP/cb39f2f23e2a04115584555b92d55744f818831e70d7151af3af49d8d2db510d?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703";

  // Define more items with onClick handlers
  // const moreItems: MoreItem[] = [
  //   {
  //     name: "Favorites",
  //     icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/a46436fd25f67178d2e56178a984a183e76952b9f360364abe5b88502668f1d5?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703",
  //     isSelected: selectedItem === "Favorites",
  //     onClick: () => handleItemClick("Favorites"),
  //   },
  //   {
  //     name: "Trash",
  //     icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/e09efc0606175d561330bf218b95d6f9937c28973374a4d19bacfb5e05277f4b?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703",
  //     isSelected: selectedItem === "Trash",
  //     onClick: () => handleItemClick("Trash"),
  //   },
  //   {
  //     name: "Archived Notes",
  //     icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ff75aac119cef0b58e6f95d04e829efd14e3f184362544e49325f0d3b452b04f?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703",
  //     isSelected: selectedItem === "Archived Notes",
  //     onClick: () => handleItemClick("Archived Notes"),
  //   },
  // ];

  // Generate folder items from categories
  const folderItems: FolderItem[] = categories.length > 0
  ? categories.map(category => ({
      name: category.name,
      icon: selectedItem === category.name ? selectedIcon : "https://cdn.builder.io/api/v1/image/assets/TEMP/f73b2aeeb3f442c8c0b65649003ea6bd5083551e0a61af6dea17258a2825725d?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703",
      isSelected: selectedItem === category.name,
      onClick: () => handleItemClick(category, category.name),
    }))
  : [{
      name: 'No categories found',
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/f73b2aeeb3f442c8c0b65649003ea6bd5083551e0a61af6dea17258a2825725d?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703",
      isSelected: true,
      onClick: () => {},
    }];

  const createNewNote = async () => {
    try {
      const response = await fetch('http://localhost:3001/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include the session cookie
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          category: 'Personal', // Default category
        }),
      });

      if (response.ok) {
        const { note } = await response.json();
        toast.success('New note has been created!', customToastOptions);
        onNewNote();
      } else {
        toast.error('Failed to create note.', customToastOptions);
      }
    } catch (error) {
      toast.error('Failed to create note.', customToastOptions);
    }
  };

  return (
    <aside className="flex flex-col bg-gray-950/40 rounded-2xl min-w-[240px] max-w-[280px] overflow-hidden h-full flex-grow">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 bg-gray-950/80">
        <div className="text-2xl font-bold text-white">Folders</div>
      </div>
      
      {/* New Note Button */}
      <div className="flex flex-col mt-6 px-5 items-center">
        <button
          className="flex items-center p-3 rounded-2xl bg-[#5953e0]/90 hover:bg-[#5953e0] transition-colors duration-300 w-full"
          onClick={createNewNote}
        >
          <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/155641d3dc83c5248ab566e6051774134a2edd86128979c85325392b063db15b?placeholderIfAbsent=true&apiKey=7e47c175400e498f8e55a6d4ee00f703"
        alt="New"
        className="w-6 h-6"
          />
          <span className="ml-3 text-white">New Note</span>
        </button>
      </div>

      {/* Folders Section */}
      <SidebarSection title="Folders" items={folderItems} />

      {/* More Section */}

      {/* Toast Notifications */}
      {/* <ToastContainer /> */}
    </aside>
  );
};

export default Sidebar;
