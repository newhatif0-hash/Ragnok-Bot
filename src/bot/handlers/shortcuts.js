export const shortcuts = {
  // Clearing: مسح
  'مسح': {
    command: 'mod',
    subcommand: null,
    allowedRoles: ['1545277913077907558', '1545277921109745764'],
    action: 'purge',
  },
  
  // Timeout: صمها، اسكت، اص
  'صمها': {
    command: 'mod',
    subcommand: 'timeout',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },
  'اسكت': {
    command: 'mod',
    subcommand: 'timeout',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },
  'اص': {
    command: 'mod',
    subcommand: 'timeout',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },

  // Warn: تحذير، ت
  'تحذير': {
    command: 'mod',
    subcommand: 'warn',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },
  'ت': {
    command: 'mod',
    subcommand: 'warn',
    allowedRoles: ['1545277913077907558', '1545277937836761128', '1545277921109745764'],
  },

  // Warns list: تحذيرات @username
  'تحذيرات': {
    command: 'mod',
    subcommand: 'warn-list',
    allowedRoles: ['1545277937836761128', '1545277913077907558', '1545277921109745764'],
  },

  // Give/Remove role: ر، رول @username
  'ر': {
    command: 'role',
    action: 'toggle',
    allowedRoles: ['1545277913077907558', '1545277888897617940'],
  },
  'رول': {
    command: 'role',
    action: 'toggle',
    allowedRoles: ['1545277913077907558', '1545277888897617940'],
  },

  // Lock channel: ق
  'ق': {
    command: 'lock',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },

  // Unlock channel: ف
  'ف': {
    command: 'unlock',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },

  // Kick: برا
  'برا': {
    command: 'mod',
    subcommand: 'kick',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },

  // Ban: بنعالي، كسرة، بان
  'بنعالي': {
    command: 'mod',
    subcommand: 'ban',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },
  'كسرة': {
    command: 'mod',
    subcommand: 'ban',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },
  'بان': {
    command: 'mod',
    subcommand: 'ban',
    allowedRoles: ['1545277888897617940', '1545277913077907558'],
  },
};

export function getShortcutData(shortcut) {
  return shortcuts[shortcut];
}

export function isAllowedToUseShortcut(shortcutData, userRoles) {
  return shortcutData.allowedRoles.some((roleId) => userRoles.includes(roleId));
}
