'use client';

import Menuitems from './MenuItems';
import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { useContext, useMemo } from 'react';

import { CustomizerContext } from '@/app/context/customizerContext';
import { useAuth } from '@/app/context/AuthContext';

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);
  const { roles } = useAuth();

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: any = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';

  const visibleMenuItems = useMemo(() => {
    const filtered = Menuitems.filter((item) => {
      if (item.subheader) return true;
      const requiredRoles = item.requiredRoles as string[] | undefined;
      if (!requiredRoles || requiredRoles.length === 0) return true;
      return roles.some((r) => requiredRoles.includes(r));
    });
    return filtered.filter((item, index, arr) => {
      if (!item.subheader) return true;
      const nextItem = arr[index + 1];
      return nextItem && !nextItem.subheader;
    });
  }, [roles]);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {visibleMenuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => setIsMobileSidebar(!isMobileSidebar)}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu} onClick={() => setIsMobileSidebar(!isMobileSidebar)} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
