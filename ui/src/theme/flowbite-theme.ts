import type { CustomFlowbiteTheme } from 'flowbite-react';

/**
 * Custom Flowbite Theme
 * 
 * Design System Colors:
 * - Primary: #073679 (navy blue)
 * - Secondary: #073679 (same as primary)
 * - Text Primary: #222529
 * - Text Secondary/Disabled: #87888a
 */
export const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-4 focus:ring-primary-300',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-4 focus:ring-secondary-300',
      light: 'bg-white hover:bg-gray-100 text-[#222529] border border-gray-200 focus:ring-4 focus:ring-primary-300',
      dark: 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-4 focus:ring-gray-300',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-4 focus:ring-green-300',
      failure: 'bg-red-600 hover:bg-red-700 text-white focus:ring-4 focus:ring-red-300',
      warning: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 focus:ring-4 focus:ring-yellow-300',
      info: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-4 focus:ring-primary-300',
    },
    outline: {
      color: {
        primary: 'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-4 focus:ring-primary-300',
        secondary: 'border border-secondary-600 text-secondary-600 hover:bg-secondary-600 hover:text-white focus:ring-4 focus:ring-secondary-300',
      },
    },
  },
  spinner: {
    color: {
      primary: 'fill-primary-600',
      secondary: 'fill-secondary-600',
      info: 'fill-primary-500',
      success: 'fill-green-600',
      failure: 'fill-red-600',
      warning: 'fill-yellow-400',
    },
  },
  badge: {
    root: {
      color: {
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        info: 'bg-primary-100 text-primary-800',
        success: 'bg-green-100 text-green-800',
        failure: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
      },
    },
  },
  alert: {
    color: {
      primary: 'text-primary-800 bg-primary-50 border-primary-300',
      secondary: 'text-secondary-800 bg-secondary-50 border-secondary-300',
      info: 'text-primary-800 bg-primary-50 border-primary-300',
      success: 'text-green-800 bg-green-50 border-green-300',
      failure: 'text-red-800 bg-red-50 border-red-300',
      warning: 'text-yellow-800 bg-yellow-50 border-yellow-300',
    },
  },
  textInput: {
    field: {
      input: {
        colors: {
          gray: 'bg-gray-50 border-gray-300 text-[#222529] focus:border-primary-500 focus:ring-primary-500',
        },
      },
    },
  },
  textarea: {
    colors: {
      gray: 'bg-gray-50 border-gray-300 text-[#222529] focus:border-primary-500 focus:ring-primary-500',
    },
  },
  select: {
    field: {
      select: {
        colors: {
          gray: 'bg-gray-50 border-gray-300 text-[#222529] focus:border-primary-500 focus:ring-primary-500',
        },
      },
    },
  },
  checkbox: {
    root: {
      color: {
        default: 'text-primary-600 focus:ring-primary-500',
      },
    },
  },
  radio: {
    root: {
      color: {
        default: 'text-primary-600 focus:ring-primary-500',
      },
    },
  },
  toggleSwitch: {
    toggle: {
      checked: {
        color: {
          blue: 'bg-primary-600',
        },
      },
    },
  },
  tabs: {
    tablist: {
      tabitem: {
        base: 'flex items-center justify-center p-4 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-[#87888a]',
        variant: {
          default: {
            base: 'rounded-t-lg',
            active: {
              on: 'bg-gray-100 text-primary-600',
              off: 'text-[#87888a] hover:bg-gray-50 hover:text-[#222529]',
            },
          },
          underline: {
            base: 'rounded-t-lg',
            active: {
              on: 'text-primary-600 border-b-2 border-primary-600',
              off: 'text-[#87888a] border-b-2 border-transparent hover:text-[#222529] hover:border-gray-300',
            },
          },
          pills: {
            base: 'rounded-lg',
            active: {
              on: 'bg-primary-600 text-white',
              off: 'text-[#87888a] hover:bg-gray-100 hover:text-[#222529]',
            },
          },
        },
      },
    },
  },
  sidebar: {
    root: {
      inner: 'h-full overflow-y-auto overflow-x-hidden bg-white py-4 px-3',
    },
    item: {
      base: 'flex items-center justify-center rounded-lg p-2 text-base font-normal text-[#222529] hover:bg-primary-50',
      active: 'bg-primary-100 text-primary-700',
      icon: {
        base: 'h-6 w-6 flex-shrink-0 text-[#87888a] transition duration-75 group-hover:text-primary-600',
        active: 'text-primary-600',
      },
    },
  },
  navbar: {
    link: {
      base: 'block py-2 pr-4 pl-3 md:p-0',
      active: {
        on: 'text-primary-600',
        off: 'text-[#222529] hover:text-primary-600',
      },
    },
  },
  pagination: {
    pages: {
      selector: {
        base: 'w-12 py-2 text-[#222529] hover:bg-primary-50 hover:text-primary-700',
        active: 'bg-primary-600 text-white hover:bg-primary-700 hover:text-white',
      },
    },
  },
  progress: {
    color: {
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
    },
  },
  table: {
    head: {
      base: 'group/head text-xs uppercase text-[#87888a]',
      cell: {
        base: 'bg-gray-50 px-6 py-3',
      },
    },
    row: {
      base: 'group/row text-[#222529]',
      hovered: 'hover:bg-primary-50',
    },
  },
  tooltip: {
    style: {
      dark: 'bg-gray-900 text-white',
      light: 'border border-gray-200 bg-white text-[#222529]',
    },
  },
  dropdown: {
    floating: {
      item: {
        base: 'flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-[#222529] hover:bg-primary-50 focus:bg-primary-50 focus:outline-none',
      },
    },
  },
  modal: {
    header: {
      title: 'text-xl font-semibold text-[#222529]',
    },
  },
  card: {
    root: {
      base: 'flex rounded-lg border border-gray-200 bg-white shadow-sm',
    },
  },
  accordion: {
    title: {
      heading: 'flex w-full items-center justify-between py-5 px-5 text-left font-medium text-[#222529]',
      open: {
        on: 'text-primary-600 bg-primary-50',
        off: '',
      },
    },
  },
  breadcrumb: {
    item: {
      href: {
        on: 'text-[#87888a] hover:text-primary-600',
        off: 'text-[#87888a]',
      },
    },
  },
};
