export interface Note {
  title: string;
  date: string;
  content: string;
  isActive: boolean;
}

export interface Folder {
  name: string;
  icon: string;
  isActive?: boolean;
}

export interface MoreItem {
  name: string;
  icon: string;
}
