import React from "react";

export interface SidebarItemProps {
  name: string;
  icon: string;
  isSelected?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  isSelected = false,
  onClick,
}) => {
  
  const baseClass = 'bg-transparent';
  // Increase opacity on hover
  const hoverClass = 'hover:bg-gray-500/20';
  // Increase opacity even more when selected
  const selectedClass = isSelected ? 'bg-gray-500/20' : '';

  return (
    <div
      className={`flex gap-4 items-center px-5 py-2.5 w-full cursor-pointer ${baseClass} ${hoverClass} ${selectedClass} transition-colors duration-300 ${
        isSelected ? 'rounded-lg ' : ''
      }`}
      onClick={onClick}
      style={{ width: '100%' }} // Ensure the item extends fully to the edge
    >
      <img
        loading="lazy"
        src={icon}
        alt=""
        className="object-contain shrink-0 w-5 h-5"
      />
      <div className="text-white flex-1">{name}</div> {/* Ensure the text takes up remaining space */}
    </div>
  );
};

export default SidebarItem;

export type FolderItem = SidebarItemProps;
export type MoreItem = SidebarItemProps;