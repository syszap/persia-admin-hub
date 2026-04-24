export interface MenuItemData {
  id: string;
  title: string;
  icon: string;
  route: string;
  parentId: string | null;
  children: MenuItemData[];
}
