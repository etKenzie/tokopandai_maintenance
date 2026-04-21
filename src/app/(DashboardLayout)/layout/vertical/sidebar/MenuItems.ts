import {
  IconBox,
  IconBuilding,
  IconCashBanknote,
  IconDashboard,
  IconFileInvoice,
  IconGraph,
  IconHome,
  IconMask,
  // IconPaywall,
  IconUserCancel
} from "@tabler/icons-react";
import { uniqueId } from "lodash";
import { ROLES } from "@/config/roles";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
  /** Roles that can see this item (user needs at least one). Omit = visible to all authenticated users. */
  requiredRoles?: string[];
}

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Main",
  },

  {
    id: uniqueId(),
    title: "Home",
    icon: IconHome,
    href: "/",
    // chip: "New",
    // chipColor: "secondary",
  },
  // {
  //   id: uniqueId(),
  //   title: "Kasbon",
  //   icon: IconCash,
  //   chip: "New",
  //   href: "/kasbon",
  //   chipColor: "secondary"
  // },
  {
    navlabel: true,
    subheader: "Analytics",
  },
  {
    id: uniqueId(),
    title: "Loans",
    icon: IconCashBanknote,
    href: "/loan",
    requiredRoles: [ROLES.ADMIN, ROLES.LOAN],
    children: [
      {
        id: uniqueId(),
        title: "Overview",
        icon: IconDashboard,
        href: "/loan/overview",
        chipColor: "secondary",
      },
      {
        id: uniqueId(),
        title: "Client Performance",
        icon: IconGraph,
        href: "/loan/client-performance",
      },
      {
        id: uniqueId(),
        title: "Non-Performing List",
        icon: IconUserCancel,
        href: "/loan/non-performing-list",
      },
      
    ],
  },
  {
    id: uniqueId(),
    title: "Internal Payroll",
    icon: IconBox,
    href: "/internal-payroll",
    chip: "New",
    requiredRoles: [ROLES.ADMIN, ROLES.PAYROLL],
    children: [
      {
        id: uniqueId(),
        title: "Overview",
        icon: IconDashboard,
        href: "/internal-payroll",
        
        chipColor: "secondary",
      },
      {
        id: uniqueId(),
        title: "Department",
        icon: IconBuilding,
        href: "/internal-payroll/department",
    
        chipColor: "secondary",
      },
      {
        id: uniqueId(),
        title: "Cost Owner",
        icon: IconMask,
        href: "/internal-payroll/cost-owner",
    
        chipColor: "secondary",
      },
      
    ],
  },
  // {
  //   id: uniqueId(),
  //   title: "External Payroll",
  //   icon: IconPaywall,
  //   href: "/external-payroll",
  //   chip: "New",
  //   requiredRoles: [ROLES.ADMIN, ROLES.PAYROLL],
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: "Overview",
  //       icon: IconDashboard,
  //       href: "/external-payroll",
  //
  //       chipColor: "secondary",
  //     },
  //     // {
  //     //   id: uniqueId(),
  //     //   title: "Department",
  //     //   icon: IconBuilding,
  //     //   href: "/external-payroll/department",
  //     //
  //     //   chipColor: "secondary",
  //     // },
  //     // {
  //     //   id: uniqueId(),
  //     //   title: "Cost Owner",
  //     //   icon: IconMask,
  //     //   href: "/external-payroll/cost-owner",
  //     //
  //     //   chipColor: "secondary",
  //     // },
  //
  //   ],
  // },

  {
    id: uniqueId(),
    title: "Invoice",
    icon: IconFileInvoice,
    href: "/invoice",
    chip: "New",
  },

  // {
  //   navlabel: true,
  //   subheader: "Other",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Menu Level",
  //   icon: IconBoxMultiple,
  //   href: "/menulevel/",
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: "Level 1",
  //       icon: IconPoint,
  //       href: "/l1",
  //     },
  //     {
  //       id: uniqueId(),
  //       title: "Level 1.1",
  //       icon: IconPoint,
  //       href: "/l1.1",
  //       children: [
  //         {
  //           id: uniqueId(),
  //           title: "Level 2",
  //           icon: IconPoint,
  //           href: "/l2",
  //         },
  //         {
  //           id: uniqueId(),
  //           title: "Level 2.1",
  //           icon: IconPoint,
  //           href: "/l2.1",
  //           children: [
  //             {
  //               id: uniqueId(),
  //               title: "Level 3",
  //               icon: IconPoint,
  //               href: "/l3",
  //             },
  //             {
  //               id: uniqueId(),
  //               title: "Level 3.1",
  //               icon: IconPoint,
  //               href: "/l3.1",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: uniqueId(),
  //   title: "Disabled",
  //   icon: IconBan,
  //   href: "",
  //   disabled: true,
  // },
  // {
  //   id: uniqueId(),
  //   title: "SubCaption",
  //   subtitle: "This is the sutitle",
  //   icon: IconStar,
  //   href: "",
  // },

  // {
  //   id: uniqueId(),
  //   title: "Chip",
  //   icon: IconAward,
  //   href: "",
  //   chip: "9",
  //   chipColor: "primary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Outlined",
  //   icon: IconMoodSmile,
  //   href: "",
  //   chip: "outline",
  //   variant: "outlined",
  //   chipColor: "primary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "External Link",
  //   external: true,
  //   icon: IconStar,
  //   href: "https://google.com",
  // },
];

export default Menuitems;
